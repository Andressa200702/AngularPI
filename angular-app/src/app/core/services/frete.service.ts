import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

const STORAGE_FRETE = 'rolagem_frete';
const STORAGE_UF = 'rolagem_frete_uf';

export interface FreteResult {
  ok: boolean;
  frete: number;
  message: string;
  uf?: string;
  cidade?: string;
  bairro?: string;
  logradouro?: string;
}

@Injectable({ providedIn: 'root' })
export class FreteService {
  constructor(private readonly storage: StorageService) {}

  getStoredFrete(): number | null {
    const raw = this.storage.get<string | null>(STORAGE_FRETE, null);
    if (raw === null || raw === undefined) return null;
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  }

  async calcular(cep: string, subtotal: number): Promise<FreteResult> {
    const normalized = (cep || '').replace(/\D/g, '');
    if (normalized.length !== 8) {
      return { ok: false, frete: 0, message: 'Por favor, insira um CEP valido.' };
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${normalized}/json/`);
      const data = await response.json();
      console.log('ViaCEP data:', data); // Debug para ver o que a API traz
      if (data.erro) {
        return { ok: false, frete: 0, message: 'CEP nao encontrado.' };
      }

      console.log('Checking subtotal:', subtotal); // Debug para ver o valor recebido

      let frete = 25.9;
      const uf = data.uf;
      
      if (uf === 'SP') frete = 12.5;
      else if (['RJ', 'MG', 'PR', 'SC', 'RS'].includes(uf)) frete = 18.9;
      else if (['ES', 'MS', 'GO', 'DF'].includes(uf)) frete = 22.0;
      else frete = 35.0;

      const sulSudeste = ['SP', 'RJ', 'MG', 'ES', 'PR', 'SC', 'RS'];
      
      // Forçar logica de frete gratis de forma mais agressiva
      if (sulSudeste.includes(uf) && Number(subtotal) >= 200) {
        console.log('Frete GRATIS aplicado para', uf);
        frete = 0;
      }

      this.storage.set(STORAGE_FRETE, frete.toString());
      return { 
        ok: true, 
        frete, 
        message: 'Calculado', 
        uf: data.uf, 
        cidade: data.localidade,
        bairro: data.bairro,
        logradouro: data.logradouro
      };
    } catch {
      return { ok: false, frete: 0, message: 'Erro ao consultar CEP.' };
    }
  }
}
