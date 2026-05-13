import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="section-container">
      <div class="auth-card">
        <h2 class="section-title">Acesse sua Conta</h2>

        <div class="info-alert" *ngIf="redirectUrl">
          <p><strong>Atenção:</strong> Você precisa estar logado para finalizar sua compra.</p>
        </div>
        
        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group">
            <label for="email">E-mail</label>
            <input type="email" id="email" name="email" [(ngModel)]="email" required #emailInput="ngModel" placeholder="seu@email.com">
          </div>
          
          <div class="form-group">
            <label for="password">Senha</label>
            <input type="password" id="password" name="password" [(ngModel)]="password" required placeholder="Sua senha">
          </div>

          <p class="error-msg" *ngIf="error()">{{ error() }}</p>

          <button type="submit" class="btn btn-primary" [disabled]="loading() || !loginForm.form.valid">
            {{ loading() ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>

        <div class="auth-footer">
          <p>Não tem uma conta? <a routerLink="/cadastro">Cadastre-se</a></p>
          <a routerLink="/recuperar-senha">Esqueci minha senha</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-card {
      max-width: 400px;
      margin: 0 auto;
      background: white;
      padding: 2.5rem;
      border-radius: 8px;
      border: 1px solid var(--border);
    }
    .info-alert {
      background: #fdf2f2;
      border-left: 4px solid var(--primary);
      padding: 1rem;
      margin-bottom: 1.5rem;
      font-size: 0.95rem;
      color: #333;
    }
    .info-alert p {
      margin: 0;
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
    .form-group input:focus {
      border-color: var(--primary);
    }
    .btn {
      width: 100%;
      margin-top: 1rem;
    }
    .error-msg {
      color: var(--primary);
      font-size: 0.9rem;
      margin-bottom: 1rem;
      text-align: center;
    }
    .auth-footer {
      margin-top: 2rem;
      text-align: center;
      font-size: 0.9rem;
    }
    .auth-footer a {
      color: var(--primary);
      font-weight: 600;
    }
  `]
})
export class LoginPage implements OnInit {
  email = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);
  redirectUrl: string | null = null;

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  ngOnInit() {
    // Captura para onde o usuário queria ir antes de ser barrado pelo Guard
    this.redirectUrl = this.route.snapshot.queryParamMap.get('returnUrl');
  }

  async onSubmit() {
    this.loading.set(true);
    this.error.set(null);

    const success = await this.authService.login(this.email, this.password);
    
    if (success) {
      void this.router.navigate([this.redirectUrl || '/']);
    } else {
      this.error.set('E-mail ou senha incorretos.');
      this.loading.set(false);
    }
  }
}