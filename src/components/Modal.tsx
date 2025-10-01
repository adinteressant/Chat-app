import type { ReactNode } from 'react'
import { X } from 'lucide-react'

type ModalProps = {
    isOpen:boolean,
    onClose: () => void,
    title:string,
    children:ReactNode
  }

const Modal = ({ isOpen, onClose, title, children}:ModalProps) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-slate-700 shadow-xl rounded-2xl w-full max-w-md">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-slate-50">{title}</h3>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 cursor-pointer hover:bg-slate-500 hover:text-slate-50
            rounded-xl transition-all duration-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-3 max-h-48 overflow-auto">
            {children}
          </div>
        </div>
      </div>
    )
  }

export default Modal
