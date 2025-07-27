# Audit Snapshot

_Gerado em 2025-07-27T17:27:03.488Z_


## Árvore de Pastas

```
- .env.local
- .gitignore
- AUDIT_SNAPSHOT.md
- bun.lockb
- components.json
- eslint.config.js
- index.html
- package-lock.json
- package.backup.json
- package.json
- postcss.config.js
- public/
  - public\favicon.ico
  - public\placeholder.svg
  - public\robots.txt
- README.md
- scripts/
  - scripts\checkpoint.mjs
  - scripts\gen-audit.mjs
- src/
  - src\App.css
  - src\App.tsx
  - src\components/
    - src\components\AI/
      - src\components\AI\AIPanel.tsx
    - src\components\Auth/
      - src\components\Auth\LoginForm.tsx
    - src\components\Books/
      - src\components\Books\BookCard.tsx
      - src\components\Books\BookForm.tsx
      - src\components\Books\BookList.tsx
    - src\components\Chapters/
      - src\components\Chapters\ChapterForm.tsx
      - src\components\Chapters\ChapterList.tsx
    - src\components\Debug/
      - src\components\Debug\StorageDebug.tsx
    - src\components\Export/
      - src\components\Export\ExportPanel.tsx
      - src\components\Export\ExportTest.tsx
    - src\components\Images/
      - src\components\Images\BookCoverUpload.tsx
      - src\components\Images\CoverSelector.tsx
      - src\components\Images\ImageEditor.tsx
      - src\components\Images\ImageGallery.tsx
      - src\components\Images\ImagePositioner.tsx
      - src\components\Images\ImageRenderer.tsx
      - src\components\Images\ImageRendererInline.tsx
      - src\components\Images\ImageUpload.tsx
    - src\components\Layout/
      - src\components\Layout\Navigation.tsx
    - src\components\ProtectedRoute.tsx
    - src\components\ui/
      - src\components\ui\accordion.tsx
      - src\components\ui\alert-dialog.tsx
      - src\components\ui\alert.tsx
      - src\components\ui\aspect-ratio.tsx
      - src\components\ui\avatar.tsx
      - src\components\ui\badge.tsx
      - src\components\ui\breadcrumb.tsx
      - src\components\ui\button.tsx
      - src\components\ui\calendar.tsx
      - src\components\ui\card.tsx
      - src\components\ui\carousel.tsx
      - src\components\ui\chart.tsx
      - src\components\ui\checkbox.tsx
      - src\components\ui\collapsible.tsx
      - src\components\ui\command.tsx
      - src\components\ui\context-menu.tsx
      - src\components\ui\dialog.tsx
      - src\components\ui\drawer.tsx
      - src\components\ui\dropdown-menu.tsx
      - src\components\ui\form.tsx
      - src\components\ui\hover-card.tsx
      - src\components\ui\input-otp.tsx
      - src\components\ui\input.tsx
      - src\components\ui\label.tsx
      - src\components\ui\menubar.tsx
      - src\components\ui\navigation-menu.tsx
      - src\components\ui\pagination.tsx
      - src\components\ui\popover.tsx
      - src\components\ui\progress.tsx
      - src\components\ui\radio-group.tsx
      - src\components\ui\resizable.tsx
      - src\components\ui\scroll-area.tsx
      - src\components\ui\select.tsx
      - src\components\ui\separator.tsx
      - src\components\ui\sheet.tsx
      - src\components\ui\sidebar.tsx
      - src\components\ui\skeleton.tsx
      - src\components\ui\slider.tsx
      - src\components\ui\sonner.tsx
      - src\components\ui\switch.tsx
      - src\components\ui\table.tsx
      - src\components\ui\tabs.tsx
      - src\components\ui\textarea.tsx
      - src\components\ui\toast.tsx
      - src\components\ui\toaster.tsx
      - src\components\ui\toggle-group.tsx
      - src\components\ui\toggle.tsx
      - src\components\ui\tooltip.tsx
      - src\components\ui\use-toast.ts
  - src\contexts/
    - src\contexts\AuthContext.tsx
  - src\hooks/
    - src\hooks\use-mobile.tsx
    - src\hooks\use-toast.ts
    - src\hooks\useAI.ts
    - src\hooks\useExport.ts
    - src\hooks\useImages.ts
  - src\index.css
  - src\integrations/
    - src\integrations\supabase/
      - src\integrations\supabase\client.ts
      - src\integrations\supabase\types.ts
  - src\lib/
    - src\lib\supabaseStorage.ts
    - src\lib\utils.ts
  - src\main.tsx
  - src\pages/
    - src\pages\BookDetails.tsx
    - src\pages\ChapterDetail.tsx
    - src\pages\CreateBook.tsx
    - src\pages\Dashboard.tsx
    - src\pages\DocsOverview.tsx
    - src\pages\EditChapter.tsx
    - src\pages\Index.tsx
    - src\pages\Login.tsx
    - src\pages\NotFound.tsx
    - src\pages\Profile.tsx
    - src\pages\Statistics.tsx
  - src\services/
    - src\services\images.ts
  - src\types/
    - src\types\supabase.ts
  - src\vite-env.d.ts
- supabase/
  - supabase\config.toml
  - supabase\functions/
    - supabase\functions\ai-enrich/
      - supabase\functions\ai-enrich\index.ts
    - supabase\functions\ai-prompt/
      - supabase\functions\ai-prompt\index.ts
    - supabase\functions\export-book/
      - supabase\functions\export-book\index.ts
  - supabase\migrations/
    - supabase\migrations\20250725035324-0eb3bb9f-039e-40a6-a261-8e116c9e5431.sql
    - supabase\migrations\20250725040934-924ca003-ea3c-43f4-9230-385ffbdad2ac.sql
    - supabase\migrations\20250725041352-9a4e241e-b7df-4efa-a5a4-78b39d6c167b.sql
    - supabase\migrations\20250725041533-c1e55638-e7a7-4270-a5b9-a0c28a5c0b0e.sql
    - supabase\migrations\20250725041757-6e2b09ff-630a-47d4-82ce-453254049928.sql
    - supabase\migrations\20250725042044-fc3f42a5-f71b-4110-9529-f188f450b061.sql
    - supabase\migrations\20250726010549-256a5844-743c-48ef-b03e-b45a8062d7fa.sql
    - supabase\migrations\20250726012114-d491d548-6728-4824-84df-bb244d9984c6.sql
    - supabase\migrations\20250726012731-80a9627a-b3a6-4f48-b5ce-bbb656e296a1.sql
    - supabase\migrations\20250726013544-0f94d8fb-21a1-4dab-af33-a8bc04f6918c.sql
    - supabase\migrations\20250726013610-0b7fec21-ee2c-4971-ba19-32683cc524c6.sql
- tailwind.config.ts
- tsconfig.app.json
- tsconfig.json
- tsconfig.node.json
- vite.config.ts
```


