# Pixel Hub SceneFlow — Arquitetura e Roadmap

Documento de acompanhamento do protótipo funcional (Fase 1). Registra o que foi construído e por quê, o que é real versus simulado, o modelo de dados alvo, a arquitetura de produção recomendada e o caminho para continuar o desenvolvimento no Claude Code.

---

## 1. Síntese do protótipo

O SceneFlow Fase 1 é um aplicativo React de arquivo único (`pixel-hub-sceneflow.jsx`) que roda inteiramente no navegador, sem nenhuma API externa. Ele cobre o núcleo do fluxo da Pixel Hub: receber uma maquete, diagnosticá-la e corrigi-la, ambientá-la com luz solar real, definir tomadas de câmera com trajetórias suaves, revisar num storyboard e exportar imagem e prévia de vídeo com a marca da empresa.

A decisão central de arquitetura foi **priorizar um núcleo pequeno e verdadeiro em vez de uma casca larga e falsa**. O ambiente de execução (Artifact) fornece Three.js r128 sem os loaders e controles oficiais; por isso os parsers de GLB/glTF, OBJ e ZIP e o controle orbital foram escritos do zero e validados contra os arquivos de amostra oficiais da Khronos (Box, BoxInterleaved com desentrelaçamento de byteStride, Duck, BoxTextured), além de OBJ sintético com quadriláteros e índices negativos e ZIP com deflate.

### O que funciona de verdade (sem carimbo na interface)

- Viewport 3D com renderização física (sRGB, tone mapping ACES/Reinhard/Cineon, sombras PCF com suavidade ajustável) e cena demonstrativa procedural "Residencial Horizonte" (terreno, viário com faixas, lotes, 10 edificações, comercial com letreiro, praça, lago, vegetação, postes com luz noturna real, pessoas, veículos, entorno).
- Navegação: órbita com amortecimento, caminhada em primeira pessoa (1,70 m), voo livre, vistas ortogonais topo/frente/lateral, foco por duplo clique, enquadramento (F), gizmo de eixos.
- Importação real de **GLB, glTF embutido, OBJ e ZIP** com parsers próprios: acessores com stride, materiais PBR com texturas embutidas, alpha blend/mask, hierarquia de nós, mensagens de erro específicas (Draco, buffers externos, versões).
- Diagnóstico da maquete: extensão, triângulos, objetos, materiais, texturas, distância da origem, geometrias reutilizadas, estimativa de desempenho, detecção de escala em milímetros e de coordenadas georreferenciadas distantes da origem — com correções de um clique (centralizar, apoiar no piso, corrigir escala, redefinir origem, gerar materiais básicos), sempre preservando o arquivo original.
- Ambientação: 11 presets, posição solar calculada por hora, dia do ano, latitude e norte do projeto (arco solar interativo), céu em shader com disco solar e estrelas, transição dia/noite que acende janelas, letreiros e postes, nuvens, névoa exponencial, exposição, comparação antes/depois segurando um botão, presets de cena salvos no projeto.
- Materiais: editor PBR completo (cor, rugosidade, metalicidade, opacidade, emissão, escala e rotação de textura quando existir mapa), biblioteca com 19 presets, aplicar a semelhantes por nome, restaurar original.
- Biblioteca de objetos procedurais (árvores em 3 variações, palmeira, arbusto, pessoas, veículos, poste, banco, lixeira, placa) com inserção por clique e **dispersão instanciada** (InstancedMesh — centenas de cópias com custo de uma).
- Câmeras e vídeo: tomada da vista atual, pontos-chave (tecla K), trajetória Catmull-Rom de posição e alvo, 5 curvas de suavização, FOV por tomada, visualização do percurso no viewport, 9 movimentos prontos (aérea, aproximação, órbita, travelling, caminhada, panorâmica, elevação, revelação, afastamento), timeline com blocos proporcionais, playhead, marcação A/B, reordenação, silenciar, reprodução em tempo real.
- **Diretor Pixel**: sequências determinísticas escaladas ao tamanho da cena e comandos em linguagem natural por regras locais ("30 segundos para Instagram ao pôr do sol, aéreo, mostrando a avenida" → duração, 9:16, ambientação, roteiro), com registro transparente de cada decisão.
- Storyboard com miniaturas renderizadas, status por tomada (rascunho → em revisão → ajustes → aprovado → exportado) e comentários locais.
- Saída: enquadramento **real** do canvas em 16:9, 9:16, 1:1 e 4:5; captura PNG e gravação **WebM** da timeline com logotipo, marca-d'água, vinheta e fades compostos no quadro; exportação JSON do projeto e do storyboard.
- Desempenho: HUD (fps, triângulos, draw calls, texturas, pixel ratio), 4 modos de qualidade, redução adaptativa de resolução durante a navegação com restauração automática.
- Persistência em cascata `window.storage` (artifact) → `localStorage` → memória, salvamento automático a cada 20 s, banner de restauração, desfazer/refazer por instantâneos (30 níveis).

