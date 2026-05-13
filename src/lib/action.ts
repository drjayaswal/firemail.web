import { google } from 'googleapis';
import { auth } from '@/lib/auth';
import { Mail } from '@/types';

export async function getGmailMails(): Promise<Mail[]> {
  const session = await auth();
  if (!session?.accessToken) {
    throw new Error('Unauthorized: No access token');
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: session.accessToken });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  try {
    const res = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 10,
    });

    const messages = res.data.messages || [];
    const mails: Mail[] = [];

    for (const msg of messages) {
      const details = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id!,
        format: 'full',
      });

      const payload = details.data.payload;
      const headers = payload?.headers;

      const labels = details.data.labelIds || [];

      let fullBody = "";
      if (payload?.body?.data) {
        fullBody = Buffer.from(payload.body.data, 'base64').toString();
      } else if (payload?.parts) {
        const textPart = payload.parts.find(part => part.mimeType === 'text/plain');
        if (textPart?.body?.data) {
          fullBody = Buffer.from(textPart.body.data, 'base64').toString();
        }
      }

      const technicalData = {
        threadId: details.data.threadId,
        historyId: details.data.historyId,
        sizeEstimate: details.data.sizeEstimate,
        rawHeaders: headers,
      };

      mails.push({
        id: msg.id!,
        subject: headers?.find((h) => h.name === 'Subject')?.value || 'No Subject',
        sender: headers?.find((h) => h.name === 'From')?.value || 'Unknown Sender',
        recipient: headers?.find((h) => h.name === 'To')?.value || 'me',
        body: fullBody || details.data.snippet || '',
        status: labels.includes('UNREAD') ? 'unread' : 'read',
        createdAt: new Date(headers?.find((h) => h.name === 'Date')?.value || '').toISOString(),

        labels: labels,
        threadId: technicalData.threadId,
      });
    }

    return mails;
  } catch (error: unknown) {
    const err = error as { code?: number };
    if (err.code === 401) {
      throw new Error("Your session expired while you were Offline. Please sign in again.");
    }
    throw error;
  }
}
