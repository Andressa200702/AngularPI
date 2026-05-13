import { CommonModule, CurrencyPipe, DatePipe } from "@angular/common";
import { Component, inject, computed, signal } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { AuthService } from "../../../core/services/auth.service";
import { StorageService } from "../../../core/services/storage.service";
import { Order } from "../../../domain/models/order.model";

@Component({
  selector: "app-perfil-page",
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CurrencyPipe, DatePipe],
  template: `
    <div class="section-container">
      <div class="profile-container">
        <aside class="sidebar">
          <div class="user-info">
            <div class="avatar">{{ user()?.nome?.[0] || "U" }}</div>
            <h3>{{ user()?.nome }}</h3>
            <p>{{ user()?.email }}</p>
          </div>
          <nav class="side-nav">
            <a class="active" (click)="selectedTab.set('dados'); selectedOrder.set(null)">Dados Pessoais</a>
            <a *ngIf="!isAdmin()" (click)="selectedTab.set('pedidos'); selectedOrder.set(null)">Meus Pedidos</a>
            <a (click)="selectedTab.set('senha')">Alterar Senha</a>
            <a *ngIf="isAdmin()" routerLink="/admin">Painel Admin</a>
            <button class="logout-btn" (click)="logout()">Sair da Conta</button>
          </nav>
        </aside>

        <main class="content-area">
          <!-- Detalhes do Pedido -->
          <ng-container *ngIf="selectedOrder() as currentOrder; else listView">
            <div class="order-details-view">
              <button class="back-link" (click)="selectedOrder.set(null)">← Voltar para a lista</button>
              <h2 class="section-title" style="text-align: left; margin: 1.5rem 0;">Detalhes do Pedido #{{ currentOrder.id }}</h2>
              
              <div class="order-info-banner">
                <div>
                  <p><strong>Status:</strong> {{ currentOrder.status || "Pendente" }}</p>
                  <p><strong>Data:</strong> {{ currentOrder.createdAt | date:"dd/MM/yyyy HH:mm" }}</p>
                </div>
                <div style="text-align: right;">
                  <p><strong>Total:</strong> {{ currentOrder.total | currency:"BRL" }}</p>
                  <p><strong>Pagamento:</strong> {{ currentOrder.paymentMethod }}</p>
                </div>
              </div>

              <div class="items-list">
                <h3>Itens Comprados</h3>
                <div class="item-row" *ngFor="let item of currentOrder.items">
                  <img [src]="item.image" [alt]="item.title" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
                  <div class="item-info">
                    <strong>{{ item.title }}</strong>
                    <span>Qtd: {{ item.quantity }}</span>
                  </div>
                  <div class="item-price">
                    {{ item.price | currency:"BRL" }}
                  </div>
                </div>
              </div>

              <!-- Endereco com Fallback para Frete -->
              <div class="shipping-info" style="margin-top: 2rem; padding: 1.5rem; background: #f8f8f8; border-radius: 4px; border-left: 4px solid var(--primary);">
                <h3>Informações de Entrega</h3>
                
                <!-- Caso tenha endereco completo -->
                <div *ngIf="currentOrder.customer.address; else onlyShipping">
                  <p><strong>Destinatário:</strong> {{ currentOrder.customer.name }}</p>
                  <p><strong>Endereço:</strong> {{ currentOrder.customer.address }}, {{ currentOrder.customer.number }}</p>
                  <p><strong>Cidade:</strong> {{ currentOrder.customer.city }} - {{ currentOrder.customer.state }}</p>
                  <p><strong>CEP:</strong> {{ currentOrder.customer.zipCode }}</p>
                </div>

                <!-- Caso o pedido seja antigo e so tenha o frete/cep -->
                <ng-template #onlyShipping>
                   <p><strong>CEP de Destino:</strong> {{ currentOrder.shipping?.zipCode || currentOrder.customer.zipCode || "Não informado" }}</p>
                   <p><strong>Tipo de Envio:</strong> {{ currentOrder.shipping?.type || "Padrão" }}</p>
                   <p *ngIf="currentOrder.shipping?.price"><strong>Valor do Frete:</strong> {{ currentOrder.shipping.price | currency:"BRL" }}</p>
                   <p style="color: #666; font-size: 0.85rem; margin-top: 10px;">
                      Nota: Alguns dados detalhados do endereço podem não estar disponíveis para este pedido específico.
                   </p>
                </ng-template>
              </div>
            </div>
          </ng-container>

          <ng-template #listView>
            <!-- Dados Pessoais -->
            <div *ngIf="selectedTab() === 'dados'">
              <h2 class="section-title" style="text-align: left; margin-bottom: 2rem;">Dados Pessoais</h2>
              <div class="data-grid">
                  <div class="data-item">
                  <strong>Nome:</strong>
                  <span>{{ user()?.nome }}</span>
                  </div>
                  <div class="data-item">
                  <strong>E-mail:</strong>
                  <span>{{ user()?.email }}</span>
                  </div>
              </div>
            </div>

            <!-- Alterar Senha -->
            <div *ngIf="selectedTab() === 'senha'">
              <h2 class="section-title" style="text-align: left; margin-bottom: 2rem;">Alterar Senha</h2>
              
              <div class="password-form" style="max-width: 400px;">
                <div class="form-group">
                  <label>Senha Atual</label>
                  <input type="password" [(ngModel)]="passwordForm.currentPassword" placeholder="Digite sua senha atual">
                </div>
                
                <div class="form-group">
                  <label>Nova Senha</label>
                  <input type="password" [(ngModel)]="passwordForm.newPassword" placeholder="Digite a nova senha (mín. 8 caracteres)">
                </div>
                
                <div class="form-group">
                  <label>Confirmar Nova Senha</label>
                  <input type="password" [(ngModel)]="passwordForm.confirmPassword" placeholder="Confirme a nova senha">
                </div>

                <p *ngIf="passwordError()" class="error-message">{{ passwordError() }}</p>
                <p *ngIf="passwordSuccess()" class="success-message">{{ passwordSuccess() }}</p>

                <button (click)="changePassword()" class="btn btn-primary" style="width: 100%;">
                  Alterar Senha
                </button>
              </div>
            </div>

            <!-- Meus Pedidos -->
            <div *ngIf="selectedTab() === 'pedidos' && !isAdmin()">
              <h2 class="section-title" style="text-align: left; margin-bottom: 2rem;">Meus Pedidos</h2>
              <div class="orders-list">
                <div *ngIf="userOrders().length > 0; else noOrders" class="orders-grid">
                    <div class="order-card clickable" *ngFor="let ord of userOrders()" (click)="selectedOrder.set(ord)">
                    <div class="order-header">
                        <strong>Pedido #{{ ord.id }}</strong>
                        <span class="status-badge">{{ ord.status || "Pendente" }}</span>
                    </div>
                    <div class="order-body">
                        <p>{{ ord.items.length }} item(ns)</p>
                        <p>Data: {{ ord.createdAt | date:"dd/MM/yyyy HH:mm" }}</p>
                        <strong>Total: {{ ord.total | currency:"BRL" }}</strong>
                        <button class="btn-detail">Ver detalhes</button>
                    </div>
                    </div>
                </div>
                <ng-template #noOrders>
                    <div class="empty-orders">
                    <p>Você ainda não possui pedidos vinculados a esta conta.</p>
                    </div>
                </ng-template>
            </div>
            </div>
          </ng-template>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 3rem;
      background: white;
      padding: 2rem;
      border-radius: 8px;
      border: 1px solid var(--border);
    }
    .user-info {
        text-align: center;
        padding-bottom: 2rem;
        border-bottom: 1px solid var(--border);
        margin-bottom: 2rem;
    }
    .avatar {
        width: 80px; height: 80px;
        background: var(--primary);
        color: white;
        font-size: 2rem; font-weight: 800;
        display: flex; align-items: center; justify-content: center;
        border-radius: 50%; margin: 0 auto 1rem;
    }
    .side-nav { display: flex; flex-direction: column; gap: 0.5rem; }
    .side-nav a {
        padding: 0.8rem 1rem; border-radius: 4px;
        font-weight: 600; color: var(--dark); text-decoration: none; cursor: pointer;
    }
    .side-nav a.active { background: var(--light); color: var(--primary); }
    .logout-btn {
        margin-top: 2rem; padding: 0.8rem;
        border: 1px solid var(--primary); color: var(--primary);
        background: none; border-radius: 4px; font-weight: 700; cursor: pointer;
    }
    .data-grid { display: grid; gap: 1.5rem; }
    .data-item { display: flex; flex-direction: column; }
    .data-item strong { color: #6b7280; font-size: 0.9rem; }
    .data-item span { font-size: 1.1rem; font-weight: 500; }

    .orders-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }
    .order-card {
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .order-card:hover { border-color: var(--primary); box-shadow: var(--shadow-md); }
    .btn-detail {
        margin-top: 1rem; width: 100%; padding: 0.5rem;
        background: var(--dark); color: white; border: none;
        border-radius: 2px; font-weight: 700; cursor: pointer;
    }
    .status-badge {
      font-size: 0.75rem; background: #eee;
      padding: 2px 8px; border-radius: 10px;
      text-transform: uppercase; font-weight: 700;
    }

    .back-link {
        background: none; border: none; color: var(--primary);
        font-weight: 700; cursor: pointer; padding: 0;
    }
    .order-info-banner {
        display: flex; justify-content: space-between;
        background: var(--dark); color: white;
        padding: 1.5rem; border-radius: 4px; margin-bottom: 2rem;
    }
    .item-row {
        display: grid; grid-template-columns: 60px 1fr auto;
        gap: 1.5rem; align-items: center;
        padding: 1rem 0; border-bottom: 1px solid var(--border);
    }
    .item-info { display: flex; flex-direction: column; }
    .item-price { font-weight: 700; color: var(--primary); }
    
    .password-form {
      background: #f8f8f8;
      padding: 1.5rem;
      border-radius: 4px;
      border-left: 4px solid var(--primary);
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: var(--dark);
    }

    .form-group input {
      width: 100%;
      padding: 0.8rem;
      border: 1px solid var(--border);
      border-radius: 4px;
      outline: none;
    }

    .form-group input:focus {
      border-color: var(--primary);
    }

    .error-message {
      color: var(--primary);
      font-size: 0.9rem;
      margin-bottom: 1rem;
      font-weight: 600;
    }

    .success-message {
      color: #2e7d32;
      font-size: 0.9rem;
      margin-bottom: 1rem;
      font-weight: 600;
    }
  `]
})
export class PerfilPage {
  private readonly authService = inject(AuthService);
  private readonly storage = inject(StorageService);
  private readonly router = inject(Router);

