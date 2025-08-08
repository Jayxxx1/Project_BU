import React, { useEffect } from "react";

export default function FeedbackModal({ open, message, onClose, autoClose = 0 }) {
  useEffect(() => {
    if (open && autoClose > 0) {
      const timer = setTimeout(() => {
        onClose && onClose();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [open, autoClose, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-center z-10">
        <p className="text-lg font-medium text-gray-800 mb-4">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          ปิด
        </button>
      </div>
    </div>
  );
}