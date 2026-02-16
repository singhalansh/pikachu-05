'use client'

import { toast as sonnerToast } from 'sonner'
import * as React from 'react'

interface ToastOptions {
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: 'default' | 'destructive'
  action?: React.ReactNode
}

function toast({ title, description, variant, ...rest }: ToastOptions) {
  const message = typeof title === 'string' ? title : 'Notification'
  const opts: Parameters<typeof sonnerToast>[1] = {
    description: description as string | undefined,
  }

  if (variant === 'destructive') {
    return sonnerToast.error(message, opts)
  }

  return sonnerToast.success(message, opts)
}

function useToast() {
  return {
    toast,
    dismiss: (id?: string | number) => {
      if (id !== undefined) {
        sonnerToast.dismiss(id)
      } else {
        sonnerToast.dismiss()
      }
    },
    toasts: [] as any[],
  }
}

export { useToast, toast }
