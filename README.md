# 📚 Book Management System

Sistema de gerenciamento de livros e capítulos com React, TypeScript, Supabase e deploy otimizado para Vercel.

## 🚀 Quick Start

### Desenvolvimento Local
```bash
# Clonar repositório
git clone <your-repo-url>
cd coordenada-junta-tudo-agora

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Iniciar desenvolvimento
npm run dev
```

### Deploy Rápido
```bash
# Build de produção
npm run build

# Testar localmente
npm run preview

# Deploy no Vercel
vercel --prod
```

## 🛠️ Technology Stack

- **React 18** + **TypeScript** - UI framework
- **Vite** - Build tool otimizado
- **Supabase** - Backend as a Service  
- **Tailwind CSS** + **shadcn/ui** - Design system
- **React Router** - SPA routing
- **React Query** - Data fetching
- **Vercel** - Hosting platform

## 📦 Features

- ✅ **Autenticação** - Login/registro com Supabase Auth
- ✅ **Gerenciamento de Livros** - CRUD completo
- ✅ **Editor de Capítulos** - Rich text editor
- ✅ **Upload de Imagens** - Supabase Storage
- ✅ **Admin Panel** - Dashboard administrativo
- ✅ **Responsive Design** - Mobile-first
- ✅ **Dark/Light Mode** - Tema adaptativo
- ✅ **SEO Optimized** - Meta tags e estrutura semântica

## 🔧 Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build produção
npm run preview      # Preview build local
npm run lint         # Linting
npm run format       # Formatação código
```

## 🌐 Deploy

Para instruções detalhadas de deploy, consulte [DEPLOY.md](./DEPLOY.md)

### Vercel (Recomendado)
1. Conecte seu repositório GitHub ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Variáveis de Ambiente Necessárias
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_ADMIN_EMAILS=admin@domain.com
```

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── ui/             # shadcn/ui components
│   ├── Auth/           # Componentes de autenticação
│   ├── Books/          # Gerenciamento de livros
│   └── Admin/          # Painel administrativo
├── hooks/              # Custom hooks
├── integrations/       # Configurações Supabase
├── pages/              # Páginas da aplicação
└── lib/                # Utilitários

supabase/
├── functions/          # Edge functions
└── config.toml        # Configuração Supabase
```

## 🔐 Configuração do Supabase

1. **Criar projeto:** [supabase.com](https://supabase.com)
2. **Configurar Auth:** Providers e URLs de redirect
3. **Configurar Storage:** Buckets para imagens
4. **Deploy Edge Functions:** Automático via Lovable

## 🎨 Design System

- **Cores:** Definidas em HSL no `src/index.css`
- **Componentes:** Baseados em shadcn/ui
- **Tipografia:** Sistema responsivo
- **Spacing:** Grid system padronizado

## 📈 Performance

- **Bundle Size:** Otimizado com code splitting
- **Lazy Loading:** Componentes e rotas
- **Image Optimization:** WebP e lazy loading
- **Caching:** Headers otimizados no Vercel

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para detalhes.

## 🔗 Links Úteis

- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Supabase](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
