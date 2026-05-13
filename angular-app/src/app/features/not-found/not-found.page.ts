import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [RouterLink],
  template: `<section style="padding:24px"><h1>Pagina nao encontrada</h1><a routerLink="/catalogo">Voltar ao catalogo</a></section>`
})
export class NotFoundPage {}
