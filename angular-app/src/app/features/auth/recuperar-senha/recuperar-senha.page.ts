import { CommonModule } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";

@Component({
  selector: "app-recuperar-senha-page",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="section-container">
      <div class="auth-card">
        <h2 class="section-title">Recuperar Senha</h2>
        
        <!-- Passo 1: Digitar E-mail -->
        <div *ngIf="step() === 1">
          <p style="margin-bottom: 1.5rem; color: #666;">Digite o e-mail da sua conta para validar a identidade.</p>
          <form (ngSubmit)="checkEmail()" #emailForm="ngForm">
            <div class="form-group">
              <label for="email">Seu E-mail</label>
              <input type="email" id="email" name="email" [(ngModel)]="email" required placeholder="seu@email.com">
            </div>
            <p class="error-msg" *ngIf="error()">{{ error() }}</p>
            <button type="submit" class="btn btn-primary" [disabled]="loading() || !emailForm.form.valid">
              {{ loading() ? "Validando..." : "Validar E-mail" }}
            </button>
          </form>
        </div>

        <!-- Passo 2: Digitar Nova Senha -->
        <div *ngIf="step() === 2">
          <p style="margin-bottom: 1.5rem; color: #2e7d32;"><strong>E-mail validado!</strong> Digite sua nova senha abaixo.</p>
          <form (ngSubmit)="resetPassword()" #passForm="ngForm">
            <div class="form-group">
              <label for="newPass">Nova Senha</label>
              <input type="password" id="newPass" name="newPass" [(ngModel)]="newPassword" required minlength="6" placeholder="Mínimo 6 caracteres">
            </div>
            <button type="submit" class="btn btn-primary" [disabled]="loading() || !passForm.form.valid">
              {{ loading() ? "Alterando..." : "Redefinir Senha" }}
            </button>
          </form>
        </div>

        <!-- Passo 3: Sucesso -->
        <div *ngIf="step() === 3" class="success-msg">
          <div class="success-icon">✓</div>
          <h3>Senha Alterada!</h3>
          <p>Sua senha foi atualizada com sucesso. Você já pode acessar sua conta.</p>
          <button class="btn btn-primary" style="margin-top: 1.5rem;" routerLink="/login">Ir para o Login</button>
        </div>

        <div class="auth-footer" *ngIf="step() < 3">
          <p>Lembrou a senha? <a routerLink="/login">Fazer Login</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-card { max-width: 450px; margin: 2rem auto; background: white; padding: 3rem; border-radius: 8px; border: 1px solid var(--border); text-align: center; }
    .form-group { margin-bottom: 2rem; text-align: left; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; }
    .form-group input { width: 100%; padding: 0.8rem; border: 1px solid var(--border); border-radius: 4px; outline: none; }
    .form-group input:focus { border-color: var(--primary); }
    .btn { width: 100%; }
    .error-msg { color: var(--primary); font-size: 0.85rem; margin-top: -1.5rem; margin-bottom: 1.5rem; text-align: left; }
    .auth-footer { margin-top: 2rem; font-size: 0.9rem; }
    .auth-footer a { color: var(--primary); font-weight: 600; }
    .success-msg h3 { color: #2e7d32; margin-bottom: 1rem; }
    .success-icon { width: 60px; height: 60px; background: #e8f5e9; color: #2e7d32; font-size: 2rem; display: flex; align-items: center; justify-content: center; border-radius: 50%; margin: 0 auto 1.5rem; }
  `]
})
export class RecuperarSenhaPage {
  private readonly authService = inject(AuthService);
  
  email = "";
  newPassword = "";
  step = signal(1);
  loading = signal(false);
  error = signal<string | null>(null);

  async checkEmail() {
    this.loading.set(true);
    this.error.set(null);
    
    // Simula uma busca no "banco" (AuthService)
    const users = JSON.parse(localStorage.getItem("rolagem_usuarios") || "[]");
    const userExists = users.some((u: any) => u.email.toLowerCase() === this.email.toLowerCase());

    setTimeout(() => {
      this.loading.set(false);
      if (userExists) {
        this.step.set(2);
      } else {
        this.error.set("E-mail não encontrado em nossa base.");
      }
    }, 1000);
  }

  async resetPassword() {
    this.loading.set(true);
    
    // Atualiza a senha no localStorage
    const users = JSON.parse(localStorage.getItem("rolagem_usuarios") || "[]");
    const updatedUsers = users.map((u: any) => {
        if (u.email.toLowerCase() === this.email.toLowerCase()) {
            return { ...u, senha: this.newPassword };
        }
        return u;
    });
    
    localStorage.setItem("rolagem_usuarios", JSON.stringify(updatedUsers));

    setTimeout(() => {
      this.loading.set(false);
      this.step.set(3);
    }, 1200);
  }
}