import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../core/services/storage.service';
import { AuthService } from '../../core/services/auth.service';
import { StockService } from '../../core/services/stock.service';
import { ProductService } from '../../core/services/product.service';
import { ReportService } from '../../core/services/report.service';
import { CouponService } from '../../core/services/coupon.service';
import { CategoryService } from '../../core/services/category.service';
import { ClientService } from '../../core/services/client.service';
import { AuditService } from '../../core/services/audit.service';
import { ToastService } from '../../core/services/toast.service';
import { Router } from '@angular/router';
import { Order } from '../../domain/models/order.model';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="section-container">
      <div class="admin-card">
        <h1 class="section-title">Painel Administrativo</h1>
        
        <!-- Tabs de navegação -->
        <div class="tabs-nav">
          <button 
            *ngFor="let tab of tabs" 
            (click)="activeTab.set(tab.id)"
            [class.active]="activeTab() === tab.id"
            class="tab-button">
            {{ tab.label }}
          </button>
        </div>

        <!-- Dashboard -->
        <div *ngIf="activeTab() === 'dashboard'" class="tab-content">
          <div class="stats-grid">
            <div class="stat-box">
              <span class="label">Total de Pedidos</span>
              <span class="value">{{ allOrders().length }}</span>
            </div>
            <div class="stat-box">
              <span class="label">Faturamento Total</span>
              <span class="value">{{ revenue() | currency:'BRL' }}</span>
            </div>
            <div class="stat-box">
              <span class="label">Produtos no Estoque</span>
              <span class="value">{{ stockItems().length }}</span>
            </div>
            <div class="stat-box">
              <span class="label">Itens Esgotados</span>
              <span class="value danger">{{ outOfStockCount() }}</span>
            </div>
          </div>

          <div class="table-container">
            <h3>Pedidos Recentes</h3>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Data</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let order of allOrders()">
                  <td>#{{ order.id }}</td>
                  <td>{{ order.customer.nome }}</td>
                  <td>{{ order.createdAt | date:'dd/MM/yyyy HH:mm' }}</td>
                  <td>{{ order.total | currency:'BRL' }}</td>
                  <td>
                    <select 
                      [value]="order.status || 'pendente'" 
                      (change)="updateOrderStatus(order.id, $event)"
                      class="status-select">
                      <option value="pendente">Pendente</option>
                      <option value="confirmado">Confirmado</option>
                      <option value="enviado">Enviado</option>
                      <option value="entregue">Entregue</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </td>
                  <td>
                    <button class="btn-sm" (click)="toggleOrderDetails(order.id)">
                      {{ expandedOrder() === order.id ? 'Ocultar' : 'Ver' }}
                    </button>
                  </td>
                </tr>
                <tr *ngIf="allOrders().length === 0">
                  <td colspan="6" style="text-align: center; padding: 2rem;">Nenhum pedido registrado.</td>
                </tr>
              </tbody>
            </table>

            <!-- Detalhes do pedido -->
            <div *ngIf="expandedOrder()" class="order-details">
              <div *ngFor="let order of allOrders()">
                <div *ngIf="order.id === expandedOrder()" class="details-box">
                  <h4>Detalhes do Pedido #{{ order.id }}</h4>
                  <div class="details-grid">
                    <div><strong>Cliente:</strong> {{ order.customer.nome }}</div>
                    <div><strong>Email:</strong> {{ order.customer.email }}</div>
                    <div><strong>Endereço:</strong> {{ order.customer.endereco }}, {{ order.customer.numero }} - {{ order.customer.bairro }}</div>
                    <div><strong>Cidade:</strong> {{ order.customer.cidade }}, {{ order.customer.estado }} - {{ order.customer.cep }}</div>
                    <div><strong>Método de Pagamento:</strong> {{ order.paymentMethod === 'cartao' ? 'Cartão de Crédito' : 'PIX' }}</div>
                    <div><strong>Status:</strong> {{ order.status || 'pendente' | uppercase }}</div>
                  </div>
                  <div class="items-list">
                    <h5>Itens:</h5>
                    <div *ngFor="let item of order.items" class="item-row">
                      {{ item.title }} - {{ item.quantity }}x R$ {{ item.price }}
                    </div>
                  </div>
                  <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #ddd;">
                    <strong>Total: {{ order.total | currency:'BRL' }}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Relatórios -->
        <div *ngIf="activeTab() === 'relatorios'" class="tab-content">
          <div class="stats-grid">
            <div class="stat-box">
              <span class="label">Total de Vendas</span>
              <span class="value">{{ report().totalRevenue | currency:'BRL' }}</span>
            </div>
            <div class="stat-box">
              <span class="label">Pedidos Confirmados</span>
              <span class="value">{{ report().completedOrders }}</span>
            </div>
            <div class="stat-box">
              <span class="label">Ticket Médio</span>
              <span class="value">{{ report().averageTicket | currency:'BRL' }}</span>
            </div>
            <div class="stat-box">
              <span class="label">Pedidos Cancelados</span>
              <span class="value danger">{{ report().cancelledOrders }}</span>
            </div>
          </div>

          <!-- Gráfico de Vendas por Dia -->
          <div class="table-container">
            <h3>Vendas por Dia (Últimos 30 dias)</h3>
            <div class="chart-container">
              <div *ngFor="let day of report().salesByDay" class="chart-bar">
                <div class="bar-label">{{ day.day }}</div>
                <div class="bar-wrapper">
                  <div class="bar" [style.height.%]="(day.amount / (report().totalRevenue / (report().salesByDay.length || 1))) * 50">
                    <span class="bar-value">R$ {{ day.amount | number:'1.0-0' }}</span>
                  </div>
                </div>
                <div class="bar-count">{{ day.sales }} pedido(s)</div>
              </div>
            </div>
          </div>

          <!-- Top Produtos -->
          <div class="table-container">
            <h3>Top 10 Produtos Mais Vendidos</h3>
            <table>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Quantidade Vendida</th>
                  <th>Faturamento</th>
                  <th>% do Total</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let product of report().topProducts">
                  <td>{{ product.title }}</td>
                  <td style="text-align: center; font-weight: 600;">{{ product.quantity }}</td>
                  <td>{{ product.revenue | currency:'BRL' }}</td>
                  <td>
                    <div class="progress-bar">
                      <div class="progress" [style.width.%]="(product.revenue / report().totalRevenue) * 100"></div>
                      <span>{{ ((product.revenue / report().totalRevenue) * 100) | number:'1.0-0' }}%</span>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="report().topProducts.length === 0">
                  <td colspan="4" style="text-align: center; padding: 2rem;">Nenhuma venda registrada.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Top Clientes -->
          <div class="table-container">
            <h3>Top 10 Clientes</h3>
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Pedidos</th>
                  <th>Total Gasto</th>
                  <th>Ticket Médio</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let customer of report().topCustomers">
                  <td><strong>{{ customer.name }}</strong></td>
                  <td>{{ customer.email }}</td>
                  <td style="text-align: center; font-weight: 600;">{{ customer.orders }}</td>
                  <td>{{ customer.spent | currency:'BRL' }}</td>
                  <td>{{ (customer.spent / customer.orders) | currency:'BRL' }}</td>
                </tr>
                <tr *ngIf="report().topCustomers.length === 0">
                  <td colspan="5" style="text-align: center; padding: 2rem;">Nenhum cliente registrado.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Status dos Pedidos -->
          <div class="table-container">
            <h3>Distribuição de Pedidos por Status</h3>
            <div class="status-grid">
              <div *ngFor="let status of report().ordersByStatus" class="status-card">
                <div class="status-count">{{ status.count }}</div>
                <div class="status-label">{{ status.status | uppercase }}</div>
                <div class="status-percentage">
                  {{ ((status.count / report().totalOrders) * 100) | number:'1.0-0' }}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Estoque -->
        <div *ngIf="activeTab() === 'estoque'" class="tab-content">
          <div class="table-container">
            <h3>Controle de Estoque</h3>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Produto</th>
                  <th>Status</th>
                  <th>Quantidade Atual</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of stockItems()">
                  <td>#{{ item.id }}</td>
                  <td>{{ item.nome }}</td>
                  <td>
                    <span class="badge" 
                      [class.badge-success]="item.qtd > 3"
                      [class.badge-warning]="item.qtd === 0 || (item.qtd <= 3 && item.qtd > 0)"
                      [class.badge-danger]="item.qtd === 0">
                      {{ item.qtd === 0 ? 'ESGOTADO' : (item.qtd <= 3 ? 'BAIXO' : 'DISPONÍVEL') }}
                    </span>
                  </td>
                  <td style="text-align: center;">
                    <strong style="font-size: 1.2rem; color: var(--primary);">{{ item.qtd }} un</strong>
                  </td>
                  <td>
                    <input type="number" 
                      [value]="item.qtd" 
                      (change)="updateStock(item.id, $event)" 
                      class="stock-input" 
                      min="0"> 
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Adicionar Produtos -->
        <div *ngIf="activeTab() === 'produtos'" class="tab-content">
          <div class="form-section">
            <h3>Adicionar Novo Produto</h3>
            
            <div class="form-group">
              <label>Título do Produto *</label>
              <input 
                type="text" 
                [(ngModel)]="newProduct.title"
                placeholder="Ex: Conjunto de Dados Poliedrais"
                class="form-input">
            </div>

            <div class="form-group">
              <label>Descrição *</label>
              <textarea 
                [(ngModel)]="newProduct.description"
                placeholder="Descrição detalhada do produto"
                class="form-input"
                rows="3"></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Preço (R$) *</label>
                <input 
                  type="number" 
                  [(ngModel)]="newProduct.price"
                  placeholder="0.00"
                  class="form-input"
                  step="0.01">
              </div>

              <div class="form-group">
                <label>Quantidade em Estoque *</label>
                <input 
                  type="number" 
                  [(ngModel)]="newProduct.stock"
                  placeholder="0"
                  class="form-input"
                  min="0">
              </div>

              <div class="form-group">
                <label>Parcelamento</label>
                <input 
                  type="number" 
                  [(ngModel)]="newProduct.installments"
                  placeholder="1"
                  class="form-input"
                  min="1"
                  max="12">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Categoria *</label>
                <select [(ngModel)]="newProduct.category" class="form-input">
                  <option value="">Selecione uma categoria</option>
                  <option value="rpg-de-mesa">RPG de Mesa</option>
                  <option value="board-games">Board Games</option>
                  <option value="acessorios">Acessórios</option>
                  <option value="literatura">Literatura</option>
                  <option value="pre-vendas">Pré-vendas</option>
                </select>
              </div>

              <div class="form-group">
                <label>Label da Categoria</label>
                <input 
                  type="text" 
                  [(ngModel)]="newProduct.categoryLabel"
                  placeholder="Ex: Livro Básico"
                  class="form-input">
              </div>
            </div>

            <div class="form-group">
              <label>URL da Imagem</label>
              <input 
                type="text" 
                [(ngModel)]="newProduct.image"
                placeholder="https://..."
                class="form-input">
            </div>

            <button (click)="addProduct()" class="btn-primary" style="width: 100%; margin-top: 1rem;">
              Adicionar Produto
            </button>

            <div *ngIf="successMessage" class="success-message">
              {{ successMessage }}
            </div>
            <div *ngIf="errorMessage" class="error-message">
              {{ errorMessage }}
            </div>
          </div>

          <!-- Lista de Produtos Adicionados -->
          <div class="table-container" style="margin-top: 3rem;">
            <h3>Produtos Cadastrados</h3>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Título</th>
                  <th>Preço</th>
                  <th>Estoque</th>
                  <th>Categoria</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let product of customProducts()">
                  <td>#{{ product.id }}</td>
                  <td>{{ product.title }}</td>
                  <td>{{ product.price | currency:'BRL' }}</td>
                  <td>
                    <strong [style.color]="product.stock === 0 ? 'var(--primary)' : 'green'">
                      {{ product.stock }}
                    </strong>
                  </td>
                  <td>{{ product.categoryLabel }}</td>
                  <td>
                    <button class="btn-sm danger" (click)="deleteProduct(product.id)">Remover</button>
                  </td>
                </tr>
                <tr *ngIf="customProducts().length === 0">
                  <td colspan="6" style="text-align: center; padding: 2rem;">Nenhum produto adicionado ainda.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Cupons -->
        <div *ngIf="activeTab() === 'cupons'" class="tab-content">
          <div class="form-section">
            <h3>Criar Novo Cupom</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label>Código do Cupom *</label>
                <input 
                  type="text" 
                  [(ngModel)]="newCoupon.code"
                  placeholder="Ex: PROMO10"
                  class="form-input">
              </div>

              <div class="form-group">
                <label>Tipo *</label>
                <select [(ngModel)]="newCoupon.type" class="form-input">
                  <option value="percentage">Percentual (%)</option>
                  <option value="fixed">Valor Fixo (R$)</option>
                </select>
              </div>

              <div class="form-group">
                <label>Valor *</label>
                <input 
                  type="number" 
                  [(ngModel)]="newCoupon.value"
                  placeholder="0"
                  class="form-input"
                  step="0.01">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Limite de Usos</label>
                <input 
                  type="number" 
                  [(ngModel)]="newCoupon.maxUses"
                  placeholder="Deixe em branco para ilimitado"
                  class="form-input"
                  min="1">
              </div>

              <div class="form-group">
                <label>Data de Expiração</label>
                <input 
                  type="date" 
                  [(ngModel)]="newCoupon.expiryDate"
                  class="form-input">
              </div>
            </div>

            <div class="form-group">
              <label>Descrição</label>
              <textarea 
                [(ngModel)]="newCoupon.description"
                placeholder="Ex: Desconto para primeira compra"
                class="form-input"
                rows="2"></textarea>
            </div>

            <button (click)="addCoupon()" class="btn-primary" style="width: 100%;">
              Criar Cupom
            </button>

            <div *ngIf="successMessage" class="success-message">{{ successMessage }}</div>
            <div *ngIf="errorMessage" class="error-message">{{ errorMessage }}</div>
          </div>

          <div class="table-container">
            <h3>Cupons Ativo</h3>
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Tipo</th>
                  <th>Valor</th>
                  <th>Usos</th>
                  <th>Expiração</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let coupon of coupons()">
                  <td><strong>{{ coupon.code }}</strong></td>
                  <td>{{ coupon.type === 'percentage' ? '%' : 'R$' }}</td>
                  <td>{{ coupon.value }}</td>
                  <td>{{ coupon.usedCount }}<span *ngIf="coupon.maxUses"> / {{ coupon.maxUses }}</span></td>
                  <td>{{ coupon.expiryDate ? (coupon.expiryDate | date:'dd/MM/yyyy') : 'Sem prazo' }}</td>
                  <td>
                    <span class="badge" [class.badge-success]="coupon.isActive" [class.badge-danger]="!coupon.isActive">
                      {{ coupon.isActive ? 'Ativo' : 'Inativo' }}
                    </span>
                  </td>
                  <td>
                    <button class="btn-sm" (click)="toggleCoupon(coupon.id)">
                      {{ coupon.isActive ? 'Desativar' : 'Ativar' }}
                    </button>
                    <button class="btn-sm danger" (click)="deleteCoupon(coupon.id, coupon.code)">Remover</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Categorias -->
        <div *ngIf="activeTab() === 'categorias'" class="tab-content">
          <div class="form-section">
            <h3>Adicionar Categoria</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label>Nome Interno *</label>
                <input 
                  type="text" 
                  [(ngModel)]="newCategory.name"
                  placeholder="Ex: rpg-de-mesa"
                  class="form-input">
              </div>

              <div class="form-group">
                <label>Label de Exibição *</label>
                <input 
                  type="text" 
                  [(ngModel)]="newCategory.label"
                  placeholder="Ex: RPG de Mesa"
                  class="form-input">
              </div>
            </div>

            <div class="form-group">
              <label>Descrição</label>
              <textarea 
                [(ngModel)]="newCategory.description"
                placeholder="Descrição opcional"
                class="form-input"
                rows="2"></textarea>
            </div>

            <button (click)="addCategory()" class="btn-primary" style="width: 100%;">
              Adicionar Categoria
            </button>

            <div *ngIf="successMessage" class="success-message">{{ successMessage }}</div>
            <div *ngIf="errorMessage" class="error-message">{{ errorMessage }}</div>
          </div>

          <div class="table-container">
            <h3>Categorias</h3>
            <table>
              <thead>
                <tr>
                  <th>Label</th>
                  <th>Nome Interno</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let category of categories()">
                  <td><strong>{{ category.label }}</strong></td>
                  <td>{{ category.name }}</td>
                  <td>
                    <span class="badge" [class.badge-success]="category.isActive">
                      {{ category.isActive ? 'Ativa' : 'Inativa' }}
                    </span>
                  </td>
                  <td>
                    <button class="btn-sm" (click)="moveCategoryUp(category.id)">Acima</button>
                    <button class="btn-sm" (click)="moveCategoryDown(category.id)">Abaixo</button>
                    <button class="btn-sm danger" (click)="deleteCategory(category.id, category.label)">Remover</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Clientes -->
        <div *ngIf="activeTab() === 'clientes'" class="tab-content">
          <div class="form-group" style="margin-bottom: 2rem;">
            <label>Buscar Cliente</label>
            <input 
              type="text" 
              [(ngModel)]="searchQuery"
              placeholder="Por nome ou email..."
              class="form-input">
          </div>

          <div class="table-container">
            <h3>Clientes</h3>
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Pedidos</th>
                  <th>Total Gasto</th>
                  <th>Ticket Médio</th>
                  <th>Último Pedido</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let customer of filteredCustomers()">
                  <td><strong>{{ customer.nome }}</strong></td>
                  <td>{{ customer.email }}</td>
                  <td style="text-align: center;">{{ customer.totalOrders }}</td>
                  <td>{{ customer.totalSpent | currency:'BRL' }}</td>
                  <td>{{ (customer.totalSpent / customer.totalOrders) | currency:'BRL' }}</td>
                  <td>{{ customer.lastOrder ? (customer.lastOrder | date:'dd/MM/yyyy') : '-' }}</td>
                </tr>
                <tr *ngIf="filteredCustomers().length === 0">
                  <td colspan="6" style="text-align: center; padding: 2rem;">Nenhum cliente registrado.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Auditoria -->
        <div *ngIf="activeTab() === 'auditoria'" class="tab-content">
          <div class="table-container">
            <h3>Histórico de Ações (Últimos 500)</h3>
            <table>
              <thead>
                <tr>
                  <th>Data/Hora</th>
                  <th>Ação</th>
                  <th>Entidade</th>
                  <th>Detalhes</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let log of auditLogs() | slice:0:500">
                  <td style="font-size: 0.85rem;">{{ log.timestamp | date:'dd/MM/yyyy HH:mm:ss' }}</td>
                  <td>
                    <span class="badge-action" [class]="'action-' + log.action.toLowerCase()">
                      {{ log.action }}
                    </span>
                  </td>
                  <td>{{ log.entity }}</td>
                  <td style="font-size: 0.9rem;">{{ log.details }}</td>
                </tr>
                <tr *ngIf="auditLogs().length === 0">
                  <td colspan="4" style="text-align: center; padding: 2rem;">Nenhum log registrado.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .section-container { padding: 2rem; background: var(--light); min-height: 100vh; }
    .admin-card { background: white; padding: 2rem; border-radius: 8px; border: 1px solid var(--border); }
    
    /* Tabs */
    .tabs-nav { display: flex; gap: 0.5rem; margin-bottom: 2rem; border-bottom: 2px solid var(--border); }
    .tab-button { 
      padding: 1rem 1.5rem; 
      background: none; 
      border: none; 
      cursor: pointer; 
      font-weight: 600;
      color: var(--gray);
      border-bottom: 3px solid transparent;
      transition: all 0.3s;
    }
    .tab-button.active { 
      color: var(--primary); 
      border-bottom-color: var(--primary);
    }
    .tab-button:hover { color: var(--dark); }
    
    .tab-content { animation: fadeIn 0.3s; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    /* Stats */
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; margin-bottom: 3rem; }
    .stat-box { background: var(--light); padding: 1.5rem; border-radius: 8px; text-align: center; border: 1px solid var(--border); }
    .stat-box .label { display: block; color: var(--gray); font-size: 0.9rem; margin-bottom: 0.5rem; }
    .stat-box .value { font-size: 1.8rem; font-weight: 900; color: var(--primary); }
    .stat-box .value.danger { color: #d32f2f; }

    /* Tabelas */
    .table-container { overflow-x: auto; margin-top: 2rem; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: 1rem; background: var(--light); color: var(--dark); border-bottom: 2px solid var(--border); font-weight: 700; }
    td { padding: 1rem; border-bottom: 1px solid var(--border); }
    tr:hover { background: #fafafa; }

    /* Badges */
    .badge { 
      padding: 0.4rem 0.8rem; 
      border-radius: 4px; 
      font-size: 0.75rem; 
      font-weight: bold; 
      text-transform: uppercase; 
      display: inline-block;
    }
    .badge-success { background: #e8f5e9; color: #2e7d32; }
    .badge-warning { background: #fff3e0; color: #e65100; }
    .badge-danger { background: #ffebee; color: #c62828; }

    /* Selects e Inputs */
    .status-select { 
      padding: 0.4rem 0.6rem; 
      border: 1px solid var(--border); 
      border-radius: 4px; 
      font-weight: 600;
      cursor: pointer;
    }
    .stock-input { 
      width: 80px; 
      padding: 0.4rem; 
      border: 1px solid var(--border); 
      border-radius: 4px; 
      font-weight: bold; 
      text-align: center; 
    }

    /* Botões */
    .btn-sm { 
      padding: 0.4rem 0.8rem; 
      font-size: 0.8rem; 
      background: var(--dark); 
      color: white; 
      border: none; 
      border-radius: 4px; 
      cursor: pointer;
      transition: 0.2s;
    }
    .btn-sm:hover { opacity: 0.8; }
    .btn-sm.danger { background: #d32f2f; }

    .btn-primary {
      padding: 0.8rem 1.5rem;
      background: var(--primary);
      color: white;
      border: none;
      border-radius: 4px;
      font-weight: 600;
      cursor: pointer;
      transition: 0.3s;
    }
    .btn-primary:hover { opacity: 0.9; }

    /* Detalhes do Pedido */
    .order-details { margin-top: 2rem; }
    .details-box { 
      background: var(--light); 
      padding: 1.5rem; 
      border-radius: 8px; 
      border-left: 4px solid var(--primary);
      margin-bottom: 1rem;
    }
    .details-box h4 { margin-bottom: 1rem; color: var(--dark); }
    .details-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
      gap: 1rem; 
      margin-bottom: 1.5rem;
    }
    .details-grid div { font-size: 0.9rem; }
    .details-grid strong { display: block; color: var(--gray); font-size: 0.75rem; text-transform: uppercase; margin-bottom: 0.3rem; }
    .items-list { background: white; padding: 1rem; border-radius: 4px; }
    .items-list h5 { margin-bottom: 0.8rem; }
    .item-row { padding: 0.6rem 0; border-bottom: 1px solid var(--border); }
    .item-row:last-child { border-bottom: none; }

    /* Formulário de Produtos */
    .form-section { background: var(--light); padding: 2rem; border-radius: 8px; }
    .form-section h3 { margin-bottom: 2rem; color: var(--dark); }
    
    .form-group { margin-bottom: 1.5rem; }
    .form-group label { display: block; font-weight: 600; margin-bottom: 0.5rem; color: var(--dark); }
    .form-input { 
      width: 100%; 
      padding: 0.8rem; 
      border: 1px solid var(--border); 
      border-radius: 4px; 
      font-family: inherit;
      font-size: 1rem;
    }
    .form-input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 2px rgba(201, 24, 24, 0.1); }

    .form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; }

    /* Gráficos */
    .chart-container { 
      display: flex; 
      gap: 1.5rem; 
      overflow-x: auto; 
      padding: 1rem 0;
      flex-wrap: wrap;
    }
    .chart-bar { 
      flex: 1; 
      min-width: 60px; 
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
    .bar-label { 
      font-size: 0.7rem; 
      font-weight: 600; 
      color: var(--gray);
      width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .bar-wrapper { 
      height: 100px; 
      display: flex; 
      align-items: flex-end; 
      justify-content: center;
    }
    .bar { 
      width: 100%; 
      background: linear-gradient(to top, var(--primary), #ff6b6b);
      border-radius: 4px 4px 0 0;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      min-height: 10px;
      position: relative;
    }
    .bar-value { 
      font-size: 0.65rem; 
      font-weight: 600; 
      color: white;
      padding: 0.2rem;
    }
    .bar-count { 
      font-size: 0.7rem; 
      color: var(--dark);
      font-weight: 600;
    }

    /* Progress Bar */
    .progress-bar {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      height: 24px;
    }
    .progress {
      background: linear-gradient(to right, var(--primary), #ff6b6b);
      height: 8px;
      border-radius: 4px;
      min-width: 20px;
      flex: 1;
    }
    .progress-bar span {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--dark);
      white-space: nowrap;
      min-width: 40px;
      text-align: right;
    }

    /* Status Grid */
    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1.5rem;
      margin-top: 1rem;
    }
    .status-card{
      background: var(--light);
      padding: 1.5rem;
      border-radius: 8px;
      text-align: center;
      border: 2px solid var(--border);
      transition: 0.3s;
    }
    .status-card:hover {
      border-color: var(--primary);
      box-shadow: 0 4px 12px rgba(201, 24, 24, 0.1);
    }
    .status-count {
      font-size: 2rem;
      font-weight: 900;
      color: var(--primary);
      margin-bottom: 0.5rem;
    }
    .status-label {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--dark);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 0.8rem;
    }
    .status-percentage {
      font-size: 0.9rem;
      color: var(--gray);
      font-weight: 600;
    }

    /* Mensagens */
    .success-message { 
      margin-top: 1rem;
      padding: 1rem;
      background: #e8f5e9;
      color: #2e7d32;
      border-radius: 4px;
      font-weight: 600;
    }
    .error-message { 
      margin-top: 1rem;
      padding: 1rem;
      background: #ffebee;
      color: #c62828;
      border-radius: 4px;
      font-weight: 600;
    }

    /* Badges para Ações */
    .badge-action {
      padding: 0.3rem 0.8rem;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      display: inline-block;
    }
    .action-create { background: #e8f5e9; color: #2e7d32; }
    .action-update { background: #e3f2fd; color: #1565c0; }
    .action-delete { background: #ffebee; color: #c62828; }
    .action-cancel_order { background: #fff3e0; color: #e65100; }
    .action-update_status { background: #f3e5f5; color: #6a1b9a; }
  `]
})
export class AdminPage {
  private readonly storage = inject(StorageService);
  private readonly auth = inject(AuthService);
  private readonly stockService = inject(StockService);
  private readonly productService = inject(ProductService);
  private readonly reportService = inject(ReportService);
  private readonly couponService = inject(CouponService);
  private readonly categoryService = inject(CategoryService);
  private readonly clientService = inject(ClientService);
  private readonly auditService = inject(AuditService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  readonly activeTab = signal<string>('dashboard');
  readonly expandedOrder = signal<string | null>(null);

  readonly allOrders = computed<Order[]>(() => this.storage.get<Order[]>('rolagem_pedidos', []) || []);
  readonly revenue = computed(() => this.allOrders().reduce((acc: number, curr: any) => acc + (curr.total || 0), 0));
  readonly stockItems = computed(() => this.stockService.stock());
  readonly customProducts = computed(() => this.productService.products());
  
  readonly outOfStockCount = computed(() => 
    this.stockItems().filter(item => item.qtd === 0).length
  );

  readonly report = computed(() => this.reportService.generateReport());
  readonly coupons = computed(() => this.couponService.coupons());
  readonly categories = computed(() => this.categoryService.categories());
  readonly customers = computed(() => this.clientService.customers());
  readonly auditLogs = computed(() => this.auditService.logs());
  readonly filteredCustomers = computed(() => {
    if (!this.searchQuery) return this.customers();
    
    const query = this.searchQuery.toLowerCase();
    return this.customers().filter(c => 
      c.nome.toLowerCase().includes(query) || 
      c.email.toLowerCase().includes(query)
    );
  });

  newProduct = {
    title: '',
    description: '',
    price: 0,
    image: '',
    category: '',
    categoryLabel: '',
    installments: 1,
    stock: 0
  };

  newCoupon = {
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    maxUses: 0,
    expiryDate: '',
    description: ''
  };

  newCategory = {
    name: '',
    label: '',
    description: ''
  };

  searchQuery = '';

  successMessage = '';
  errorMessage = '';

  tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'relatorios', label: 'Relatorios' },
    { id: 'estoque', label: 'Estoque' },
    { id: 'produtos', label: 'Produtos' },
    { id: 'cupons', label: 'Cupons' },
    { id: 'categorias', label: 'Categorias' },
    { id: 'clientes', label: 'Clientes' },
    { id: 'auditoria', label: 'Auditoria' }
  ];

  constructor() {
    if (!this.auth.isAdmin()) {
      void this.router.navigate(['/']);
    }
  }

  toggleOrderDetails(orderId: string): void {
    this.expandedOrder.set(this.expandedOrder() === orderId ? null : orderId);
  }

  updateOrderStatus(orderId: string, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value;
    
    const orders = this.allOrders();
    const order = orders.find(o => o.id === orderId);
    
    if (!order) return;

    // Se estatus for cancelado, devolver estoque
    if (newStatus === 'cancelado') {
      const confirm = window.confirm('Tem certeza que deseja cancelar este pedido? O estoque será restaurado.');
      if (!confirm) {
        select.value = order.status || 'pendente';
        return;
      }

      // Devolver itens ao estoque
      for (const item of order.items) {
        const stock = this.stockService.getById(item.productId);
        if (stock) {
          this.stockService.updateQty(item.productId, stock.qtd + item.quantity);
        }
      }

      this.auditService.logOrderCancelled(orderId, order.customer?.nome || 'Cliente');
    } else {
      this.auditService.logOrderStatusUpdated(orderId, order.status || 'pendente', newStatus);
    }
    
    const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    this.storage.set('rolagem_pedidos', updated);
  }

  updateStock(id: string, event: Event): void {
    const input = event.target as HTMLInputElement;
    const newQty = parseInt(input.value, 10);
    if (!isNaN(newQty)) {
      this.stockService.updateQty(id, newQty);
      
      // Get product name for audit
      const product = [...this.stockItems()].find(item => item.id === id);
      const productName = product?.nome || 'Produto';
      
      this.auditService.logStockUpdated(id, productName, newQty);
    }
  }

  addProduct(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.newProduct.title || !this.newProduct.description || !this.newProduct.category) {
      this.errorMessage = 'Preencha todos os campos obrigatórios (*)';
      this.toastService.error('Preencha todos os campos obrigatórios (*)');
      return;
    }

    if (this.newProduct.price <= 0) {
      this.errorMessage = 'O preço deve ser maior que zero';
      this.toastService.error('O preço deve ser maior que zero');
      return;
    }

    try {
      const product = {
        title: this.newProduct.title,
        description: this.newProduct.description,
        price: this.newProduct.price,
        image: this.newProduct.image || 'https://via.placeholder.com/400x300?text=Produto',
        category: this.newProduct.category,
        categoryLabel: this.newProduct.categoryLabel || this.newProduct.category,
        installments: this.newProduct.installments || 1,
        stock: this.newProduct.stock || 0
      };

      const newProduct = this.productService.add(product);
      this.auditService.logProductCreated(newProduct.id, this.newProduct.title);

      this.successMessage = 'Produto adicionado com sucesso!';
      this.toastService.success('Produto criado com sucesso!');
      
      // Reset form
      this.newProduct = {
        title: '',
        description: '',
        price: 0,
        image: '',
        category: '',
        categoryLabel: '',
        installments: 1,
        stock: 0
      };

      setTimeout(() => this.successMessage = '', 3000);
    } catch (error) {
      this.errorMessage = 'Erro ao adicionar produto. Tente novamente.';
      this.toastService.error('Erro ao adicionar produto. Tente novamente.');
    }
  }

  deleteProduct(id: string): void {
    if (confirm('Tem certeza que deseja remover este produto?')) {
      this.productService.delete(id);
      this.auditService.logProductDeleted(id, 'Produto customizado removido');
    }
  }

  // Cupons
  addCoupon(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.newCoupon.code || this.newCoupon.value <= 0) {
      this.errorMessage = 'Preencha o código e valor do cupom';
      this.toastService.error('Preencha o código e valor do cupom');
      return;
    }

    try {
      this.couponService.add({
        code: this.newCoupon.code.toUpperCase(),
        type: this.newCoupon.type,
        value: this.newCoupon.value,
        maxUses: this.newCoupon.maxUses || undefined,
        expiryDate: this.newCoupon.expiryDate || undefined,
        description: this.newCoupon.description,
        isActive: true
      });

      this.auditService.logCouponCreated(Date.now().toString(), this.newCoupon.code);
      this.successMessage = 'Cupom criado com sucesso!';
      this.toastService.success('Cupom criado com sucesso!');
      
      this.newCoupon = { code: '', type: 'percentage', value: 0, maxUses: 0, expiryDate: '', description: '' };
      setTimeout(() => this.successMessage = '', 3000);
    } catch (error) {
      this.errorMessage = 'Erro ao criar cupom';
      this.toastService.error('Erro ao criar cupom');
    }
  }

  deleteCoupon(id: string, code: string): void {
    if (confirm(`Tem certeza que deseja remover o cupom ${code}?`)) {
      this.couponService.delete(id);
    }
  }

  toggleCoupon(id: string): void {
    const coupon = this.coupons().find(c => c.id === id);
    if (coupon) {
      this.couponService.update(id, { isActive: !coupon.isActive });
    }
  }

  // Categorias
  addCategory(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.newCategory.name || !this.newCategory.label) {
      this.errorMessage = 'Preencha nome e label da categoria';
      this.toastService.error('Preencha nome e label da categoria');
      return;
    }

    try {
      this.categoryService.add({
        name: this.newCategory.name,
        label: this.newCategory.label,
        description: this.newCategory.description,
        isActive: true
      });

      this.successMessage = 'Categoria criada com sucesso!';
      this.toastService.success('Categoria criada com sucesso!');
      this.newCategory = { name: '', label: '', description: '' };
      setTimeout(() => this.successMessage = '', 3000);
    } catch (error) {
      this.errorMessage = 'Erro ao criar categoria';
      this.toastService.error('Erro ao criar categoria');
    }
  }

  deleteCategory(id: string, label: string): void {
    if (confirm(`Tem certeza que deseja remover a categoria ${label}?`)) {
      this.categoryService.delete(id);
    }
  }

  moveCategoryUp(id: string): void {
    this.categoryService.moveUp(id);
  }

  moveCategoryDown(id: string): void {
    this.categoryService.moveDown(id);
  }

  // Clientes
  getCustomerOrders(email: string): any[] {
    return this.clientService.getCustomerOrders(email);
  }

  getCustomerStats(email: string): any {
    return this.clientService.getCustomerStats(email);
  }
}