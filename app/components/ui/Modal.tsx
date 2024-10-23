 // Start of Selection
import React from 'react';
import { cn } from '@/lib/utils';
import { ModalProps } from '@/lib/types';

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };


  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div 
        className={cn("bg-white rounded-lg shadow-lg relative", "max-w-lg w-full p-6")}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold z-10"
          aria-label="閉じる"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;