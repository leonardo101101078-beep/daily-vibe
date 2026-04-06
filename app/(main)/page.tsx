import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { seedTodayLogs, fetchTodayLogs } from '@/lib/actions/daily-logs'
import { getNotificationSettings } from '@/lib/actions/push'
import { getWellnessForDate } from '@/lib/actions/wellness'
import { GroupedDayChecklist } from '@/components/GroupedDayChecklist'
import { NotificationToggle } from '@/components/NotificationToggle'
import { TodayClock } from '@/components/TodayClock'
import { WellnessCard } from '@/components/WellnessCard'

function getLocalDateString(): string {
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

  if (!user) redirect('/login')

  const today = getLocalDateString()

  const [logs, notificationSettings, wellness] = await Promise.all([
    seedTodayLogs(user.id, today).then(() => fetchTodayLogs(user.id, today)),
    getNotificationSettings(),
    getWellnessForDate(user.id, today),
  ])

  const taskCount = logs.length

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-md">
        <header className="px-5 pb-6 pt-10">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {formatDisplayDate(today)}
          </p>
          <h1 className="font-display mt-3 text-[1.75rem] font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl">
            今日待辦
            <span className="text-muted-foreground">（{taskCount}）</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {getGreeting()}，今天繼續加油
          </p>
        </header>

        <div className="grid grid-cols-2 gap-3 px-5 pb-4">
          <div
            className="motion-bento-in flex flex-col justify-between rounded-2xl border border-border/50 bg-bento-mint/90 p-4 shadow-sm [animation-delay:0ms]"
            style={{ animationDelay: '0ms' }}
          >
            <TodayClock />
            <span className="mt-2 text-[11px] font-medium text-muted-foreground">
              本地時間
            </span>
          </div>
          <div
            className="motion-bento-in flex flex-col justify-center rounded-2xl border border-border/50 bg-bento-sky/90 p-4 shadow-sm"
            style={{ animationDelay: '70ms' }}
          >
            <p className="font-display text-2xl font-bold tabular-nums leading-none text-foreground">
              {taskCount > 0
                ? Math.round(
                    (logs.filter((l) => l.status === 'completed').length /
                      taskCount) *
                      100,
                  )
                : 0}
              <span className="text-lg font-semibold text-muted-foreground">
                %
              </span>
            </p>
            <span className="mt-2 text-[11px] font-medium text-muted-foreground">
              今日完成度
            </span>
          </div>
        </div>

        <div
          className="motion-bento-in px-5 pb-4"
          style={{ animationDelay: '140ms' }}
        >
          <WellnessCard date={today} initial={wellness} />
        </div>

        <div
          className="motion-bento-in px-5"
          style={{ animationDelay: '210ms' }}
        >
          <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/90 shadow-sm backdrop-blur-sm">
            <GroupedDayChecklist initialLogs={logs} />
          </div>
        </div>

        <div
          className="motion-bento-in px-5 pb-8 pt-5"
          style={{ animationDelay: '280ms' }}
        >
          <NotificationToggle initialSettings={notificationSettings} />
        </div>
      </div>
    </main>
  )
}
