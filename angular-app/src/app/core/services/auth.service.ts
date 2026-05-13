import { Injectable, computed, signal } from '@angular/core';
import { StorageService } from './storage.service';

export interface User {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  cpf?: string;
  data_nasc?: string;
  senha: string;
  isAdmin?: boolean;
}

const USERS_KEY = 'rolagem_usuarios';
const LOGGED_KEY = 'rolagem_usuarioLogado';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly currentUser = signal<User | null>(null);
  readonly isLoggedIn = computed(() => !!this.currentUser());
  readonly isAdmin = computed(() => !!this.currentUser()?.isAdmin);

  constructor(private readonly storage: StorageService) {
    this.ensureAdmin();
    this.currentUser.set(this.storage.get<User | null>(LOGGED_KEY, null));
  }

  listUsers(): User[] {
    return this.storage.get<User[]>(USERS_KEY, []);
  }

  login(email: string, senha: string): { ok: boolean; message: string; user?: User } {
    const users = this.listUsers();
    const found = users.find((user) => user.email.toLowerCase() === email.toLowerCase() && user.senha === senha);
    if (!found) {
      return { ok: false, message: 'E-mail ou senha incorretos.' };
    }

    this.setLoggedUser(found);
    return { ok: true, message: `Bem-vindo de volta, ${found.nome}!`, user: found };
  }

  logout(): void {
    this.storage.remove(LOGGED_KEY);
    this.currentUser.set(null);
  }

  recoverPassword(email: string): { ok: boolean; message: string } {
    const users = this.listUsers();
    const found = users.find((user) => user.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      return { ok: false, message: 'E-mail nao encontrado no sistema.' };
    }

    return { ok: true, message: `Sua senha atual e: ${found.senha}` };
  }

  register(payload: {
    nome: string;
    email: string;
    telefone: string;
    cpf: string;
    data_nasc: string;
    senha: string;
    confirmaSenha: string;
  }): { ok: boolean; message: string } {
    const nome = payload.nome.trim().replace(/\s+/g, ' ');
    if (nome.length < 10) return { ok: false, message: 'O nome deve ter pelo menos 10 caracteres.' };
    if (/\d/.test(nome)) return { ok: false, message: 'O nome nao pode conter numeros.' };
    if (!/^[A-Za-z\s]+$/.test(nome)) return { ok: false, message: 'O nome deve conter apenas letras e espacos.' };

    if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(payload.cpf)) {
      return { ok: false, message: 'CPF invalido. Use o formato 000.000.000-00.' };
    }

    if (!/^\(\d{2}\)\s?\d{4,5}-\d{4}$/.test(payload.telefone)) {
      return { ok: false, message: 'Telefone invalido. Use o formato (DD) 99999-9999.' };
    }

    if (!payload.data_nasc) {
      return { ok: false, message: 'Informe a data de nascimento.' };
    }

    if (payload.senha.length < 8) {
      return { ok: false, message: 'A senha deve ter no minimo 8 caracteres.' };
    }

    if (payload.senha !== payload.confirmaSenha) {
      return { ok: false, message: 'As senhas nao coincidem.' };
    }

    const email = payload.email.trim().toLowerCase();
    const users = this.listUsers();
    if (users.some((user) => user.email.toLowerCase() === email)) {
      return { ok: false, message: 'E-mail ja cadastrado!' };
    }

    const user: User = {
      id: Date.now().toString(),
      nome,
      email,
      telefone: payload.telefone.trim(),
      cpf: payload.cpf.trim(),
      data_nasc: payload.data_nasc.trim(),
      senha: payload.senha
    };

    this.storage.set(USERS_KEY, [...users, user]);
    return { ok: true, message: 'Cadastro efetuado com sucesso!' };
  }

  updateProfile(next: { nome: string; telefone?: string; cpf?: string }): { ok: boolean; message: string } {
    const user = this.currentUser();
    if (!user) return { ok: false, message: 'Voce precisa estar logado.' };

    const nome = next.nome.trim();
    if (!nome) return { ok: false, message: 'Nome e obrigatorio.' };

    const updated: User = { ...user, nome, telefone: next.telefone || '', cpf: next.cpf || '' };
    this.setLoggedUser(updated);

    const users = this.listUsers();
    const idx = users.findIndex((item) => item.email === user.email);
    if (idx >= 0) {
      users[idx] = { ...users[idx], nome: updated.nome, telefone: updated.telefone, cpf: updated.cpf };
      this.storage.set(USERS_KEY, users);
    }

    return { ok: true, message: 'Dados atualizados com sucesso!' };
  }

  updatePassword(current: string, next: string, confirm: string): { ok: boolean; message: string } {
    const user = this.currentUser();
    if (!user) return { ok: false, message: 'Voce precisa estar logado.' };

    if (current !== user.senha) return { ok: false, message: 'Senha atual incorreta.' };
    if (next.length < 8) return { ok: false, message: 'A nova senha deve ter no minimo 8 caracteres.' };
    if (next !== confirm) return { ok: false, message: 'As novas senhas nao conferem.' };

    const updated: User = { ...user, senha: next };
    this.setLoggedUser(updated);

    const users = this.listUsers();
    const idx = users.findIndex((item) => item.email === user.email);
    if (idx >= 0) {
      users[idx] = { ...users[idx], senha: next };
      this.storage.set(USERS_KEY, users);
    }

    return { ok: true, message: 'Senha alterada com sucesso!' };
  }

  private setLoggedUser(user: User): void {
    this.storage.set(LOGGED_KEY, user);
    this.currentUser.set(user);
  }

  private ensureAdmin(): void {
    const users = this.listUsers();
    const hasAdmin = users.some((user) => user.isAdmin || user.email === 'admin@rolagemcritica.com');
    if (hasAdmin) return;

    const admin: User = {
      id: 'admin1',
      nome: 'Administrador',
      email: 'admin@rolagemcritica.com',
      senha: 'admin',
      isAdmin: true
    };

    this.storage.set(USERS_KEY, [...users, admin]);
  }
}
