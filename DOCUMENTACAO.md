# Sistema de Gerenciamento de Estoque e Financeiro

## Visão Geral

Sistema completo de gerenciamento para lojas de suplementos, desenvolvido com Next.js 16, React 19, TypeScript e Supabase. O sistema oferece controle de estoque, gestão financeira, ponto de venda (PDV) e relatórios analíticos.

## Tecnologias Utilizadas

- **Frontend**: Next.js 16 (App Router), React 19.2, TypeScript
- **UI**: Tailwind CSS v4, shadcn/ui
- **Banco de Dados**: Supabase (PostgreSQL)
- **Gráficos**: Recharts
- **Autenticação**: Sem autenticação (acesso público)

## Estrutura do Banco de Dados

### Tabela: `products`

Armazena informações dos produtos em estoque.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | Identificador único (PK) |
| name | text | Nome do produto |
| category | text | Categoria do produto |
| barcode | text | Código de barras (opcional) |
| price | decimal(10,2) | Preço de venda |
| cost | decimal(10,2) | Custo de aquisição |
| stock | integer | Quantidade em estoque |
| min_stock | integer | Estoque mínimo |
| created_at | timestamp | Data de criação |
| updated_at | timestamp | Data de atualização |

### Tabela: `sales`

Registra as vendas realizadas.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | Identificador único (PK) |
| total | decimal(10,2) | Valor total da venda |
| payment_method | text | Forma de pagamento |
| created_at | timestamp | Data da venda |

### Tabela: `sale_items`

Armazena os itens de cada venda.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | Identificador único (PK) |
| sale_id | uuid | ID da venda (FK) |
| product_id | uuid | ID do produto (FK) |
| product_name | text | Nome do produto |
| quantity | integer | Quantidade vendida |
| unit_price | decimal(10,2) | Preço unitário |
| subtotal | decimal(10,2) | Subtotal do item |
| created_at | timestamp | Data de criação |

### Tabela: `transactions`

Registra todas as transações financeiras.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | uuid | Identificador único (PK) |
| type | text | Tipo (receita/despesa) |
| category | text | Categoria da transação |
| description | text | Descrição |
| amount | decimal(10,2) | Valor |
| sale_id | uuid | ID da venda relacionada (FK, opcional) |
| created_at | timestamp | Data da transação |

## Funcionalidades

### 1. Dashboard

**Rota**: `/`

Visão geral do negócio com:
- Cards de estatísticas (receita, lucro, vendas, estoque)
- Gráfico de vendas dos últimos 7 dias
- Lista de vendas recentes
- Alertas de produtos com estoque baixo

**Principais Componentes**:
- `StatCard`: Exibe métricas individuais
- Gráficos Recharts para visualização de dados

### 2. Gestão de Estoque

**Rota**: `/estoque`

Gerenciamento completo de produtos:
- Listagem de produtos com filtros (nome, código de barras, categoria)
- Adicionar novos produtos
- Editar produtos existentes
- Excluir produtos
- Indicadores visuais de estoque baixo
- Visualização responsiva (tabela desktop, cards mobile)

**Campos do Produto**:
- Nome
- Categoria
- Código de barras
- Preço de venda
- Custo
- Quantidade em estoque
- Estoque mínimo
- Fornecedor (apenas frontend)
- Descrição (apenas frontend)

### 3. Ponto de Venda (PDV)

**Rota**: `/vendas`

Sistema de vendas com:
- Busca de produtos por nome ou código de barras
- Carrinho de compras
- Validação de estoque em tempo real
- Seleção de forma de pagamento (Dinheiro, Crédito, Débito, PIX)
- Histórico de vendas
- Atualização automática de estoque após venda
- Registro automático de transação financeira

**Fluxo de Venda**:
1. Buscar e selecionar produto
2. Definir quantidade
3. Adicionar ao carrinho
4. Escolher forma de pagamento
5. Finalizar venda
6. Sistema atualiza estoque e cria transação

### 4. Gestão Financeira

**Rota**: `/financeiro`

Controle de receitas e despesas:
- Cards de resumo (receitas, despesas, saldo)
- Listagem de transações com filtros
- Adicionar receitas e despesas manualmente
- Categorização de transações
- Proteção contra exclusão de transações vinculadas a vendas

**Categorias de Despesas**:
- Fornecedores
- Aluguel
- Salários
- Energia
- Marketing
- Impostos
- Manutenção
- Outros

### 5. Relatórios

**Rota**: `/relatorios`

Análises e insights do negócio:
- Filtros por período (7, 30, 90 dias, tudo)
- Cards de métricas (receita, vendas, ticket médio, alertas)
- Três abas de análise:

**Aba Vendas**:
- Gráfico de produtos mais vendidos (top 5)

**Aba Estoque**:
- Gráfico de distribuição por categoria
- Cards de status (estoque normal, baixo, esgotado)

**Aba Financeiro**:
- Gráfico de despesas por categoria

## Estrutura de Arquivos

