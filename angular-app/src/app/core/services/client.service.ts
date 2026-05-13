import { Injectable, inject } from '@angular/core';
import { signal, computed } from '@angular/core';
import { StorageService } from './storage.service';
import { Order } from '../../domain/models/order.model';

export interface Customer {
  email: string;
  nome: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder?: string;
  joinedDate: string;
}

@Injectable({ providedIn: 'root' })
export class ClientService {
  private readonly storage = inject(StorageService);
  private customersSignal = signal<Map<string, Customer>>(new Map());

  readonly customers = computed(() => {
    const orders = this.storage.get<Order[]>('rolagem_pedidos', []) || [];
    const customers = new Map<string, Customer>();

    orders.forEach(order => {
      const email = order.customer.email.toLowerCase();
      if (!customers.has(email)) {
        customers.set(email, {
          email,
          nome: order.customer.nome,
          totalOrders: 0,
          totalSpent: 0,
          joinedDate: order.createdAt
        });
      }
      
      const customer = customers.get(email)!;
      customer.totalOrders++;
      customer.totalSpent += order.total || 0;
      customer.lastOrder = order.createdAt;
    });

    return Array.from(customers.values())
      .sort((a, b) => b.totalSpent - a.totalSpent);
  });

  getCustomerOrders(email: string): Order[] {
    const orders = this.storage.get<Order[]>('rolagem_pedidos', []) || [];
    return orders.filter(o => o.customer.email.toLowerCase() === email.toLowerCase());
  }

  getCustomerStats(email: string): {
    totalOrders: number;
    totalSpent: number;
    averageTicket: number;
    lastOrderDate: string;
  } {
    const orders = this.getCustomerOrders(email);
    const totalSpent = orders.reduce((acc, o) => acc + (o.total || 0), 0);
    
    return {
      totalOrders: orders.length,
      totalSpent,
      averageTicket: orders.length > 0 ? totalSpent / orders.length : 0,
      lastOrderDate: orders.length > 0 ? orders[0].createdAt : ''
    };
  }

  searchCustomers(query: string): Customer[] {
    const lowerQuery = query.toLowerCase();
    return this.customers().filter(c => 
      c.email.includes(lowerQuery) || c.nome.toLowerCase().includes(lowerQuery)
    );
  }
}
