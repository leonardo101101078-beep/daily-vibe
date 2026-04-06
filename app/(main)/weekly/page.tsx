import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { listWeeklyGoals } from '@/lib/actions/goals'
import { mondayOfWeekContaining, weekDayLabels } from '@/lib/week'
import { WeeklyGoalsClient } from '@/components/weekly/WeeklyGoalsClient'
import { cn } from '@/lib/utils'

function getLocalDateString(): string {
  const now = new Date()
  return now.toISOString().slice(0, 10)
}

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function formatLocalDate(d: Date): string {
  const yy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yy}-${mm}-${dd}`
}

function addDays(dateStr: string, days: number): string {
  const d = parseLocalDate(dateStr)
  d.setDate(d.getDate() + days)
  return formatLocalDate(d)
}

export const metadata = {
  title: '每週目標 | DailyVibe',
}

export default async function WeeklyPage({
  searchParams,
}: {
  searchParams: { week?: string }
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const calendarToday = getLocalDateString()
  const rawWeek = searchParams.week
  const weekStart =
    rawWeek && /^\d{4}-\d{2}-\d{2}$/.test(rawWeek)
      ? mondayOfWeekContaining(rawWeek)
      : mondayOfWeekContaining(calendarToday)

  const goals = await listWeeklyGoals(weekStart)
  const days = weekDayLabels(weekStart)
  const prevWeekStart = addDays(weekStart, -7)
  const nextWeekStart = addDays(weekStart, 7)

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-md px-5 pb-28 pt-8">
        <h1 className="font-display text-2xl font-extrabold tracking-tight">
          每週目標
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          設定本週方向，並點選日期查看當日的今日事項。
        </p>

        <div className="mt-6">
          <WeeklyGoalsClient
            weekStart={weekStart}
            goals={goals}
            prevWeekStart={prevWeekStart}
            nextWeekStart={nextWeekStart}
          />
        </div>

        <div className="mt-8">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            本週日期
          </h2>
          <ul
            className="grid grid-cols-7 gap-1.5 text-center"
            role="list"
          >
            {days.map(({ date, label }) => {
              const isToday = date === calendarToday
              return (
                <li key={date}>
                  <Link
                    href={`/today?date=${date}`}
                    className={cn(
                      'flex flex-col items-center rounded-xl border border-border/60 bg-card py-2.5 text-xs shadow-sm transition-colors hover:bg-muted/80',
                      isToday && 'border-primary bg-primary/10',
                    )}
                  >
                    <span className="text-[10px] font-medium text-muted-foreground">
                      週{label}
                    </span>
                    <span className="mt-1 font-display text-base font-bold tabular-nums">
                      {date.slice(8, 10)}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </main>
  )
}
