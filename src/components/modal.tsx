import { createPortal } from 'react-dom'
import React from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  canClose?: boolean
}

export function Modal({ isOpen, onClose, title, children, canClose }: ModalProps) {
  if (!isOpen) return null
  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl flex flex-col max-h-full">
        <div className="px-6 py-4 flex justify-between items-center flex-shrink-0 headerBgGradient">
          <h2 className="font-semibold text-lg">{title}</h2>
          {canClose && <button onClick={onClose}>✖</button>}
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}