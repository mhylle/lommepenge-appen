export interface Message {
  id: number;
  content: string;
  author?: string;
  createdAt: Date;
}

export interface CreateMessage {
  content: string;
  author?: string;
}
