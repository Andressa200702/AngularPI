import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartStore } from '../../core/state/cart.store';
import { FreteService } from '../../core/services/frete.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-carrinho-page',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink, FormsModule],
  templateUrl: './carrinho.page.html',
  styleUrl: './carrinho.page.css'
})
export class CarrinhoPage {
  private readonly cartStore = inject(CartStore);
  private readonly freteService = inject(FreteService);
  private readonly router = inject(Router);

  readonly items = this.cartStore.items;
  readonly subtotal = computed(() => this.cartStore.subtotal());

  readonly cep = signal('');
  readonly frete = signal<number | null>(null);
  readonly loadingFrete = signal(false);
  readonly freteError = signal<string | null>(null);

  // Removi o autoRecalcular por enquanto para garantir que o clique manual funcione isolado
  async calcularFrete() {
    const val = this.cep().replace(/\D/g, '');
    if (val.length !== 8) {
      this.freteError.set('CEP inválido');
      return;
    }

    this.loadingFrete.set(true);
    this.freteError.set(null);

    const currentSubtotal = this.cartStore.subtotal(); // Puxando direto da Store para garantir valor real
    
    console.log('Solicitando frete para subtotal:', currentSubtotal);
    const result = await this.freteService.calcular(val, currentSubtotal);
    this.loadingFrete.set(false);

    if (result.ok) {
      console.log('Resultado frete recebido:', result.frete);
      this.frete.set(result.frete);
    } else {
      this.freteError.set(result.message);
      this.frete.set(null);
    }
  }

  readonly totalComFrete = computed(() => {
    const f = this.frete();
    return this.subtotal() + (f !== null ? f : 0);
  });

  increase(productId: string): void {
    const item = this.items().find((current) => current.productId === productId);
    if (!item) return;
    this.cartStore.setQuantity(productId, item.quantity + 1);
  }

  decrease(productId: string): void {
    const item = this.items().find((current) => current.productId === productId);
    if (!item) return;
    this.cartStore.setQuantity(productId, item.quantity - 1);
  }

  remove(productId: string): void {
    this.cartStore.remove(productId);
  }

  goCheckout(): void {
    if (!this.items().length) return;
    void this.router.navigate(['/checkout']);
  }
}
