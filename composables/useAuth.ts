import type { User } from 'firebase/auth'
import { onAuthStateChanged, signInWithRedirect, signOut } from 'firebase/auth'
import { onMounted, ref } from 'vue'
import { useNuxtApp } from '#app'

const _user = ref<User | null>(null)
const _ready = ref(false)

export function useAuth() {
  const { $firebase } = useNuxtApp()

  async function loginWithGoogle() {
    await signInWithRedirect($firebase.auth, $firebase.provider)
  }

  async function logout() {
    await signOut($firebase.auth)
  }

  onMounted(() => {
    if (_ready.value) return
    onAuthStateChanged($firebase.auth, (u) => {
      _user.value = u
      _ready.value = true
    })
  })

  return { user: _user, ready: _ready, loginWithGoogle, logout }
}
