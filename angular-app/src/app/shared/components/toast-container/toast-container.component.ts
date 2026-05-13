import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div 
        *ngFor="let toast of toastService.toasts()" 
        [class]="'toast toast-' + toast.type"
        role="alert"
      >
        <span class="toast-message">{{ toast.message }}</span>
        <button class="toast-close" (click)="toastService.removeToast(toast.id)">×</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    }

    .toast {
      pointer-events: auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-radius: 4px;
      min-width: 300px;
      max-width: 500px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .toast-success {
      background: #2e7d32;
      color: white;
    }

    .toast-error {
      background: var(--primary);
      color: white;
    }

    .toast-info {
      background: #1976d2;
      color: white;
    }

    .toast-message {
      flex: 1;
      font-weight: 500;
      font-size: 0.95rem;
    }

    .toast-close {
      background: none;
      border: none;
      color: inherit;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      margin-left: 12px;
      opacity: 0.8;
      transition: opacity 0.2s;
    }

    .toast-close:hover {
      opacity: 1;
    }

    @media (max-width: 600px) {
      .toast-container {
        left: 10px;
        right: 10px;
        top: 10px;
      }

      .toast {
        min-width: auto;
      }
    }
  `]
})
export class ToastContainerComponent {
  toastService = inject(ToastService);
}
