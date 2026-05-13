# Rolagem Crítica - Projeto Completo

**Versão:** Angular 18+ com TypeScript e Signals  
**Status:** ✅ Pronto para Produção  
**Última Atualização:** Maio 2026

## Como Executar

No Windows, execute na pasta `angular-app`:

```bash
cd angular-app
cmd /c npm.cmd install
npm start
```

A aplicação iniciará em **`http://localhost:57447`** (porta 4200 estava em uso).

### Principais Features Implementadas ✅

**UX Features:**
- ✅ **Logout Button** - Logout seguro com limpeza de estado
- ✅ **Form Validations** - CPF, Telefone, Nome, Senha validados
- ✅ **Password Change** - Alteração de senha com verificação de senha atual (em Perfil > Alterar Senha)
- ✅ **Toast Notifications** - Sistema de notificações auto-dismiss (sucesso, erro, info)
- ✅ **Design Profissional** - Remoção de todos os emojis para aparência mais séria

**Admin Dashboard Melhorado:**
- ✅ **Tab Pedidos Removido** - Toda gestão de pedidos centralizada no Dashboard
- ✅ **Vista Completa de Pedidos** - Dashboard exibe TODOS os pedidos com filtro por status
- ✅ **Expansão de Detalhes** - Visualizar/ocultar detalhes completos de cada pedido
- ✅ **Produtos Customizados Persistidos** - Produtos adicionados no admin agora são preservados no localStorage
- ✅ **Proteção: Admin Não Pode Fazer Pedidos** - Checkout bloqueado para administradores (apenas clientes podem comprar)

### Rotas de Navegação

### Rotas de Navegação

**Públicas:**
- `/` - Home
- `/catalogo` - Catálogo com filtros por categoria
- `/categoria/:slug` - Produtos por categoria (RPG de Mesa, Board Games, etc)
- `/produto/:id` - Detalhe do produto
- `/carrinho` - Carrinho de compras
- `/checkout` - Finalização da compra
- `/pedido-finalizado` - Confirmação após pagamento
- `/login` - Login de usuário
- `/cadastro` - Registro de novo usuário

**Autenticadas (User):**
- `/perfil` - Perfil do usuário com 3 abas:
  - **Dados Pessoais** - Informações da conta
  - **Meus Pedidos** - Histórico de pedidos com detalhes
  - **Alterar Senha** - Mudar senha com verificação da atual

**Admin Only:**
- `/admin` - Dashboard administrativo com 8 abas:
  - **Dashboard** - Visão geral + lista completa de pedidos
  - **Relatórios** - Estatísticas e gráficos
  - **Estoque** - Gerenciar quantidade de produtos
  - **Produtos** - Adicionar/editar produtos
  - **Cupons** - Criar e gerenciar cupons de desconto
  - **Categorias** - Gerenciar categorias de produtos
  - **Clientes** - Listar usuários cadastrados
  - **Auditoria** - Log de todas as ações do sistema

### Credenciais de Teste

**Admin (acesso completo):**
```
Email: admin@rolagemcritica.com
Senha: admin
```

**Ou crie um novo usuário:**
- Clique em "Cadastro"
- Preencha com dados válidos:
  - Nome: mínimo 10 caracteres, sem números
  - CPF: formato `000.000.000-00` ou apenas dígitos
  - Telefone: `(DD) 99999-9999` ou 10-11 dígitos
  - Senha: mínimo 8 caracteres

### Estrutura de Código Angular

```
src/app/
├── core/
│   ├── services/
│   │   ├── auth.service.ts         # Autenticação e login
│   │   ├── cart.service.ts         # Gerenciamento do carrinho
│   │   ├── product.service.ts      # Catálogo de produtos
│   │   ├── stock.service.ts        # Estoque (FIX: preserva customizados)
│   │   ├── storage.service.ts      # localStorage wrapper
│   │   ├── toast.service.ts        # Sistema de notificações
│   │   └── ...outros serviços
│   └── state/
│       ├── cart.store.ts           # Estado do carrinho (Signals)
│       └── checkout.store.ts       # Estado do checkout
├── shared/
│   └── components/
│       ├── app-header/
│       ├── app-footer/             # Com documentação comentada
│       ├── toast-container/        # UI para notificações
│       └── app-product-card/
├── domain/
│   └── models/                     # Interfaces TypeScript
├── data/
│   └── mock/                       # Dados iniciais (products, users, etc)
└── features/
    ├── auth/
    │   ├── login/
    │   ├── cadastro/               # Com validações completas
    │   └── perfil/                 # 3 abas (Dados, Pedidos, Senha)
    ├── catalogo/                   
    ├── produto/
    ├── carrinho/
    ├── checkout/
    ├── pedido-finalizado/
    └── admin/                      # Dashboard com 8 abas
```

### Padrões de Código Utilizados

**Signals & Reactive State:**
```typescript
// Exemplo do CartStore
private itemsSignal = signal<CartItem[]>([]);
readonly items = computed(() => this.itemsSignal());
readonly totalItems = computed(() => this.items().length);

// Uso em componentes
items(): CartItem[] {
  return this.cartStore.items();
}
```

**Toast Notifications:**
```typescript
// Chamar em qualquer componente/serviço
this.toastService.success('Produto adicionado ao carrinho!');
this.toastService.error('Estoque insuficiente');
this.toastService.info('Informação importante');
```

**Form Validations:**
```typescript
// Cadastro com validações
validateCPF(cpf: string): boolean { /* regex + length */ }
validateTelefone(telefone: string): boolean { /* regex + length */ }
validateNome(nome: string): boolean { /* min 10 chars, sem números */ }
validateSenha(senha: string): boolean { /* min 8 chars */ }
```

