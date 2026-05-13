import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) {
    return true;
  }

  // Redireciona para o login e salva o estado da rota para voltar depois
  const state = inject(Router).routerState.snapshot;
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url }});
};