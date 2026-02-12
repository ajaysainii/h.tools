<template>
  <header class="py-2 w-100 z-3 position-relative bg-black">
    <div class="container d-flex align-items-center justify-content-between gap-2">
      <NuxtLink to="/" class="navbar-brand d-flex align-items-center gap-2 text-decoration-none me-2">
        <img src="~/assets/images/logo.svg" alt="Heartbeat Logo" height="32" />
        <span class="fw-bold text-white" style="letter-spacing:.4px; font-size:1.05rem">
          Heartbeat Tools
        </span>
      </NuxtLink>

      <div class="d-flex align-items-center ms-auto gap-2">
        <ClientOnly>
          <button
            class="btn btn-ghost btn-sm d-inline-flex align-items-center"
            type="button"
            :aria-label="themeValue === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'"
            @click="toggleTheme"
          >
            <i v-if="themeValue === 'dark'" class="bi bi-sun"></i>
            <i v-else class="bi bi-moon"></i>
          </button>
        </ClientOnly>

        <button
          v-if="ready && !isAuthed"
          class="btn btn-outline-light d-inline-flex align-items-center gap-2 text-white"
          @click="loginWithGoogle"
        >
          <i class="bi bi-google"></i>
          Sign In
        </button>

        <div v-else-if="ready && isAuthed" class="position-relative" ref="accountBox">
          <button
            class="btn btn-outline-light d-inline-flex align-items-center gap-2 border-primary"
            @click="openAccount = !openAccount"
          >
            <img
              :src="user?.photoURL || 'https://placehold.co/28x28?text=U'"
              width="28"
              height="28"
              class="rounded-circle"
              referrerpolicy="no-referrer"
              crossorigin="anonymous"
            />
            <span class="d-none d-md-inline text-white">{{ user?.displayName || 'Account' }}</span>
          </button>

          <div v-if="openAccount" class="account-menu card mt-2 p-2">
            <p class="mb-1 fw-semibold">{{ user?.displayName || 'User' }}</p>
            <p class="mb-2 small text-muted">{{ user?.email }}</p>
            <button class="btn btn-outline-danger btn-sm" @click="handleLogout">Sign Out</button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useAuth } from '~/composables/useAuth'

const { user, ready, loginWithGoogle, logout } = useAuth()
const nuxtApp = useNuxtApp()

const openAccount = ref(false)
const accountBox = ref<HTMLElement | null>(null)

const themeRef = (nuxtApp as any).$theme as { value: 'dark' | 'light' } | undefined
const toggleTheme = (nuxtApp as any).$toggleTheme as (() => void) | undefined
const themeValue = computed(() => themeRef?.value || 'dark')
const isAuthed = computed(() => !!user.value)

async function handleLogout() {
  await logout()
  openAccount.value = false
}

function onOutsideClick(e: MouseEvent) {
  if (!openAccount.value) return
  const target = e.target as Node
  if (accountBox.value && !accountBox.value.contains(target)) {
    openAccount.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onOutsideClick)
})
</script>

<style scoped>
.account-menu {
  position: absolute;
  right: 0;
  min-width: 240px;
  z-index: 20;
  background: var(--hb-surface);
  border: 1px solid var(--hb-border);
  box-shadow: var(--hb-card-shadow);
}
</style>
