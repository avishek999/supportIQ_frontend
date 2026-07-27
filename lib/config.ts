export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"

export const API_ROUTES = {
  AUTH: {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    ME: `${API_BASE_URL}/auth/me`,
  },
  CONVERSATIONS: {
    BASE: `${API_BASE_URL}/conversations`,
    MESSAGES: (conversationId: string) =>
      `${API_BASE_URL}/conversations/${conversationId}/messages`,
  },
  DOCUMENTS: {
    BASE: `${API_BASE_URL}/documents`,
    UPLOAD: `${API_BASE_URL}/documents/upload`,
    LINK: `${API_BASE_URL}/documents/link`,
  },
} as const
