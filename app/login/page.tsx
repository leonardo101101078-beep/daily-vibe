'use client'

import { useState } from 'react'
import { CalendarDays, Mail, Loader2, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  // ── 已寄出：顯示確認畫面 ──
  if (sent) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="max-w-xs space-y-5">
          <div className="flex justify-center">
            <div className="rounded-2xl bg-green-100 p-5">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight">確認你的信箱</h1>
            <p className="text-sm text-muted-foreground">
              登入連結已發送到{' '}
              <span className="font-medium text-foreground">{email}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              點擊信件中的連結即可登入，無需密碼。
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="text-xs text-muted-foreground underline underline-offset-2"
          >
            使用其他信箱重新發送
          </button>
        </div>
      </main>
    )
  }

  // ── 預設：登入表單 ──
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-xs space-y-7">
        {/* Logo & title */}
        <div className="space-y-3 text-center">
          <div className="flex justify-center">
            <div className="rounded-2xl bg-primary/10 p-5">
              <CalendarDays className="h-10 w-10 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">DailyVibe</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              每日任務追蹤，從今天開始
            </p>
          </div>
        </div>

        {/* Login form */}
        <form onSubmit={handleLogin} className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              placeholder="輸入你的 Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-xl border border-input bg-background py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !email}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Mail className="h-4 w-4" />
            )}
            {loading ? '發送中…' : '發送登入連結'}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          免密碼登入 · 點擊信件中的連結即可進入
        </p>
      </div>
    </main>
  )
}