  readonly user = computed(() => this.authService.currentUser());
  readonly isAdmin = computed(() => this.authService.isAdmin());
  readonly selectedOrder = signal<any | null>(null);
  readonly selectedTab = signal<string>('dados');
  
  readonly passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  
  readonly passwordError = signal<string>('');
  readonly passwordSuccess = signal<string>('');

  readonly userOrders = computed(() => {
    const allOrders = this.storage.get<Order[]>("rolagem_pedidos", []);
    const email = this.user()?.email;
    if (!email) return [];
    return allOrders
      .filter(o => o.customer.email.toLowerCase() === email.toLowerCase())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

  constructor() {
    if (!this.authService.isLoggedIn()) {
      void this.router.navigate(["/login"]);
    }
  }

  logout() {
    this.authService.logout();
    void this.router.navigate(["/"]);
  }

  changePassword() {
    this.passwordError.set('');
    this.passwordSuccess.set('');

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      this.passwordError.set('Preencha todos os campos');
      return;
    }

    if (newPassword.length < 8) {
      this.passwordError.set('A nova senha deve ter no mínimo 8 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      this.passwordError.set('As senhas não correspondem');
      return;
    }

    const currentUser = this.user();
    if (!currentUser || currentUser.senha !== currentPassword) {
      this.passwordError.set('A senha atual está incorreta');
      return;
    }

    // Atualiza a senha no usuário logado e no storage
    const users = this.storage.get<any[]>('rolagem_usuarios', []);
    const updatedUsers = users.map(u => 
      u.email === currentUser.email ? { ...u, senha: newPassword } : u
    );
    this.storage.set('rolagem_usuarios', updatedUsers);

    this.passwordSuccess.set('Senha alterada com sucesso!');
    this.passwordForm.currentPassword = '';
    this.passwordForm.newPassword = '';
    this.passwordForm.confirmPassword = '';

    setTimeout(() => this.passwordSuccess.set(''), 3000);
  }
}