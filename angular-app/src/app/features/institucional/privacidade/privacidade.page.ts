import { Component } from '@angular/core';

@Component({
  selector: 'app-privacidade-page',
  standalone: true,
  template: `
    <div class="section-container">
      <div class="content-card">
        <h1 class="section-title">Política de Privacidade</h1>
        <div class="policy-content">
            <p>A sua privacidade é importante para nós. É política da Rolagem Crítica respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no site.</p>
            
            <h3>Coleta de Dados</h3>
            <p>Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço (como finalizar sua compra ou entregar seu pedido).</p>
            
            <h3>Uso de Cookies</h3>
            <p>Utilizamos cookies para entender como você usa nosso site e para melhorar sua experiência. Isso inclui salvar itens no seu carrinho de compras e manter você logado.</p>

            <h3>Segurança</h3>
            <p>Protegemos os dados armazenados dentro de meios comercialmente aceitáveis para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .content-card { max-width: 800px; margin: 0 auto; background: white; padding: 3rem; border-radius: 8px; border: 1px solid var(--border); }
    .policy-content h3 { margin: 2rem 0 1rem; color: var(--primary); text-transform: uppercase; }
    .policy-content p { line-height: 1.6; margin-bottom: 1rem; }
  `]
})
export class PrivacidadePage {}