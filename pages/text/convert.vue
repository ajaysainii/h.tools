<template>
  <section class="case-studio">
    <div class="container">
      <div class="case-studio__hero">
        <div>
          <h1 class="case-studio__title">Case Studio</h1>
          <p class="case-studio__lead">Convert text quickly with smart exceptions</p>
        </div>
        <button class="case-studio__action-btn case-studio__exceptions-trigger" type="button" @click="showExceptionsPopup = true">
          Exceptions ({{ userExceptions.length }})
        </button>
      </div>

      <div class="case-studio__shell">
        <div class="case-studio__panel">
          <div class="case-studio__field-head">
            <label class="case-studio__label" for="case-input">Input</label>
            <button class="case-studio__action-btn" type="button" @click="clearAll">Clear</button>
          </div>
          <textarea
            id="case-input"
            v-model="inputText"
            class="case-studio__textarea"
            rows="7"
            placeholder="Type or paste text here"
          />
        </div>

        <div class="case-studio__actions" aria-label="Conversion actions">
          <button
            v-for="conversion in conversionButtons"
            :key="conversion.kind"
            class="case-studio__chip"
            type="button"
            @mouseenter="applyCase(conversion.kind)"
            @focus="applyCase(conversion.kind)"
            @click="applyCase(conversion.kind)"
          >
            {{ conversion.label }}
          </button>
        </div>

        <div class="case-studio__panel case-studio__panel--output">
          <div class="case-studio__field-head">
            <label class="case-studio__label" for="case-output">Output</label>
            <button
              class="case-studio__action-btn"
              type="button"
              :disabled="!outputText"
              @click="copyOutput"
            >
              <i class="bi bi-clipboard"></i>
              Copy
            </button>
          </div>
          <textarea
            id="case-output"
            :value="outputText"
            class="case-studio__textarea case-studio__textarea--output"
            rows="7"
            readonly
          />
          <div class="case-studio__hint">Conversions auto-copy to clipboard.</div>
        </div>
      </div>
    </div>

    <div v-if="showExceptionsPopup" class="case-studio__popup-backdrop" @click.self="showExceptionsPopup = false">
      <div class="case-studio__popup">
        <div class="case-studio__field-head">
          <label class="case-studio__exceptions-label" for="case-exception">Exceptions</label>
          <button class="case-studio__action-btn case-studio__popup-close" type="button" @click="showExceptionsPopup = false">
            Close
          </button>
        </div>

        <form class="case-studio__exception-form" @submit.prevent="addException">
          <input
            id="case-exception"
            v-model="exceptionInput"
            class="case-studio__exception-input"
            type="text"
            placeholder="e.g. LLC"
            :disabled="!isAuthed || savingExceptions"
          />
          <button class="case-studio__action-btn" type="submit" :disabled="!canAddException">
            Add
          </button>
        </form>

        <p v-if="ready && !isAuthed" class="case-studio__exceptions-note">
          Sign in to save exceptions for your account.
        </p>
        <p v-else-if="isAuthed && loadingExceptions" class="case-studio__exceptions-note">
          Loading exceptions...
        </p>
        <p v-else-if="exceptionsError" class="case-studio__exceptions-note">
          {{ exceptionsError }}
        </p>
        <div v-if="userExceptions.length" class="case-studio__exception-list">
          <button
            v-for="exception in userExceptions"
            :key="exception"
            class="case-studio__exception-item"
            type="button"
            :disabled="savingExceptions"
            @click="removeException(exception)"
          >
            <span>{{ exception }}</span>
            <i class="bi bi-x"></i>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore/lite'
import { computed, ref, watch } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useToast } from '~/composables/useToast'

definePageMeta({
  title: 'Case Converter',
  description: 'Convert text quickly with smart exceptions.',
  headerPosition: 'position-relative',
})

