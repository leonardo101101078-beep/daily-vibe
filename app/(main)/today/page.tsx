import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { seedTodayLogs, fetchTodayLogs } from '@/lib/actions/daily-logs'
import { getWellnessForDate } from '@/lib/actions/wellness'
import { getTaskTemplates } from '@/lib/actions/task-templates'
import { GroupedDayChecklist } from '@/components/GroupedDayChecklist'
import { TodayClock } from '@/components/TodayClock'
import { WellnessCard } from '@/components/WellnessCard'
import { TemplateForm } from '@/components/TemplateForm'
import { DailyNoteCard } from '@/components/DailyNoteCard'
import { ManageTaskTemplates } from '@/components/ManageTaskTemplates'

function getLocalDateString(): string {
  const now = new Date()
  return now.toISOString().slice(0, 10)
}

function parseViewDate(raw: string | undefined, fallback: string): string {
  if (!raw || !/^\d{4}-\d{2}-\d{2}$/.test(raw)) return fallback
  return raw
}

function formatDisplayDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`)
  return date.toLocaleDateString('zh-TW', {
    weekday: 'long',
    year: 'numeric',
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

export const metadata = {
  title: '今日事項 | DailyVibe',
}

/** 避免快取導致新增任務／seed 後仍顯示舊清單 */
export const dynamic = 'force-dynamic'

export default async function TodayPage({
  searchParams,
}: {
  searchParams: { date?: string }
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const calendarToday = getLocalDateString()
  const viewDate = parseViewDate(searchParams.date, calendarToday)

  const [{ data: review }, wellness] = await Promise.all([
    supabase
      .from('daily_reviews')
      .select('review_text')
      .eq('user_id', user.id)
      .eq('date', viewDate)
      .maybeSingle(),
    getWellnessForDate(user.id, viewDate),
  ])

  const [templates, logs] = await Promise.all([
    getTaskTemplates(),
    seedTodayLogs(user.id, viewDate, calendarToday).then(() =>
      fetchTodayLogs(user.id, viewDate),
    ),
  ])

  const taskCount = logs.length
  const isViewingOtherDay = viewDate !== calendarToday

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-md">
        <header className="px-5 pb-6 pt-10">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {formatDisplayDate(viewDate)}
          </p>
          <h1 className="font-display mt-3 text-[1.75rem] font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl">
            今日事項
            <span className="text-muted-foreground">（{taskCount}）</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {getGreeting()}，今天繼續加油
          </p>
          {isViewingOtherDay && (
            <p className="mt-2 rounded-xl bg-muted/80 px-3 py-2 text-xs text-muted-foreground">
              正在檢視：{viewDate}（今日為 {calendarToday}）
            </p>
          )}
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
          <WellnessCard date={viewDate} initial={wellness} />
        </div>

        <div
          className="motion-bento-in px-5"
          style={{ animationDelay: '210ms' }}
        >
          <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/90 shadow-sm backdrop-blur-sm">
            <GroupedDayChecklist
              key={logs.map((l) => l.id).join('|')}
              initialLogs={logs}
            />
          </div>
        </div>

        <div
          className="motion-bento-in space-y-4 px-5 pb-4 pt-5"
          style={{ animationDelay: '260ms' }}
        >
          <DailyNoteCard
            date={viewDate}
            initialText={review?.review_text ?? null}
          />
        </div>

        <div
          className="motion-bento-in space-y-4 px-5 pb-6"
          style={{ animationDelay: '300ms' }}
        >
          <TemplateForm
            variant="card"
            minOccurrenceDate={calendarToday}
          />
          <ManageTaskTemplates templates={templates} />
        </div>
      </div>
    </main>
  )
}
