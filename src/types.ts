export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  files?: Array<{ name: string; path: string }>;
  toolCall?: {
    name: string;
    input: unknown;
    status: "running" | "done";
  };
}

export interface ImageFile {
  name: string;
  path: string;
  type: "image" | "file" | "directory";
  children?: ImageFile[];
}

export interface WSMessage {
  type: string;
  content?: string;
  toolName?: string;
  toolInput?: unknown;
  error?: string;
}
