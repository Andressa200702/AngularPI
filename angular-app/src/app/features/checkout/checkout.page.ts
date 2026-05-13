import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, computed, inject, signal, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartStore } from '../../core/state/cart.store';
import { CheckoutStore } from '../../core/state/checkout.store';
import { FreteService } from '../../core/services/frete.service';
import { AuthService } from '../../core/services/auth.service';
import { CouponService } from '../../core/services/coupon.service';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, CurrencyPipe, RouterLink],
  templateUrl: './checkout.page.html',
  styleUrl: './checkout.page.css'
})
export class CheckoutPage {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly cartStore = inject(CartStore);
  private readonly freteService = inject(FreteService);
  private readonly authService = inject(AuthService);
  private readonly couponService = inject(CouponService);
  readonly checkoutStore = inject(CheckoutStore);

  readonly items = this.cartStore.items;
  readonly subtotal = computed(() => this.cartStore.subtotal());
  
  readonly frete = signal(0);
  readonly loadingFrete = signal(false);
  readonly couponCode = signal('');
  readonly appliedCoupon = signal<any>(null);
  readonly couponError = signal('');
  readonly couponSuccess = signal('');
  readonly selectedPayment = signal<'cartao' | 'pix'>('cartao');

  readonly discount = computed(() => {
    // PIX sempre recebe 10% de desconto
    let pixDiscount = this.selectedPayment() === 'pix' ? this.subtotal() * 0.1 : 0;
    let couponDiscount = 0;

    // Cupom é aplicado independente da forma de pagamento
    if (this.appliedCoupon()) {
      const coupon = this.appliedCoupon();
      if (coupon.type === 'percentage') {
        couponDiscount = this.subtotal() * (coupon.value / 100);
      } else {
        couponDiscount = coupon.value;
      }
    }

    // Acumula PIX (se aplicável) + cupom, limitado ao subtotal
    return Math.min(pixDiscount + couponDiscount, this.subtotal());
  });

  readonly total = computed(() => {
    return this.subtotal() + this.frete() - this.discount();
  });

  // Bloqueia checkout para admin
  readonly isAdmin = computed(() => {
    const user = this.authService.currentUser();
    return user?.isAdmin === true;
  });

  readonly form = this.fb.nonNullable.group({
    nome: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    cep: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    endereco: ['', [Validators.required]],
    numero: ['', [Validators.required]],
    complemento: [''],
    bairro: ['', [Validators.required]],
    cidade: ['', [Validators.required]],
    estado: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
    pagamento: this.fb.nonNullable.control<'cartao' | 'pix'>('cartao', Validators.required)
  });

  constructor() {
    const user = this.authService.currentUser();
    if (user) {
      this.form.patchValue({
        nome: user.nome,
        email: user.email
      });
    }

    // Sincroniza mudança de forma de pagamento
    effect(() => {
      const payment = this.form.get('pagamento')?.value;
      if (payment) {
        this.selectedPayment.set(payment as 'cartao' | 'pix');
      }
    }, { allowSignalWrites: true });
  }

  async onCepChange(): Promise<void> {
    const rawCep = this.form.get('cep')?.value || '';
    const cep = rawCep.replace(/\D/g, ''); // Garante que so tenha numeros
    
    if (cep.length === 8) {
      this.loadingFrete.set(true);
      try {
        const result = await this.freteService.calcular(cep, this.subtotal());
        if (result.ok) {
          this.form.patchValue({
            cidade: result.cidade || '',
            estado: result.uf || '',
            bairro: result.bairro || '',
            endereco: result.logradouro || ''
          });
          this.frete.set(result.frete);
        }
      } finally {
        this.loadingFrete.set(false);
      }
    } else {
      this.frete.set(0);
    }
  }

  async submit(): Promise<void> {
    // Bloqueia checkout para admin
    if (this.isAdmin()) {
      this.checkoutStore.error.set('Administradores não podem fazer pedidos no sistema.');
      return;
    }

    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const payload = {
      ...this.form.getRawValue(),
      frete: this.frete(),
      desconto: this.discount(),
      coupon: this.appliedCoupon()?.code || null
    };

    const order = await this.checkoutStore.submit(
      payload,
      this.items(),
      this.total()
    );

    if (!order) return;

    // Increment coupon usage if applied
    if (this.appliedCoupon()) {
      this.couponService.incrementUsage(this.appliedCoupon().id);
    }

    this.cartStore.clear();
    void this.router.navigate(['/pedido-finalizado']);
  }

  applyCoupon(): void {
    this.couponError.set('');
    this.couponSuccess.set('');

    if (!this.couponCode().trim()) {
      this.couponError.set('Digite um código de cupom');
      return;
    }

    try {
      const result = this.couponService.validate(this.couponCode().toUpperCase());
      
      if (!result.valid || !result.coupon) {
        this.couponError.set(result.message || 'Cupom não encontrado ou inválido');
        return;
      }

      this.appliedCoupon.set(result.coupon);
      this.couponSuccess.set(`✓ Cupom ${result.coupon.code} aplicado com sucesso!`);
      
      setTimeout(() => this.couponSuccess.set(''), 3000);
    } catch (error) {
      this.couponError.set('Erro ao aplicar cupom');
    }
  }

  removeCoupon(): void {
    this.appliedCoupon.set(null);
    this.couponCode.set('');
  }
}
