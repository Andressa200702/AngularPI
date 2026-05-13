import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductRepository } from '../../data/repositories/product.repository';
import { Product } from '../../domain/models/product.model';
import { CartStore } from '../../core/state/cart.store';

@Component({
  selector: 'app-produto-page',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './produto.page.html',
  styleUrl: './produto.page.css'
})
export class ProdutoPage {
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly product = signal<Product | null>(null);
  readonly quantity = signal(1);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly repository = inject(ProductRepository);
  private readonly cartStore = inject(CartStore);

  constructor() {
    const productId = this.route.snapshot.paramMap.get('id');
    if (!productId) {
      this.error.set('Produto invalido.');
      return;
    }
    void this.load(productId);
  }

  async load(id: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const data = await this.repository.byId(id);
      if (!data) {
        this.error.set('Produto nao encontrado.');
      } else {
        this.product.set(data);
      }
    } catch {
      this.error.set('Falha ao carregar produto.');
    } finally {
      this.loading.set(false);
    }
  }

  changeQuantity(delta: number): void {
    const product = this.product();
    if (!product) return;

    // Legacy limit: max 10 items per product
    const next = Math.max(1, Math.min(this.quantity() + delta, Math.min(product.stock || 1, 10)));
    this.quantity.set(next);
  }

  addToCart(): void {
    const product = this.product();
    if (!product) return;

    this.cartStore.addProduct(product, this.quantity());
    void this.router.navigate(['/carrinho']);
  }
}