const inputText = ref('')
const outputText = ref('')
const exceptionInput = ref('')
const showExceptionsPopup = ref(false)
const userExceptions = ref<string[]>([])
const loadingExceptions = ref(false)
const savingExceptions = ref(false)
const exceptionsError = ref('')
const exceptionsStorageMode = ref<'unknown' | 'root' | 'legacy'>('unknown')
const toast = useToast()
const { user, ready } = useAuth()
const { $firebase } = useNuxtApp()
const isAuthed = computed(() => !!user.value)
const canAddException = computed(() => !!exceptionInput.value.trim() && isAuthed.value && !savingExceptions.value)

type CaseKind =
  | 'title'
  | 'sentence'
  | 'lower'
  | 'upper'
  | 'snake'
  | 'kebab'
  | 'reverse'
  | 'ascii'
  | 'asciiHex'

const conversionButtons: Array<{ kind: CaseKind; label: string }> = [
  { kind: 'title', label: 'Title' },
  { kind: 'sentence', label: 'Sentence' },
  { kind: 'lower', label: 'lower' },
  { kind: 'upper', label: 'UPPER' },
  { kind: 'snake', label: 'snake' },
  { kind: 'kebab', label: 'kebab' },
  { kind: 'reverse', label: 'Reverse' },
  { kind: 'ascii', label: 'ASCII' },
  { kind: 'asciiHex', label: 'ASCII Hex' },
]

const titleCaseSmallWords = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'nor', 'of', 'on', 'or', 'the', 'up'])
const exceptionLookup = computed(() => {
  const map = new Map<string, string>()
  for (const exception of userExceptions.value) {
    map.set(exception.toLowerCase(), exception)
  }
  return map
})

watch(
  [ready, () => user.value?.uid ?? ''],
  async ([authReady, uid]) => {
    if (!import.meta.client || !authReady) return
    if (!uid) {
      userExceptions.value = []
      loadingExceptions.value = false
      exceptionsError.value = ''
      return
    }
    await loadUserExceptions(uid)
  },
  { immediate: true },
)

async function applyCase(kind: CaseKind) {
  const source = inputText.value || ''
  let result = ''

  switch (kind) {
    case 'title':
      result = toTitleCase(source)
      break
    case 'sentence':
      result = toSentenceCase(source)
      break
    case 'lower':
      result = source.toLowerCase()
      break
    case 'upper':
      result = source.toUpperCase()
      break
    case 'snake':
      result = toDelimitedCase(source, '_')
      break
    case 'kebab':
      result = toDelimitedCase(source, '-')
      break
    case 'reverse':
      result = reverseCase(source)
      break
    case 'ascii':
      result = toAsciiDecimal(source)
      break
    case 'asciiHex':
      result = toAsciiHex(source)
      break
  }

  if (kind !== 'ascii' && kind !== 'asciiHex') {
    result = applyUserExceptions(result)
  }

  outputText.value = result
  await copyText(result)
}

function clearAll() {
  inputText.value = ''
  outputText.value = ''
}

async function copyOutput() {
  await copyText(outputText.value)
}

async function copyText(text: string) {
  if (!text) return
  if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) return

  try {
    await navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard.')
  } catch {
    // Keep UX fast if clipboard is blocked.
  }
}

