import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartStore } from '../../../core/state/cart.store';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './app-header.component.html',
  styleUrl: './app-header.component.css'
})
export class AppHeaderComponent {
  private readonly cartStore = inject(CartStore);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly cartCount = computed(() => this.cartStore.totalItems());
  readonly isLoggedIn = computed(() => this.authService.isLoggedIn());

  readonly searchTerm = signal('');

  onSearch(): void {
    const term = this.searchTerm().trim();
    if (term) {
      void this.router.navigate(['/'], { queryParams: { q: term } });
    }
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/']);
  }
}

