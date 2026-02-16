'use client'

import { Toaster as Sonner, ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            '!bg-emerald-900 !border-emerald-500/30 !text-white !shadow-2xl',
          title: '!text-white !font-semibold',
          description: '!text-white/80',
          actionButton: '!bg-emerald-600 !text-white',
          cancelButton: '!bg-white/10 !text-white',
          closeButton: '!text-white/60 hover:!text-white',
          error:
            '!bg-red-900 !border-red-500/30 !text-white',
          success:
            '!bg-emerald-900 !border-emerald-500/30 !text-white',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
