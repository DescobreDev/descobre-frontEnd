import { createPortal } from 'react-dom'
import React, { useEffect, useState } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  canClose?: boolean
}

export function Modal({ isOpen, onClose, title, children, canClose }: ModalProps) {
  const [visible, setVisible] = useState(false)
  const [rendered, setRendered] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setRendered(true)
      setTimeout(() => setVisible(true), 10)
    } else {
      setVisible(false)
    }
  }, [isOpen])

  if (!rendered) return null

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        backgroundColor: `rgba(0,0,0,${visible ? 0.5 : 0})`,
        transition: 'background-color 0.3s ease',
      }}
    >
      <div
        onTransitionEnd={() => {
          if (!isOpen) setRendered(false)
        }}

        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1)' : 'scale(0.95)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
        }}
        className="bg-white rounded-lg shadow-lg w-full max-w-2xl flex flex-col max-h-full"
      >
        {title.length > 0 &&
          <div className="px-6 py-4 flex justify-between items-center flex-shrink-0 headerBgGradient">
            <h2 className="font-semibold text-lg">{title}</h2>
            {canClose && <button onClick={onClose}>✖</button>}
          </div>
        }
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}