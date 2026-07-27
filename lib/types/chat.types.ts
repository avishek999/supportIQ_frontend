export interface DocumentItem {
  id: string
  title?: string
  name?: string
  originalName?: string
  url?: string
  type?: "file" | "link" | string
  createdAt?: string
}

export interface Conversation {
  id: string
  title?: string
  documentId?: string
  document?: DocumentItem
  createdAt: string
  updatedAt?: string
}

export interface Message {
  id: string
  conversationId: string
  role?: "user" | "assistant" | "system"
  sender?: "user" | "assistant" | "system" | "USER" | "ASSISTANT"
  content: string
  createdAt: string
}

export interface CreateConversationInput {
  title?: string
  documentId?: string
}

export interface SendMessageInput {
  content: string
}
