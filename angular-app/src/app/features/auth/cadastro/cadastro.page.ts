import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-cadastro-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="section-container">
      <div class="auth-card">
        <h2 class="section-title">Criar Conta</h2>
        
        <form (ngSubmit)="onSubmit()" #regForm="ngForm">
          <div class="form-group">
            <label for="nome">Nome Completo</label>
            <input type="text" id="nome" name="nome" [(ngModel)]="user.nome" required placeholder="Seu nome completo">
          </div>

          <div class="form-group">
            <label for="email">E-mail</label>
            <input type="email" id="email" name="email" [(ngModel)]="user.email" required placeholder="seu@email.com">
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="cpf">CPF</label>
              <input type="text" id="cpf" name="cpf" [(ngModel)]="user.cpf" required placeholder="000.000.000-00">
            </div>
            <div class="form-group">
              <label for="telefone">Telefone</label>
              <input type="text" id="telefone" name="telefone" [(ngModel)]="user.telefone" required placeholder="(00) 00000-0000">
            </div>
          </div>

          <div class="form-group">
            <label for="data_nasc">Data de Nascimento</label>
            <input type="date" id="data_nasc" name="data_nasc" [(ngModel)]="user.data_nasc" required>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="password">Senha</label>
              <input type="password" id="password" name="password" [(ngModel)]="user.senha" required minlength="8" placeholder="Mínimo 8 caracteres">
            </div>
            <div class="form-group">
              <label for="confirmaSenha">Confirmar Senha</label>
              <input type="password" id="confirmaSenha" name="confirmaSenha" [(ngModel)]="user.confirmaSenha" required placeholder="Repita a senha">
            </div>
          </div>

          <p class="error-msg" *ngIf="error()">{{ error() }}</p>

          <button type="submit" class="btn btn-primary" [disabled]="loading() || !regForm.form.valid">
            {{ loading() ? 'Criando Conta...' : 'Criar Conta' }}
          </button>
        </form>

        <div class="auth-footer">
          <p>Já tem uma conta? <a routerLink="/login">Faça Login</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-card {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      padding: 2.5rem;
      border-radius: 8px;
      border: 1px solid var(--border);
    }
    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
    }
    .form-group {
      margin-bottom: 1.5rem;
    }
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }
    .form-group input {
      width: 100%;
      padding: 0.8rem;
      border: 1px solid var(--border);
      border-radius: 4px;
      outline: none;
    }
    .error-msg { color: var(--primary); text-align: center; margin-bottom: 1rem; }
    .auth-footer { margin-top: 2rem; text-align: center; font-size: 0.9rem; }
    .auth-footer a { color: var(--primary); font-weight: 600; }
  `]
})
export class CadastroPage {
  user = { 
    nome: '', 
    email: '', 
    telefone: '', 
    cpf: '', 
    data_nasc: '', 
    senha: '', 
    confirmaSenha: '' 
  };
  loading = signal(false);
  error = signal<string | null>(null);

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private validateCPF(cpf: string): boolean {
    const cleanCPF = cpf.replace(/\D/g, '');
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/;
    return cpfRegex.test(cpf) && cleanCPF.length === 11;
  }

  private validateTelefone(telefone: string): boolean {
    const telRegex = /^\(\d{2}\)\s?\d{4,5}-\d{4}$|^\d{10,11}$/;
    return telRegex.test(telefone) && telefone.replace(/\D/g, '').length >= 10;
  }

  private validateNome(nome: string): boolean {
    return nome.length >= 10 && !/\d/.test(nome);
  }

  private validateSenha(senha: string): boolean {
    return senha.length >= 8;
  }

  private validateDataNascimento(data: string): boolean {
    if (!data) return false;
    
    const dataNasc = new Date(data);
    const hoje = new Date();
    
    // Não pode ser no futuro
    if (dataNasc > hoje) {
      return false;
    }
    
    // Calcula idade
    let idade = hoje.getFullYear() - dataNasc.getFullYear();
    const mesAtual = hoje.getMonth();
    const diaAtual = hoje.getDate();
    
    if (mesAtual < dataNasc.getMonth() || 
        (mesAtual === dataNasc.getMonth() && diaAtual < dataNasc.getDate())) {
      idade--;
    }
    
    // Deve ter no mínimo 13 anos e no máximo 120 anos
    return idade >= 13 && idade <= 120;
  }

  async onSubmit() {
    this.loading.set(true);
    this.error.set(null);

    // Validações
    if (!this.validateNome(this.user.nome)) {
      this.error.set('Nome deve ter no mínimo 10 caracteres e sem números');
      this.loading.set(false);
      return;
    }

    if (!this.validateCPF(this.user.cpf)) {
      this.error.set('CPF inválido. Use o formato: 000.000.000-00');
      this.loading.set(false);
      return;
    }

    if (!this.validateTelefone(this.user.telefone)) {
      this.error.set('Telefone inválido. Use o formato: (00) 00000-0000');
      this.loading.set(false);
      return;
    }

    if (!this.validateDataNascimento(this.user.data_nasc)) {
      this.error.set('Data de nascimento inválida. Você deve ter entre 13 e 120 anos');
      this.loading.set(false);
      return;
    }

    if (!this.validateSenha(this.user.senha)) {
      this.error.set('Senha deve ter no mínimo 8 caracteres');
      this.loading.set(false);
      return;
    }

    if (this.user.senha !== this.user.confirmaSenha) {
      this.error.set('As senhas não correspondem');
      this.loading.set(false);
      return;
    }

    const result = await this.authService.register(this.user);
    
    if (result.ok) {
      alert('Cadastro realizado com sucesso!');
      void this.router.navigate(['/login']);
    } else {
      this.error.set(result.message);
      this.loading.set(false);
    }
  }
}