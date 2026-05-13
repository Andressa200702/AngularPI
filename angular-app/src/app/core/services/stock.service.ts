import { Injectable, signal, computed } from '@angular/core';
import { StorageService } from './storage.service';

export interface StockItem {
  id: string;
  nome: string;
  qtd: number;
}

const STORAGE_KEY = 'rolagem_estoque_mock';
const DEFAULT_STOCK: StockItem[] = [
  { id: '101', nome: 'Sistema D20 Moderno - Edicao Revisada', qtd: 15 },
  { id: '102', nome: 'Bandeja de Dados em Couro Ecologico', qtd: 8 },
  { id: '103', nome: 'Labirinto da Morte - Edicao de Colecionador', qtd: 3 },
  { id: '104', nome: 'Bestiario Fantastico Vol. 1', qtd: 0 },
  { id: '105', nome: 'Conjunto de Dados Poliedrais - Nebulosa', qtd: 24 },
  { id: '106', nome: 'Escudo do Mestre (Cenario de Fantasia)', qtd: 10 },
  { id: '107', nome: 'O Guia Definitivo do Mestre de Jogo', qtd: 5 },
  { id: '108', nome: 'Colonos do Abismo: O Jogo de Tabuleiro', qtd: 12 },
  { id: '109', nome: 'Batalha dos Reinos: Deck Base', qtd: 20 },
  { id: '110', nome: 'A Queda do Dragao Dourado (Capa Dura)', qtd: 7 },
  { id: '111', nome: 'Pack de Miniaturas - Aventureiros Basicos', qtd: 15 },
  { id: '112', nome: 'Campanha Epica: As Cinzas do Imperio', qtd: 2 }
];

@Injectable({ providedIn: 'root' })
export class StockService {
  private stockSignal = signal<StockItem[]>([]);
  readonly stock = computed(() => this.stockSignal());

  constructor(private readonly storage: StorageService) {
    this.ensureStock();
    this.loadStock();
  }

  private loadStock(): void {
    const items = this.storage.get<StockItem[]>(STORAGE_KEY, DEFAULT_STOCK);
    this.stockSignal.set(items);
  }

  list(): StockItem[] {
    return this.stock();
  }

  getById(id: string): StockItem | undefined {
    return this.list().find((item) => item.id === id);
  }

  updateQty(id: string, qty: number): void {
    const next = this.list().map((item) =>
      item.id === id ? { ...item, qtd: Math.max(0, Math.floor(qty)) } : item
    );
    this.storage.set(STORAGE_KEY, next);
    this.stockSignal.set(next);
  }

  addItem(item: StockItem): void {
    const current = this.list();
    const exists = current.find(s => s.id === item.id);
    if (!exists) {
      const next = [...current, item];
      this.storage.set(STORAGE_KEY, next);
      this.stockSignal.set(next);
    }
  }

  removeItem(id: string): void {
    const next = this.list().filter(item => item.id !== id);
    this.storage.set(STORAGE_KEY, next);
    this.stockSignal.set(next);
  }

  decrement(items: Array<{ productId: string; quantity: number }>): { ok: boolean; message?: string } {
    const stock = this.list();
    for (const item of items) {
      const current = stock.find((row) => row.id === item.productId);
      if (current && item.quantity > current.qtd) {
        return { ok: false, message: `Estoque insuficiente para ${current.nome}.` };
      }
    }

    const next = stock.map((row) => {
      const match = items.find((item) => item.productId === row.id);
      if (!match) return row;
      return { ...row, qtd: Math.max(0, row.qtd - match.quantity) };
    });

    this.storage.set(STORAGE_KEY, next);
    this.stockSignal.set(next);
    return { ok: true };
  }

  private ensureStock(): void {
    const stored = this.storage.get<StockItem[]>(STORAGE_KEY, []);
    if (!Array.isArray(stored) || !stored.length) {
      this.storage.set(STORAGE_KEY, DEFAULT_STOCK);
      this.stockSignal.set(DEFAULT_STOCK);
      return;
    }

    // Manter todos os produtos (default + customizados)
    const storedMap = new Map(stored.map((item) => [item.id, item]));
    const defaultMap = new Map(DEFAULT_STOCK.map((item) => [item.id, item]));
    
    // Mesclar: manter quantidades do localStorage e adicionar novos produtos do DEFAULT_STOCK
    const merged: StockItem[] = [];
    
    // Adicionar produtos que estão no localStorage
    for (const item of stored) {
      merged.push({
        ...item,
        qtd: Math.max(0, Number(item.qtd) || 0)
      });
    }
    
    // Adicionar produtos do DEFAULT_STOCK que não estão no localStorage
    for (const defaultItem of DEFAULT_STOCK) {
      if (!storedMap.has(defaultItem.id)) {
        merged.push(defaultItem);
      }
    }

    this.storage.set(STORAGE_KEY, merged);
    this.stockSignal.set(merged);
  }
}
