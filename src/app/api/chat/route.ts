import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { getSession } from "@/lib/auth";
import { getCustomMails } from "@/lib/action";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

async function extractIntent(query: string) {
    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            temperature: 0,
            messages: [
                {
                    role: "user",
                    content: `Analyze this user request about their Gmail inbox and extract the following parameters:
- count: number (default: 10 if not specified, extract the count if they say e.g. "last 5" or "10 emails")
- unread: boolean (default: true if not specified, false if they explicitly ask for read/all)
- important: boolean (default: false if not specified, true if they say e.g. "important")
- starred: boolean (default: false if not specified, true if they say e.g. "starred")
- storeMailContext: boolean (default: true if not specified, false if they explicitly say not to store or use context)
- isGmailQuery: boolean (true if the query is asking to retrieve, search, show, check, analyze, or count Gmail messages/inbox/emails, false otherwise)

User request: "${query}"

Respond with ONLY a JSON object. No other text or markdown formatting. E.g.:
{
  "count": 10,
  "unread": true,
  "important": false,
  "starred": false,
  "storeMailContext": true,
  "isGmailQuery": true
}`,
                },
            ],
        });

        const text = response.choices[0]?.message?.content || "";
        const cleanText = text.trim().replace(/^```json/, "").replace(/```$/, "").trim();
        const parsed = JSON.parse(cleanText);
        return {
            count: typeof parsed.count === "number" ? parsed.count : 10,
            unread: typeof parsed.unread === "boolean" ? parsed.unread : true,
            important: typeof parsed.important === "boolean" ? parsed.important : false,
            starred: typeof parsed.starred === "boolean" ? parsed.starred : false,
            storeMailContext: typeof parsed.storeMailContext === "boolean" ? parsed.storeMailContext : true,
            isGmailQuery: typeof parsed.isGmailQuery === "boolean" ? parsed.isGmailQuery : true,
        };
    } catch (error) {
        console.error("Failed to extract intent:", error);
        const lower = query.toLowerCase();
        const isGmailQuery = lower.includes("mail") || lower.includes("email") || lower.includes("inbox") || lower.includes("message");
        return {
            count: 10,
            unread: true,
            important: false,
            starred: false,
            storeMailContext: true,
            isGmailQuery,
        };
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { messages, mode } = body;

        const session = await getSession();
        let mailsContext = "";
        let intent: any = null;

        if (mode === "ANALYZE" && session?.accessToken) {
            const userQuery = messages[messages.length - 1]?.content || "";
            intent = await extractIntent(userQuery);

            if (intent.isGmailQuery) {
                try {
                    const fetchedMails = await getCustomMails({
                        count: intent.count,
                        unread: intent.unread,
                        important: intent.important,
                        starred: intent.starred,
                        days: 30,
                        store: false,
                    });

                    if (intent.storeMailContext && fetchedMails.length > 0) {
                        mailsContext = `
Additional Context: The user asked about their Gmail inbox. Here are the fetched emails:
${fetchedMails.map((m, idx) => `
Email #${idx + 1}:
ID: ${m.id}
From: ${m.sender}
Subject: ${m.subject}
Body: ${m.body}
---
`).join("\n")}
Please analyze this email context to answer the user's request.`;
                    }
                } catch (e: any) {
                    console.error("Failed to fetch Gmail mails:", e);
                    mailsContext = `\n\nNote: There was an error fetching Gmail messages: ${e.message || e}`;
                }
            }
        }

        const systemMessage = [
            "You are Firemail AI — a sharp, fast, emotionally aware mail intelligence assistant.",
            "You analyze conversations, summarize emails, detect intent, uncover patterns, and help users respond with clarity and confidence.",
            "",
            "Your personality adapts to the user's tone:",
            "- If the user is respectful, respond with calm confidence, warmth, and intelligence.",
            "- If the user is rude, arrogant, aggressive, or disrespectful, respond with dry humor, witty sarcasm, and confident energy.",
            "- Keep the humor playful and cinematic, never hateful, discriminatory, threatening, or genuinely abusive.",
            "- Replies should feel confident, social, and emotionally sharp.",
            "",
            mode === "ANONYMOUS"
                ? "This session is private. Conversations are not stored after the session ends."
                : mode === "ANALYZE"
                ? "You are in Analyze mode. When the user asks about their inbox, their emails have been fetched and included in the context for you to analyze. Focus on providing insightful, accurate analysis of the provided email data."
                : "Conversation history is saved so the user can revisit previous discussions.",
            "",
            mailsContext,
            "",
            "CRITICAL FORMAT RULE: You MUST start your response with a thinking block enclosed in `<thinking>...</thinking>`, detailing your step-by-step thinking process, search parameters, or analysis. Then provide your actual response outside the thinking block.",
            "Example:",
            "<thinking>",
            "User is asking for unread emails. Let me list the unread emails from the context...",
            "</thinking>",
            "Here are your unread emails..."
        ].filter(Boolean).join("\n");

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            temperature: 0.7,
            messages: [
                {
                    role: "system",
                    content: systemMessage,
                },
                ...messages.map((m: any) => ({
                    role: m.role,
                    content: m.content,
                })),
            ],
        });

        const rawReply = completion.choices[0]?.message?.content || "";
        let content = rawReply;
        let thinking = "Analyzed user intent, generated contextual response.";

        const thinkingMatch = rawReply.match(/<thinking>([\s\S]*?)<\/thinking>/);
        if (thinkingMatch) {
            thinking = thinkingMatch[1].trim();
            content = rawReply.replace(/<thinking>[\s\S]*?<\/thinking>/, "").trim();
        }

        return NextResponse.json({
            content,
            thinking,
            intent,
        });
    } catch (error: any) {
        console.error("Error in chat route:", error);
        return NextResponse.json(
            {
                error: error?.message || "Something went wrong",
            },
            {
                status: 500,
            }
        );
    }
}