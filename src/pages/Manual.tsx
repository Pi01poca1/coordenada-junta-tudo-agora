import { Navigation } from '@/components/Layout/Navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Image, 
  Download, 
  BarChart, 
  Users, 
  Settings,
  FileText,
  PaintBucket,
  Zap,
  Archive
} from 'lucide-react'

const Manual = () => {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            📚 Manual de Utilização
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Guia completo para usar todas as funcionalidades do sistema literário SIPLI
          </p>
          
          {/* Menu de navegação rápida */}
          <Card className="p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">🗂️ Navegação Rápida</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <Button variant="outline" size="sm" onClick={() => scrollToSection('primeiros-passos')}>
                Primeiros Passos
              </Button>
              <Button variant="outline" size="sm" onClick={() => scrollToSection('criando-livros')}>
                Criar Livros
              </Button>
              <Button variant="outline" size="sm" onClick={() => scrollToSection('gerenciando-capitulos')}>
                Capítulos
              </Button>
              <Button variant="outline" size="sm" onClick={() => scrollToSection('editor-avancado')}>
                Editor
              </Button>
              <Button variant="outline" size="sm" onClick={() => scrollToSection('imagens')}>
                Imagens
              </Button>
              <Button variant="outline" size="sm" onClick={() => scrollToSection('ia-integrada')}>
                IA Integrada
              </Button>
              <Button variant="outline" size="sm" onClick={() => scrollToSection('exportacao')}>
                Exportação
              </Button>
              <Button variant="outline" size="sm" onClick={() => scrollToSection('estatisticas')}>
                Estatísticas
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-12">
          {/* Primeiros Passos */}
          <section id="primeiros-passos">
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">🚀 Primeiros Passos</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">1. Fazendo Login</h3>
                  <ul className="space-y-2 text-muted-foreground ml-4">
                    <li>• Acesse o sistema através do link fornecido</li>
                    <li>• Use seu email e senha para entrar</li>
                    <li>• Se não tem conta, clique em "Criar conta" para se registrar</li>
                    <li>• Confirme seu email se solicitado</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">2. Dashboard Principal</h3>
                  <ul className="space-y-2 text-muted-foreground ml-4">
                    <li>• Após login, você verá o dashboard com suas estatísticas</li>
                    <li>• Visualize total de livros, capítulos e palavras escritas</li>
                    <li>• Acompanhe sua atividade recente</li>
                    <li>• Use os botões de navegação no topo da tela</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">3. Navegação</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2">Menu Principal</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• <strong>Dashboard:</strong> Página inicial</li>
                        <li>• <strong>Estatísticas:</strong> Dados de produção</li>
                        <li>• <strong>Documentação:</strong> Info técnica</li>
                        <li>• <strong>Perfil:</strong> Configurações pessoais</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2">Ações Rápidas</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• <strong>Novo Livro:</strong> Criar projeto</li>
                        <li>• <strong>Exportar:</strong> Download em PDF/EPUB/etc</li>
                        <li>• <strong>Estatísticas:</strong> Ver progresso</li>
                        <li>• <strong>Sair:</strong> Encerrar sessão</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Criando Livros */}
          <section id="criando-livros">
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">📖 Criando e Gerenciando Livros</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">1. Criar Novo Livro</h3>
                  <div className="bg-muted/30 p-4 rounded-lg mb-4">
                    <Badge variant="secondary" className="mb-2">Passo a Passo</Badge>
                    <ol className="space-y-2 text-muted-foreground ml-4">
                      <li>1. Clique no botão "Novo Livro" no dashboard</li>
                      <li>2. Preencha o título do livro</li>
                      <li>3. Adicione uma descrição (opcional)</li>
                      <li>4. Escolha o status: Rascunho, Em Progresso ou Publicado</li>
                      <li>5. Clique em "Salvar" para criar o livro</li>
                    </ol>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">2. Editando Informações do Livro</h3>
                  <ul className="space-y-2 text-muted-foreground ml-4">
                    <li>• Clique no título do livro para acessar os detalhes</li>
                    <li>• Use o botão "Editar Livro" para modificar título, descrição e status</li>
                    <li>• As alterações são salvas automaticamente</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">3. Status dos Livros</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                      <Badge variant="secondary" className="mb-2">Rascunho</Badge>
                      <p className="text-sm text-muted-foreground">
                        Ideias iniciais, estrutura básica
                      </p>
                    </div>
                    <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                      <Badge variant="secondary" className="mb-2">Em Progresso</Badge>
                      <p className="text-sm text-muted-foreground">
                        Escrita ativa, desenvolvimento do conteúdo
                      </p>
                    </div>
                    <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                      <Badge variant="secondary" className="mb-2">Publicado</Badge>
                      <p className="text-sm text-muted-foreground">
                        Finalizado, pronto para distribuição
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Gerenciando Capítulos */}
          <section id="gerenciando-capitulos">
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">📝 Gerenciando Capítulos</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">1. Criando Capítulos</h3>
                  <div className="bg-muted/30 p-4 rounded-lg mb-4">
                    <Badge variant="secondary" className="mb-2">Como Fazer</Badge>
                    <ol className="space-y-2 text-muted-foreground ml-4">
                      <li>1. Entre na página de detalhes do livro</li>
                      <li>2. Clique em "Novo Capítulo"</li>
                      <li>3. Digite o título do capítulo</li>
                      <li>4. Escreva o conteúdo usando o editor</li>
                      <li>5. Salve regularmente com Ctrl+S</li>
                    </ol>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">2. Organizando Capítulos</h3>
                  <ul className="space-y-2 text-muted-foreground ml-4">
                    <li>• <strong>Reordenar:</strong> Arraste e solte para reorganizar</li>
                    <li>• <strong>Numeração:</strong> Automática baseada na ordem</li>
                    <li>• <strong>Índice:</strong> Gerado automaticamente</li>
                    <li>• <strong>Visualização:</strong> Lista ou cartões</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">3. Editando Capítulos</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2">Atalhos do Editor</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+S</kbd> Salvar</li>
                        <li>• <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+B</kbd> Negrito</li>
                        <li>• <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+I</kbd> Itálico</li>
                        <li>• <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+Z</kbd> Desfazer</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2">Funcionalidades</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Formatação de texto rica</li>
                        <li>• Inserção de imagens</li>
                        <li>• Listas e numeração</li>
                        <li>• Salvamento automático</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Editor Avançado */}
          <section id="editor-avancado">
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Edit className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">✏️ Editor Avançado</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">1. Ferramentas de Formatação</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2">Texto</h4>
                      <ul className="text-sm space-y-1">
                        <li>• <strong>Negrito</strong> e <em>itálico</em></li>
                        <li>• <u>Sublinhado</u> e ~~riscado~~</li>
                        <li>• Cores de texto e fundo</li>
                        <li>• Tamanhos de fonte</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2">Parágrafos</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Títulos (H1 a H6)</li>
                        <li>• Alinhamento de texto</li>
                        <li>• Espaçamento de linhas</li>
                        <li>• Recuo de parágrafos</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2">Listas</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Listas com marcadores</li>
                        <li>• Listas numeradas</li>
                        <li>• Listas aninhadas</li>
                        <li>• Checklists</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">2. Elementos Especiais</h3>
                  <ul className="space-y-2 text-muted-foreground ml-4">
                    <li>• <strong>Citações:</strong> Destaque para trechos importantes</li>
                    <li>• <strong>Código:</strong> Para textos técnicos ou exemplos</li>
                    <li>• <strong>Tabelas:</strong> Organização de dados</li>
                    <li>• <strong>Separadores:</strong> Divisão visual de seções</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">3. Produtividade</h3>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <Badge variant="secondary" className="mb-2">Dicas Pro</Badge>
                    <ul className="space-y-2 text-muted-foreground ml-4">
                      <li>• Use Ctrl+S frequentemente para salvar</li>
                      <li>• O sistema salva automaticamente a cada 30 segundos</li>
                      <li>• Use o modo tela cheia para focar na escrita</li>
                      <li>• Customize atalhos de teclado nas configurações</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Imagens */}
          <section id="imagens">
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Image className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">🖼️ Gerenciamento de Imagens</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">1. Adicionando Imagens</h3>
                  <div className="bg-muted/30 p-4 rounded-lg mb-4">
                    <Badge variant="secondary" className="mb-2">Métodos de Upload</Badge>
                    <ol className="space-y-2 text-muted-foreground ml-4">
                      <li>1. <strong>Via Editor:</strong> Botão de imagem na barra de ferramentas</li>
                      <li>2. <strong>Arrastar e Soltar:</strong> Arraste arquivos direto para o editor</li>
                      <li>3. <strong>Galeria:</strong> Selecione de imagens já enviadas</li>
                      <li>4. <strong>Capa do Livro:</strong> Upload dedicado para capas</li>
                    </ol>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">2. Formatos Suportados</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">✅ Aceitos</h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• JPG/JPEG (recomendado)</li>
                        <li>• PNG (com transparência)</li>
                        <li>• WebP (otimizado)</li>
                        <li>• SVG (vetorial)</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-medium text-red-800 mb-2">❌ Não Aceitos</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        <li>• GIF animado</li>
                        <li>• TIFF/RAW</li>
                        <li>• BMP</li>
                        <li>• Arquivos {'>'}10MB</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">3. Editando Imagens</h3>
                  <ul className="space-y-2 text-muted-foreground ml-4">
                    <li>• <strong>Redimensionar:</strong> Ajuste tamanho proporcionalmente</li>
                    <li>• <strong>Posicionamento:</strong> Esquerda, centro, direita</li>
                    <li>• <strong>Legenda:</strong> Adicione descrições</li>
                    <li>• <strong>Alt Text:</strong> Para acessibilidade</li>
                    <li>• <strong>Borda:</strong> Estilos e espessuras</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">4. Otimização</h3>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <Badge variant="secondary" className="mb-2">Boas Práticas</Badge>
                    <ul className="space-y-2 text-muted-foreground ml-4">
                      <li>• Use JPG para fotos e PNG para gráficos</li>
                      <li>• Mantenha arquivos abaixo de 2MB</li>
                      <li>• Resolução recomendada: 1200px de largura</li>
                      <li>• Nomeie arquivos de forma descritiva</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* IA Integrada */}
          <section id="ia-integrada">
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">🤖 IA Integrada</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">1. Assistente de Escrita</h3>
                  <div className="bg-muted/30 p-4 rounded-lg mb-4">
                    <Badge variant="secondary" className="mb-2">Funcionalidades</Badge>
                    <ul className="space-y-2 text-muted-foreground ml-4">
                      <li>• <strong>Geração de Texto:</strong> Continue trechos automaticamente</li>
                      <li>• <strong>Correção:</strong> Gramática e ortografia</li>
                      <li>• <strong>Melhorias:</strong> Sugestões de estilo</li>
                      <li>• <strong>Ideias:</strong> Brainstorming para capítulos</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">2. Como Usar</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2">No Editor</h4>
                      <ol className="text-sm space-y-1">
                        <li>1. Selecione o texto desejado</li>
                        <li>2. Clique no ícone de IA</li>
                        <li>3. Escolha a ação desejada</li>
                        <li>4. Revise e aceite as sugestões</li>
                      </ol>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2">Panel IA</h4>
                      <ol className="text-sm space-y-1">
                        <li>1. Abra o painel lateral de IA</li>
                        <li>2. Digite sua solicitação</li>
                        <li>3. Aguarde a resposta</li>
                        <li>4. Copie para o editor</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">3. Tipos de Sugestões</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                      <Badge variant="secondary" className="mb-2">Criativa</Badge>
                      <ul className="text-sm space-y-1">
                        <li>• Continuação de histórias</li>
                        <li>• Diálogos naturais</li>
                        <li>• Descrições vívidas</li>
                        <li>• Plot twists</li>
                      </ul>
                    </div>
                    <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                      <Badge variant="secondary" className="mb-2">Técnica</Badge>
                      <ul className="text-sm space-y-1">
                        <li>• Correção gramatical</li>
                        <li>• Melhoria de fluidez</li>
                        <li>• Simplificação</li>
                        <li>• Formatação</li>
                      </ul>
                    </div>
                    <div className="p-4 border border-purple-200 bg-purple-50 rounded-lg">
                      <Badge variant="secondary" className="mb-2">Estrutural</Badge>
                      <ul className="text-sm space-y-1">
                        <li>• Organização de ideias</li>
                        <li>• Transições</li>
                        <li>• Títulos e subtítulos</li>
                        <li>• Resumos</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Exportação */}
          <section id="exportacao">
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Download className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">📥 Exportação</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">1. Formatos Disponíveis</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-2xl mb-2">📄</div>
                      <h4 className="font-medium">PDF</h4>
                      <p className="text-sm text-muted-foreground">Livros impressos</p>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-2xl mb-2">📱</div>
                      <h4 className="font-medium">EPUB</h4>
                      <p className="text-sm text-muted-foreground">E-readers</p>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-2xl mb-2">📝</div>
                      <h4 className="font-medium">DOCX</h4>
                      <p className="text-sm text-muted-foreground">Word/Docs</p>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-2xl mb-2">🌐</div>
                      <h4 className="font-medium">HTML</h4>
                      <p className="text-sm text-muted-foreground">Web/Blog</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">2. Templates Profissionais</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2">PDF Templates</h4>
                      <ul className="text-sm space-y-1">
                        <li>• <strong>Padrão:</strong> Layout simples e limpo</li>
                        <li>• <strong>Profissional:</strong> Com capa e índice</li>
                        <li>• <strong>ABNT:</strong> Normas acadêmicas brasileiras</li>
                        <li>• <strong>Acadêmico:</strong> Para trabalhos científicos</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2">Customizações</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Fonte e tamanho do texto</li>
                        <li>• Margens e espaçamento</li>
                        <li>• Cabeçalhos e rodapés</li>
                        <li>• Numeração de páginas</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">3. Processo de Exportação</h3>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <Badge variant="secondary" className="mb-2">Passo a Passo</Badge>
                    <ol className="space-y-2 text-muted-foreground ml-4">
                      <li>1. Vá para a página de detalhes do livro</li>
                      <li>2. No painel de exportação, escolha o formato</li>
                      <li>3. Selecione o template (se aplicável)</li>
                      <li>4. Defina o intervalo de capítulos</li>
                      <li>5. Clique em "Exportar" e aguarde o download</li>
                    </ol>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Estatísticas */}
          <section id="estatisticas">
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BarChart className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">📊 Estatísticas e Acompanhamento</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">1. Métricas Principais</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600">📚</div>
                      <h4 className="font-medium">Total de Livros</h4>
                      <p className="text-sm text-muted-foreground">Criados e em progresso</p>
                    </div>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">📝</div>
                      <h4 className="font-medium">Capítulos</h4>
                      <p className="text-sm text-muted-foreground">Escritos e publicados</p>
                    </div>
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-center">
                      <div className="text-2xl font-bold text-purple-600">✍️</div>
                      <h4 className="font-medium">Palavras</h4>
                      <p className="text-sm text-muted-foreground">Total escrito</p>
                    </div>
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-center">
                      <div className="text-2xl font-bold text-orange-600">🤖</div>
                      <h4 className="font-medium">IA Sessions</h4>
                      <p className="text-sm text-muted-foreground">Assistência utilizada</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">2. Acompanhamento de Progresso</h3>
                  <ul className="space-y-2 text-muted-foreground ml-4">
                    <li>• <strong>Atividade Semanal:</strong> Gráfico de palavras por dia</li>
                    <li>• <strong>Média Diária:</strong> Produtividade média</li>
                    <li>• <strong>Dia Mais Produtivo:</strong> Melhor performance</li>
                    <li>• <strong>Atividade Recente:</strong> Últimas ações realizadas</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">3. Análises Avançadas</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2">Por Período</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Livros criados este mês</li>
                        <li>• Capítulos adicionados</li>
                        <li>• Comparativo mensal</li>
                        <li>• Tendências de crescimento</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2">Por Conteúdo</h4>
                      <ul className="text-sm space-y-1">
                        <li>• <strong>Palavras por capítulo</strong></li>
                        <li>• <strong>Tempo estimado de leitura</strong></li>
                        <li>• <strong>Distribuição por livro</strong></li>
                        <li>• <strong>Análise de produtividade</strong></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Dicas e Truques */}
          <section>
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <PaintBucket className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">💡 Dicas e Truques</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">🚀 Produtividade</h3>
                  <ul className="space-y-2 text-muted-foreground ml-4">
                    <li>• <strong>Salvamento:</strong> Use Ctrl+S frequentemente ou confie no auto-save</li>
                    <li>• <strong>Foco:</strong> Use modo tela cheia para concentração máxima</li>
                    <li>• <strong>Organização:</strong> Crie títulos descritivos para capítulos</li>
                    <li>• <strong>Backup:</strong> Exporte regularmente em múltiplos formatos</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">✨ Qualidade</h3>
                  <ul className="space-y-2 text-muted-foreground ml-4">
                    <li>• <strong>Revisão:</strong> Use a IA para correções gramática</li>
                    <li>• <strong>Consistência:</strong> Mantenha um padrão de formatação</li>
                    <li>• <strong>Imagens:</strong> Use sempre descrições alternativas</li>
                    <li>• <strong>Estrutura:</strong> Organize com títulos e subtítulos</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">🎯 Eficiência</h3>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <Badge variant="secondary" className="mb-2">Pro Tips</Badge>
                    <ul className="space-y-2 text-muted-foreground ml-4">
                      <li>• Defina metas diárias de palavras nas estatísticas</li>
                      <li>• Use templates pré-definidos para exportação rápida</li>
                      <li>• Organize arquivos de imagem com nomes descritivos</li>
                      <li>• Aproveite os atalhos de teclado para formatação</li>
                      <li>• Experimente a IA para superar bloqueios criativos</li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Suporte */}
          <section>
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Archive className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">🆘 Precisa de Ajuda?</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Recursos Disponíveis</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2">Documentação</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Acesse informações técnicas detalhadas
                      </p>
                      <Button variant="outline" size="sm" onClick={() => scrollToSection('docs')}>
                        Ver Documentação
                      </Button>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium mb-2">Estatísticas</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Acompanhe seu progresso e produtividade
                      </p>
                      <Button variant="outline" size="sm">
                        Ir para Estatísticas
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Problemas Comuns</h3>
                  <div className="space-y-4">
                    <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                      <h4 className="font-medium text-yellow-800 mb-2">❓ Não consigo salvar</h4>
                      <p className="text-sm text-yellow-700">
                        Verifique sua conexão com a internet. O sistema salva automaticamente a cada 30 segundos.
                      </p>
                    </div>
                    <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">❓ Imagem não aparece</h4>
                      <p className="text-sm text-blue-700">
                        Verifique se o formato é suportado (JPG, PNG, WebP) e se o arquivo é menor que 10MB.
                      </p>
                    </div>
                    <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">❓ Exportação falha</h4>
                      <p className="text-sm text-green-700">
                        Aguarde alguns minutos e tente novamente. Livros grandes podem demorar mais para processar.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </section>
        </div>

        <div className="mt-12 text-center">
          <Separator className="my-8" />
          <p className="text-muted-foreground">
            📚 <strong>SIPLI Enterprise v4.0</strong> - Sistema Literário Profissional
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Desenvolvido para escritores profissionais e criativos
          </p>
        </div>
      </div>
    </div>
  )
}

export default Manual