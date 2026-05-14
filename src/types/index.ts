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
  /** `decimal(10,4)` from DB, e.g. `"0.0000"`. */
  priority?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface AnalyzeOptions {
  unread: boolean;
  days: number;
  store: boolean;
  count: number;
  important: boolean;
  starred: boolean;
}
