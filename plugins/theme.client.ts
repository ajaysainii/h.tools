import { defineNuxtPlugin, useCookie } from '#app'
import { useState } from '#imports'

type Theme = 'light' | 'dark'

export default defineNuxtPlugin(() => {
  const theme = useState<Theme>('theme', () => 'dark')
  const cookie = useCookie<Theme>('hb_theme', { path: '/', sameSite: 'lax' })

  const pickInitial = (): Theme => {
    const saved = cookie.value || (typeof localStorage !== 'undefined'
      ? (localStorage.getItem('hb_theme') as Theme | null)
      : null)
    if (saved === 'light' || saved === 'dark') return saved
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    return 'light'
  }

  const apply = (t: Theme) => {
    document.documentElement.setAttribute('data-theme', t)
  }

  theme.value = pickInitial()
  cookie.value = theme.value
  try { localStorage.setItem('hb_theme', theme.value) } catch {}
  apply(theme.value)

  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    cookie.value = theme.value
    try { localStorage.setItem('hb_theme', theme.value) } catch {}
    apply(theme.value)
  }

  return {
    provide: {
      theme,
      toggleTheme,
    },
  }
})
