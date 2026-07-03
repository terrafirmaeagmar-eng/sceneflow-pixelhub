# Pixel Hub SceneFlow — versão web

Preparação de cena 3D e produção de vídeo arquitetônico, 100% no navegador.

## Rodar localmente (requer Node.js 18+)

```bash
npm install
npm run dev
```

Abra o endereço mostrado (normalmente http://localhost:5173) no Chrome ou Edge.

## Publicar na web (recomendado — nenhuma instalação para os usuários)

**Vercel (mais simples):**
1. Suba esta pasta para um repositório no GitHub.
2. Em vercel.com → "Add New Project" → importe o repositório.
3. O Vercel detecta o Vite automaticamente — clique em Deploy.
4. Compartilhe o link (ex.: `sceneflow.vercel.app`) com a equipe e clientes.

**Netlify Drop (sem GitHub):**
1. Rode `npm run build` — a pasta `dist/` é gerada.
2. Arraste a pasta `dist/` em https://app.netlify.com/drop.

## Notas

- Os projetos são salvos no `localStorage` do navegador de cada usuário (salvamento automático a cada 20 s). Para backup durável ou troca entre máquinas, use **Exportar projeto (JSON)** no menu.
- A geometria de maquetes importadas (GLB/glTF/OBJ/ZIP) não persiste entre sessões — o app avisa e pede a reimportação; correções e transformações são reaplicadas.
- Convenções de honestidade da interface: sem carimbo = funciona de verdade; DEMONSTRAÇÃO = interface real com resultado simulado; FASE 2 = depende de backend (conversão SKP/DWG, render MP4/4K, colaboração).
- Arquitetura, modelo de dados e roadmap: ver `ARQUITETURA-E-ROADMAP.md`.
