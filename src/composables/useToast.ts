import { ref } from 'vue';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  link?: {
    text: string;
    url: string;
  };
}

// Global state
const toasts = ref<Toast[]>([]);

export function useToast() {
  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      ...toast,
      id
    };
    
    toasts.value.push(newToast);
    
    // Auto remove
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }
    
    return id;
  };

  const removeToast = (id: string) => {
    const index = toasts.value.findIndex(t => t.id === id);
    if (index > -1) {
      toasts.value.splice(index, 1);
    }
  };

  const notifySuccess = (message: string, link?: Toast['link']) => {
    return addToast({ message, type: 'success', link });
  };

  const notifyError = (message: string) => {
    return addToast({ message, type: 'error' });
  };

  const notifyInfo = (message: string, link?: Toast['link'], duration = 5000) => {
    return addToast({ message, type: 'info', link, duration });
  };

  return {
    toasts,
    addToast,
    removeToast,
    notifySuccess,
    notifyError,
    notifyInfo
  };
}
