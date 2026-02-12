import type { Auth, GoogleAuthProvider } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore/lite'
import type { Ref } from 'vue'

declare module '#app' {
  interface NuxtApp {
    $firebase: {
      auth: Auth
      provider: GoogleAuthProvider
      db: Firestore
    }
    $theme: Ref<'light' | 'dark'>
    $toggleTheme: () => void
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $firebase: {
      auth: Auth
      provider: GoogleAuthProvider
      db: Firestore
    }
    $theme: Ref<'light' | 'dark'>
    $toggleTheme: () => void
  }
}

export {}
