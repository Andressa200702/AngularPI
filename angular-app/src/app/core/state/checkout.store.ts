import { Injectable, signal } from '@angular/core';
import { CartItem } from '../../domain/models/cart-item.model';
import { Order } from '../../domain/models/order.model';
import { StockService } from '../services/stock.service';
import { StorageService } from '../services/storage.service';
import { AuthService } from '../services/auth.service';

const STORAGE_ORDERS_KEY = 'rolagem_pedidos';
const STORAGE_LAST_ORDER_KEY = 'rolagem_last_order';

export interface CheckoutPayload {
  nome: string;
  email: string;
  cep: string;
  endereco: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  pagamento: 'cartao' | 'pix';
  frete: number;
  desconto: number;
}

@Injectable({ providedIn: 'root' })
export class CheckoutStore {
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly lastOrder = signal<Order | null>(null);

  constructor(
    private readonly storage: StorageService,
    private readonly stockService: StockService,
    private readonly authService: AuthService
  ) {
    this.lastOrder.set(this.storage.get<Order | null>(STORAGE_LAST_ORDER_KEY, null));
  }

  async submit(payload: CheckoutPayload, items: CartItem[], total: number): Promise<Order | null> {
    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    const currentUser = this.authService.currentUser();

    if (!items.length) {
      this.error.set('Carrinho vazio.');
      this.loading.set(false);
      return null;
    }

    // New validation: Ensure required customer data is present
    if (!payload.nome || !payload.email || !payload.cep) {
      this.error.set('Por favor, preencha todos os campos obrigatórios.');
      this.loading.set(false);
      return null;
    }

    await new Promise((resolve) => setTimeout(resolve, 300));

    const stockResult = this.stockService.decrement(
      items.map((item) => ({ productId: item.productId, quantity: item.quantity }))
    );
    if (!stockResult.ok) {
      this.error.set(stockResult.message || 'Estoque insuficiente.');
      this.loading.set(false);
      return null;
    }

    const order: Order = {
      id: Date.now().toString().slice(-6),
      userId: currentUser?.id,
      createdAt: new Date().toISOString(),
      items,
      total,
      shippingFee: payload.frete,
      discount: payload.desconto,
      paymentMethod: payload.pagamento,
      status: 'Pendente',
      customer: {
        nome: payload.nome,
        email: payload.email,
        cep: payload.cep,
        endereco: payload.endereco,
        numero: payload.numero,
        complemento: payload.complemento,
        bairro: payload.bairro,
        cidade: payload.cidade,
        estado: payload.estado
      }
    };

    const currentOrders = this.storage.get<Order[]>(STORAGE_ORDERS_KEY, []);
    currentOrders.push(order);
    this.storage.set(STORAGE_ORDERS_KEY, currentOrders);
    this.storage.set(STORAGE_LAST_ORDER_KEY, order);

    this.lastOrder.set(order);
    this.success.set('Pedido finalizado com sucesso.');
    this.loading.set(false);
    return order;
  }
}
