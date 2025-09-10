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
