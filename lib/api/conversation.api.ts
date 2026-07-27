import { api } from "./axios"
import { API_ROUTES } from "@/lib/config"
import type { Conversation, Message, CreateConversationInput } from "@/lib/types/chat.types"

export interface CreateConversationResponse {
  message: string
  data: {
    _id: string
    userId: string
    documentId: string
    title: string
    lastMessageAt?: string
    createdAt: string
  }
}

export interface SendMessageResponse {
  message: string
  data: {
    userMessage: {
      _id: string
      conversationId: string
      role: "user"
      content: string
      createdAt: string
    }
    aiMessage: {
      _id: string
      conversationId: string
      role: "assistant"
      content: string
      createdAt: string
    }
  }
}

// Helper to safely extract an array from flexible API response wrappers
function extractArray<T = Record<string, unknown>>(resData: unknown, preferredKeys: string[]): T[] {
  if (Array.isArray(resData)) return resData as T[]
  if (!resData || typeof resData !== "object") return []

  const obj = resData as Record<string, unknown>

  // Check nested obj.data first
  if (obj.data && typeof obj.data === "object") {
    if (Array.isArray(obj.data)) return obj.data as T[]
    const nestedObj = obj.data as Record<string, unknown>
    for (const key of preferredKeys) {
      if (Array.isArray(nestedObj[key])) return nestedObj[key] as T[]
    }
  }

  // Check top-level keys
  for (const key of preferredKeys) {
    if (Array.isArray(obj[key])) return obj[key] as T[]
  }

  return []
}

// POST /api/conversations -> Create new conversation
export async function createConversationApi(
  data: CreateConversationInput,
): Promise<Conversation> {
  const response = await api.post<CreateConversationResponse | { data: Conversation } | Conversation>(
    API_ROUTES.CONVERSATIONS.BASE,
    data,
  )

  const resData = response.data
  if ("data" in resData && resData.data) {
    const d = resData.data as { _id?: string; id?: string; title?: string; documentId?: string; createdAt: string }
    return {
      id: d._id || d.id || "",
      title: d.title || "",
      documentId: d.documentId || "",
      createdAt: d.createdAt,
    }
  }
  return resData as Conversation
}

// GET /api/conversations -> List user's conversations
export async function getConversationsApi(
  page = 1,
  limit = 20,
): Promise<{ conversations: Conversation[]; hasMore?: boolean }> {
  const response = await api.get(API_ROUTES.CONVERSATIONS.BASE, {
    params: { page, limit },
  })

  const rawList = extractArray(response.data, ["conversations", "data"])

  const conversations: Conversation[] = rawList.map((item) => ({
    id: (item._id || item.id || "") as string,
    title: (item.title || "") as string,
    documentId: (item.documentId || "") as string,
    createdAt: (item.createdAt || "") as string,
    updatedAt: (item.updatedAt || "") as string,
  }))

  const hasMore = (response.data as { data?: { pagination?: { hasMore?: boolean } } })?.data?.pagination?.hasMore

  return {
    conversations,
    hasMore,
  }
}

// GET /api/conversations/:conversationId/messages -> Get messages
export async function getConversationMessagesApi(
  conversationId: string,
  cursor?: string,
  limit = 30,
): Promise<{ messages: Message[]; nextCursor?: string }> {
  const response = await api.get(API_ROUTES.CONVERSATIONS.MESSAGES(conversationId), {
    params: { cursor, limit },
  })

  const rawList = extractArray(response.data, ["messages", "data"])

  const messages: Message[] = rawList.map((item) => ({
    id: (item._id || item.id || "") as string,
    conversationId: (item.conversationId || conversationId) as string,
    role: (item.role || item.sender || "user") as "user" | "assistant",
    sender: (item.role || item.sender || "user") as "user" | "assistant",
    content: (item.content || "") as string,
    createdAt: (item.createdAt || "") as string,
  }))

  return {
    messages,
    nextCursor: (response.data as { data?: { nextCursor?: string } })?.data?.nextCursor,
  }
}

// POST /api/conversations/:conversationId/messages -> Send message & get AI response
export async function sendMessageApi(
  conversationId: string,
  content: string,
): Promise<{ userMessage: Message; aiMessage: Message }> {
  const response = await api.post<SendMessageResponse>(
    API_ROUTES.CONVERSATIONS.MESSAGES(conversationId),
    { content },
  )

  const resData = response.data.data
  return {
    userMessage: {
      id: resData.userMessage._id,
      conversationId: resData.userMessage.conversationId,
      role: resData.userMessage.role,
      sender: resData.userMessage.role,
      content: resData.userMessage.content,
      createdAt: resData.userMessage.createdAt,
    },
    aiMessage: {
      id: resData.aiMessage._id,
      conversationId: resData.aiMessage.conversationId,
      role: resData.aiMessage.role,
      sender: resData.aiMessage.role,
      content: resData.aiMessage.content,
      createdAt: resData.aiMessage.createdAt,
    },
  }
}
