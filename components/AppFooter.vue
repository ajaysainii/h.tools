<template>
  <footer class="hb-footer border-top pt-4 pb-3 mt-5">
    <div class="container">
      <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div>
          <div class="d-flex align-items-center gap-2 mb-2">
            <img src="~/assets/images/logo.svg" alt="Heartbeat Logo" style="max-width: 110px" />
            <span class="fw-bold fs-6">Heartbeat Tools</span>
          </div>
          <p class="hb-muted mb-0">Fast, focused text utilities for everyday workflows.</p>
        </div>

        <div class="d-flex gap-3">
          <a href="#" class="hb-social" aria-label="Facebook">
            <i class="bi bi-facebook fs-5"></i>
          </a>
          <a href="#" class="hb-social" aria-label="Instagram">
            <i class="bi bi-instagram fs-5"></i>
          </a>
          <a href="#" class="hb-social" aria-label="GitHub">
            <i class="bi bi-github fs-5"></i>
          </a>
        </div>
      </div>

      <div class="text-center pt-3 mt-3 border-top">
        <small class="hb-muted">© {{ year }} Heartbeat Tools</small>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<style scoped>
.hb-footer {
  background: var(--hb-surface);
  color: var(--hb-text);
  border-color: var(--hb-border);
}

.hb-muted {
  color: var(--hb-text-muted);
}

.hb-social {
  display: inline-grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: var(--hb-brand);
  color: #fff;
  text-decoration: none;
  transition: transform 0.12s ease, filter 0.12s ease;
}

.hb-social:hover {
  transform: translateY(-1px);
  filter: brightness(1.05);
}
</style>
