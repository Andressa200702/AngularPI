import { Injectable, inject } from '@angular/core';
import { signal, computed } from '@angular/core';
import { StorageService } from './storage.service';

export interface Category {
  id: string;
  name: string;
  label: string;
  order: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

const CATEGORY_STORAGE_KEY = 'rolagem_categories';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly storage = inject(StorageService);
  private categoriesSignal = signal<Category[]>([]);
  readonly categories = computed(() => this.categoriesSignal().sort((a, b) => a.order - b.order));

  constructor() {
    this.loadCategories();
  }

  private loadCategories(): void {
    const stored = this.storage.get<Category[]>(CATEGORY_STORAGE_KEY, []);
    if (stored.length === 0) {
      this.initializeDefaults();
    } else {
      this.categoriesSignal.set(stored);
    }
  }

  private initializeDefaults(): void {
    const defaults: Category[] = [
      { id: '1', name: 'rpg-de-mesa', label: 'RPG de Mesa', order: 1, isActive: true, createdAt: new Date().toISOString() },
      { id: '2', name: 'board-games', label: 'Board Games', order: 2, isActive: true, createdAt: new Date().toISOString() },
      { id: '3', name: 'acessorios', label: 'Acessórios', order: 3, isActive: true, createdAt: new Date().toISOString() },
      { id: '4', name: 'literatura', label: 'Literatura', order: 4, isActive: true, createdAt: new Date().toISOString() },
      { id: '5', name: 'pre-vendas', label: 'Pré-vendas', order: 5, isActive: true, createdAt: new Date().toISOString() }
    ];
    this.categoriesSignal.set(defaults);
    this.storage.set(CATEGORY_STORAGE_KEY, defaults);
  }

  add(data: Omit<Category, 'id' | 'createdAt' | 'order'>): Category {
    const maxOrder = Math.max(...this.categoriesSignal().map(c => c.order), 0);
    const category: Category = {
      ...data,
      id: Date.now().toString(),
      order: maxOrder + 1,
      createdAt: new Date().toISOString()
    };
    
    const current = this.categoriesSignal();
    this.categoriesSignal.set([...current, category]);
    this.storage.set(CATEGORY_STORAGE_KEY, this.categoriesSignal());
    
    return category;
  }

  update(id: string, updates: Partial<Category>): void {
    const current = this.categoriesSignal();
    const index = current.findIndex(c => c.id === id);
    
    if (index !== -1) {
      const updated = [...current];
      updated[index] = { ...updated[index], ...updates };
      this.categoriesSignal.set(updated);
      this.storage.set(CATEGORY_STORAGE_KEY, this.categoriesSignal());
    }
  }

  delete(id: string): void {
    const current = this.categoriesSignal();
    const filtered = current.filter(c => c.id !== id);
    this.categoriesSignal.set(filtered);
    this.storage.set(CATEGORY_STORAGE_KEY, filtered);
  }

  moveUp(id: string): void {
    const current = this.categoriesSignal();
    const index = current.findIndex(c => c.id === id);
    
    if (index > 0) {
      const temp = current[index].order;
      current[index].order = current[index - 1].order;
      current[index - 1].order = temp;
      this.categoriesSignal.set([...current]);
      this.storage.set(CATEGORY_STORAGE_KEY, this.categoriesSignal());
    }
  }

  moveDown(id: string): void {
    const current = this.categoriesSignal();
    const index = current.findIndex(c => c.id === id);
    
    if (index < current.length - 1) {
      const temp = current[index].order;
      current[index].order = current[index + 1].order;
      current[index + 1].order = temp;
      this.categoriesSignal.set([...current]);
      this.storage.set(CATEGORY_STORAGE_KEY, this.categoriesSignal());
    }
  }
}