**Password Change (Perfil):**
```typescript
changePassword() {
  // 1. Verifica senha atual no localStorage
  // 2. Valida nova senha (8+ caracteres)
  // 3. Confirma que senhas coincidem
  // 4. Persiste em localStorage
  // 5. Mostra toast com auto-dismiss (3s)
}
```

### Data Persistence (localStorage)

Todas as chaves utilizadas:
- `rolagem_usuarios` - Usuários cadastrados
- `rolagem_pedidos` - Histórico de pedidos
- `rolagem_carrinho` - Itens no carrinho
- `rolagem_estoque_mock` - Estoque de produtos (preserva customizados)
- `rolagem_coupons` - Cupons de desconto
- `rolagem_categories` - Categorias de produtos
- `rolagem_audit_logs` - Log de auditoria
- `rolagem_produtos_custom` - Produtos customizados (admin)

### Build & Deployment

**Build para produção:**
```bash
npm run build
```

**Saída esperada:**
- ~232 KB bundle inicial
- 9 chunks lazy-loaded
- 0 erros de build
- Otimizado para production

### Checklist Final de Features ✅

- [x] Logout button com router navigation
- [x] Validação CPF (regex + length validation)
- [x] Validação Telefone (regex + length validation)
- [x] Validação Nome (10+ chars, sem números)
- [x] Validação Senha (8+ chars, confirmation match)
- [x] Password change em Perfil com verificação de senha atual
- [x] Toast notifications (success/error/info) com auto-dismiss
- [x] Remoção de todos os emojis (design profissional)
- [x] Admin dashboard reestruturado (Pedidos tab removido)
- [x] Gestão de pedidos centralizada no Dashboard
- [x] Stock service fix (produtos customizados preservados)
- [x] Componentes com documentação comentada
- [x] Build passa sem erros
- [x] App roda sem erros no console
- [x] Categorias dinâmicas (admin cria = aparecem no catálogo)
- [x] Sistema de desconto corrigido (PIX 10% ou Cupom, não acumula errado)
- [x] Checkout bloqueado para admin (apenas clientes podem fazer pedidos)

### Fluxos de Teste Recomendados

**1. Fluxo de Cliente:**
```
Home → Catálogo → Filtrar categoria → Ver produto → Adicionar ao carrinho
→ Ir para carrinho → Checkout → Login/Cadastro → Finalizar pedido
→ Perfil → Ver pedido em Meus Pedidos
```

**2. Fluxo de Admin:**
```
Login (admin@...) → Admin Dashboard → Ver pedidos → Alterar status
→ Aba Estoque → Adicionar produto → Aba Relatórios → Ver estatísticas
```

**3. Fluxo de Segurança:**
```
Cadastro com validações → Login → Perfil → Alterar Senha → Logout → Login com nova senha
```

### Suporte e Troubleshooting

**App não sobe na porta 4200?**
- Verifique `/src/main.ts` - porta configurada é 57447
- Ou libere a porta: `netstat -ano | findstr :4200`

**localStorage vazio?**
- Será preenchido ao primeiro acesso com dados padrão
- Verifique DevTools > Application > Local Storage

**Erro NG0303 (ngIf)?**
- Todos os componentes têm CommonModule importado
- Build passa sem erros

---

## Evolução do Projeto

### Fase 1: HTML/CSS/JS Original
- ✅ Versão estática com funcionalidades básicas
- ✅ localStorage para persistência
- ✅ Scripts vanilla JS

### Fase 2: Migração para Angular 18+
- ✅ Componentes standalone (sem NgModules)
- ✅ TypeScript com tipagem completa
- ✅ Signals para state management reativo
- ✅ Lazy loading de features

### Fase 3: UX/Security Polish (FINAL) ✅
- ✅ Logout button
- ✅ Form validations (CPF, Telefone, Nome, Senha)
- ✅ Password change com verificação
- ✅ Toast notifications
- ✅ Design profissional (sem emojis)
- ✅ Admin dashboard reestruturado
- ✅ Stock service fix (customizados preservados)
- ✅ Documentação em comentários

---

## Informações Técnicas

**Stack:**
- Angular 18+
- TypeScript 5.x
- Angular Signals API
- CSS 3 com variáveis
- localStorage API

**Padrões:**
- Component-Driven Architecture
- Standalone Components
- Lazy Loading Routes
- Service-Based State
- Factory Pattern (Signals)

**Performance:**
- Initial Bundle: ~232 KB
- Lazy Chunks: 9
- Build Time: < 30s
- No external dependencies (vanilla CSS)

**Browser Support:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Documentação de Componentes

Cada componente principal possui:
- JSDoc header com `@component`, `@selector`, `@standalone`
- Seções HTML comentadas com `<!-- SEÇÃO X -->`
- Estilos agrupados com `/* ============ GRUPO ============ */`
- Responsabilidades listadas na classe

Exemplo (app-footer.component.ts):
```typescript
/**
 * FOOTER COMPONENT
 * ================
 * Rodapé da aplicação com informações da marca...
 * @component
 * @selector app-footer
 */

export class FooterComponent {
  // Responsabilidades documentadas
}
```

---

## Links Rápidos

- **Projeto Original:** `/pi/` (HTML/CSS/JS)
- **Angular App:** `/angular-app/`
- **Docs:** Este README
- **Dev Server:** http://localhost:57447
- **Admin Login:** admin@rolagemcritica.com / admin

---

