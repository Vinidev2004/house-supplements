# Guia de Segurança - Sistema de Estoque e Finanças

## Visão Geral

Este documento descreve as práticas de segurança implementadas e recomendações para produção.

## Autenticação e Autorização

### Estado Atual (Desenvolvimento)

**⚠️ ATENÇÃO**: O sistema atualmente usa validação de senha hardcoded para facilitar o desenvolvimento:

```typescript
const isPasswordValid =
  (username === "house" && password === "100620") || 
  (username === "func" && password === "1234")
```

### Implementação para Produção

**OBRIGATÓRIO antes de ir para produção:**

1. **Implementar bcrypt para hash de senhas**:
   ```bash
   npm install bcrypt
   npm install --save-dev @types/bcrypt
   ```

2. **Atualizar lib/auth.ts**:
   ```typescript
   import bcrypt from 'bcrypt'
   
   // No login
   const isPasswordValid = await bcrypt.compare(password, user.password_hash)
   
   // Ao criar usuário
   const password_hash = await bcrypt.hash(password, 10)
   ```

3. **Atualizar senhas no banco de dados**:
   ```sql
   -- Gerar hash bcrypt das senhas atuais
   UPDATE users SET password_hash = '$2b$10$...' WHERE username = 'house';
   UPDATE users SET password_hash = '$2b$10$...' WHERE username = 'func';
   ```

## Segurança dos Cookies

### Configuração Atual

✅ **Implementado corretamente**:

```typescript
cookieStore.set(SESSION_COOKIE, "authenticated", {
  httpOnly: true,              // Protege contra XSS
  secure: process.env.NODE_ENV === "production", // HTTPS obrigatório em produção
  sameSite: "lax",             // Proteção contra CSRF
  maxAge: 60 * 60 * 24 * 7,   // 7 dias
})
```

## Proteção de Rotas

### Middleware (proxy.ts)

✅ **Implementado**: O middleware protege rotas sensíveis e redireciona usuários não autenticados.

✅ **Controle de acesso por role**: Funcionários não podem acessar `/financeiro` e `/relatorios`.

## Segurança do Banco de Dados

### Row Level Security (RLS)

✅ **Todas as tabelas têm RLS habilitado** no Supabase com política "Enable all operations".

⚠️ **Recomendação para Produção**: Implementar políticas RLS mais restritivas:

```sql
-- Exemplo: Vendas visíveis apenas para o usuário que criou ou admin
CREATE POLICY "Users can view own sales"
  ON sales FOR SELECT
  USING (
    user_id = auth.uid() OR
    (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );
```

### Índices de Performance e Segurança

✅ **Script criado**: `scripts/017_add_security_indexes.sql`

Índices implementados:
- Username único (previne duplicatas)
- Role indexada (acelera filtros por tipo de usuário)
- User_id em sales (acelera filtros de vendas por funcionário)
- Compostos para queries de data

## Validação de Entrada

### Frontend

✅ **Validação em formulários** usando React Hook Form e schemas

### Backend

⚠️ **Recomendação**: Adicionar validação no servidor usando bibliotecas como Zod:

```typescript
import { z } from 'zod'

const productSchema = z.object({
  name: z.string().min(1).max(255),
  price: z.number().positive(),
  cost: z.number().positive(),
  stock: z.number().int().min(0),
})
```

## Proteção contra Vulnerabilidades Comuns

### SQL Injection

✅ **Protegido**: Usando Supabase Client com queries parametrizadas.

### XSS (Cross-Site Scripting)

✅ **Protegido**: React escapa automaticamente valores renderizados.

### CSRF (Cross-Site Request Forgery)

✅ **Protegido**: Cookies com `sameSite: "lax"`.

### Clickjacking

⚠️ **Recomendação**: Adicionar headers de segurança em `next.config.mjs`:

```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}
```

## Auditoria e Logging

### Estado Atual

✅ **Logs de erro**: Console.error para erros de banco de dados

⚠️ **Recomendação para Produção**: Implementar sistema de logging estruturado:

```typescript
import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
})
```

## Variáveis de Ambiente

✅ **Boas práticas seguidas**:
- Variáveis sensíveis não commitadas (`.env.local` no `.gitignore`)
- Uso de `NEXT_PUBLIC_` apenas para variáveis públicas

## Checklist de Segurança para Produção

- [ ] Implementar bcrypt para senhas
- [ ] Atualizar todas as senhas no banco com hash bcrypt
- [ ] Implementar políticas RLS mais restritivas
- [ ] Adicionar validação no servidor (Zod)
- [ ] Configurar headers de segurança
- [ ] Implementar rate limiting para APIs
- [ ] Configurar logging estruturado
- [ ] Implementar backup automático do banco
- [ ] Configurar monitoring (Sentry, DataDog, etc)
- [ ] Auditar dependências com `npm audit`
- [ ] Configurar HTTPS em produção
- [ ] Implementar 2FA para admins (opcional)

## Contato de Segurança

Para reportar vulnerabilidades de segurança, entre em contato através de [seu email de segurança].
