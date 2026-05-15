export interface Mail {
  id: string;
  threadId: string | null | undefined;
  subject: string;
  sender: string;
  recipient: string;
  body: string;
  status: 'read' | 'unread';
  labels: string[];
  createdAt: string;
  categories?: string[] | null;
  priority?: string;
}

export interface MailQueryOptions {
  unread: boolean;
  days: number;
  count: number;
  important: boolean;
  starred: boolean;
}

export type FetchOptions = MailQueryOptions;

export interface AnalyzeOptions extends MailQueryOptions {
  store: boolean;
}

export interface AnalyzeCheckRequest {
  mails: Mail[];
  store: boolean;
}

export interface AnalyzeRunPayload {
  mails: Mail[];
  options: AnalyzeOptions;
}
