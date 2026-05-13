import { CommonModule, CurrencyPipe, DatePipe } from "@angular/common";
import { Component, inject, computed } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { CheckoutStore } from "../../core/state/checkout.store";
import { StorageService } from "../../core/services/storage.service";
import { Order } from "../../domain/models/order.model";

@Component({
  selector: "app-pedido-finalizado-page",
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, RouterLink],
  template: `
    <section class="section-container">
      <div class="success-card" *ngIf="order() as pedido; else noOrder">
        <div class="success-header">
          <div class="success-icon">✓</div>
          <h1 class="section-title">Pedido Realizado com Sucesso!</h1>
          <p class="subtitle">Obrigado pela sua compra! Confirme os detalhes abaixo.</p>
        </div>

        <div class="order-details-section">
          <h2 class="subsection-title">Resumo do Pedido #{{ pedido.id }}</h2>
          
          <div class="order-info-grid">
            <div class="info-block">
              <strong>E-mail</strong>
              <span>{{ pedido.customer.email }}</span>
            </div>
            <div class="info-block">
              <strong>Data</strong>
              <span>{{ pedido.createdAt | date:"dd/MM/yyyy HH:mm" }}</span>
            </div>
            <div class="info-block">
              <strong>Pagamento</strong>
              <span>{{ getPagamento(pedido.paymentMethod) }}</span>
            </div>
            <div class="info-block">
              <strong>Status</strong>
              <span class="badge">{{ pedido.status }}</span>
            </div>
          </div>

          <div class="items-section">
            <h3>Itens Comprados</h3>
            <div class="items-list">
              <div class="item-row" *ngFor="let item of pedido.items">
                <img [src]="item.image" [alt]="item.title" class="item-image">
                <div class="item-details">
                  <strong>{{ item.title }}</strong>
                  <span>Quantidade: {{ item.quantity }}x</span>
                </div>
                <div class="item-price">
                  {{ item.price | currency:"BRL" }}
                </div>
              </div>
            </div>
          </div>

          <div class="totals-section">
            <div class="total-row" *ngIf="pedido.shippingFee">
              <span>Frete:</span>
              <strong>{{ pedido.shippingFee | currency:"BRL" }}</strong>
            </div>
            <div class="total-row" *ngIf="pedido.discount">
              <span>Desconto:</span>
              <strong style="color: #2e7d32;">-{{ pedido.discount | currency:"BRL" }}</strong>
            </div>
            <div class="total-row grand-total">
              <span>Total Pago:</span>
              <strong class="total-price">{{ pedido.total | currency:"BRL" }}</strong>
            </div>
          </div>

          <div class="delivery-info" *ngIf="pedido.customer.endereco">
            <h3>Endereço de Entrega</h3>
            <p>{{ pedido.customer.endereco }}, {{ pedido.customer.numero }}</p>
            <p>{{ pedido.customer.bairro }}, {{ pedido.customer.cidade }} - {{ pedido.customer.estado }}</p>
            <p>CEP: {{ pedido.customer.cep }}</p>
          </div>

          <div class="next-steps">
            <h3>Próximas Etapas</h3>
            <ul>
              <li *ngIf="isPix(pedido.paymentMethod)">
                <strong>1. Pagamento via PIX:</strong> Um código será enviado para seu e-mail. Utilize-o para completar o pagamento.
              </li>
              <li *ngIf="!isPix(pedido.paymentMethod)">
                <strong>1. Confirmação:</strong> Seu pagamento está sendo processado. Você receberá uma confirmação por e-mail.
              </li>
              <li><strong>2. Separação:</strong> Nossa equipe irá preparar seu pedido com todo cuidado.</li>
              <li><strong>3. Envio:</strong> Assim que postado, você receberá um código de rastreio por e-mail.</li>
            </ul>
          </div>

          <div class="actions">
            <a routerLink="/" class="btn btn-primary">← Continuar Comprando</a>
            <a routerLink="/perfil" class="btn btn-secondary">Ver Meus Pedidos</a>
          </div>
        </div>
      </div>

      <ng-template #noOrder>
        <div class="empty-state">
          <div class="error-icon">!</div>
          <h2>Nenhum Pedido Encontrado</h2>
          <p>Parece que você chegou aqui sem fazer uma compra. Volte à loja e tente novamente!</p>
          <a routerLink="/" class="btn btn-primary" style="margin-top: 1.5rem;">Voltar à Loja</a>
        </div>
      </ng-template>
    </section>
  `,
  styles: [`
    .success-card {
      max-width: 900px;
      margin: 2rem auto;
      background: white;
      border-radius: 8px;
      border: 1px solid var(--border);
      overflow: hidden;
    }
    .success-header {
      text-align: center;
      padding: 3rem 2rem;
      background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%);
      border-bottom: 3px solid #2e7d32;
    }
    .success-icon {
      width: 80px;
      height: 80px;
      background: #2e7d32;
      color: white;
      font-size: 3rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      margin: 0 auto 1.5rem;
    }
    .success-header h1 { color: #1b5e20; margin-bottom: 0.5rem; }
    .subtitle { color: #558b2f; font-size: 1.05rem; }

    .order-details-section { padding: 2.5rem; }
    .subsection-title { font-size: 1.5rem; margin-bottom: 2rem; color: var(--dark); font-weight: 900; }

    .order-info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 2rem;
      margin-bottom: 2.5rem;
      padding: 2rem;
      background: #f8f8f8;
      border-radius: 4px;
    }
    .info-block { display: flex; flex-direction: column; }
    .info-block strong { display: block; color: #6b7280; font-size: 0.8rem; margin-bottom: 0.8rem; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; }
    .info-block span { font-size: 1.1rem; font-weight: 600; word-break: break-word; }
    .badge { background: #fff3cd; padding: 0.5rem 1rem; border-radius: 4px; font-weight: 600; display: inline-block; }

    .items-section { margin: 2.5rem 0; }
    .items-section h3 { margin-bottom: 1.5rem; font-weight: 700; font-size: 1.1rem; }
    .items-list { border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
    .item-row {
      display: grid;
      grid-template-columns: 70px 1fr auto;
      gap: 1.5rem;
      align-items: center;
      padding: 1.5rem 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .item-row:last-child { border-bottom: none; }
    .item-image { width: 70px; height: 70px; object-fit: cover; border-radius: 4px; }
    .item-details { }
    .item-details strong { display: block; margin-bottom: 0.3rem; }
    .item-details span { font-size: 0.9rem; color: #666; }
    .item-price { font-weight: 700; font-size: 1.1rem; color: var(--primary); text-align: right; }

    .totals-section { background: #f8f8f8; padding: 1.5rem; border-radius: 4px; margin: 2rem 0; }
    .total-row { display: flex; justify-content: space-between; margin-bottom: 0.8rem; }
    .grand-total { border-top: 2px solid var(--border); padding-top: 1rem; margin-top: 1rem; font-size: 1.1rem; }
    .total-price { color: var(--primary); font-size: 1.3rem; }

    .delivery-info { background: #fdf2f2; padding: 1.5rem; border-left: 4px solid var(--primary); margin: 2rem 0; }
    .delivery-info h3 { margin-bottom: 0.8rem; }
    .delivery-info p { margin: 0.3rem 0; }

    .next-steps { margin: 2.5rem 0; }
    .next-steps ul { margin-left: 1.5rem; }
    .next-steps li { margin-bottom: 1rem; line-height: 1.6; }
    .next-steps strong { color: var(--primary); }

    .actions { display: flex; gap: 1rem; margin-top: 2.5rem; }
    .actions .btn { flex: 1; }
    .btn-secondary { background: white; color: var(--dark); border: 2px solid var(--border); }
    .btn-secondary:hover { border-color: var(--primary); }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 8px;
    }
    .error-icon {
      width: 80px;
      height: 80px;
      background: #ffebee;
      color: var(--primary);
      font-size: 3rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      margin: 0 auto 1.5rem;
    }
  `]
})
export class PedidoFinalizadoPage {
  private readonly checkoutStore = inject(CheckoutStore);
  private readonly storage = inject(StorageService);

  readonly order = computed(() => {
    const lastOrder = this.checkoutStore.lastOrder();
    if (lastOrder) return lastOrder;
    
    const savedOrder = this.storage.get<Order | null>("rolagem_last_order", null);
    if (savedOrder) {
      this.checkoutStore.lastOrder.set(savedOrder);
      return savedOrder;
    }
    
    return null;
  });

  isPix(method: string): boolean {
    return method === "pix";
  }

  getPagamento(method: string): string {
    return method === "pix" ? "PIX" : "Cartão de Crédito";
  }
}