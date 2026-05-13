# Rolagem Critica - Site Frontend E-commerce

Projeto academico de e-commerce focado em frontend (HTML, CSS e JavaScript puro), com fluxo completo de vitrine, carrinho, checkout e area de perfil/admin usando `localStorage` para simulacao de dados.

## Como executar

1. Abra a pasta do projeto no VS Code.
2. Execute com uma extensao de servidor local (ex.: Live Server) ou abra `index.html` no navegador.
3. Navegue normalmente pelo fluxo da loja.

## Fluxos implementados

- Catalogo de produtos por paginas de categoria.
- Busca por termo (`busca.html?q=`).
- Pagina de produto com exibicao de estoque disponivel.
- Carrinho com adicionar/remover e ajuste de quantidade.
- Calculo de frete por CEP (ViaCEP) e regra de frete gratis por regiao/faixa.
- Checkout com endereco e pagamento simulado (PIX/cartao).
- Cadastro, login, logout e recuperacao de senha simulada.
- Perfil com atualizacao de dados e alteracao de senha.
- Historico de pedidos com "Ver Detalhes".
- Painel admin com gestao de status de pedidos e estoque.

## Regras de negocio

- Bloqueio de compra quando estoque for insuficiente.
- Validacao de quantidade maxima por item no carrinho.
- Validacao de cadastro:
  - Nome sem numeros e com minimo de 10 caracteres.
  - CPF no formato `000.000.000-00`.
  - Telefone no formato `(DD) 99999-9999`.
  - Senha com minimo de 8 caracteres.
- Validacao de checkout antes de finalizar o pedido.

## Dados de teste

- Admin padrao:
  - Email: `admin@rolagemcritica.com`
  - Senha: `admin`
- Usuario de teste:
  - Crie pelo formulario em `cadastro.html`.

## Evidencias para entrega

- Fluxo recomendado para gravacao/prints:
  1. Catalogo -> produto.
  2. Produto -> carrinho.
  3. Carrinho -> checkout.
  4. Checkout -> confirmacao.
  5. Perfil -> historico de pedidos (ver detalhes).
  6. Admin -> ajuste de estoque e status do pedido.

## Escopo e limitacoes

- Projeto somente frontend.
- Dados persistidos no `localStorage` do navegador.
- Nao ha backend real, gateway de pagamento real ou autenticacao em servidor.

# Rolagem Critica - Angular + TypeScript

Projeto frontend migrado para Angular com TypeScript.

## Como ver o site

No PowerShell (Windows), execute na pasta `angular-app`:

```bash
cmd /c npm.cmd install
cmd /c npm.cmd start
```

Se a porta `4200` estiver ocupada, o Angular vai sugerir outra porta automaticamente.

Depois, abra a URL mostrada no terminal. Exemplo:

- `http://localhost:4200/`
- ou `http://localhost:56553/` (quando 4200 ja estiver em uso)

## Rotas para navegar

### Site legado (igual ao antes do Angular)

- `/index`
- `/catalogo`
- `/produtos`
- `/produto`
- `/carrinho`
- `/checkout`
- `/sobre`
- `/contato`
- `/login`
- `/cadastro`
- `/perfil`
- `/admin`

### Telas Angular nativas (nova estrutura)

- `/ng/catalogo`
- `/ng/produto/101`
- `/ng/carrinho`
- `/ng/checkout`
- `/ng/pedido-finalizado`

## Estrutura do codigo

- `src/app/core`: estado da aplicacao e servicos base
- `src/app/shared`: componentes reutilizaveis
- `src/app/domain`: modelos de dominio
- `src/app/data`: acesso a dados/repositorios
- `src/app/features`: telas por funcionalidade

## Estado da aplicacao

- `CartStore` com Signals: itens, subtotal, loading, error e success
- `CheckoutStore` com Signals: loading, error, success e ultimo pedido

## Componentes reutilizaveis

- `app-header`
- `app-product-card`

## Critérios cobertos

- Catalogo, detalhe do produto, carrinho, checkout e confirmacao
- Rotas Angular explicitas por feature
- Carrinho com adicionar, remover, alterar quantidade e total
- Checkout com validacao basica de formulario
- Organizacao em core/shared/domain/data/features
- Estado com Signals
