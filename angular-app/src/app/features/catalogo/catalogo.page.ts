import { CommonModule } from '@angular/common';
import { Component, inject, signal, computed, effect, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ProductRepository } from '../../data/repositories/product.repository';
import { Product } from '../../domain/models/product.model';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { CartStore } from '../../core/state/cart.store';
import { CategoryService } from '../../core/services/category.service';

@Component({
  selector: 'app-catalogo-page',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, RouterLink],
  templateUrl: './catalogo.page.html',
  styleUrl: './catalogo.page.css'
})
export class CatalogoPage implements OnInit, OnDestroy {
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly allProducts = signal<Product[]>([]);
  
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly repository = inject(ProductRepository);
  private readonly cartStore = inject(CartStore);
  private readonly categoryService = inject(CategoryService);
  private pollInterval: any;

  readonly categoriaLabel = signal<string>('Destaques');
  readonly categoryFilter = signal<string | null>(null);
  readonly searchFilter = signal<string | null>(null);

  // Categorias dinâmicas do CategoryService
  readonly categories = computed(() => 
    this.categoryService.categories()
      .filter(c => c.isActive)
      .map(c => ({ 
        id: c.id,
        name: c.name,
        label: c.label
      }))
  );

  readonly filteredProducts = computed(() => {
    let products = this.allProducts();
    
    if (this.categoryFilter()) {
      products = products.filter(p => p.category.toLowerCase().replace(/\s+/g, '-') === this.categoryFilter());
    }
    
    if (this.searchFilter()) {
      const search = this.searchFilter()!.toLowerCase();
      products = products.filter(p => p.title.toLowerCase().includes(search) || p.description.toLowerCase().includes(search));
    }
    
    return products;
  });

  constructor() {
    void this.load();
    
    // Watch for route param changes
    effect(() => {
      this.route.params.subscribe(params => {
        if (params['categoria']) {
          this.categoryFilter.set(params['categoria']);
          this.categoriaLabel.set(this.formatCategoryName(params['categoria']));
        } else {
          this.categoryFilter.set(null);
          this.categoriaLabel.set('Destaques');
        }
      });
      
      this.route.queryParams.subscribe(params => {
        if (params['q']) {
          this.searchFilter.set(params['q']);
          this.categoriaLabel.set(`Busca: ${params['q']}`);
        } else {
          this.searchFilter.set(null);
        }
      });
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    // Recarrega produtos a cada 3 segundos para captar produtos novos do admin
    this.pollInterval = setInterval(() => {
      void this.load();
    }, 3000);
  }

  ngOnDestroy(): void {
    // Limpa o intervalo quando sai da página
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  private formatCategoryName(slug: string): string {
    const names: Record<string, string> = {
      'rpg-de-mesa': 'RPG de Mesa',
      'board-games': 'Board Games',
      'literatura': 'Literatura',
      'acessorios': 'Acessórios',
      'originais': 'Originais',
      'pre-vendas': 'Pré-vendas'
    };
    return names[slug] || slug;
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      this.allProducts.set(await this.repository.list());
    } catch {
      this.error.set('Falha ao carregar produtos.');
    } finally {
      this.loading.set(false);
    }
  }

  openProduct(productId: string): void {
    void this.router.navigate(['/produto', productId]);
  }

  addToCart(productId: string): void {
    const product = this.allProducts().find((item) => item.id === productId);
    if (!product) return;
    this.cartStore.addProduct(product, 1);
  }

  searchProducts(query: string): void {
    if (query.trim()) {
      void this.router.navigate(['/catalogo'], { queryParams: { q: query } });
    }
  }

  filterByCategory(category: string): void {
    void this.router.navigate(['/categoria', category]);
  }
}
