import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { Order } from '../../domain/models/order.model';

export interface SalesReport {
  totalOrders: number;
  totalRevenue: number;
  averageTicket: number;
  completedOrders: number;
  cancelledOrders: number;
  salesByDay: { day: string; sales: number; amount: number }[];
  topProducts: { title: string; quantity: number; revenue: number }[];
  topCustomers: { name: string; email: string; orders: number; spent: number }[];
  ordersByStatus: { status: string; count: number }[];
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly storage = inject(StorageService);

  generateReport(): SalesReport {
    const orders = this.storage.get<Order[]>('rolagem_pedidos', []) || [];
    
    // Filtrar apenas pedidos confirmados (não cancelados)
    const confirmedOrders = orders.filter(o => o.status !== 'cancelado');
    const cancelledOrders = orders.filter(o => o.status === 'cancelado');

    // Totais
    const totalRevenue = confirmedOrders.reduce((acc, o) => acc + (o.total || 0), 0);
    const totalOrders = orders.length;
    const completedOrders = confirmedOrders.length;

    // Vendas por dia
    const salesByDay = this.getSalesByDay(confirmedOrders);

    // Top produtos
    const topProducts = this.getTopProducts(confirmedOrders);

    // Top clientes
    const topCustomers = this.getTopCustomers(confirmedOrders);

    // Pedidos por status
    const ordersByStatus = this.getOrdersByStatus(orders);

    return {
      totalOrders,
      totalRevenue,
      averageTicket: completedOrders > 0 ? totalRevenue / completedOrders : 0,
      completedOrders,
      cancelledOrders: cancelledOrders.length,
      salesByDay,
      topProducts,
      topCustomers,
      ordersByStatus
    };
  }

  private getSalesByDay(orders: Order[]): { day: string; sales: number; amount: number }[] {
    const grouped = new Map<string, { count: number; amount: number }>();

    orders.forEach(order => {
      const date = new Date(order.createdAt);
      const day = date.toLocaleDateString('pt-BR');
      
      if (!grouped.has(day)) {
        grouped.set(day, { count: 0, amount: 0 });
      }
      
      const current = grouped.get(day)!;
      current.count++;
      current.amount += order.total || 0;
    });

    return Array.from(grouped.entries())
      .map(([day, data]) => ({ day, sales: data.count, amount: data.amount }))
      .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime())
      .slice(-30); // Últimos 30 dias
  }

  private getTopProducts(orders: Order[]): { title: string; quantity: number; revenue: number }[] {
    const products = new Map<string, { quantity: number; revenue: number }>();

    orders.forEach(order => {
      order.items.forEach(item => {
        if (!products.has(item.title)) {
          products.set(item.title, { quantity: 0, revenue: 0 });
        }
        const current = products.get(item.title)!;
        current.quantity += item.quantity;
        current.revenue += item.price * item.quantity;
      });
    });

    return Array.from(products.entries())
      .map(([title, data]) => ({ title, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }

  private getTopCustomers(orders: Order[]): { name: string; email: string; orders: number; spent: number }[] {
    const customers = new Map<string, { name: string; email: string; orders: number; spent: number }>();

    orders.forEach(order => {
      const key = order.customer.email;
      if (!customers.has(key)) {
        customers.set(key, { name: order.customer.nome, email: key, orders: 0, spent: 0 });
      }
      const current = customers.get(key)!;
      current.orders++;
      current.spent += order.total || 0;
    });

    return Array.from(customers.values())
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 10);
  }

  private getOrdersByStatus(orders: Order[]): { status: string; count: number }[] {
    const statuses = new Map<string, number>();

    orders.forEach(order => {
      const status = order.status || 'pendente';
      statuses.set(status, (statuses.get(status) || 0) + 1);
    });

    return Array.from(statuses.entries())
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);
  }
}
