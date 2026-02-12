import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore/lite'
import { markRaw } from 'vue'

export default defineNuxtPlugin(() => {
  const cfg = useRuntimeConfig().public

  const firebaseConfig = {
    apiKey: cfg.FB_API_KEY,
    authDomain: cfg.FB_AUTH_DOMAIN,
    projectId: cfg.FB_PROJECT_ID,
    appId: cfg.FB_APP_ID,
  }

  const app = markRaw(getApps().length ? getApps()[0]! : initializeApp(firebaseConfig))
  const auth = markRaw(getAuth(app))
  const provider = markRaw(new GoogleAuthProvider())
  const db = markRaw(getFirestore(app))

  return {
    provide: {
      firebase: {
        app,
        auth,
        provider,
        db,
      },
    },
  }
})
