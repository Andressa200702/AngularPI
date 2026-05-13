import { CartItem } from './cart-item.model';

export interface Order {
  id: string;
  userId?: string; // Novo campo para vincular ao usuário
  createdAt: string;
  items: CartItem[];
  total: number;
  shippingFee?: number;
  discount?: number;
  customer: {
    nome: string;
    email: string;
    cep: string;
    endereco: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade: string;
    estado: string;
  };
  paymentMethod: 'cartao' | 'pix';
  status?: string;
}
