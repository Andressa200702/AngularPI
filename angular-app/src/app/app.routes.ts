
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { CatalogoPage } from './features/catalogo/catalogo.page';
import { ProdutoPage } from './features/produto/produto.page';
import { CarrinhoPage } from './features/carrinho/carrinho.page';
import { CheckoutPage } from './features/checkout/checkout.page';
import { PedidoFinalizadoPage } from './features/pedido-finalizado/pedido-finalizado.page';
import { NotFoundPage } from './features/not-found/not-found.page';

export const routes: Routes = [
	{
		path: '',
		component: CatalogoPage
	},
	{
		path: 'categoria/:categoria',
		component: CatalogoPage
	},
	{
		path: 'busca',
		component: CatalogoPage
	},
	{
		path: 'produto/:id',
		component: ProdutoPage
	},
	{
		path: 'carrinho',
		component: CarrinhoPage
	},
	{
		path: 'checkout',
		component: CheckoutPage,
		canActivate: [authGuard]
	},
	{
		path: 'pedido-finalizado',
		component: PedidoFinalizadoPage,
		canActivate: [authGuard]
	},
	{
		path: 'login',
		loadComponent: () => import('./features/auth/login/login.page').then(m => m.LoginPage)
	},
	{
		path: 'recuperar-senha',
		loadComponent: () => import('./features/auth/recuperar-senha/recuperar-senha.page').then(m => m.RecuperarSenhaPage)
	},
	{
		path: 'cadastro',
		loadComponent: () => import('./features/auth/cadastro/cadastro.page').then(m => m.CadastroPage)
	},
	{
		path: 'perfil',
		loadComponent: () => import('./features/auth/perfil/perfil.page').then(m => m.PerfilPage)
	},
	{
		path: 'admin',
		loadComponent: () => import('./features/admin/admin.page').then(m => m.AdminPage)
	},
	{
		path: 'termos',
		loadComponent: () => import('./features/institucional/termos/termos.page').then(m => m.TermosPage)
	},
	{
		path: 'privacidade',
		loadComponent: () => import('./features/institucional/privacidade/privacidade.page').then(m => m.PrivacidadePage)
	},
	{
		path: 'trocas',
		loadComponent: () => import('./features/institucional/trocas/trocas.page').then(m => m.TrocasPage)
	},
	{
		path: 'contato',
		loadComponent: () => import('./features/institucional/contato/contato.page').then(m => m.ContatoPage)
	},
	{
		path: '**',
		component: NotFoundPage
	}
];
