import { Injectable, computed, signal, inject } from '@angular/core';
import { CartItem } from '../../domain/models/cart-item.model';
import { Product } from '../../domain/models/product.model';
import { StockService } from '../services/stock.service';
import { StorageService } from '../services/storage.service';
import { ToastService } from '../services/toast.service';

const STORAGE_KEY = 'rolagem_carrinho';

@Injectable({ providedIn: 'root' })
export class CartStore {
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly items = signal<CartItem[]>([]);

  readonly totalItems = computed(() =>
    this.items().reduce((acc, item) => acc + item.quantity, 0)
  );

  readonly subtotal = computed(() =>
    this.items().reduce((acc, item) => acc + item.quantity * item.price, 0)
  );

  constructor(
    private readonly storage: StorageService,
    private readonly stockService: StockService,
    private readonly toastService: ToastService = inject(ToastService)
  ) {
    this.items.set(this.storage.get<CartItem[]>(STORAGE_KEY, []));
  }

  addProduct(product: Product, quantity = 1): void {
    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    const next = [...this.items()];
    const idx = next.findIndex((item) => item.productId === product.id);
    const currentQty = idx >= 0 ? next[idx].quantity : 0;

    const stockEntry = this.stockService.getById(product.id);
    const availableStock = stockEntry ? stockEntry.qtd : product.stock;
    const maxAllowed = Math.min(availableStock, 10);

    if (availableStock < 1) {
      this.error.set('Produto esgotado no momento.');
      this.toastService.error('Produto esgotado no momento.');
      this.loading.set(false);
      return;
    }

    if (currentQty + quantity > maxAllowed) {
      this.error.set(`Quantidade excede o estoque disponivel (max ${maxAllowed}).`);
      this.toastService.error(`Quantidade excede o estoque disponivel (max ${maxAllowed}).`);
      this.loading.set(false);
      return;
    }

    if (idx >= 0) {
      next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
    } else {
      next.push({
        productId: product.id,
        title: product.title,
        image: product.image,
        price: product.price,
        quantity,
        stock: availableStock
      });
    }

    this.items.set(next);
    this.persist();
    this.success.set('Item adicionado ao carrinho.');
    this.toastService.success('Produto adicionado ao carrinho!');
    this.loading.set(false);
  }

  setQuantity(productId: string, quantity: number): void {
    if (quantity < 1) {
      this.remove(productId);
      return;
    }

    const stockEntry = this.stockService.getById(productId);
    const availableStock = stockEntry ? stockEntry.qtd : undefined;

    const next = this.items().map((item) => {
      if (item.productId !== productId) return item;
      const maxAllowed = Math.min(availableStock ?? item.stock, 10);
      return { ...item, quantity: Math.min(quantity, maxAllowed) };
    });

    this.items.set(next);
    this.persist();
  }

  remove(productId: string): void {
    const next = this.items().filter((item) => item.productId !== productId);
    this.items.set(next);
    this.persist();
  }

  clear(): void {
    this.items.set([]);
    this.persist();
  }

  clearMessages(): void {
    this.error.set(null);
    this.success.set(null);
  }

  private persist(): void {
    this.storage.set(STORAGE_KEY, this.items());
  }
}
