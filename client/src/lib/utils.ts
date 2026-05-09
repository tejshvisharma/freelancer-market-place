import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}


/** Extract error message from axios error or unknown */
export function getErrorMessage(error: unknown): string {
  if (!error) return "An unexpected error occurred";
  const axiosMsg = (error as any)?.response?.data?.message;
  if (axiosMsg) return axiosMsg;
  const msg = (error as Error)?.message;
  if (msg) return msg;
  return "An unexpected error occurred";
}
 
/** Extract 422 field errors from axios error */
export function getFieldErrors(
  error: unknown
): Array<{ field: string; message: string }> {
  return (error as any)?.response?.data?.errors ?? [];
}
 