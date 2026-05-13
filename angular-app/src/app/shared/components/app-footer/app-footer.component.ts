/**
 * FOOTER COMPONENT
 * ================
 * Rodapé da aplicação com informações da marca, links úteis,
 * categorias de produtos e redes sociais.
 *
 * @component
 * @selector app-footer
 * @standalone true
 * @imports [RouterLink]
 *
 * @example
 * // Uso no template
 * <app-footer></app-footer>
 */

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <!-- ============== MAIN FOOTER ============== -->
    <footer class="main-footer">
      <div class="footer-container">
        
        <!-- ========== FOOTER GRID ========== -->
        <div class="footer-grid">
          
          <!-- SEÇÃO 1: SOBRE A MARCA -->
          <div class="footer-section">
            <h3 class="footer-title">Rolagem Crítica</h3>
            <p class="footer-desc">
              Sua loja especializada em RPG de mesa e acessórios geek. 
              Leve sua aventura para o próximo nível com nossos dados e acessórios.
            </p>
          </div>

          <!-- SEÇÃO 2: INFORMAÇÕES E POLÍTICAS -->
          <div class="footer-section">
            <h3 class="footer-title">Informações</h3>
            <ul class="footer-links">
              <li><a routerLink="/termos">Termos de Uso</a></li>
              <li><a routerLink="/privacidade">Privacidade</a></li>
              <li><a routerLink="/trocas">Trocas e Devoluções</a></li>
              <li><a routerLink="/contato">Fale Conosco</a></li>
            </ul>
          </div>

          <!-- SEÇÃO 3: CATEGORIAS DE PRODUTOS -->
          <div class="footer-section">
            <h3 class="footer-title">Categorias</h3>
            <ul class="footer-links">
              <li><a [routerLink]="['/categoria', 'dados']">Dados de RPG</a></li>
              <li><a [routerLink]="['/categoria', 'acessorios']">Acessórios</a></li>
              <li><a [routerLink]="['/categoria', 'colecionáveis']">Colecionáveis</a></li>
            </ul>
          </div>

          <!-- SEÇÃO 4: REDES SOCIAIS -->
          <div class="footer-section">
            <h3 class="footer-title">Siga-nos</h3>
            <div class="social-icons">
              <span>Instagram</span>
              <span>Facebook</span>
              <span>YouTube</span>
            </div>
          </div>
        </div>

        <!-- RODAPÉ INFERIOR (DIREITOS) -->
        <div class="footer-bottom">
          <p>&copy; 2024 Rolagem Crítica. Todos os direitos reservados. CNPJ: 00.000.000/0001-00</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    /* ============== ESTILOS GERAIS ============== */
    .main-footer {
      background: #1a1a1a;
      color: #ccc;
      padding: 4rem 0 2rem;
      margin-top: 4rem;
      border-top: 4px solid var(--primary);
    }

    .footer-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }

    /* ============== LAYOUT GRID ============== */
    .footer-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 3rem;
      margin-bottom: 3rem;
    }

    .footer-section {
      /* Cada seção ocupa uma coluna */
    }

    /* ============== TÍTULOS ============== */
    .footer-title {
      color: white;
      font-size: 1.1rem;
      text-transform: uppercase;
      margin-bottom: 1.5rem;
      font-weight: 700;
      position: relative;
    }

    /* Linha vermelha abaixo dos títulos */
    .footer-title::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: -8px;
      width: 40px;
      height: 2px;
      background: var(--primary);
    }

    /* ============== DESCRIÇÃO DA MARCA ============== */
    .footer-desc {
      line-height: 1.6;
      font-size: 0.95rem;
    }

    /* ============== LISTAS DE LINKS ============== */
    .footer-links {
      list-style: none;
      padding: 0;
    }

    .footer-links li {
      margin-bottom: 0.8rem;
    }

    .footer-links a {
      color: #ccc;
      text-decoration: none;
      transition: color 0.3s;
      font-size: 0.95rem;
    }

    .footer-links a:hover {
      color: var(--primary);
    }

    /* ============== ÍCONES DE REDES SOCIAIS ============== */
    .social-icons {
      display: flex;
      gap: 1rem;
      font-size: 0.85rem;
    }

    /* ============== RODAPÉ INFERIOR ============== */
    .footer-bottom {
      border-top: 1px solid #333;
      padding-top: 2rem;
      text-align: center;
      font-size: 0.85rem;
    }
  `]
})
export class FooterComponent {
  /**
   * Componente de Rodapé
   *
   * Responsabilidades:
   * - Exibir informações da marca
   * - Prover links para políticas e informações
   * - Listar categorias de produtos
   * - Mostrar links para redes sociais
   * - Manter copyright e CNPJ
   */
}