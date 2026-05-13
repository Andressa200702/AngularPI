import { Component } from '@angular/core';

@Component({
  selector: 'app-termos-page',
  standalone: true,
  template: `
    <div class="section-container">
      <div class="content-card">
        <h1 class="section-title">Termos de Uso</h1>
        <div class="terms-content">
            <p>Ao acessar o site Rolagem Crítica, você concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis ​​e concorda que é responsável pelo cumprimento de todas as leis locais aplicáveis.</p>
            
            <h3>1. Uso de Licença</h3>
            <p>É concedida permissão para baixar temporariamente uma cópia dos materiais no site da Rolagem Crítica apenas para visualização transitória pessoal e não comercial.</p>
            
            <h3>2. Isenção de Responsabilidade</h3>
            <p>Os materiais no site da Rolagem Crítica são fornecidos "como estão". Rolagem Crítica não oferece garantias, expressas ou implícitas.</p>

            <h3>3. Limitações</h3>
            <p>Em nenhum caso a Rolagem Crítica ou seus fornecedores serão responsáveis ​​por quaisquer danos decorrentes do uso ou da incapacidade de usar os materiais.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .content-card { max-width: 800px; margin: 0 auto; background: white; padding: 3rem; border-radius: 8px; border: 1px solid var(--border); }
    .terms-content h3 { margin: 2rem 0 1rem; color: var(--primary); text-transform: uppercase; }
    .terms-content p { line-height: 1.6; margin-bottom: 1rem; color: #444; }
  `]
})
export class TermosPage {}