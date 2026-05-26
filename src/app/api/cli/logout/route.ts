import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/app/db";
import { session } from "@/app/db/schema";

export async function POST(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 },
        );
    }
    const token = authHeader.slice("Bearer ".length);
    const deleted = await db
        .delete(session)
        .where(eq(session.token, token))
        .returning();
    return NextResponse.json({
        success: true,
        deletedCount: deleted.length,
    });
}