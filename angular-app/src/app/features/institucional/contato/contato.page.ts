import { Component } from '@angular/core';

@Component({
  selector: 'app-contato-page',
  standalone: true,
  template: `
    <div class="section-container">
      <div class="content-card">
        <h1 class="section-title">Fale Conosco</h1>
        
        <div class="contact-grid">
            <div class="contact-info">
                <h3>Canais de Atendimento</h3>
                <p><strong>E-mail:</strong> contato&#64;rolagemcritica.com.br</p>
                <p><strong>WhatsApp:</strong> (11) 98765-4321</p>
                <p><strong>Horário:</strong> Segunda a Sexta, 09h às 18h</p>
                
                <h3 style="margin-top: 2rem;">Endereço</h3>
                <p>Rua dos Aventureiros, 20</p>
                <p>Bairro Masmorra - São Paulo/SP</p>
                <p>CEP: 01234-567</p>
            </div>

            <form class="contact-form">
                <div class="form-group">
                    <label>Nome</label>
                    <input type="text" placeholder="Seu nome">
                </div>
                <div class="form-group">
                    <label>E-mail</label>
                    <input type="email" placeholder="seu@email.com">
                </div>
                <div class="form-group">
                    <label>Assunto</label>
                    <select>
                        <option>Dúvida sobre produto</option>
                        <option>Status do pedido</option>
                        <option>Sugestões/Elogios</option>
                        <option>Outros</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Mensagem</label>
                    <textarea rows="5" placeholder="Como podemos ajudar?"></textarea>
                </div>
                <button type="button" class="btn" onclick="alert('Mensagem enviada! Retornaremos em breve.')">Enviar Mensagem</button>
            </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .content-card { max-width: 900px; margin: 0 auto; background: white; padding: 3rem; border-radius: 8px; border: 1px solid var(--border); }
    .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; margin-top: 2rem; }
    .contact-info h3 { margin-bottom: 1rem; color: var(--primary); text-transform: uppercase; }
    .contact-info p { margin-bottom: 0.8rem; }
    .form-group { margin-bottom: 1.5rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; }
    .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 0.8rem; border: 1px solid var(--border); border-radius: 4px; }
    @media (max-width: 768px) { .contact-grid { grid-template-columns: 1fr; gap: 2rem; } }
  `]
})
export class ContatoPage {}