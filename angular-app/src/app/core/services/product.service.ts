import { Injectable, inject } from '@angular/core';
import { signal, computed } from '@angular/core';
import { Product } from '../../domain/models/product.model';
import { StorageService } from './storage.service';
import { StockService } from './stock.service';

const PRODUCTS_STORAGE_KEY = 'rolagem_produtos_custom';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly storage = inject(StorageService);
  private readonly stockService = inject(StockService);

  private productsSignal = signal<Product[]>([]);
  readonly products = computed(() => this.productsSignal());

  constructor() {
    this.loadProducts();
  }

  private loadProducts(): void {
    const stored = this.storage.get<Product[]>(PRODUCTS_STORAGE_KEY, []);
    this.productsSignal.set(stored);
  }

  add(product: Omit<Product, 'id'>): Product {
    const id = Date.now().toString();
    const newProduct: Product = { ...product, id };
    
    const current = this.productsSignal();
    this.productsSignal.set([...current, newProduct]);
    this.storage.set(PRODUCTS_STORAGE_KEY, this.productsSignal());

    // Adiciona ao estoque com o mesmo ID
    this.stockService.addItem({
      id,
      nome: product.title,
      qtd: product.stock
    });

    return newProduct;
  }

  update(id: string, updates: Partial<Product>): void {
    const current = this.productsSignal();
    const index = current.findIndex(p => p.id === id);
    
    if (index !== -1) {
      const updated = [...current];
      updated[index] = { ...updated[index], ...updates };
      this.productsSignal.set(updated);
      this.storage.set(PRODUCTS_STORAGE_KEY, updated);

      // Sincroniza estoque
      if (updates.stock !== undefined) {
        this.stockService.updateQty(id, updates.stock);
      }
    }
  }

  getById(id: string): Product | undefined {
    return this.productsSignal().find(p => p.id === id);
  }

  delete(id: string): void {
    const current = this.productsSignal();
    const filtered = current.filter(p => p.id !== id);
    this.productsSignal.set(filtered);
    this.storage.set(PRODUCTS_STORAGE_KEY, filtered);
    
    // Remove do estoque também
    this.stockService.removeItem(id);
  }
}
