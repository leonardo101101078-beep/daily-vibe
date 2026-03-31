import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Settings2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { seedTodayLogs, fetchTodayLogs } from '@/lib/actions/daily-logs'
import { getNotificationSettings } from '@/lib/actions/push'
import { TaskChecklist } from '@/components/TaskChecklist'
import { NotificationToggle } from '@/components/NotificationToggle'

function getLocalDateString(): string {
  // Returns YYYY-MM-DD using the server's local time.
  // For per-user timezones, pass the user's timezone from their profile.
  const now = new Date()
  return now.toISOString().slice(0, 10)
}

function formatDisplayDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`)
  return date.toLocaleDateString('zh-TW', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 6) return '深夜好'
  if (hour < 12) return '早安'
  if (hour < 18) return '午安'
  return '晚安'
}

export default async function HomePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Middleware handles unauthenticated redirects, but keep this as a safety net
  if (!user) redirect('/login')

  const today = getLocalDateString()

  // Run seed + data fetches in parallel to minimise server latency
  const [logs, notificationSettings] = await Promise.all([
    seedTodayLogs(user.id, today).then(() => fetchTodayLogs(user.id, today)),
    getNotificationSettings(),
  ])

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-md">
        {/* Page header */}
        <header className="flex items-start justify-between gap-3 px-5 pb-4 pt-10">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {formatDisplayDate(today)}
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">
              {getGreeting()}，今天繼續加油 👋
            </h1>
          </div>
          <Link
            href="/templates"
            className="mt-1 flex shrink-0 items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Settings2 className="h-3.5 w-3.5" />
            管理模板
          </Link>
        </header>

        {/* Main checklist (progress bar + task items) */}
        <TaskChecklist initialLogs={logs} />

        {/* Push notification toggle — shown below the task list */}
        <div className="px-5 pb-8 pt-2">
          <NotificationToggle initialSettings={notificationSettings} />
        </div>
      </div>
    </main>
  )
}