### O que é interface real com resultado simulado — carimbo DEMONSTRAÇÃO

- Recebimento de SKP/DWG/DXF/IFC/FBX: o arquivo é validado e enfileirado de verdade pelo `ModelConversionAdapter` local, mas a fila termina explicitamente em "Aguardando backend — Fase 2". **Nenhuma conversão é anunciada como concluída.**
- Diretor Pixel: as regras são locais e determinísticas, não um modelo de linguagem.

### O que é apenas interface — carimbo FASE 2

MP4/H.264, 4K, fila de render na nuvem, bloom/DOF/AO/motion blur reais, otimização de malha, reprojeção de UVs, links de revisão com aprovação do cliente, comentários multiusuário, adaptadores Autodesk Platform Services e serviço de conversão próprio.

### Limitações reais e conscientes

1. **Geometria importada não persiste** entre sessões (limite de armazenamento do navegador). O projeto salva nome do arquivo, correções e transformações e avisa para reimportar; o JSON exportado é o caminho durável.
2. Pós-processamento limita-se a tone mapping, vinheta e fades compostos em 2D — bloom/DOF exigem EffectComposer ou pipeline offline (Fase 2).
3. A gravação WebM roda em tempo real: quedas de fps do navegador aparecem no vídeo. Isso é inerente ao `captureStream`; a solução definitiva é o render server da Fase 2, que consome exatamente o mesmo JSON de timeline.
4. Posição solar usa modelo simplificado (declinação + ângulo horário) — suficiente para direção de luz plausível; efemérides precisas ficam para a Fase 2.
5. Sem MTL para OBJ, sem Draco/KTX2, sem FBX nativo (roteado para a fila de conversão).
6. Colaboração e aprovação do cliente exigem backend.

---

## 2. Modelo de dados alvo (TypeScript)

Interfaces que o protótipo já espelha em JSON e que o backend deve materializar:

