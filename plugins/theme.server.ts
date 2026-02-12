import { defineNuxtPlugin, useState } from '#app'

type Theme = 'light' | 'dark'

export default defineNuxtPlugin(() => {
  const theme = useState<Theme>('theme', () => 'dark')
  const toggleTheme = () => {}

  return {
    provide: {
      theme,
      toggleTheme,
    },
  }
})
