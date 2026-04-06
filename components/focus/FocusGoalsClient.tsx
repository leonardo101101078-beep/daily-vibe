'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  addAnnualGoal,
  addMonthlyGoal,
  deleteAnnualGoal,
  deleteMonthlyGoal,
} from '@/lib/actions/goals'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AnnualGoalRow, MonthlyGoalRow } from '@/types/database'

type Props = {
  annualGoals: AnnualGoalRow[]
  monthlyGoals: MonthlyGoalRow[]
  year: number
  month: number
}

function shiftMonth(y: number, m: number, delta: number): { year: number; month: number } {
  let mm = m + delta
  let yy = y
  while (mm < 1) {
    mm += 12
    yy -= 1
  }
  while (mm > 12) {
    mm -= 12
    yy += 1
  }
  return { year: yy, month: mm }
}

export function FocusGoalsClient({
  annualGoals,
  monthlyGoals,
  year,
  month,
}: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [annualTitle, setAnnualTitle] = useState('')
  const [monthlyTitle, setMonthlyTitle] = useState('')

  const prev = shiftMonth(year, month, -1)
  const next = shiftMonth(year, month, 1)

  const refresh = () => router.refresh()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">年度目標</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              const t = annualTitle.trim()
              if (!t) return
              startTransition(async () => {
                await addAnnualGoal(t)
                setAnnualTitle('')
                refresh()
              })
            }}
          >
            <Input
              value={annualTitle}
              onChange={(e) => setAnnualTitle(e.target.value)}
              placeholder="新增年度目標…"
              disabled={pending}
            />
            <Button type="submit" disabled={pending}>
              新增
            </Button>
          </form>
          <ul className="space-y-2" role="list">
            {annualGoals.length === 0 ? (
              <li className="text-sm text-muted-foreground">尚無目標</li>
            ) : (
              annualGoals.map((g) => (
                <li
                  key={g.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm"
                >
                  <span>{g.title}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    disabled={pending}
                    onClick={() => {
                      if (!confirm('刪除此目標？')) return
                      startTransition(async () => {
                        await deleteAnnualGoal(g.id)
                        refresh()
                      })
                    }}
                  >
                    刪除
                  </Button>
                </li>
              ))
            )}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 pb-2">
          <CardTitle className="text-lg">月度重點</CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/focus?year=${prev.year}&month=${prev.month}`}>
                上月
              </Link>
            </Button>
            <span className="tabular-nums text-muted-foreground">
              {year} 年 {month} 月
            </span>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/focus?year=${next.year}&month=${next.month}`}>
                下月
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              const t = monthlyTitle.trim()
              if (!t) return
              startTransition(async () => {
                await addMonthlyGoal(year, month, t)
                setMonthlyTitle('')
                refresh()
              })
            }}
          >
            <Input
              value={monthlyTitle}
              onChange={(e) => setMonthlyTitle(e.target.value)}
              placeholder="新增本月重點…"
              disabled={pending}
            />
            <Button type="submit" disabled={pending}>
              新增
            </Button>
          </form>
          <ul className="space-y-2" role="list">
            {monthlyGoals.length === 0 ? (
              <li className="text-sm text-muted-foreground">本月尚無重點</li>
            ) : (
              monthlyGoals.map((g) => (
                <li
                  key={g.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm"
                >
                  <span>{g.title}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    disabled={pending}
                    onClick={() => {
                      if (!confirm('刪除此重點？')) return
                      startTransition(async () => {
                        await deleteMonthlyGoal(g.id)
                        refresh()
                      })
                    }}
                  >
                    刪除
                  </Button>
                </li>
              ))
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
