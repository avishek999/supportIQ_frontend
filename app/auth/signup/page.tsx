"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react"
import { SiqInput } from "@/components/siq-input"
import { SiqButton } from "@/components/siq-button"
import { registerSchema, type RegisterInput } from "@/lib/dto/auth.dto"
import { registerApi } from "@/lib/api/auth.api"
import { useAuth } from "@/components/auth-provider"
import axios from "axios"

export default function SignupPage() {
  const router = useRouter()
  const { setUser, refreshUser } = useAuth()
  const [form, setForm] = useState<RegisterInput>({
    name: "",
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterInput, string>>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const updateField = (field: keyof RegisterInput) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
    if (serverError) setServerError(null)
  }

  const handleSubmit = async () => {
    setServerError(null)
    const result = registerSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: typeof errors = {}
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof RegisterInput
        if (!fieldErrors[field]) fieldErrors[field] = issue.message
      })
      setErrors(fieldErrors)
      return
    }

    setLoading(true)
    try {
      const res = await registerApi(result.data)
      if (res.user) {
        setUser(res.user)
      } else {
        await refreshUser()
      }
      router.push("/chat")
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setServerError(err.response?.data?.message || err.response?.data?.error || "Registration failed. Please try again.")
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
          Create an account
        </h1>
        <p className="text-sm text-muted-foreground">
          Get started with SupportIQ for free
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
          label="Full Name"
          placeholder="John Doe"
          value={form.name}
          onValueChange={updateField("name")}
          error={errors.name}
          required
          startIcon={<User />}
        />

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
        text="Create Account"
        loadingText="Creating..."
        isLoading={loading}
        onPress={handleSubmit}
        width="100%"
        height="42px"
      />

      {/* Footer */}
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary"
        >
          Log in
        </Link>
      </p>
    </div>
  )
}
