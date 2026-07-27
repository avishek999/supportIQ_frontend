"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, Lock, Eye, EyeOff } from "lucide-react"
import { SiqInput } from "@/components/siq-input"
import { SiqButton } from "@/components/siq-button"
import { loginSchema, type LoginInput } from "@/lib/dto/auth.dto"
import { loginApi } from "@/lib/api/auth.api"
import { useAuth } from "@/components/auth-provider"
import axios from "axios"

export default function LoginPage() {
  const router = useRouter()
  const { setUser, refreshUser } = useAuth()
  const [form, setForm] = useState<LoginInput>({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<Partial<Record<keyof LoginInput, string>>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const updateField = (field: keyof LoginInput) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    if (serverError) setServerError(null)
  }

  const handleSubmit = async () => {
    setServerError(null)
    const result = loginSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: typeof errors = {}
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof LoginInput
        if (!fieldErrors[field]) fieldErrors[field] = issue.message
      })
      setErrors(fieldErrors)
      return
    }

    setLoading(true)
    try {
      const res = await loginApi(result.data)
      // Set user if returned in response, otherwise refresh user session
      if (res.user) {
        setUser(res.user)
      } else {
        await refreshUser()
      }
      router.push("/chat")
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setServerError(err.response?.data?.message || err.response?.data?.error || "Invalid email or password.")
      } else {
        setServerError("An unexpected error occurred.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Log in to your SupportIQ account
        </p>
      </div>

      {/* Server Error Alert */}
      {serverError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          {serverError}
        </div>
      )}

      {/* Form */}
      <div className="flex flex-col gap-4">
        <SiqInput
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onValueChange={updateField("email")}
          error={errors.email}
          required
          startIcon={<Mail />}
        />

        <SiqInput
          label="Password"
          type={showPw ? "text" : "password"}
          placeholder="••••••••"
          value={form.password}
          onValueChange={updateField("password")}
          error={errors.password}
          required
          startIcon={<Lock />}
          endIcon={
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
              aria-label={showPw ? "Hide password" : "Show password"}
            >
              {showPw ? <EyeOff /> : <Eye />}
            </button>
          }
        />
      </div>

      {/* Submit */}
      <SiqButton
        text="Log In"
        loadingText="Logging in..."
        isLoading={loading}
        onPress={handleSubmit}
        width="100%"
        height="42px"
      />

      {/* Footer */}
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/signup"
          className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary"
        >
          Sign up
        </Link>
      </p>
    </div>
  )
}
