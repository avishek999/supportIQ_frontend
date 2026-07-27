"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { SiqButton } from "@/components/siq-button"
import { SiqInput } from "@/components/siq-input"
import { ContextSelector } from "@/components/context-selector"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import {
  MessageSquarePlus,
  LogOut,
  Send,
  Bot,
  User as UserIcon,
  Sparkles,
  Loader2,
  MessageSquare,
  Menu,
} from "lucide-react"
import {
  getConversationsApi,
  getConversationMessagesApi,
  sendMessageApi,
} from "@/lib/api/conversation.api"
import type { Conversation, Message, DocumentItem } from "@/lib/types/chat.types"

export default function ChatPage() {
  const { user, logout } = useAuth()
  const searchParams = useSearchParams()
  const conversationIdFromUrl = searchParams.get("c")

  // State
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [attachedContext, setAttachedContext] = useState<{
    type: "file" | "link"
    title: string
    documentId?: string
  } | null>(null)

  const [inputMessage, setInputMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [isLoadingConversations, setIsLoadingConversations] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isSending])

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    setIsLoadingConversations(true)
    try {
      const { conversations: list } = await getConversationsApi()
      setConversations(list)

      // If URL has conversation ID, select it
      if (conversationIdFromUrl) {
        const found = list.find(
          (c) => (c.id || (c as unknown as { _id: string })._id) === conversationIdFromUrl,
        )
        if (found) {
          selectConversation(found)
        } else {
          loadMessages(conversationIdFromUrl)
        }
      }
    } catch (err) {
      console.error("Failed to load conversations:", err)
    } finally {
      setIsLoadingConversations(false)
    }
  }

  const loadMessages = useCallback(async (convId: string) => {
    setIsLoadingMessages(true)
    try {
      const { messages: msgList } = await getConversationMessagesApi(convId)
      setMessages(msgList)
    } catch (err) {
      console.error("Failed to load messages:", err)
      setMessages([])
    } finally {
      setIsLoadingMessages(false)
    }
  }, [])

  const selectConversation = (conv: Conversation) => {
    const id = conv.id || (conv as unknown as { _id: string })._id
    setActiveConversation(conv)
    setIsMobileSidebarOpen(false)
    if (conv.title) {
      setAttachedContext({
        type: "file",
        title: conv.title,
        documentId: conv.documentId,
      })
    }
    // Update URL query param ?c=
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", `/chat?c=${id}`)
    }
    loadMessages(id)
  }

  const handleConversationCreated = (
    conv: Conversation,
    doc: DocumentItem,
  ) => {
    const id = conv.id || (conv as unknown as { _id: string })._id
    const title = conv.title || doc.name || doc.title || "New Context"

    const newConv: Conversation = {
      ...conv,
      id,
      title,
      documentId: doc.id,
    }

    setConversations((prev) => [newConv, ...prev])
    setActiveConversation(newConv)
    setIsMobileSidebarOpen(false)

    setAttachedContext({
      type: (doc.type as "file" | "link") || "file",
      title,
      documentId: doc.id,
    })

    // Update URL query param ?c=conversationId
    if (id && typeof window !== "undefined") {
      window.history.pushState(null, "", `/chat?c=${id}`)
    }

    setMessages([])
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSending) return

    const userText = inputMessage.trim()
    setInputMessage("")
    setIsSending(true)

    const currentConvId =
      activeConversation?.id ||
      (activeConversation as unknown as { _id: string })?._id ||
      conversationIdFromUrl

    // Optimistic user message update
    const tempUserMsg: Message = {
      id: Date.now().toString(),
      conversationId: currentConvId || "",
      role: "user",
      sender: "user",
      content: userText,
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, tempUserMsg])

    try {
      if (currentConvId) {
        const { userMessage, aiMessage } = await sendMessageApi(
          currentConvId,
          userText,
        )
        setMessages((prev) =>
          prev.map((m) => (m.id === tempUserMsg.id ? userMessage : m)).concat(aiMessage),
        )
      } else {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              conversationId: "",
              role: "assistant",
              sender: "assistant",
              content:
                "Please attach a document or link context above so I can answer questions from your knowledge base!",
              createdAt: new Date().toISOString(),
            },
          ])
          setIsSending(false)
        }, 1000)
        return
      }
    } catch (err) {
      console.error("Failed to send message:", err)
    } finally {
      setIsSending(false)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logout()
  }

  const handleNewChat = () => {
    setActiveConversation(null)
    setAttachedContext(null)
    setMessages([])
    setIsMobileSidebarOpen(false)
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/chat")
    }
  }

  return (
    <div className="relative flex h-svh w-full overflow-hidden bg-background">
      {/* ── Mobile Sidebar Backdrop Overlay ── */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* ── Left Sidebar (Conversations & Contexts) ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-sidebar transition-transform duration-300 md:static md:w-64 md:translate-x-0 ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary font-mono text-xs font-bold text-primary-foreground">
              SQ
            </div>
            <span className="font-semibold text-foreground">SupportIQ</span>
          </div>

          <SiqButton
            text="New Chat"
            variant="ghost"
            size="xs"
            startIcon={<MessageSquarePlus className="size-3.5" />}
            onPress={handleNewChat}
          />
        </div>

        {/* Conversation List */}
        <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
          <span className="px-2 py-1 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
            Recent Conversations
          </span>

          {isLoadingConversations ? (
            <div className="flex items-center gap-2 p-3 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              <span>Loading history...</span>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-3 text-xs text-muted-foreground">
              No previous chats yet. Attach a document to start!
            </div>
          ) : (
            conversations.map((conv) => {
              const id = conv.id || (conv as unknown as { _id: string })._id
              const isActive =
                (activeConversation?.id ||
                  (activeConversation as unknown as { _id: string })?._id) === id

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => selectConversation(conv)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors text-left cursor-pointer ${
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <MessageSquare className="size-3.5 shrink-0 text-primary" />
                  <span className="truncate">{conv.title || "Untitled Chat"}</span>
                </button>
              )
            })
          )}
        </div>

        {/* Sidebar Footer — User & Logout */}
        <div className="flex items-center justify-between border-t border-border p-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
              {user?.name?.[0]?.toUpperCase() || <UserIcon className="size-4" />}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="truncate text-xs font-medium text-foreground">
                {user?.name || "User"}
              </span>
              <span className="truncate text-[10px] text-muted-foreground">
                {user?.email || ""}
              </span>
            </div>
          </div>

          <SiqButton
            text=""
            variant="ghost"
            size="icon-sm"
            isLoading={isLoggingOut}
            onPress={handleLogout}
            title="Log out"
            startIcon={<LogOut className="size-4 text-muted-foreground hover:text-destructive" />}
          />
        </div>
      </aside>

      {/* ── Main Chat Area ── */}
      <main className="flex min-w-0 flex-1 flex-col">
        {/* Chat Header */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-background px-4 sm:px-6">
          <div className="flex items-center gap-2 min-w-0">
            <SiqButton
              text=""
              variant="ghost"
              size="icon-sm"
              className="md:hidden"
              onPress={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
              startIcon={<Menu className="size-5" />}
              title="Toggle Sidebar"
            />
            <Sparkles className="size-4 shrink-0 text-primary" />
            <span className="truncate text-sm font-medium text-foreground max-w-[180px] sm:max-w-xs">
              {activeConversation?.title || "SupportIQ Assistant"}
            </span>
          </div>

          <SiqButton
            text="Logout"
            variant="outline"
            size="sm"
            isLoading={isLoggingOut}
            onPress={handleLogout}
            startIcon={<LogOut className="size-3.5" />}
          />
        </header>

        {/* Messages Container */}
        <div className="flex flex-1 flex-col overflow-y-auto p-4 sm:p-6">
          {isLoadingMessages ? (
            <div className="flex flex-1 items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-primary" />
              <span>Loading conversation...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-2xl border border-border bg-sidebar shadow-xs">
                <Bot className="size-6 text-foreground" />
              </div>
              <div className="flex max-w-md flex-col items-center gap-1.5 text-center px-4">
                <h3 className="text-base font-semibold text-foreground">
                  How can SupportIQ help you today?
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Attach a document or link below to start asking questions against your knowledge base.
                </p>
              </div>
            </div>
          ) : (
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
              {messages.map((msg) => {
                const role = msg.role || msg.sender
                const isUser = role === "user" || role === "USER"
                return (
                  <div
                    key={msg.id || (msg as unknown as { _id: string })._id}
                    className={`flex items-start gap-3 ${
                      isUser ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                        isUser
                          ? "border border-primary/40 bg-primary/15 text-primary"
                          : "border border-border bg-muted text-foreground"
                      }`}
                    >
                      {isUser ? <UserIcon className="size-4" /> : <Bot className="size-4" />}
                    </div>

                    <div
                      className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        isUser
                          ? "border border-border bg-muted/70 text-foreground"
                          : "border border-border bg-sidebar text-foreground"
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <MarkdownRenderer content={msg.content} />
                      )}
                    </div>
                  </div>
                )
              })}

              {isSending && (
                <div className="flex items-start gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-foreground">
                    <Bot className="size-4" />
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-border bg-sidebar px-4 py-2.5 text-xs text-muted-foreground">
                    <Loader2 className="size-3.5 animate-spin text-primary" />
                    <span>SupportIQ is generating response...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar & Context Selector */}
        <div className="flex flex-col gap-3 border-t border-border bg-background p-3 sm:p-4">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
            {/* ── Expandable Upload / Link Box & Attached Pill ── */}
            <ContextSelector
              onConversationCreated={handleConversationCreated}
              attachedContext={attachedContext}
              onClearContext={() => setAttachedContext(null)}
            />

            {/* Input Bar */}
            <div className="flex items-center gap-2">
              <SiqInput
                placeholder={
                  attachedContext
                    ? `Ask anything about ${attachedContext.title}...`
                    : "Attach a document or link context above to start chatting..."
                }
                value={inputMessage}
                onValueChange={setInputMessage}
                disabled={!attachedContext}
                title={
                  !attachedContext
                    ? "Attach a file or add a link to start chatting"
                    : undefined
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && attachedContext) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                width="100%"
                height="44px"
              />
              <SiqButton
                text=""
                size="icon-lg"
                onPress={handleSendMessage}
                isLoading={isSending}
                disabled={!attachedContext || !inputMessage.trim()}
                title={
                  !attachedContext
                    ? "Attach a file or add a link to start chatting"
                    : undefined
                }
                startIcon={<Send className="size-4" />}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
