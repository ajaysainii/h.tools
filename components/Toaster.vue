<template>
  <div class="hb-toaster" role="status" aria-live="polite">
    <div
      v-for="t in list"
      :key="t.id"
      class="toast-card"
      :class="t.kind"
      :data-kind="t.kind"
    >
      <div class="toast-left">
        <span class="toast-icon" aria-hidden="true">
          <i v-if="t.kind === 'success'" class="bi bi-check2-circle"></i>
          <i v-else-if="t.kind === 'error'" class="bi bi-x-octagon"></i>
          <i v-else class="bi bi-info-circle"></i>
        </span>
      </div>

      <div class="toast-body">
        <strong v-if="t.title" class="toast-title">{{ t.title }}</strong>
        <span class="toast-text">{{ t.message }}</span>
      </div>

      <button class="toast-close" @click="remove(t.id)" aria-label="Dismiss">
        <i class="bi bi-x-lg"></i>
      </button>

      <span class="toast-progress" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast'

const { list, remove } = useToast()
</script>

<style scoped>
.hb-toaster {
  position: fixed;
  left: 16px;
  bottom: 16px;
  z-index: 2000;
  display: flex;
  flex-direction: column-reverse;
  gap: 12px;
  pointer-events: none;
}

.toast-card {
  --bg: rgba(20, 22, 28, 0.7);
  --bd: rgba(255, 255, 255, 0.08);
  --fg: #e9eef7;
  --acc: #60a5fa;
  backdrop-filter: blur(10px) saturate(140%);
  background: var(--bg);
  border: 1px solid var(--bd);
  color: var(--fg);
  width: min(380px, 88vw);
  border-radius: 14px;
  padding: 10px 12px 12px 10px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-areas:
    "icon body close"
    "bar bar bar";
  align-items: center;
  gap: 10px;
  pointer-events: auto;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
  animation: toastIn 0.22s ease-out both;
}

.toast-card.info { --acc: #60a5fa; }
.toast-card.success { --acc: #22c55e; }
.toast-card.error { --acc: #ef4444; }

.toast-left {
  grid-area: icon;
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: color-mix(in oklab, var(--acc) 18%, transparent);
  border: 1px solid color-mix(in oklab, var(--acc) 35%, transparent);
}

.toast-icon {
  font-size: 18px;
  color: var(--acc);
  display: inline-grid;
  place-items: center;
}

.toast-body {
  grid-area: body;
  display: flex;
  flex-direction: column;
  gap: 2px;
  line-height: 1.25;
}

.toast-title {
  font-weight: 700;
  letter-spacing: 0.2px;
  font-size: 0.95rem;
  color: #fff;
}

.toast-text {
  font-size: 0.92rem;
  color: #dfe6f5;
}

.toast-close {
  grid-area: close;
  background: transparent;
  border: 0;
  color: #cbd5e1;
  opacity: 0.8;
  padding: 6px;
  border-radius: 8px;
  transition: background 0.15s ease, opacity 0.15s ease, transform 0.05s ease;
}

.toast-close:hover {
  background: rgba(255, 255, 255, 0.08);
  opacity: 1;
}

.toast-close:active {
  transform: translateY(1px);
}

.toast-progress {
  grid-area: bar;
  height: 3px;
  border-radius: 99px;
  width: 100%;
  background: linear-gradient(90deg, var(--acc), color-mix(in oklab, var(--acc) 55%, #fff));
  mask: linear-gradient(90deg, #000 0 0) no-repeat;
  animation: bar 3s linear forwards;
  opacity: 0.9;
}

@keyframes toastIn {
  from {
    transform: translateY(8px) scale(0.98);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes bar {
  from { mask-size: 100% 100%; }
  to { mask-size: 0% 100%; }
}

.toast-card:hover {
  transform: translateY(-2px);
  transition: transform 0.15s ease;
}

@media (prefers-reduced-motion: reduce) {
  .toast-card { animation: none; }
  .toast-progress { animation: none; }
}

@media (max-width: 420px) {
  .hb-toaster {
    left: 12px;
    bottom: 12px;
    gap: 10px;
  }

  .toast-card {
    width: calc(100vw - 24px);
  }
}
</style>
