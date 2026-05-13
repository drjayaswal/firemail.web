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
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
