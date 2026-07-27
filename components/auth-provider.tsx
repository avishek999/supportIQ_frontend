"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { getMeApi, logoutApi, type User } from "@/lib/api/auth.api"

interface AuthContextType {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  logout: () => Promise<void>
  refreshUser: () => Promise<User | null>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
  logout: async () => {},
  refreshUser: async () => null,
})

const PROTECTED_ROUTES = ["/chat"]
const AUTH_ROUTES = ["/auth/login", "/auth/signup"]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()

  const fetchUser = async () => {
    try {
      const currentUser = await getMeApi()
      setUser(currentUser)
      return currentUser
    } catch {
      setUser(null)
      return null
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  useEffect(() => {
    if (loading) return

    const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
      pathname.startsWith(route),
    )
    const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route))

    if (!user && isProtectedRoute) {
      router.replace("/auth/login")
    } else if (user && (isAuthRoute || pathname === "/")) {
      router.replace("/chat")
    }
  }, [user, loading, pathname, router])

  const handleLogout = async () => {
    try {
      await logoutApi()
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      setUser(null)
      router.replace("/auth/login")
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setUser,
        logout: handleLogout,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
