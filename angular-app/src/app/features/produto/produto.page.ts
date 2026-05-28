import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductRepository } from '../../data/repositories/product.repository';
import { Product } from '../../domain/models/product.model';
import { CartStore } from '../../core/state/cart.store';

interface Review {
  author: string;
  rating: number;
  comment: string;
  date: string;
}

// Avaliações mockadas por produto (chave = productId)
const MOCK_REVIEWS: Record<string, Review[]> = {
  default: [
    { author: 'Carlos M.',     rating: 5, comment: 'Produto incrível! Qualidade excelente, chegou rápido e bem embalado. Recomendo muito!', date: '15/05/2025' },
    { author: 'Ana Paula S.',  rating: 4, comment: 'Gostei bastante, só achei que poderia vir com uma caixinha mais resistente. Fora isso, perfeito!', date: '02/04/2025' },
    { author: 'Rodrigo T.',    rating: 5, comment: 'Comprei pra presentear e a pessoa amou. Visual lindo e material de qualidade.', date: '20/03/2025' },
  ]
};

const STORAGE_KEY_PREFIX = 'rolagem_reviews_';

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

  // ─── Avaliações ──────────────────────────────────────────────────────────────
  readonly reviews = signal<Review[]>([]);

  readonly newRating = signal(0);
  readonly newAuthor = signal('');
  readonly newComment = signal('');
  readonly hoverStar = signal(0);
  readonly reviewError = signal('');
  readonly reviewSuccess = signal('');

  readonly averageRating = computed(() => {
    const r = this.reviews();
    if (!r.length) return '0.0';
    const avg = r.reduce((sum, rv) => sum + rv.rating, 0) / r.length;
    return avg.toFixed(1);
  });

  readonly roundedRating = computed(() => {
    const r = this.reviews();
    if (!r.length) return 0;
    return Math.round(r.reduce((sum, rv) => sum + rv.rating, 0) / r.length);
  });

  readonly ratingLabel = computed(() => {
    const labels: Record<number, string> = {
      1: 'Péssimo', 2: 'Ruim', 3: 'Regular', 4: 'Bom', 5: 'Excelente'
    };
    return labels[this.newRating()] ?? '';
  });

  // ─── Injeções ────────────────────────────────────────────────────────────────
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly repository = inject(ProductRepository);
  private readonly cartStore = inject(CartStore);

  private productId = '';

  constructor() {
    const productId = this.route.snapshot.paramMap.get('id');
    if (!productId) {
      this.error.set('Produto inválido.');
      return;
    }
    this.productId = productId;
    void this.load(productId);
    this.loadReviews(productId);
  }

  // ─── Produto ─────────────────────────────────────────────────────────────────

  async load(id: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await this.repository.byId(id);
      if (!data) {
        this.error.set('Produto não encontrado.');
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
    const next = Math.max(1, Math.min(this.quantity() + delta, Math.min(product.stock || 1, 10)));
    this.quantity.set(next);
  }

  addToCart(): void {
    const product = this.product();
    if (!product) return;
    this.cartStore.addProduct(product, this.quantity());
    void this.router.navigate(['/carrinho']);
  }

  // ─── Avaliações ──────────────────────────────────────────────────────────────

  private loadReviews(productId: string): void {
    const storageKey = STORAGE_KEY_PREFIX + productId;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      this.reviews.set(JSON.parse(stored));
    } else {
      // Usa mockadas na primeira vez
      const mocked = MOCK_REVIEWS[productId] ?? MOCK_REVIEWS['default'];
      this.reviews.set(mocked);
      localStorage.setItem(storageKey, JSON.stringify(mocked));
    }
  }

  submitReview(): void {
    this.reviewError.set('');
    this.reviewSuccess.set('');

    if (this.newRating() === 0) {
      this.reviewError.set('Selecione uma nota de 1 a 5 estrelas.');
      return;
    }
    if (!this.newAuthor().trim()) {
      this.reviewError.set('Informe seu nome.');
      return;
    }
    if (this.newComment().trim().length < 10) {
      this.reviewError.set('Escreva um comentário com pelo menos 10 caracteres.');
      return;
    }

    const today = new Date();
    const date = `${String(today.getDate()).padStart(2,'0')}/${String(today.getMonth()+1).padStart(2,'0')}/${today.getFullYear()}`;

    const nova: Review = {
      author: this.newAuthor().trim(),
      rating: this.newRating(),
      comment: this.newComment().trim(),
      date
    };

    const atualizadas = [nova, ...this.reviews()];
    this.reviews.set(atualizadas);
    localStorage.setItem(STORAGE_KEY_PREFIX + this.productId, JSON.stringify(atualizadas));

    // Limpa formulário
    this.newRating.set(0);
    this.newAuthor.set('');
    this.newComment.set('');
    this.reviewSuccess.set('✓ Avaliação enviada com sucesso!');
    setTimeout(() => this.reviewSuccess.set(''), 3000);
  }
}