\`\`\`
/
├── app/
│   ├── page.tsx                 # Dashboard
│   ├── estoque/
│   │   └── page.tsx            # Gestão de estoque
│   ├── vendas/
│   │   └── page.tsx            # PDV
│   ├── financeiro/
│   │   └── page.tsx            # Gestão financeira
│   ├── relatorios/
│   │   └── page.tsx            # Relatórios
│   ├── layout.tsx              # Layout principal
│   └── globals.css             # Estilos globais
├── components/
│   ├── sidebar.tsx             # Menu lateral
│   ├── mobile-nav.tsx          # Menu mobile
│   ├── stat-card.tsx           # Card de estatística
│   ├── report-stat-card.tsx    # Card de relatório
│   ├── product-form.tsx        # Formulário de produto
│   └── transaction-form.tsx    # Formulário de transação
├── lib/
│   ├── types.ts                # Tipos TypeScript
│   ├── database.ts             # Funções do banco de dados
│   ├── dashboard-utils.ts      # Utilitários do dashboard
│   └── supabase/
│       ├── client.ts           # Cliente Supabase (browser)
│       └── server.ts           # Cliente Supabase (server)
└── scripts/
    ├── 001_create_tables.sql   # Script de criação inicial
    └── 002_remove_auth_and_simplify.sql  # Script de remoção de auth
\`\`\`

## Configuração do Projeto

### Pré-requisitos

- Node.js 18+
- Conta Supabase
- npm ou yarn

### Variáveis de Ambiente

O projeto utiliza as seguintes variáveis de ambiente (configuradas automaticamente via integração Supabase):

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
\`\`\`

### Instalação

1. Clone o repositório
2. Instale as dependências:
   \`\`\`bash
   npm install
   \`\`\`

3. Configure a integração Supabase no v0

4. Execute os scripts SQL na ordem:
   - `001_create_tables.sql`
   - `002_remove_auth_and_simplify.sql`

5. Inicie o servidor de desenvolvimento:
   \`\`\`bash
   npm run dev
   \`\`\`

6. Acesse `http://localhost:3000`

## Scripts SQL

### Script 1: Criação Inicial

Cria as tabelas com autenticação (não utilizado na versão final).

### Script 2: Remoção de Autenticação

- Remove políticas RLS baseadas em usuário
- Remove colunas `user_id`
- Cria políticas públicas
- Insere dados de exemplo

## Segurança

### Políticas RLS (Row Level Security)

O sistema utiliza políticas RLS públicas que permitem todas as operações:

\`\`\`sql
create policy "Enable all operations for [table]"
  on public.[table] for all
  using (true)
  with check (true);
\`\`\`

**Nota**: Esta configuração é adequada para ambientes de desenvolvimento ou sistemas de uso interno. Para produção com múltiplos usuários, recomenda-se implementar autenticação.

## Responsividade

O sistema é totalmente responsivo com:

- **Desktop**: Tabelas completas, sidebar fixa
- **Tablet**: Layout adaptativo, sidebar colapsável
- **Mobile**: 
  - Menu hambúrguer
  - Cards ao invés de tabelas
  - Botões full-width
  - Gráficos otimizados
  - Sem scroll horizontal

## Boas Práticas Implementadas

1. **TypeScript**: Tipagem forte em todo o código
2. **Componentes Reutilizáveis**: UI modular com shadcn/ui
3. **Async/Await**: Operações assíncronas consistentes
4. **Loading States**: Indicadores de carregamento
5. **Error Handling**: Tratamento de erros com console.log
6. **Validações**: Validação de estoque e dados
7. **Responsividade**: Mobile-first design
8. **Acessibilidade**: Labels, ARIA attributes
9. **Performance**: Lazy loading, otimização de queries

## Fluxo de Dados

### Adicionar Produto
\`\`\`
Usuário → Formulário → addProduct() → Supabase → Atualiza UI
\`\`\`

### Realizar Venda
\`\`\`
Usuário → Carrinho → addSale() → 
  1. Cria venda (sales)
  2. Cria itens (sale_items)
  3. Atualiza estoque (products)
  4. Cria transação (transactions)
→ Atualiza UI
\`\`\`

### Adicionar Transação
\`\`\`
Usuário → Formulário → addTransaction() → Supabase → Atualiza UI
\`\`\`

## Manutenção

### Backup do Banco de Dados

Recomenda-se fazer backups regulares via Supabase Dashboard:
1. Acesse o projeto no Supabase
2. Vá em Database → Backups
3. Configure backups automáticos

### Monitoramento

Monitore o uso através do Supabase Dashboard:
- Número de requisições
- Uso de armazenamento
- Performance de queries

## Limitações Conhecidas

1. **Sem Autenticação**: Sistema de acesso público
2. **Sem Multi-tenancy**: Dados compartilhados entre todos os usuários
3. **Campo Fornecedor**: Não persiste no banco de dados
4. **Sem Histórico de Alterações**: Não rastreia mudanças em produtos
5. **Sem Backup Automático de Vendas**: Vendas não podem ser canceladas após finalização

## Melhorias Futuras

1. Implementar sistema de autenticação
2. Adicionar multi-tenancy (múltiplas lojas)
3. Criar módulo de fornecedores
4. Implementar impressão de cupons fiscais
5. Adicionar notificações de estoque baixo
6. Criar relatórios em PDF
7. Implementar dashboard em tempo real
8. Adicionar suporte a múltiplos idiomas
9. Criar app mobile nativo
10. Implementar integração com sistemas de pagamento

## Suporte

Para dúvidas ou problemas:
1. Verifique a documentação do Supabase
2. Consulte a documentação do Next.js
3. Revise os logs do console do navegador
4. Verifique os logs do Supabase Dashboard

## Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

## Contribuindo

Contribuições são bem-vindas! Por favor:
1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## Changelog

### Versão 1.0.0 (2025-01-04)
- Lançamento inicial
- Sistema completo de estoque e financeiro
- Integração com Supabase
- Interface responsiva
- Relatórios analíticos
