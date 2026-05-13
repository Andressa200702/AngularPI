import { Component } from '@angular/core';

@Component({
  selector: 'app-trocas-page',
  standalone: true,
  template: `
    <div class="section-container">
      <div class="content-card">
        <h1 class="section-title">Trocas e Devoluções</h1>
        <div class="policy-content">
            <p>Nossa política de trocas e devoluções foi criada para atender nossos clientes de acordo com o Código de Defesa do Consumidor.</p>
            
            <h3>Arrependimento de Compra</h3>
            <p>O cliente tem até 7 (sete) dias corridos após o recebimento do produto para solicitar a devolução por arrependimento.</p>
            
            <h3>Produtos com Defeito</h3>
            <p>Em caso de produtos com defeito de fabricação, o prazo é de 30 dias para notificação. Faremos a troca sem custo adicional.</p>

            <h3>Condições para Troca</h3>
            <ul>
                <li>O produto deve estar na embalagem original;</li>
                <li>Sem indícios de uso ou lavagem;</li>
                <li>Acompanhado do comprovante de compra.</li>
            </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .content-card { max-width: 800px; margin: 0 auto; background: white; padding: 3rem; border-radius: 8px; border: 1px solid var(--border); }
    .policy-content h3 { margin: 2rem 0 1rem; color: var(--primary); text-transform: uppercase; }
    .policy-content p { line-height: 1.6; margin-bottom: 1rem; }
    .policy-content ul { padding-left: 1.5rem; }
    .policy-content li { margin-bottom: 0.5rem; }
  `]
})
export class TrocasPage {}