function toTitleCase(value: string) {
  const words = value.match(/\b[\w']+\b/g) ?? []
  let wordIndex = 0

  return value.replace(/\b[\w']+\b/g, (word) => {
    const lower = word.toLowerCase()
    const isFirst = wordIndex === 0
    const isLast = wordIndex === words.length - 1
    wordIndex += 1

    if (!isFirst && !isLast && titleCaseSmallWords.has(lower)) {
      return lower
    }

    return lower.charAt(0).toUpperCase() + lower.slice(1)
  })
}

function toSentenceCase(value: string) {
  const lower = value.toLowerCase()
  return lower.replace(/(^\s*[a-z])/, (match) => match.toUpperCase())
}

function toDelimitedCase(value: string, delimiter: '_' | '-') {
  const normalized = value
    .replace(/([a-z0-9])([A-Z])/g, (_match, left, right) => `${left}${delimiter}${right}`)
    .replace(/[^a-zA-Z0-9]+/g, delimiter)
    .replace(new RegExp(`${delimiter}+`, 'g'), delimiter)
    .replace(new RegExp(`^${delimiter}|${delimiter}$`, 'g'), '')

  return normalized.toLowerCase()
}

function reverseCase(value: string) {
  return value
    .split('')
    .map((char) => {
      const lower = char.toLowerCase()
      const upper = char.toUpperCase()
      if (char === lower && char !== upper) return upper
      if (char === upper && char !== lower) return lower
      return char
    })
    .join('')
}

function toAsciiDecimal(value: string) {
  return Array.from(value, (char) => char.charCodeAt(0).toString(10)).join(' ')
}

function toAsciiHex(value: string) {
  return Array.from(value, (char) => char.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')).join(' ')
}

async function addException() {
  if (!isAuthed.value) {
    toast.info('Sign in to save exceptions.')
    return
  }

  const nextValue = exceptionInput.value.trim()
  if (!nextValue) return

  const exists = userExceptions.value.some((item) => item.toLowerCase() === nextValue.toLowerCase())
  if (exists) {
    exceptionInput.value = ''
    return
  }

  const nextItems = [...userExceptions.value, nextValue]
  const didSave = await persistUserExceptions(nextItems)
  if (!didSave) return

  exceptionInput.value = ''
}

async function removeException(exception: string) {
  if (!isAuthed.value) return
  const nextItems = userExceptions.value.filter((item) => item.toLowerCase() !== exception.toLowerCase())
  await persistUserExceptions(nextItems)
}

async function loadUserExceptions(uid: string) {
  loadingExceptions.value = true
  exceptionsError.value = ''
  try {
    const items = await loadExceptionsFromFirestore(uid)
    userExceptions.value = sanitizeExceptionList(items)
  } catch (error) {
    userExceptions.value = []
    const message = formatExceptionError(error, 'load')
    exceptionsError.value = message
    toast.error(message)
  } finally {
    loadingExceptions.value = false
  }
}

async function persistUserExceptions(nextItems: string[]) {
  const uid = user.value?.uid
  if (!uid) return false

  savingExceptions.value = true
  try {
    const cleanItems = sanitizeExceptionList(nextItems)
    await saveExceptionsToFirestore(uid, cleanItems)
    userExceptions.value = cleanItems
    exceptionsError.value = ''
    return true
  } catch (error) {
    const message = formatExceptionError(error, 'save')
    toast.error(message)
    return false
  } finally {
    savingExceptions.value = false
  }
}

function sanitizeExceptionList(items: unknown): string[] {
  if (!Array.isArray(items)) return []

  const seen = new Set<string>()
  const normalized: string[] = []
  for (const item of items) {
    if (typeof item !== 'string') continue
    const trimmed = item.trim()
    if (!trimmed) continue
    const key = trimmed.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    normalized.push(trimmed)
  }
  return normalized
}

function applyUserExceptions(value: string) {
  if (!value || exceptionLookup.value.size === 0) return value
  return value.replace(/[A-Za-z0-9]+/g, (word) => exceptionLookup.value.get(word.toLowerCase()) ?? word)
}

async function loadExceptionsFromFirestore(uid: string) {
  const rootFirst = exceptionsStorageMode.value !== 'legacy'
  const attempts = rootFirst ? ['root', 'legacy'] as const : ['legacy', 'root'] as const
  let lastError: unknown = null

  for (const mode of attempts) {
    try {
      if (mode === 'root') {
        const userRef = doc($firebase.db, 'users', uid)
        const snapshot = await getDoc(userRef)
        exceptionsStorageMode.value = 'root'
        return snapshot.data()?.caseStudioExceptions
      }

      const legacyRef = doc($firebase.db, 'users', uid, 'caseStudio', 'exceptions')
      const snapshot = await getDoc(legacyRef)
      exceptionsStorageMode.value = 'legacy'
      return snapshot.data()?.items
    } catch (error) {
      lastError = error
      if (!shouldFallbackToOtherStorage(error)) break
    }
  }

  throw lastError ?? new Error('unknown')
}

async function saveExceptionsToFirestore(uid: string, cleanItems: string[]) {
  const rootFirst = exceptionsStorageMode.value !== 'legacy'
  const attempts = rootFirst ? ['root', 'legacy'] as const : ['legacy', 'root'] as const
  let lastError: unknown = null

  for (const mode of attempts) {
    try {
      if (mode === 'root') {
        const userRef = doc($firebase.db, 'users', uid)
        await setDoc(
          userRef,
          {
            caseStudioExceptions: cleanItems,
            caseStudioUpdatedAt: serverTimestamp(),
          },
          { merge: true },
        )
        exceptionsStorageMode.value = 'root'
        return
      }

      const legacyRef = doc($firebase.db, 'users', uid, 'caseStudio', 'exceptions')
      await setDoc(
        legacyRef,
        {
          items: cleanItems,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      )
      exceptionsStorageMode.value = 'legacy'
      return
    } catch (error) {
      lastError = error
      if (!shouldFallbackToOtherStorage(error)) break
    }
  }

  throw lastError ?? new Error('unknown')
}

function formatExceptionError(error: unknown, action: 'load' | 'save') {
  const actionWord = action === 'load' ? 'load' : 'save'

  const code = typeof error === 'object' && error && 'code' in error ? String((error as { code?: unknown }).code ?? '') : ''
  if (code === 'permission-denied') {
    return `Could not ${actionWord} exceptions (permission denied).`
  }
  if (code === 'unavailable') {
    return `Could not ${actionWord} exceptions (service unavailable).`
  }
  if (code === 'deadline-exceeded') {
    return `Could not ${actionWord} exceptions (deadline exceeded).`
  }

  return `Could not ${actionWord} exceptions.`
}

function shouldFallbackToOtherStorage(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error ? String((error as { code?: unknown }).code ?? '') : ''
  return code === 'permission-denied' || code === 'not-found'
}
</script>

<style scoped>
.case-studio {
  padding: 3.5rem 0 5rem;
  background:
    radial-gradient(circle at 15% 10%, rgba(var(--hb-brand-rgb, 106, 163, 255), 0.18), transparent 55%),
    radial-gradient(circle at 85% 0%, rgba(var(--hb-brand-rgb, 106, 163, 255), 0.08), transparent 45%),
    var(--hb-bg, #ffffff);
}

.case-studio__hero {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.case-studio__title {
  font-size: clamp(2rem, 3.5vw, 3rem);
  margin: 0 0 0.4rem;
}

.case-studio__lead {
  font-size: 1.05rem;
  color: var(--hb-text-muted, #4a4d55);
  margin: 0;
}

.case-studio__shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: start;
  gap: 2rem;
}

.case-studio__panel {
  background: var(--hb-surface, #ffffff);
  border-radius: 24px;
  padding: 1.75rem;
  box-shadow: 0 20px 50px rgba(18, 22, 33, 0.08);
  border: 1px solid var(--hb-border, rgba(15, 23, 42, 0.08));
}

.case-studio__panel--output {
  border: 1px solid var(--hb-border, rgba(15, 23, 42, 0.08));
}

.case-studio__label {
  display: inline-block;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.72rem;
  color: var(--hb-text-muted, #6b6f78);
  margin-bottom: 0;
}

.case-studio__field-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  margin-bottom: 0.5rem;
}

.case-studio__textarea {
  width: 100%;
  border-radius: 18px;
  padding: 1rem 1.1rem;
  border: 1px solid var(--hb-border, rgba(15, 23, 42, 0.15));
  background: var(--hb-surface, #ffffff);
  color: var(--hb-text, #111317);
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.case-studio__textarea:focus {
  outline: none;
  border-color: var(--hb-brand, #2b6fff);
  box-shadow: 0 0 0 3px rgba(var(--hb-brand-rgb, 106, 163, 255), 0.25);
}

.case-studio__textarea--output {
  background: var(--hb-surface, #ffffff);
  border-style: solid;
}

.case-studio__actions {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  align-self: center;
  align-items: center;
}

.case-studio__chip {
  border: 1px solid var(--hb-border, rgba(15, 23, 42, 0.12));
  background: var(--hb-surface, #ffffff);
  color: var(--hb-text, #111317);
  border-radius: 999px;
  padding: 0.45rem 1rem;
  font-size: 0.85rem;
  text-align: center;
  justify-content: center;
  transition: transform 0.15s ease, border-color 0.15s ease;
}

.case-studio__chip:hover {
  transform: translateY(-1px);
  border-color: var(--hb-brand, #2b6fff);
}

.case-studio__action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  border: 1px solid var(--hb-border, rgba(15, 23, 42, 0.15));
  border-radius: 999px;
  padding: 0.35rem 0.9rem;
  background: var(--hb-surface, #ffffff);
  color: var(--hb-text, #111317);
  font-size: 0.8rem;
  text-align: center;
  margin-left: auto;
}

.case-studio__action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.case-studio__exceptions-trigger {
  margin-left: auto;
}

.case-studio__exceptions-label {
  display: inline-block;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--hb-text-muted, #6b6f78);
  margin-bottom: 0;
}

.case-studio__exception-form {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.6rem;
}

.case-studio__exception-form .case-studio__action-btn {
  margin-left: 0;
}

.case-studio__exception-input {
  min-width: 0;
  flex: 1;
  border: 1px solid var(--hb-border, rgba(15, 23, 42, 0.15));
  border-radius: 999px;
  padding: 0.35rem 0.8rem;
  background: var(--hb-surface, #ffffff);
  color: var(--hb-text, #111317);
  font-size: 0.82rem;
}

.case-studio__exception-input:focus {
  outline: none;
  border-color: var(--hb-brand, #2b6fff);
  box-shadow: 0 0 0 3px rgba(var(--hb-brand-rgb, 106, 163, 255), 0.18);
}

.case-studio__exceptions-note {
  margin: 0.75rem 0 0;
  text-align: left;
  color: var(--hb-text-muted, #6b6f78);
  font-size: 0.75rem;
}

.case-studio__exception-list {
  margin-top: 0.75rem;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 0.35rem;
}

.case-studio__exception-item {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  border: 1px solid var(--hb-border, rgba(15, 23, 42, 0.15));
  background: var(--hb-surface, #ffffff);
  color: var(--hb-text, #111317);
  border-radius: 999px;
  font-size: 0.75rem;
  padding: 0.2rem 0.55rem;
}

.case-studio__exception-item:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.case-studio__popup-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(12, 18, 30, 0.42);
  z-index: 30;
  display: grid;
  place-items: center;
  padding: 1rem;
}

.case-studio__popup {
  width: min(520px, 94vw);
  background: var(--hb-surface, #ffffff);
  border: 1px solid var(--hb-border, rgba(15, 23, 42, 0.1));
  border-radius: 20px;
  box-shadow: 0 24px 56px rgba(18, 22, 33, 0.22);
  padding: 1rem;
}

.case-studio__popup-close {
  margin-left: auto;
}

.case-studio__hint {
  margin-top: 0.75rem;
  color: var(--hb-text-muted, #6b6f78);
  font-size: 0.85rem;
}

@media (max-width: 768px) {
  .case-studio {
    padding: 2.5rem 0 3.5rem;
  }

  .case-studio__shell {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .case-studio__actions {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }

  .case-studio__exceptions-trigger {
    width: 100%;
  }

  .case-studio__panel {
    padding: 1.4rem;
  }
}
</style>
