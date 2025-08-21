# 🚀 Deploy Guide - Vercel

## 📋 Checklist Pré-Deploy

### ✅ Verificações Obrigatórias
- [ ] Build local funcionando (`npm run build`)
- [ ] Preview local funcionando (`npm run preview`) 
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Supabase configurado e funcionando
- [ ] Rotas SPA testadas
- [ ] Responsividade verificada

## 🔧 Variáveis de Ambiente Necessárias

### No Vercel Dashboard:
```bash
VITE_SUPABASE_URL=https://rfxrguxoqnspsrqzzwlc.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmeHJndXhvcW5zcHNycXp6d2xjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NjUwNTIsImV4cCI6MjA2ODU0MTA1Mn0.PJ5jrYu6eXVuaVVel8fJTqRsn9FFWYMTJw2q1u1y8fc
VITE_SUPABASE_PROJECT_ID=rfxrguxoqnspsrqzzwlc
VITE_ADMIN_EMAILS=98sdobrados89@gmail.com
NODE_ENV=production
```

## 📦 Deploy no Vercel

### Método 1: Deploy via GitHub (Recomendado)
1. **Conectar Repositório:**
   - Faça push do código para GitHub
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "New Project"
   - Importe o repositório GitHub

2. **Configurar Projeto:**
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Adicionar Variáveis de Ambiente:**
   - Vá para Settings > Environment Variables
   - Adicione todas as variáveis listadas acima

4. **Deploy:**
   - Clique "Deploy"
   - Aguarde o build completar

### Método 2: Deploy via Vercel CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Para produção
vercel --prod
```

## 🔄 Comandos de Teste Local

```bash
# Instalar dependências
npm install

# Build de produção
npm run build

# Testar build localmente
npm run preview

# Verificar se não há erros
npm run lint
```

## 🛠️ Configuração do Supabase para Produção

### Atualizar URLs no Supabase:
1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard/project/rfxrguxoqnspsrqzzwlc/auth/providers)
2. Vá para Authentication > URL Configuration
3. Adicione seus domínios de produção:
   - Site URL: `https://seu-dominio.vercel.app`
   - Redirect URLs: 
     - `https://seu-dominio.vercel.app/login`
     - `https://seu-dominio.vercel.app/dashboard`

## ⚡ Otimizações Aplicadas

### Build Otimizado:
- ✅ Minificação ativada (Terser)
- ✅ Tree shaking configurado
- ✅ Code splitting por chunks
- ✅ Console.logs removidos em produção
- ✅ Sourcemaps desabilitados

### Performance:
- ✅ Lazy loading implementado
- ✅ Cache headers configurados
- ✅ Gzip compression (automático no Vercel)
- ✅ Security headers configurados

## 🔍 Monitoramento Pós-Deploy

### Verificar após deploy:
- [ ] Todas as rotas funcionando
- [ ] Authentication funcionando
- [ ] Supabase conectado
- [ ] Console sem erros
- [ ] Performance (Lighthouse)

### Links Importantes:
- Dashboard Vercel: https://vercel.com/dashboard
- Supabase Dashboard: https://supabase.com/dashboard/project/rfxrguxoqnspsrqzzwlc
- Analytics: Vercel Analytics (se habilitado)

## 🚨 Troubleshooting

### Problemas Comuns:
1. **Build Fail:** Verificar variáveis de ambiente
2. **404 em rotas:** Verificar vercel.json (rewrites)
3. **Supabase error:** Verificar URLs no dashboard
4. **Auth não funciona:** Verificar redirect URLs

### Logs:
- Build logs: Vercel Dashboard > Deployments
- Runtime logs: Vercel Dashboard > Functions
- Supabase logs: Supabase Dashboard > Logs

---

## 📝 Arquivos Necessários para Deploy

### Core Files:
- ✅ `package.json`
- ✅ `vite.config.ts` (otimizado)
- ✅ `vercel.json`
- ✅ `src/` (código fonte)
- ✅ `public/` (assets estáticos)

### Configuração:
- ✅ `.env.example` (referência)
- ✅ `tailwind.config.ts`
- ✅ `tsconfig.json`
- ✅ `index.html`

### Supabase:
- ✅ `supabase/` (edge functions)
- ✅ `src/integrations/supabase/` (client config)

**🎉 Seu app está pronto para produção!**