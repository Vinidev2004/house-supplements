# Sistema de Gerenciamento de Estoque e Financeiro

Sistema completo para gestão de lojas de suplementos com controle de estoque, vendas, financeiro e relatórios.

## 🚀 Tecnologias

- Next.js 16
- React 19.2
- TypeScript
- Supabase
- Tailwind CSS v4
- shadcn/ui
- Recharts

## 📋 Funcionalidades

- ✅ Dashboard com métricas em tempo real
- ✅ Gestão completa de estoque
- ✅ Ponto de Venda (PDV)
- ✅ Controle financeiro (receitas e despesas)
- ✅ Relatórios analíticos com gráficos
- ✅ Interface responsiva (desktop, tablet, mobile)
- ✅ Alertas de estoque baixo
- ✅ Múltiplas formas de pagamento

## 🎯 Início Rápido

1. **Clone o repositório**
   \`\`\`bash
   git clone [url-do-repositorio]
   cd inventory-finance-system
   \`\`\`

2. **Instale as dependências**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configure o Supabase**
   - Crie um projeto no Supabase
   - Execute os scripts SQL em `scripts/`
   - Configure as variáveis de ambiente

4. **Inicie o servidor**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Acesse o sistema**
   \`\`\`
   http://localhost:3000
   \`\`\`

## 📚 Documentação

Para documentação completa, consulte [DOCUMENTACAO.md](./DOCUMENTACAO.md)

## 🗄️ Estrutura do Banco de Dados

- **products**: Produtos em estoque
- **sales**: Vendas realizadas
- **sale_items**: Itens de cada venda
- **transactions**: Transações financeiras

## 🎨 Interface

### Desktop
- Sidebar fixa com navegação
- Tabelas completas
- Gráficos interativos

### Mobile
- Menu hambúrguer
- Cards responsivos
- Gráficos otimizados
- Sem scroll horizontal

## 📊 Módulos

### Dashboard
Visão geral com métricas principais e gráficos de vendas.

### Estoque
Gerenciamento completo de produtos com filtros e alertas.

### Vendas
PDV com carrinho de compras e validação de estoque.

### Financeiro
Controle de receitas e despesas com categorização.

### Relatórios
Análises detalhadas com filtros de período e múltiplos gráficos.

## 🔒 Segurança

Sistema configurado para acesso público. Para produção, recomenda-se implementar autenticação.

## 🤝 Contribuindo

Contribuições são bem-vindas! Veja [DOCUMENTACAO.md](./DOCUMENTACAO.md) para mais detalhes.

## 📝 Licença

MIT License - veja LICENSE para detalhes.

## 📧 Contato

Para suporte, abra uma issue no repositório.
