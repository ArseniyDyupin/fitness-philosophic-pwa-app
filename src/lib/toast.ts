import { toast, type ToastOptions } from 'react-hot-toast';

type Opts = ToastOptions & { id?: string };

export const toastSuccess = (message: string, opts?: Opts) =>
  toast.success(message, {
    className: 'shadow-lg border border-emerald-200 dark:border-emerald-700',
    duration: 3500,
    ...(opts ?? {}),
  });

export const toastError = (message: string, opts?: Opts) =>
  toast.error(message, {
    className: 'shadow-lg border border-rose-200 dark:border-rose-700',
    duration: 4000,
    ...(opts ?? {}),
  });

export const toastInfo = (message: string, opts?: Opts) =>
  toast(message, {
    icon: 'ℹ️',
    className: 'shadow-lg border border-slate-200 dark:border-slate-700',
    duration: 3000,
    ...(opts ?? {}),
  });

export const toastLoading = (message: string, opts?: Opts) =>
  toast.loading(message, {
    className: 'shadow-lg border border-slate-200 dark:border-slate-700',
    duration: Infinity, // Loading toasts don't auto-dismiss
    ...(opts ?? {}),
  });

export const toastPromise = <T,>(p: Promise<T>, messages: {
  loading: string; 
  success: string | ((val: T) => string); 
  error: string | ((err: any) => string);
}, opts?: Opts) => toast.promise(p, messages, {
  className: 'shadow-lg',
  duration: 3500,
  ...(opts ?? {}),
});

export const toastDismiss = (id?: string) => toast.dismiss(id);
export const toastCustom = toast; // экспортируем оригинал на случай редких кастомов

// Convenience function for common patterns
export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  switch (type) {
    case 'success':
      return toastSuccess(message);
    case 'error':
      return toastError(message);
    case 'info':
    default:
      return toastInfo(message);
  }
};
