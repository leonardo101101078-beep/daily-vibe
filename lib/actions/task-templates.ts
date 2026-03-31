'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { TaskTemplate } from '@/types/database'

const VALID_CATEGORIES = ['health', 'work', 'learning', 'personal'] as const
export type TaskCategory = (typeof VALID_CATEGORIES)[number]

export interface CreateTaskTemplateInput {
  title: string
  description?: string | null
  category?: string
  targetValue?: number | null
  unit?: string | null
}

export async function getTaskTemplates(): Promise<TaskTemplate[]> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('task_templates')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as TaskTemplate[]
}

export async function createTaskTemplate(
  input: CreateTaskTemplateInput,
): Promise<void> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const title = input.title?.trim()
  if (!title) throw new Error('標題為必填')

  const category =
    input.category && VALID_CATEGORIES.includes(input.category as TaskCategory)
      ? input.category
      : 'personal'

  const { data: last } = await supabase
    .from('task_templates')
    .select('sort_order')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const sortOrder = (last?.sort_order ?? -1) + 1

  const targetValue =
    input.targetValue != null && !Number.isNaN(Number(input.targetValue))
      ? Number(input.targetValue)
      : null
  const unit =
    targetValue != null && input.unit?.trim()
      ? input.unit.trim()
      : null

  const { error } = await supabase.from('task_templates').insert({
    user_id: user.id,
    title,
    description: input.description?.trim() || null,
    category,
    sort_order: sortOrder,
    is_active: true,
    target_value: targetValue,
    unit,
    icon: null,
    color: null,
  })

  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/templates')
}
