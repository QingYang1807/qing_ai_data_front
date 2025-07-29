import { useState, useCallback } from 'react';
import { ToastData } from '@/components/common/Toast';

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((
    type: ToastData['type'],
    title: string,
    message?: string,
    duration?: number
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: ToastData = {
      id,
      type,
      title,
      message,
      duration
    };

    setToasts(prev => [...prev, toast]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // 便捷方法
  const showSuccess = useCallback((title: string, message?: string, duration?: number) => {
    return showToast('success', title, message, duration);
  }, [showToast]);

  const showError = useCallback((title: string, message?: string, duration?: number) => {
    return showToast('error', title, message, duration);
  }, [showToast]);

  const showWarning = useCallback((title: string, message?: string, duration?: number) => {
    return showToast('warning', title, message, duration);
  }, [showToast]);

  const showInfo = useCallback((title: string, message?: string, duration?: number) => {
    return showToast('info', title, message, duration);
  }, [showToast]);

  return {
    toasts,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
    clearAllToasts
  };
}; 