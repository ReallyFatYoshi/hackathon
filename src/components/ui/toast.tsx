'use client'
import * as React from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ToastContextValue {
  toast: (opts: { title: string; description?: string; variant?: 'default' | 'error' | 'success' | undefined }) => void
}

const ToastContext = React.createContext<ToastContextValue>({ toast: () => {} })

export function useToast() {
  return React.useContext(ToastContext)
}

interface ToastItem {
  id: number
  title: string
  description?: string
  variant: 'default' | 'error' | 'success'
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([])
  const counter = React.useRef(0)

  const toast = React.useCallback(
    ({ title, description, variant: rawVariant }: { title: string; description?: string; variant?: 'default' | 'error' | 'success' | undefined }) => {
      const variant: 'default' | 'error' | 'success' = rawVariant ?? 'default'
      const id = ++counter.current
      setToasts((prev) => [...prev, { id, title, description, variant }])
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000)
    },
    []
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {toasts.map((t) => (
          <ToastPrimitive.Root
            key={t.id}
            className={cn(
              'group pointer-events-auto relative flex w-full max-w-md items-center justify-between space-x-4 overflow-hidden rounded-xl border p-4 shadow-lg transition-all',
              t.variant === 'error' && 'bg-red-50 border-red-200',
              t.variant === 'success' && 'bg-emerald-50 border-emerald-200',
              t.variant === 'default' && 'bg-white border-stone-200'
            )}
          >
            <div>
              <ToastPrimitive.Title className="text-sm font-semibold text-stone-900">
                {t.title}
              </ToastPrimitive.Title>
              {t.description && (
                <ToastPrimitive.Description className="text-xs text-stone-500 mt-0.5">
                  {t.description}
                </ToastPrimitive.Description>
              )}
            </div>
            <ToastPrimitive.Close className="shrink-0 rounded-md p-1 text-stone-400 hover:text-stone-700">
              <X className="h-4 w-4" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  )
}
