export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"

export const API_ROUTES = {
  AUTH: {
    REGISTER: `/auth/register`,
    LOGIN: `/auth/login`,
    LOGOUT: `/auth/logout`,
    ME: `/auth/me`,
  },
  CONVERSATIONS: {
    BASE: `/conversations`,
    MESSAGES: (conversationId: string) =>
      `/conversations/${conversationId}/messages`,
  },
  DOCUMENTS: {
    BASE: `/documents`,
    UPLOAD: `/documents/upload`,
    LINK: `/documents/link`,
  },
} as const

