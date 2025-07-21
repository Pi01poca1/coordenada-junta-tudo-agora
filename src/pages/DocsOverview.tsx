import { Navigation } from '@/components/Layout/Navigation';

const DocsOverview = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1>SIPLI Enterprise v4.0 – Visão Geral</h1>
          
          <h2>O que é o SIPLI</h2>
          <p>Editor literário profissional multi‑usuário com IA integrada.</p>
          
          <h3>Recursos principais</h3>
          <ul>
            <li>Criação e edição de livros e capítulos</li>
            <li>Sistema avançado de imagens (layouts profissionais)</li>
            <li>IA (Anthropic Claude, OpenAI GPT, Ollama) para geração de texto</li>
            <li>Exportação em PDF, EPUB, DOCX, HTML</li>
            <li>Multi‑usuário com isolamento de dados</li>
            <li>Interface moderna e responsiva</li>
            <li>Sincronização local e nuvem</li>
          </ul>
          
          <h2>Arquitetura Técnica (alto nível)</h2>
          <table className="min-w-full border-collapse border border-border">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border px-4 py-2 text-left">Camada</th>
                <th className="border border-border px-4 py-2 text-left">Tecnologias</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-border px-4 py-2">Front‑end</td>
                <td className="border border-border px-4 py-2">React 18, TypeScript, Vite, TailwindCSS, React Router</td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2">Back‑end</td>
                <td className="border border-border px-4 py-2">Flask, SQLAlchemy, JWT Auth</td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2">Banco</td>
                <td className="border border-border px-4 py-2">SQLite (dev) → PostgreSQL (prod)</td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2">IA</td>
                <td className="border border-border px-4 py-2">Anthropic Claude, OpenAI GPT, Ollama (local)</td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2">Storage</td>
                <td className="border border-border px-4 py-2">Local filesystem + AWS S3</td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2">Testing</td>
                <td className="border border-border px-4 py-2">Jest, Pytest, Cypress</td>
              </tr>
              <tr>
                <td className="border border-border px-4 py-2">Deploy</td>
                <td className="border border-border px-4 py-2">Docker, Nginx, PM2</td>
              </tr>
            </tbody>
          </table>
          
          <p><em>diagrama simples se possível (texto ou ASCII)</em></p>
          
          <h2>Estrutura de Pastas (resumida)</h2>
          <pre className="bg-muted p-4 rounded-md overflow-x-auto">
            <code>{`sipli-enterprise/
├── backend/
│ ├── app/
│ │ ├── models/ … (user, book, chapter, image, ai_session)
│ │ ├── routes/ … (auth, books, chapters, images, ai, export, admin)
│ │ ├── services/ … (auth_service, book_service, image_service, ai_service, export_service)
│ │ └── ai/ … (providers, prompts, orchestrator)
├── frontend/
│ └── src/ … (hooks, components, pages, services)
└── docker/`}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

export default DocsOverview;