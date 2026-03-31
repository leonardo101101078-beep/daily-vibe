/** Shared category badge colours (matches TaskItem). */
export const CATEGORY_STYLES: Record<string, { bg: string; text: string }> = {
  health: { bg: 'bg-green-100', text: 'text-green-700' },
  work: { bg: 'bg-blue-100', text: 'text-blue-700' },
  learning: { bg: 'bg-purple-100', text: 'text-purple-700' },
  personal: { bg: 'bg-orange-100', text: 'text-orange-700' },
}

export const DEFAULT_CATEGORY_STYLE = {
  bg: 'bg-slate-100',
  text: 'text-slate-600',
}
