"use client"

import React, { useState, useRef } from "react"
import {
  Upload,
  Link2,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
} from "lucide-react"
import { SiqButton } from "@/components/siq-button"
import { SiqInput } from "@/components/siq-input"
import { uploadDocumentApi, ingestLinkApi } from "@/lib/api/document.api"
import { createConversationApi } from "@/lib/api/conversation.api"
import type { DocumentItem, Conversation } from "@/lib/types/chat.types"

interface ContextSelectorProps {
  onConversationCreated: (conversation: Conversation, document: DocumentItem) => void
  attachedContext: { type: "file" | "link"; title: string; documentId?: string } | null
  onClearContext: () => void
}

const ALLOWED_EXTENSIONS = [".pdf", ".csv", ".txt"]
const MAX_FILE_SIZE_MB = 10

export function ContextSelector({
  onConversationCreated,
  attachedContext,
  onClearContext,
}: ContextSelectorProps) {
  const [activeTab, setActiveTab] = useState<"file" | "link" | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [linkInput, setLinkInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isCollapsing, setIsCollapsing] = useState(false)

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const validateFile = (file: File): string | null => {
    const ext = "." + file.name.split(".").pop()?.toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `Invalid file type. Only ${ALLOWED_EXTENSIONS.join(", ")} files are supported.`
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `File size exceeds limit of ${MAX_FILE_SIZE_MB}MB.`
    }
    return null
  }

  const validateUrl = (url: string): boolean => {
    try {
      const parsed = new URL(url)
      return parsed.protocol === "http:" || parsed.protocol === "https:"
    } catch {
      return false
    }
  }

  const handleFileProcess = async (file: File) => {
    setError(null)
    const err = validateFile(file)
    if (err) {
      setError(err)
      return
    }

    setIsUploading(true)
    try {
      // 1. Upload document (FormData with "file")
      const docRes = await uploadDocumentApi(file)
      const docId = docRes.documentId

      // 2. Create conversation with documentId
      const convRes = await createConversationApi({
        documentId: docId,
      })

      // 3. Smooth collapse transition
      setIsCollapsing(true)
      setTimeout(() => {
        setIsCollapsing(false)
        setActiveTab(null)
        onConversationCreated(convRes, {
          id: docId,
          name: docRes.filename || file.name,
          title: docRes.filename || file.name,
        })
      }, 400)
    } catch (err: unknown) {
      console.error("File upload error:", err)
      setError("Failed to upload document. Please check server connection.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleLinkSubmit = async () => {
    setError(null)
    const trimmed = linkInput.trim()
    if (!trimmed) {
      setError("Please paste a valid web URL.")
      return
    }
    if (!validateUrl(trimmed)) {
      setError("Invalid URL format. Please include http:// or https://")
      return
    }

    setIsUploading(true)
    try {
      // 1. Ingest link via API (POST /api/documents/link)
      const docRes = await ingestLinkApi(trimmed)
      const docId = docRes.documentId

      // 2. Create conversation with documentId
      const convRes = await createConversationApi({
        documentId: docId,
      })

      // 3. Smooth collapse transition
      setIsCollapsing(true)
      setTimeout(() => {
        setIsCollapsing(false)
        setActiveTab(null)
        setLinkInput("")
        onConversationCreated(convRes, {
          id: docId,
          name: docRes.filename || trimmed,
          title: docRes.filename || trimmed,
          type: "link",
        })
      }, 400)
    } catch (err: unknown) {
      console.error("Link ingestion error:", err)
      setError("Failed to process web link. Please check server connection.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0])
    }
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.csv,.txt"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleFileProcess(e.target.files[0])
            e.target.value = ""
          }
        }}
      />

      {/* ── Context Selector Buttons / Attached Pill ── */}
      <div className="flex items-center gap-2">
        {attachedContext ? (
          /* Attached Context Pill */
          <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs text-foreground transition-all duration-300">
            {attachedContext.type === "file" ? (
              <FileText className="size-3.5 text-primary" />
            ) : (
              <Link2 className="size-3.5 text-primary" />
            )}
            <span className="max-w-[200px] truncate font-medium sm:max-w-[300px]">
              {attachedContext.title}
            </span>
          </div>
        ) : (
          /* Quick Attach Options */
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setError(null)
                setActiveTab(activeTab === "file" ? null : "file")
              }}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer ${
                activeTab === "file"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              <Upload className="size-3.5" />
              <span>Attach File</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setError(null)
                setActiveTab(activeTab === "link" ? null : "link")
              }}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer ${
                activeTab === "link"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              <Link2 className="size-3.5" />
              <span>Paste Web Link</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Expandable Upload / Link Box with Smooth Animation ── */}
      {activeTab && !attachedContext && (
        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            isCollapsing
              ? "max-h-0 opacity-0 scale-95"
              : "max-h-80 opacity-100 scale-100"
          }`}
        >
          <div className="rounded-2xl border border-border bg-sidebar/80 p-4 shadow-sm backdrop-blur-md">
            {/* Header */}
            <div className="mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-semibold text-foreground">
                <Sparkles className="size-3.5 text-primary" />
                {activeTab === "file" ? "Upload Knowledge Document" : "Paste Knowledge Link"}
              </span>
              <button
                type="button"
                onClick={() => setActiveTab(null)}
                className="cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* TAB 1: File Dropzone */}
            {activeTab === "file" && (
              <div className="flex flex-col gap-3">
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200 ${
                    dragActive
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/60 hover:bg-background/50"
                  } ${isUploading ? "pointer-events-none opacity-60" : ""}`}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="size-6 animate-spin text-primary" />
                      <span className="text-xs font-medium text-foreground">
                        Ingesting document & generating embeddings...
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                        <Upload className="size-5 text-muted-foreground" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-medium text-foreground">
                          Click to upload or drag & drop file
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          Supported formats: PDF, CSV, TXT (Max {MAX_FILE_SIZE_MB}MB)
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: Link Input */}
            {activeTab === "link" && (
              <div className="flex flex-col gap-3">
                <p className="text-xs text-muted-foreground">
                  Click here to paste the link to ingest live web content for your conversation context.
                </p>
                <div className="flex items-center gap-2">
                  <SiqInput
                    placeholder="https://example.com/docs/support"
                    value={linkInput}
                    onValueChange={setLinkInput}
                    startIcon={<Link2 />}
                    width="100%"
                    height="40px"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleLinkSubmit()
                      }
                    }}
                  />
                  <SiqButton
                    text="Attach Link"
                    loadingText="Processing link..."
                    isLoading={isUploading}
                    disabled={isUploading || !linkInput.trim()}
                    onPress={handleLinkSubmit}
                    height="40px"
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
