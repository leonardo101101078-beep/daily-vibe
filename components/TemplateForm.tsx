'use client'

import { useTransition, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus } from 'lucide-react'
import { createTaskTemplate } from '@/lib/actions/task-templates'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const CATEGORIES = [
  { value: 'personal', label: '個人' },
  { value: 'health', label: '健康' },
  { value: 'work', label: '工作' },
  { value: 'learning', label: '學習' },
] as const

export function TemplateForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">新增模板</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          id="template-form"
          className="space-y-4"
          action={(formData) => {
            setError('')
            startTransition(async () => {
              try {
                await createTaskTemplate({
                  title: formData.get('title') as string,
                  description: (formData.get('description') as string) || null,
                  category: formData.get('category') as string,
                  targetValue:
                    (formData.get('target_value') as string)?.trim() === ''
                      ? null
                      : Number(formData.get('target_value')),
                  unit: (formData.get('unit') as string) || null,
                })
                router.refresh()
                ;(document.getElementById('template-form') as HTMLFormElement)?.reset()
              } catch (e) {
                setError(e instanceof Error ? e.message : '建立失敗')
              }
            })
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="title">標題</Label>
            <Input
              id="title"
              name="title"
              placeholder="例如：雅思閱讀 30 分鐘"
              required
              maxLength={200}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">說明（選填）</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="補充細節…"
              rows={2}
              className="min-h-0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">類別</Label>
            <select
              id="category"
              name="category"
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              defaultValue="personal"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="target_value">目標數值（選填）</Label>
              <Input
                id="target_value"
                name="target_value"
                type="number"
                min={0}
                step="any"
                placeholder="例如 8"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">單位（選填）</Label>
              <Input
                id="unit"
                name="unit"
                placeholder="杯、分鐘…"
                maxLength={32}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {isPending ? '建立中…' : '建立模板'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
