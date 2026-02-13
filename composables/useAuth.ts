import type { User } from 'firebase/auth'
import {
  browserLocalPersistence,
  getRedirectResult,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth'
import { ref } from 'vue'
import { useNuxtApp } from '#app'
import { useToast } from '~/composables/useToast'

const _user = ref<User | null>(null)
const _ready = ref(false)
const _initialized = ref(false)
const _lastAuthError = ref('')

export function useAuth() {
  const { $firebase } = useNuxtApp()
  const toast = useToast()

  async function loginWithGoogle() {
    try {
      await setPersistence($firebase.auth, browserLocalPersistence)
    } catch {
      // ignore and continue with provider sign-in attempt
    }

    try {
      await signInWithPopup($firebase.auth, $firebase.provider)
      return
    } catch (error) {
      const code = typeof error === 'object' && error && 'code' in error ? String((error as { code?: unknown }).code ?? '') : ''
      const shouldFallbackToRedirect =
        code === 'auth/popup-blocked' ||
        code === 'auth/cancelled-popup-request' ||
        code === 'auth/operation-not-supported-in-this-environment'

      if (shouldFallbackToRedirect) {
        try {
          await signInWithRedirect($firebase.auth, $firebase.provider)
          return
        } catch (redirectError) {
          reportAuthError(redirectError)
          return
        }
      }

      reportAuthError(error)
    }
  }

  async function logout() {
    await signOut($firebase.auth)
  }

  if (import.meta.client && !_initialized.value) {
    _initialized.value = true

    // Keep users signed in across full-page redirects.
    setPersistence($firebase.auth, browserLocalPersistence).catch(() => {})

    // Attach listener once; it updates after redirect completion too.
    onAuthStateChanged($firebase.auth, (u) => {
      _user.value = u
      if (u) _lastAuthError.value = ''
      _ready.value = true
    })

    // Surface redirect errors (e.g. unauthorized-domain) instead of silent failure.
    getRedirectResult($firebase.auth).catch((error) => {
      reportAuthError(error)
    })
  }

  return { user: _user, ready: _ready, loginWithGoogle, logout }

  function reportAuthError(error: unknown) {
    const code = typeof error === 'object' && error && 'code' in error ? String((error as { code?: unknown }).code ?? '') : ''
    let message = 'Could not complete sign-in.'

    if (code === 'auth/unauthorized-domain') {
      message = 'Sign-in failed: add this domain to Firebase authorized domains.'
    } else if (code === 'auth/popup-closed-by-user') {
      message = 'Sign-in cancelled.'
    } else if (code) {
      message = `Sign-in failed: ${code}.`
    }

    if (_lastAuthError.value !== message) {
      _lastAuthError.value = message
      toast.error(message)
    }
  }
}