```ts
type ID = string;

interface User { id: ID; name: string; email: string; role: "admin" | "artista" | "revisor" | "cliente"; }
interface Client { id: ID; name: string; contact?: string; }

interface Project {
  id: ID; name: string; clientId: ID; venture?: string; ownerId: ID;
  location?: string; type: string; deadline?: string; notes?: string;
  geo: { lat: number; lng: number; northDeg: number; units: "m" | "cm" | "mm"; origin?: string };
  createdAt: string; importedAt?: string; firstPreviewAt?: string;
}
interface ProjectVersion { id: ID; projectId: ID; label: string; snapshot: unknown; createdAt: string; authorId: ID; }

interface ModelAsset {
  id: ID; projectId: ID; fileName: string; sourceFormat: "glb"|"gltf"|"obj"|"skp"|"dwg"|"dxf"|"ifc"|"fbx"|"zip";
  storageKey: string; sizeBytes: number;
  stats?: { meshes: number; triangles: number; materials: number; textures: number };
  diagnostics?: unknown; appliedFixes: string[]; status: "recebido"|"convertendo"|"pronto"|"erro";
}
interface ModelLayer { id: ID; assetId: ID; name: string; category: string; visible: boolean; }

interface Material {
  id: ID; projectId: ID; name: string; color: string; roughness: number; metalness: number;
  opacity: number; emissive: string; emissiveIntensity: number; mapRepeat?: number; mapRot?: number;
}
interface MaterialPreset extends Omit<Material, "projectId"> { scope: "global" | "empresa"; }

interface EnvironmentPreset {
  id: ID; name: string; hour: number; day: number; cloud: number; sunIntensity: number; ambient: number;
  exposure: number; fog: number; shadowSoft: number; shadowsOn: boolean; tone: "ACES"|"Reinhard"|"Cineon"|"Linear"; vignette: number;
}

interface SceneObject { id: ID; projectId: ID; name: string; category: string; libItem?: string; variant?: number;
  p: [number,number,number]; rY: number; s: number; visible: boolean;
  scatter?: { item: string; count: number; radius: number; center: {x:number;z:number}; variation: number; seed: number }; }

interface Camera { fov: number; near: number; far: number; }
interface CameraPath { keys: { p: [number,number,number]; t: [number,number,number] }[]; curve: "catmullrom-centripetal"; }
interface Shot {
  id: ID; projectId: ID; name: string; move: string; dur: number;
  ease: "linear"|"easeIn"|"easeOut"|"easeInOut"|"cinematic"; fov: number; rev: number;
  keys: CameraPath["keys"]; status: "rascunho"|"revisao"|"ajustes"|"aprovado"|"exportado";
  muted: boolean; comments: Comment[]; thumbKey?: string;
}
interface Timeline { projectId: ID; shotIds: ID[]; range?: [number, number]; loop: boolean; }

interface RenderPreset { id: ID; label: string; aspect: "16:9"|"9:16"|"1:1"|"4:5"; res: 720|1080|1440|2160;
  fps: 24|30|60; codec: "webm-realtime"|"h264"|"prores"; brand: { logoKey?: string; logoText?: string; watermark?: string; fades: boolean }; }
interface RenderJob { id: ID; projectId: ID; presetId: ID; timeline: Timeline; status: "fila"|"renderizando"|"pronto"|"erro";
  progress: number; outputKey?: string; workerId?: string; createdAt: string; }

interface Comment { id: ID; authorId: ID; text: string; at: string; resolved?: boolean; }
interface Approval { id: ID; projectId: ID; shotId?: ID; clientUserId: ID; decision: "aprovado"|"ajustes"; note?: string; at: string; }

interface ConversionJob { id: ID; assetId: ID; adapter: "aps"|"pixel"|"demo";
  status: "recebido"|"validando"|"fila"|"convertendo"|"pronto"|"aguardando-backend"|"erro"; message: string; progress?: number; }
```

---

## 3. Arquitetura de produção recomendada

```
Navegador (Next.js + React + TS + React Three Fiber)
   │  REST/WS
API (NestJS) ── PostgreSQL (Prisma) ── Redis (BullMQ)
   │                                     │
S3/R2 (maquetes, texturas, saídas)   Workers em contêiner
   │                                  ├─ conversão → glTF
CDN (entrega de prévias/vídeos)      └─ render → MP4/4K (FFmpeg)
```

- **Frontend**: migrar o arquivo único para Next.js + TypeScript + React Three Fiber/Drei (agora disponíveis fora do Artifact), mantendo o `SceneManager` como camada imperativa fina. O JSON de projeto do protótipo é o contrato — nada se perde.
- **API**: NestJS com Prisma sobre PostgreSQL; uploads assinados direto para S3/R2; WebSocket para progresso de filas e presença de revisores.
- **Filas**: BullMQ sobre Redis, com workers isolados por tipo de tarefa e escala horizontal.

