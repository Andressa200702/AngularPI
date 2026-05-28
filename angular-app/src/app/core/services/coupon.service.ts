import { Injectable, inject } from '@angular/core';
import { signal, computed } from '@angular/core';
import { StorageService } from './storage.service';

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  maxUses?: number;
  usedCount: number;
  expiryDate?: string;
  isActive: boolean;
  createdAt: string;
  description?: string;
}

const COUPON_STORAGE_KEY = 'rolagem_coupons';

const DEFAULT_COUPONS: Coupon[] = [
  {
    id: 'default_1',
    code: 'CRITICA10',
    type: 'percentage',
    value: 10,
    usedCount: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
    description: '10% de desconto em qualquer pedido'
  }
];

@Injectable({ providedIn: 'root' })
export class CouponService {
  private readonly storage = inject(StorageService);
  private couponsSignal = signal<Coupon[]>([]);
  readonly coupons = computed(() => this.couponsSignal());

  constructor() {
    this.loadCoupons();
  }

  private loadCoupons(): void {
    const stored = this.storage.get<Coupon[]>(COUPON_STORAGE_KEY, []);

    if (stored.length === 0) {
      // Primeira vez: salva os cupons padrão no storage
      this.couponsSignal.set(DEFAULT_COUPONS);
      this.storage.set(COUPON_STORAGE_KEY, DEFAULT_COUPONS);
    } else {
      // Garante que os cupons padrão sempre existam (mesmo que o admin delete e recarregue)
      const hasCritica10 = stored.some(c => c.code === 'CRITICA10');
      if (!hasCritica10) {
        const merged = [...DEFAULT_COUPONS, ...stored];
        this.couponsSignal.set(merged);
        this.storage.set(COUPON_STORAGE_KEY, merged);
      } else {
        this.couponsSignal.set(stored);
      }
    }
  }

  add(data: Omit<Coupon, 'id' | 'usedCount' | 'createdAt'>): Coupon {
    const coupon: Coupon = {
      ...data,
      id: Date.now().toString(),
      usedCount: 0,
      createdAt: new Date().toISOString()
    };
    
    const current = this.couponsSignal();
    this.couponsSignal.set([...current, coupon]);
    this.storage.set(COUPON_STORAGE_KEY, this.couponsSignal());
    
    return coupon;
  }

  update(id: string, updates: Partial<Coupon>): void {
    const current = this.couponsSignal();
    const index = current.findIndex(c => c.id === id);
    
    if (index !== -1) {
      const updated = [...current];
      updated[index] = { ...updated[index], ...updates };
      this.couponsSignal.set(updated);
      this.storage.set(COUPON_STORAGE_KEY, updated);
    }
  }

  delete(id: string): void {
    const current = this.couponsSignal();
    const filtered = current.filter(c => c.id !== id);
    this.couponsSignal.set(filtered);
    this.storage.set(COUPON_STORAGE_KEY, filtered);
  }

  incrementUsage(code: string): boolean {
    const coupon = this.couponsSignal().find(c => c.code === code);
    if (!coupon || !coupon.isActive) return false;
    
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return false;
    
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) return false;
    
    this.update(coupon.id, { usedCount: coupon.usedCount + 1 });
    return true;
  }

  validate(code: string): { valid: boolean; coupon?: Coupon; message?: string } {
    const coupon = this.couponsSignal().find(c => c.code.toUpperCase() === code.toUpperCase());
    
    if (!coupon) return { valid: false, message: 'Cupom não encontrado' };
    if (!coupon.isActive) return { valid: false, message: 'Cupom desativado' };
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return { valid: false, message: 'Cupom atingiu limite de usos' };
    }
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return { valid: false, message: 'Cupom expirado' };
    }
    
    return { valid: true, coupon };
  }
}
