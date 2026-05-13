import { Injectable, inject } from '@angular/core';
import { signal, computed } from '@angular/core';
import { StorageService } from './storage.service';

export interface AuditLog {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'CANCEL_ORDER' | 'UPDATE_STATUS';
  entity: 'PRODUCT' | 'COUPON' | 'CATEGORY' | 'ORDER' | 'STOCK';
  entityId: string;
  entityName: string;
  changes?: Record<string, any>;
  timestamp: string;
  userEmail?: string;
  details?: string;
}

const AUDIT_STORAGE_KEY = 'rolagem_audit_logs';

@Injectable({ providedIn: 'root' })
export class AuditService {
  private readonly storage = inject(StorageService);
  private logsSignal = signal<AuditLog[]>([]);
  readonly logs = computed(() => this.logsSignal().sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ));

  constructor() {
    this.loadLogs();
  }

  private loadLogs(): void {
    const stored = this.storage.get<AuditLog[]>(AUDIT_STORAGE_KEY, []);
    this.logsSignal.set(stored);
  }

  log(data: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const log: AuditLog = {
      ...data,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    
    const current = this.logsSignal();
    const updated = [log, ...current].slice(0, 1000); // Manter últimos 1000 logs
    this.logsSignal.set(updated);
    this.storage.set(AUDIT_STORAGE_KEY, updated);
    
    return log;
  }

  logProductCreated(productId: string, productName: string): void {
    this.log({
      action: 'CREATE',
      entity: 'PRODUCT',
      entityId: productId,
      entityName: productName,
      details: `Produto "${productName}" criado`
    });
  }

  logProductUpdated(productId: string, productName: string, changes: Record<string, any>): void {
    this.log({
      action: 'UPDATE',
      entity: 'PRODUCT',
      entityId: productId,
      entityName: productName,
      changes,
      details: `Produto "${productName}" atualizado`
    });
  }

  logProductDeleted(productId: string, productName: string): void {
    this.log({
      action: 'DELETE',
      entity: 'PRODUCT',
      entityId: productId,
      entityName: productName,
      details: `Produto "${productName}" deletado`
    });
  }

  logCouponCreated(couponId: string, couponCode: string): void {
    this.log({
      action: 'CREATE',
      entity: 'COUPON',
      entityId: couponId,
      entityName: couponCode,
      details: `Cupom "${couponCode}" criado`
    });
  }

  logOrderCancelled(orderId: string, customerName: string): void {
    this.log({
      action: 'CANCEL_ORDER',
      entity: 'ORDER',
      entityId: orderId,
      entityName: customerName,
      details: `Pedido #${orderId} de ${customerName} foi cancelado`
    });
  }

  logOrderStatusUpdated(orderId: string, customerName: string, newStatus: string): void {
    this.log({
      action: 'UPDATE_STATUS',
      entity: 'ORDER',
      entityId: orderId,
      entityName: customerName,
      changes: { status: newStatus },
      details: `Status do pedido #${orderId} alterado para ${newStatus}`
    });
  }

  logStockUpdated(productId: string, productName: string, newQuantity: number): void {
    this.log({
      action: 'UPDATE',
      entity: 'STOCK',
      entityId: productId,
      entityName: productName,
      changes: { quantity: newQuantity },
      details: `Estoque de "${productName}" alterado para ${newQuantity}`
    });
  }

  getLogsForEntity(entityId: string): AuditLog[] {
    return this.logs().filter(log => log.entityId === entityId);
  }

  getLogsByType(entity: AuditLog['entity']): AuditLog[] {
    return this.logs().filter(log => log.entity === entity);
  }

  getRecentLogs(days: number = 30): AuditLog[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.logs().filter(log => 
      new Date(log.timestamp) >= cutoffDate
    );
  }
}
