import { api } from "./axios"
import { API_ROUTES } from "@/lib/config"

export interface UploadedDocumentData {
  documentId: string
  filename: string
  mimeType?: string
  totalCharacters?: number
  totalChunks?: number
  chunks?: unknown[]
}

export interface UploadDocumentResponse {
  message: string
  data: UploadedDocumentData
}

// POST /api/documents/upload -> Upload single document
export async function uploadDocumentApi(file: File): Promise<UploadedDocumentData> {
  const formData = new FormData()
  formData.append("file", file)

  const response = await api.post<UploadDocumentResponse | UploadedDocumentData>(
    API_ROUTES.DOCUMENTS.UPLOAD,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  )

  if ("data" in response.data && response.data.data) {
    return response.data.data
  }
  return response.data as UploadedDocumentData
}

// POST /api/documents/link -> Ingest website link
export async function ingestLinkApi(url: string): Promise<UploadedDocumentData> {
  const response = await api.post<UploadDocumentResponse | UploadedDocumentData>(
    API_ROUTES.DOCUMENTS.LINK,
    { url },
  )

  if ("data" in response.data && response.data.data) {
    return response.data.data
  }
  return response.data as UploadedDocumentData
}
