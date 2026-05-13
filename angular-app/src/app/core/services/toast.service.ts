import { Injectable } from '@angular/core';
import { signal } from '@angular/core';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastIdCounter = 0;
  readonly toasts = signal<Toast[]>([]);

  showToast(message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 3000) {
    const id = `toast-${++this.toastIdCounter}`;
    const toast: Toast = { id, message, type, duration };

    this.toasts.update(toasts => [...toasts, toast]);

    setTimeout(() => {
      this.removeToast(id);
    }, duration);

    return id;
  }

  removeToast(id: string) {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  success(message: string, duration?: number) {
    return this.showToast(message, 'success', duration);
  }

  error(message: string, duration?: number) {
    return this.showToast(message, 'error', duration);
  }

  info(message: string, duration?: number) {
    return this.showToast(message, 'info', duration);
  }
}
