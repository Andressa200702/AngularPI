import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-legacy-page',
  standalone: true,
  templateUrl: './legacy-page.component.html',
  styleUrl: './legacy-page.component.css'
})
export class LegacyPageComponent implements OnInit, OnDestroy {
  iframeUrl: SafeResourceUrl = '';

  private readonly pageAliases: Record<string, string> = {
    '': 'index',
    'catalogo': 'index',
    'produtos': 'index',
    'pedido-finalizado': 'perfil'
  };

  private readonly allowedPages = new Set<string>([
    'index',
    'acessorios',
    'admin',
    'ajuda',
    'board-games',
    'busca',
    'cadastro',
    'carrinho',
    'checkout',
    'contato',
    'literatura',
    'login',
    'originais',
    'perfil',
    'pre-vendas',
    'privacidade',
    'produto',
    'recuperar-senha',
    'rpg-de-mesa',
    'sobre',
    'termos',
    'trocas',
    'vagas'
  ]);

  private readonly subscriptions: Subscription[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.route.paramMap.subscribe(() => {
        this.updateIframeUrl();
      })
    );

    this.subscriptions.push(
      this.route.queryParamMap.subscribe(() => {
        this.updateIframeUrl();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private updateIframeUrl(): void {
    const rawPage = (this.route.snapshot.paramMap.get('page') || 'index').replace('.html', '');
    const mappedPage = this.pageAliases[rawPage] || rawPage;
    const page = this.allowedPages.has(mappedPage) ? mappedPage : 'index';

    const queryString = new URLSearchParams(this.route.snapshot.queryParams).toString();
    const suffix = queryString ? `?${queryString}` : '';
    this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`/legacy/${page}.html${suffix}`);
  }
}
