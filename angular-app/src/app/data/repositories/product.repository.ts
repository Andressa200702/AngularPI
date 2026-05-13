import { Injectable, inject } from '@angular/core';
import { StockService } from '../../core/services/stock.service';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../domain/models/product.model';

const PRODUCTS: Product[] = [
  {
    id: '101',
    title: 'Sistema D20 Moderno - Edicao Revisada',
    description: 'Livro base para campanhas contemporaneas com regras completas.',
    price: 159.9,
    image: 'https://images.unsplash.com/photo-1614294149010-950b698f72c0?auto=format&fit=crop&q=80&w=900',
    category: 'rpg-de-mesa',
    categoryLabel: 'Livro Basico',
    installments: 6,
    stock: 0
  },
  {
    id: '102',
    title: 'Conjunto de Dados Poliedrais - Nebulosa',
    description: 'Dados poliedrais com acabamento nebulosa para mesas epicas.',
    price: 49.9,
    image: 'https://down-br.img.susercontent.com/file/sg-11134201-8227t-mheg7balp7nz3f',
    category: 'acessorios',
    categoryLabel: 'Acessorios',
    installments: 2,
    stock: 0
  },
  {
    id: '103',
    title: 'Labirinto da Morte - Edicao de Colecionador',
    description: 'Livro-jogo classico em edicao especial para colecionadores.',
    price: 89.9,
    image: 'https://i0.wp.com/orbedosdragoes.com/wp-content/uploads/2022/01/Eradascinzas_Capa.jpg?fit=1261%2C712&ssl=1',
    category: 'literatura',
    categoryLabel: 'Livro-Jogo',
    installments: 3,
    stock: 0
  },
  {
    id: '104',
    title: 'Escudo do Mestre (Cenario de Fantasia)',
    description: 'Escudo do mestre com tabelas essenciais para o jogo.',
    price: 79.9,
    image: 'https://images.tcdn.com.br/img/img_prod/599593/escudo_do_mestre_para_rpg_premium_d20_rpg_1_20260317165401_6b299f74dc63.jpg',
    category: 'acessorios',
    categoryLabel: 'Suplementos',
    installments: 3,
    stock: 0
  },
  {
    id: '105',
    title: 'O Guia Definitivo do Mestre de Jogo',
    description: 'Ferramentas e dicas para elevar a narrativa da mesa.',
    price: 149.9,
    image: 'https://images.unsplash.com/photo-1544365558-35aa4afcf11f?auto=format&fit=crop&q=80&w=900',
    category: 'rpg-de-mesa',
    categoryLabel: 'Suplementos',
    installments: 5,
    stock: 0
  },
  {
    id: '106',
    title: 'Bestiario Fantastico Vol. 1',
    description: 'Mais de 200 criaturas para enriquecer campanhas.',
    price: 120.0,
    image: 'https://cdn.awsli.com.br/800x800/495/495351/produto/74370621/2b5f98adea.jpg',
    category: 'rpg-de-mesa',
    categoryLabel: 'Expansao',
    installments: 4,
    stock: 0
  },
  {
    id: '107',
    title: 'Colonos do Abismo: O Jogo de Tabuleiro',
    description: 'Board game estrategico para noites intensas.',
    price: 299.9,
    image: 'https://images.tcdn.com.br/img/img_prod/558884/abyss_jogo_de_tabuleiro_galapagos_aby001_888862962_2_20170531150952.jpg',
    category: 'board-games',
    categoryLabel: 'Estrategia',
    installments: 6,
    stock: 0
  },
  {
    id: '108',
    title: 'Batalha dos Reinos: Deck Base',
    description: 'Card game competitivo para duelos rapidos.',
    price: 89.9,
    image: 'https://static.wixstatic.com/media/0f48ef_cbb11dc4bd844b2c916fc0b10f1950e0~mv2.png/v1/fill/w_520,h_693,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/0f48ef_cbb11dc4bd844b2c916fc0b10f1950e0~mv2.png',
    category: 'board-games',
    categoryLabel: 'Card Game',
    installments: 2,
    stock: 0
  },
  {
    id: '109',
    title: 'A Queda do Dragao Dourado (Capa Dura)',
    description: 'Romance fantastico com arte luxuosa e capa dura.',
    price: 69.9,
    image: 'https://thumbs.dreamstime.com/b/drag%C3%A3o-dourado-numa-pilha-de-ouro-bonito-grande-e-tesouro-olha-para-uma-pedra-rubi-169603630.jpg',
    category: 'literatura',
    categoryLabel: 'Romance',
    installments: 2,
    stock: 0
  },
  {
    id: '110',
    title: 'Bandeja de Dados em Couro Ecologico',
    description: 'Acessorio premium para rolagens organizadas na mesa.',
    price: 89.9,
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=900',
    category: 'acessorios',
    categoryLabel: 'Acessorios de Mesa',
    installments: 3,
    stock: 0
  },
  {
    id: '111',
    title: 'Pack de Miniaturas - Aventureiros Basicos',
    description: 'Miniaturas detalhadas para aventuras inesqueciveis.',
    price: 120.0,
    image: 'https://m.media-amazon.com/images/I/61UkdWQmw1L._AC_UF894,1000_QL80_.jpg',
    category: 'acessorios',
    categoryLabel: 'Miniaturas',
    installments: 4,
    stock: 0
  },
  {
    id: '112',
    title: 'Campanha Epica: As Cinzas do Imperio',
    description: 'Lancamento especial com roteiro completo e extras.',
    price: 180.0,
    image: 'https://i0.wp.com/orbedosdragoes.com/wp-content/uploads/2022/01/Eradascinzas_Capa.jpg?fit=1261%2C712&ssl=1',
    category: 'pre-vendas',
    categoryLabel: 'Lancamento em 10/05/2026',
    installments: 6,
    stock: 0
  }
];

@Injectable({ providedIn: 'root' })
export class ProductRepository {
  private readonly stockService = inject(StockService);
  private readonly productService = inject(ProductService);

  async list(): Promise<Product[]> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const stock = this.stockService.list();
    
    // Combina produtos padrão com produtos customizados
    const customProducts = this.productService.products();
    const allProducts = [...PRODUCTS, ...customProducts];
    
    return allProducts.map((product) => {
      const current = stock.find((item) => item.id === product.id);
      return { ...product, stock: current ? current.qtd : product.stock };
    });
  }

  async byId(id: string): Promise<Product | undefined> {
    await new Promise((resolve) => setTimeout(resolve, 120));
    const customProducts = this.productService.products();
    const product = PRODUCTS.find((p) => p.id === id) || customProducts.find((p) => p.id === id);
    if (!product) return undefined;
    const current = this.stockService.getById(id);
    return { ...product, stock: current ? current.qtd : product.stock };
  }
}
