type ToastKind = 'success' | 'error' | 'info'
type ToastItem = {
  id: string
  kind: ToastKind
  title?: string
  message: string
  timeout: number
}

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export function useToast() {
  const list = useState<ToastItem[]>('__toasts__', () => [])

  function push(message: string, kind: ToastKind = 'info', opts?: { title?: string; timeout?: number }) {
    const item: ToastItem = {
      id: uid(),
      kind,
      title: opts?.title,
      message,
      timeout: Math.max(1500, opts?.timeout ?? 3000),
    }
    list.value.push(item)
    setTimeout(() => {
      const i = list.value.findIndex((t) => t.id === item.id)
      if (i !== -1) list.value.splice(i, 1)
    }, item.timeout)
  }

  return {
    list,
    push,
    success: (m: string, o?: { title?: string; timeout?: number }) => push(m, 'success', o),
    error: (m: string, o?: { title?: string; timeout?: number }) => push(m, 'error', o),
    info: (m: string, o?: { title?: string; timeout?: number }) => push(m, 'info', o),
    remove: (id: string) => {
      list.value = list.value.filter((t) => t.id !== id)
    },
    clear: () => {
      list.value = []
    },
  }
}