## Conteúdo: package.json

```json
{
  "name": "vite_react_shadcn_ts",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "lint": "eslint .",
    "preview": "vite preview",
    "gen:audit": "node scripts/gen-audit.mjs",
    "checkpoint": "node scripts/checkpoint.mjs"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.9.0",
    "@radix-ui/react-accordion": "^1.2.0",
    "@radix-ui/react-alert-dialog": "^1.1.1",
    "@radix-ui/react-aspect-ratio": "^1.1.0",
    "@radix-ui/react-avatar": "^1.1.0",
    "@radix-ui/react-checkbox": "^1.1.1",
    "@radix-ui/react-collapsible": "^1.1.0",
    "@radix-ui/react-context-menu": "^2.2.1",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-dropdown-menu": "^2.1.1",
    "@radix-ui/react-hover-card": "^1.1.1",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-menubar": "^1.1.1",
    "@radix-ui/react-navigation-menu": "^1.2.0",
    "@radix-ui/react-popover": "^1.1.1",
    "@radix-ui/react-progress": "^1.1.0",
    "@radix-ui/react-radio-group": "^1.2.0",
    "@radix-ui/react-scroll-area": "^1.1.0",
    "@radix-ui/react-select": "^2.1.1",
    "@radix-ui/react-separator": "^1.1.0",
    "@radix-ui/react-slider": "^1.2.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-switch": "^1.1.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-toast": "^1.2.1",
    "@radix-ui/react-toggle": "^1.1.0",
    "@radix-ui/react-toggle-group": "^1.1.0",
    "@radix-ui/react-tooltip": "^1.1.4",
    "@supabase/supabase-js": "^2.52.0",
    "@tanstack/react-query": "^5.56.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.0.0",
    "date-fns": "^3.6.0",
    "embla-carousel-react": "^8.3.0",
    "input-otp": "^1.2.4",
    "lucide-react": "^0.462.0",
    "next-themes": "^0.3.0",
    "react": "^18.3.1",
    "react-day-picker": "^8.10.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.53.0",
    "react-quill": "^2.0.0",
    "react-resizable-panels": "^2.1.3",
    "react-router-dom": "^6.26.2",
    "recharts": "^2.12.7",
    "sonner": "^1.5.0",
    "tailwind-merge": "^2.5.2",
    "tailwindcss-animate": "^1.0.7",
    "vaul": "^0.9.3",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@eslint/js": "^9.9.0",
    "@tailwindcss/typography": "^0.5.15",
    "@types/node": "^22.5.5",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react-swc": "^3.5.0",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.9.0",
    "eslint-plugin-react-hooks": "^5.1.0-rc.0",
    "eslint-plugin-react-refresh": "^0.4.9",
    "globals": "^15.9.0",
    "lovable-tagger": "^1.1.7",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.11",
    "typescript": "^5.5.3",
    "typescript-eslint": "^8.0.1",
    "vite": "^5.4.1"
  }
}

```