**Conversão de formatos — comparação e decisão.** Duas rotas para SKP/DWG/RVT: (a) **Autodesk Platform Services (Model Derivative)** — cobre DWG/RVT/IFC com fidelidade alta e zero manutenção, mas cobra por conversão, exige nuvem Autodesk e não cobre SKP diretamente; (b) **pipeline próprio** — Blender headless (importadores SKP via extensão/FBX intermediário, DXF, OBJ, FBX) + IfcOpenShell (IFC) + ODA File Converter (DWG→DXF), exportando glTF com Draco. Recomendação: **começar pela rota própria para SKP/DXF/IFC/FBX** (o fluxo dominante da Pixel Hub vem do SketchUp) e **plugar APS como adaptador para DWG/RVT quando houver demanda** — a interface `ModelConversionAdapter` do protótipo já foi desenhada para conviver com ambos.

**Render — prévia e alta qualidade.** Fase 2: worker de **prévia determinística** usando o mesmo engine Three em Node (headless-gl ou Chromium headless via Puppeteer), renderizando quadro a quadro o mesmo JSON de timeline e muxando com FFmpeg em MP4 H.264 — resultado idêntico ao viewport, sem tempo real, com pós-processamento (bloom/DOF/AO via EffectComposer) habilitado. Fase 3: perfil de **alta qualidade** exportando a cena para Blender (Eevee para custo baixo, Cycles para fotorrealismo) com materiais mapeados dos presets.

---

## 4. Backlog

**Fase 2 — backend mínimo e fidelidade**
1. API + banco + storage + autenticação; projetos e versões persistidos com geometria.
2. Worker de conversão (SKP/DXF/IFC/FBX → glTF+Draco) atrás do `ModelConversionAdapter`; adaptador APS opcional para DWG/RVT.
3. Worker de render de prévia (mesmo engine, MP4, pós-processamento real) consumindo o JSON de timeline atual.
4. Draco/KTX2 no viewer; HDRI para reflexos; MTL de OBJ; efemérides solares precisas.
5. Gizmo de arrasto com alças (translação/rotação/escala visuais), alinhamento e distribuição de objetos.
6. Transições entre tomadas (corte/fusão), áudio-guia de duração.
7. Link de revisão com aprovação do cliente e comentários ancorados em tomada/objeto.

**Fase 3 — escala e produto**
8. Render 4K/ray tracing (Blender Cycles) com fila priorizada e estimativa de custo.
9. Biblioteca de assets de alta qualidade versionada (vegetação, pessoas animadas, veículos), materiais PBR com texturas reais.
10. Colaboração em tempo real (presença, edição concorrente), permissões por cliente.
11. Templates de vídeo por produto Pixel Hub com trilha e lettering; integração de entrega (links CDN, portais de cliente).
12. Telemetria do funil importação → primeira prévia → aprovação (as métricas já existem no protótipo).

---

## 5. Continuando no Claude Code

O protótipo foi escrito para ser dividido em módulos sem reescrita: os blocos numerados do arquivo (`parsers`, `SceneManager`, `Diretor`, `UI`) viram arquivos diretos.

1. Instale o Claude Code (requer Node.js): `npm install -g @anthropic-ai/claude-code`, depois rode `claude` na pasta do projeto. Documentação oficial: <https://docs.claude.com/en/docs/claude-code/overview>.
2. Crie o repositório com Vite ou Next + TypeScript, copie `pixel-hub-sceneflow.jsx` para `src/` e adicione um `CLAUDE.md` com as regras do produto — principalmente a convenção de honestidade (sem carimbo = real; DEMONSTRAÇÃO = simulado; FASE 2 = requer backend) e a proibição de anunciar conversões/renders inexistentes.
3. Prompts iniciais úteis:
   - "Divida pixel-hub-sceneflow.jsx em módulos TypeScript (parsers/, engine/SceneManager.ts, director/, ui/) preservando o comportamento; adicione tipos do ARQUITETURA-E-ROADMAP.md §2."
   - "Migre o SceneManager para React Three Fiber mantendo a API pública (applyEnv, makeMove, recordWebM) e os testes de parser."
   - "Implemente o worker de render de prévia: consuma o JSON de timeline exportado e gere MP4 com FFmpeg."
4. Os parsers têm testes reprodutíveis (amostras Khronos) — mantenha-os como testes de regressão antes de qualquer refatoração.