## Conteúdo: vite.config.ts

```
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

```


## Conteúdo: tsconfig.json

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "noImplicitAny": false,
    "noUnusedParameters": false,
    "skipLibCheck": true,
    "allowJs": true,
    "noUnusedLocals": false,
    "strictNullChecks": false
  }
}

```


## Conteúdo: tailwind.config.ts

```
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

```


## Conteúdo: eslint.config.js

```
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "off",
    },
  }
);

```


## Conteúdo: postcss.config.js

```
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

```


## Lista: supabase/functions

- ai-enrich
- ai-prompt
- export-book


## Lista: supabase/migrations

- 20250725035324-0eb3bb9f-039e-40a6-a261-8e116c9e5431.sql
- 20250725040934-924ca003-ea3c-43f4-9230-385ffbdad2ac.sql
- 20250725041352-9a4e241e-b7df-4efa-a5a4-78b39d6c167b.sql
- 20250725041533-c1e55638-e7a7-4270-a5b9-a0c28a5c0b0e.sql
- 20250725041757-6e2b09ff-630a-47d4-82ce-453254049928.sql
- 20250725042044-fc3f42a5-f71b-4110-9529-f188f450b061.sql
- 20250726010549-256a5844-743c-48ef-b03e-b45a8062d7fa.sql
- 20250726012114-d491d548-6728-4824-84df-bb244d9984c6.sql
- 20250726012731-80a9627a-b3a6-4f48-b5ce-bbb656e296a1.sql
- 20250726013544-0f94d8fb-21a1-4dab-af33-a8bc04f6918c.sql
- 20250726013610-0b7fec21-ee2c-4971-ba19-32683cc524c6.sql


## Arquivos candidatos (capítulos/imagens)

- src\components\Chapters\ChapterForm.tsx
- src\components\Chapters\ChapterList.tsx
- src\components\Images\ImageEditor.tsx
- src\components\Images\ImageGallery.tsx
- src\components\Images\ImagePositioner.tsx
- src\components\Images\ImageRenderer.tsx
- src\components\Images\ImageRendererInline.tsx
- src\components\Images\ImageUpload.tsx
- src\hooks\useImages.ts
- src\pages\ChapterDetail.tsx
- src\pages\EditChapter.tsx
- src\services\images.ts
