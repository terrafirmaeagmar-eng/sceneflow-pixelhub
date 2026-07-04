// ============================================================================
// PIXEL HUB SCENEFLOW — protótipo funcional (Fase 1)
// Preparação de cena 3D + produção de vídeo arquitetônico
// React + Three.js r128 (sem loaders externos: parsers GLB/OBJ/ZIP próprios)
// ----------------------------------------------------------------------------
// Convenções de honestidade do protótipo:
//   • Tudo que funciona de verdade não tem carimbo.
//   • <Stamp>DEMONSTRAÇÃO</Stamp> = interface real, resultado simulado localmente.
//   • <Stamp>FASE 2</Stamp>       = requer backend/pipeline; apenas interface.
// ============================================================================

import React, { useState, useEffect, useRef, useReducer, useCallback, useMemo, memo } from "react";
import * as THREE from "three";
import {
  Play, Pause, SkipBack, SkipForward, Repeat, Camera, Video, Film, Save, Undo2, Redo2,
  Share2, Settings, Layers, Box, TreePine, Users, Car, Lightbulb, Import, Download, Upload,
  FolderOpen, Plus, X, Check, ChevronDown, ChevronRight, Eye, EyeOff, Trash2, Copy, Sparkles,
  Gauge, MapPin, Compass, HelpCircle, MessageSquare, Move, RotateCw, Maximize2, LayoutGrid,
  Sun, Moon, CloudSun, Sunrise, Sunset, Clock, Mountain, Route, Target, Crosshair, Aperture,
  Clapperboard, Image as ImageIcon, SlidersHorizontal, AlertTriangle, Info, CheckCircle2,
  Loader2, Palette, Star, StickyNote, Lamp, Armchair, PersonStanding, Search, Wand2, CircleDot,
  MonitorPlay, FileJson, Locate, Grid3x3, PenLine, Trees, Footprints, Diamond
} from "lucide-react";

// ============================================================================
// 0. TOKENS DE DESIGN + CSS
// ============================================================================
const CSS = `
:root{
  --bg0:#15171C; --bg1:#1B1E24; --bg2:#22262E; --bg3:#2A2F39; --bg4:#333945;
  --line:#31363F; --line2:#3D4450;
  --tx:#E9EBEE; --tx2:#9AA3B2; --tx3:#667080;
  --ok:#57BE8C; --warn:#E0B347; --err:#E2635C; --info:#6FA8DC;
  --accent:#F2A83C; --accent-ink:#1A1408;
  --mono:ui-monospace,'SF Mono','Cascadia Code',Consolas,'Roboto Mono',monospace;
  --sans:-apple-system,'Segoe UI',system-ui,Roboto,'Inter',sans-serif;
  --rad:6px; --rad-lg:10px;
}
*{box-sizing:border-box; scrollbar-width:thin; scrollbar-color:var(--bg4) transparent;}
::-webkit-scrollbar{width:9px;height:9px} ::-webkit-scrollbar-thumb{background:var(--bg4);border-radius:8px;border:2px solid var(--bg1)}
::-webkit-scrollbar-track{background:transparent}
.phsf{position:fixed;inset:0;display:flex;flex-direction:column;background:var(--bg0);color:var(--tx);
  font-family:var(--sans);font-size:12px;line-height:1.45;user-select:none;overflow:hidden;}
.phsf ::selection{background:var(--accent);color:var(--accent-ink)}
.phsf input,.phsf select,.phsf textarea{font-family:inherit;font-size:12px;color:var(--tx);background:var(--bg0);
  border:1px solid var(--line2);border-radius:var(--rad);padding:5px 8px;outline:none;min-width:0}
.phsf input:focus,.phsf select:focus,.phsf textarea:focus{border-color:var(--accent);box-shadow:0 0 0 2px color-mix(in srgb,var(--accent) 25%,transparent)}
.phsf input[type=range]{-webkit-appearance:none;appearance:none;height:22px;background:transparent;border:none;padding:0;box-shadow:none;cursor:ew-resize}
.phsf input[type=range]::-webkit-slider-runnable-track{height:3px;border-radius:2px;background:linear-gradient(to right,var(--accent) 0 var(--p,50%),var(--bg4) var(--p,50%) 100%)}
.phsf input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:12px;height:12px;margin-top:-4.5px;border-radius:50%;background:var(--tx);border:2px solid var(--bg1);box-shadow:0 0 0 1px var(--line2)}
.phsf input[type=range]:focus-visible::-webkit-slider-thumb{box-shadow:0 0 0 2px var(--accent)}
.phsf input[type=color]{padding:2px;width:34px;height:26px;cursor:pointer;background:var(--bg0)}
.phsf button{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit;font-size:12px}
.phsf button:focus-visible,.phsf [tabindex]:focus-visible{outline:2px solid var(--accent);outline-offset:1px;border-radius:4px}
.phsf button:disabled{opacity:.45;cursor:not-allowed}
.mono{font-family:var(--mono);font-size:11px;letter-spacing:.01em}
.seclabel{display:flex;align-items:center;gap:8px;margin:16px 2px 8px;color:var(--tx3);font-size:10px;font-weight:600;
  letter-spacing:.12em;text-transform:uppercase;white-space:nowrap}
.seclabel::after{content:"";flex:1;height:1px;background:var(--line)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:6px 11px;border-radius:var(--rad);
  background:var(--bg3);border:1px solid var(--line2);color:var(--tx);font-weight:500;white-space:nowrap;transition:background .12s,border-color .12s}
.btn:hover:not(:disabled){background:var(--bg4)}
.btn.primary{background:var(--accent);border-color:var(--accent);color:var(--accent-ink);font-weight:600}
.btn.primary:hover:not(:disabled){filter:brightness(1.08)}
.btn.ghost{background:transparent;border-color:transparent;color:var(--tx2)} .btn.ghost:hover:not(:disabled){background:var(--bg3);color:var(--tx)}
.btn.danger{color:var(--err)} .btn.danger:hover:not(:disabled){background:color-mix(in srgb,var(--err) 15%,var(--bg3))}
.btn.sm{padding:4px 8px;font-size:11px;gap:5px}
.iconbtn{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:var(--rad);color:var(--tx2);transition:background .12s,color .12s}
.iconbtn:hover:not(:disabled){background:var(--bg3);color:var(--tx)} .iconbtn.on{background:var(--bg3);color:var(--accent)}
.stamp{display:inline-flex;align-items:center;gap:4px;padding:1px 6px;border:1px dashed var(--tx3);border-radius:3px;
  color:var(--tx3);font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;line-height:1.6;vertical-align:middle}
.stamp.demo{border-color:var(--info);color:var(--info)} .stamp.f2{border-color:var(--warn);color:var(--warn)}
.chip{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:99px;background:var(--bg3);border:1px solid var(--line2);
  color:var(--tx2);font-size:11px;font-weight:500;transition:all .12s;cursor:pointer;white-space:nowrap}
.chip:hover{border-color:var(--tx3);color:var(--tx)} .chip.on{background:color-mix(in srgb,var(--accent) 18%,var(--bg3));border-color:var(--accent);color:var(--accent)}
.panel{background:var(--bg1);border:1px solid var(--line);display:flex;flex-direction:column;min-height:0}
.row{display:flex;align-items:center;gap:8px} .col{display:flex;flex-direction:column;gap:8px}
.field{display:grid;grid-template-columns:86px 1fr;align-items:center;gap:8px;margin:5px 0}
.field>label{color:var(--tx2);font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hint{color:var(--tx3);font-size:11px;line-height:1.5}
.kbd{font-family:var(--mono);font-size:10px;background:var(--bg3);border:1px solid var(--line2);border-bottom-width:2px;border-radius:4px;padding:0 5px;color:var(--tx2)}
.treerow{display:flex;align-items:center;gap:7px;padding:4px 8px 4px 10px;border-radius:5px;color:var(--tx2);cursor:pointer;position:relative}
.treerow:hover{background:var(--bg2);color:var(--tx)} .treerow .rowtools{display:none;margin-left:auto}
.treerow:hover .rowtools{display:flex;gap:2px}
.treerow.sel{background:color-mix(in srgb,var(--accent) 14%,var(--bg2));color:var(--tx)}
.treerow.sel::before{content:"";position:absolute;left:0;top:4px;bottom:4px;width:2px;border-radius:2px;background:var(--accent)}
.shotblk{position:relative;height:100%;border-radius:6px;background:var(--bg3);border:1px solid var(--line2);overflow:hidden;cursor:pointer;flex-shrink:0}
.shotblk:hover{border-color:var(--tx3)} .shotblk.sel{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}
.modalback{position:absolute;inset:0;background:rgba(10,11,14,.62);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;z-index:60}
.modal{background:var(--bg1);border:1px solid var(--line2);border-radius:var(--rad-lg);box-shadow:0 24px 60px rgba(0,0,0,.5);
  display:flex;flex-direction:column;max-height:88vh;min-height:0;animation:pop .16s ease}
@keyframes pop{from{transform:translateY(8px) scale(.985);opacity:0}}
.toast{display:flex;gap:9px;align-items:flex-start;background:var(--bg2);border:1px solid var(--line2);border-left:3px solid var(--info);
  border-radius:8px;padding:10px 12px;box-shadow:0 10px 30px rgba(0,0,0,.45);max-width:360px;animation:pop .18s ease;pointer-events:auto}
.dot{width:6px;height:6px;border-radius:50%;background:var(--tx3);flex-shrink:0}
.vpbtn{display:inline-flex;align-items:center;gap:6px;height:26px;padding:0 9px;border-radius:6px;background:rgba(21,23,28,.78);
  border:1px solid var(--line2);color:var(--tx2);font-size:11px;backdrop-filter:blur(6px)}
.vpbtn:hover{color:var(--tx);border-color:var(--tx3)} .vpbtn.on{color:var(--accent);border-color:var(--accent)}
.card{background:var(--bg2);border:1px solid var(--line);border-radius:var(--rad-lg);padding:12px}
@keyframes spin{to{transform:rotate(360deg)}} .spin{animation:spin 1s linear infinite}
@keyframes blink{50%{opacity:.25}} .rec{animation:blink 1.1s step-end infinite}
.fadein{animation:pop .2s ease}
@media (prefers-reduced-motion:reduce){.phsf *{animation:none!important;transition:none!important}}
`;

// ============================================================================
// 1. UTILITÁRIOS
// ============================================================================
let __uid = 0;
const uid = (p = "id") => `${p}-${Date.now().toString(36)}-${(++__uid).toString(36)}`;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const D2R = Math.PI / 180;
const fmtT = (s) => {
  if (!isFinite(s)) s = 0;
  const m = Math.floor(s / 60), ss = (s % 60);
  return `${String(m).padStart(2, "0")}:${ss < 10 ? "0" : ""}${ss.toFixed(1)}`;
};
const fmtBytes = (b) => b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${(b / 1024).toFixed(0)} KB`;
const fmtLen = (m, units) => units === "cm" ? `${(m * 100).toFixed(0)} cm` : units === "mm" ? `${(m * 1000).toFixed(0)} mm` : m >= 1000 ? `${(m / 1000).toFixed(2)} km` : `${m.toFixed(m < 10 ? 2 : 1)} m`;
function download(name, blobOrUrl) {
  const a = document.createElement("a");
  a.href = typeof blobOrUrl === "string" ? blobOrUrl : URL.createObjectURL(blobOrUrl);
  a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  if (typeof blobOrUrl !== "string") setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
const EASINGS = {
  linear: { label: "Linear", fn: (t) => t },
  easeIn: { label: "Acelerar", fn: (t) => t * t },
  easeOut: { label: "Desacelerar", fn: (t) => 1 - (1 - t) * (1 - t) },
  easeInOut: { label: "Suave", fn: (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2 },
  cinematic: { label: "Cinematográfico", fn: (t) => t * t * t * (t * (t * 6 - 15) + 10) },
};
const throttleTrail = (fn, ms) => {
  let t = 0, timer = null, lastArgs = null;
  return (...args) => {
    lastArgs = args;
    const now = performance.now();
    if (now - t >= ms) { t = now; fn(...args); }
    else if (!timer) timer = setTimeout(() => { timer = null; t = performance.now(); fn(...lastArgs); }, ms - (now - t));
  };
};

// ============================================================================
// 2. POSIÇÃO SOLAR (modelo simplificado — declinação + ângulo horário)
//    Suficiente para direção de luz plausível; efemérides precisas: Fase 2.
// ============================================================================
function sunPosition(hour, dayOfYear, latDeg, northDeg = 0) {
  const lat = latDeg * D2R;
  const decl = 23.44 * D2R * Math.sin((2 * Math.PI * (284 + dayOfYear)) / 365);
  const H = (hour - 12) * 15 * D2R;
  const elev = Math.asin(Math.sin(lat) * Math.sin(decl) + Math.cos(lat) * Math.cos(decl) * Math.cos(H));
  let az = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(lat) - Math.tan(decl) * Math.cos(lat)) + Math.PI; // 0 = Norte
  az += northDeg * D2R; // norte do projeto
  return { elev, az, elevDeg: elev / D2R, azDeg: ((az / D2R) % 360 + 360) % 360 };
}

// ============================================================================
// 3. ARMAZENAMENTO — adaptador (window.storage do Artifact → localStorage → memória)
// ============================================================================
const Store = (() => {
  const mem = new Map();
  const hasWS = typeof window !== "undefined" && window.storage && typeof window.storage.get === "function";
  let hasLS = false;
  try { localStorage.setItem("__phsf", "1"); localStorage.removeItem("__phsf"); hasLS = true; } catch (e) { /* indisponível */ }
  const backend = hasWS ? "artifact" : hasLS ? "local" : "memoria";
  return {
    backend,
    persistent: hasWS || hasLS,
    async get(key) {
      try {
        if (hasWS) { const r = await window.storage.get(key); return r ? r.value : null; }
        if (hasLS) return localStorage.getItem(key);
      } catch (e) { return mem.get(key) ?? null; }
      return mem.get(key) ?? null;
    },
    async set(key, value) {
      try {
        if (hasWS) { await window.storage.set(key, value); return true; }
        if (hasLS) { localStorage.setItem(key, value); return true; }
      } catch (e) { mem.set(key, value); return false; }
      mem.set(key, value); return false;
    },
    async del(key) {
      try {
        if (hasWS) await window.storage.delete(key);
        else if (hasLS) localStorage.removeItem(key);
      } catch (e) { /* ok */ }
      mem.delete(key);
    },
  };
})();
const SAVE_KEY = "phsf:projeto:v1";
const CLOUD_KEY = "phsf:nuvem:v1";

// ============================================================================
// 3b. NUVEM (Fase 2) — cliente da SceneFlow API (servidor Node próprio)
// ============================================================================
async function apiReq(cfg, path, { method = "GET", json, body, headers = {}, pub = false, asBlob = false } = {}) {
  const base = String(cfg.url || "").replace(/\/+$/, "");
  const h = { ...headers };
  if (!pub) h["X-PH-Key"] = cfg.key || "";
  if (json !== undefined) { h["Content-Type"] = "application/json"; body = JSON.stringify(json); }
  let r;
  try { r = await fetch(base + path, { method, headers: h, body }); }
  catch (e) { throw new Error("Servidor inacessível — confira a URL da API e se o serviço está no ar."); }
  if (!r.ok) {
    let msg = null;
    try { msg = (await r.json()).error; } catch (e) { /* corpo não-JSON */ }
    throw new Error(msg || `Erro ${r.status} na API.`);
  }
  if (asBlob) return r.arrayBuffer();
  const ct = r.headers.get("content-type") || "";
  return ct.includes("json") ? r.json() : r.text();
}
function parseReviewLink() {
  try {
    const q = new URLSearchParams(window.location.search);
    const token = q.get("review"), api = q.get("api");
    return token && api ? { token, api: decodeURIComponent(api) } : null;
  } catch (e) { return null; }
}

// ============================================================================
// 4. PARSERS DE IMPORTAÇÃO (GLB/glTF, OBJ, ZIP) — testados contra amostras Khronos
// ============================================================================
const COMP = {
  5120: { arr: Int8Array, size: 1 }, 5121: { arr: Uint8Array, size: 1 },
  5122: { arr: Int16Array, size: 2 }, 5123: { arr: Uint16Array, size: 2 },
  5125: { arr: Uint32Array, size: 4 }, 5126: { arr: Float32Array, size: 4 },
};
const ITEM = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT2: 4, MAT3: 9, MAT4: 16 };
function decodeDataURI(uri) {
  const m = /^data:(.*?)(;base64)?,(.*)$/.exec(uri);
  if (!m) return null;
  if (m[2]) {
    const bin = atob(m[3]); const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return { mime: m[1], bytes: out };
  }
  return { mime: m[1], bytes: new TextEncoder().encode(decodeURIComponent(m[3])) };
}

async function parseGLTF(arrayBuffer, opts = {}) {
  const warnings = [];
  const stats = { meshes: 0, triangles: 0, materials: 0, textures: 0, nodes: 0, animations: 0 };
  let json, bin = null;
  const dv = new DataView(arrayBuffer);
  if (arrayBuffer.byteLength >= 12 && dv.getUint32(0, true) === 0x46546c67) {
    const version = dv.getUint32(4, true);
    if (version !== 2) throw new Error(`GLB versão ${version} não suportada (esperado 2.0).`);
    let offset = 12;
    while (offset < arrayBuffer.byteLength) {
      const len = dv.getUint32(offset, true);
      const type = dv.getUint32(offset + 4, true);
      const chunk = arrayBuffer.slice(offset + 8, offset + 8 + len);
      if (type === 0x4e4f534a) json = JSON.parse(new TextDecoder().decode(chunk));
      else if (type === 0x004e4942) bin = chunk;
      offset += 8 + len + (len % 4 ? 4 - (len % 4) : 0);
    }
    if (!json) throw new Error("GLB sem chunk JSON.");
  } else {
    json = JSON.parse(new TextDecoder().decode(arrayBuffer));
  }
  const required = json.extensionsRequired || [];
  if (required.includes("KHR_draco_mesh_compression"))
    throw new Error("Este glTF usa compressão Draco. O decodificador está previsto para a Fase 2 — exporte sem Draco por enquanto.");
  if (required.length) warnings.push(`Extensões obrigatórias não suportadas: ${required.join(", ")} (resultado pode variar).`);
  const used = json.extensionsUsed || [];
  const buffers = (json.buffers || []).map((b, i) => {
    if (b.uri) {
      const d = decodeDataURI(b.uri);
      if (!d) throw new Error(`Buffer ${i} referencia arquivo externo "${b.uri}". Use GLB (binário único) ou um ZIP com o conjunto completo.`);
      return d.bytes.byteLength === d.bytes.buffer.byteLength ? d.bytes.buffer : d.bytes.slice().buffer;
    }
    if (!bin) throw new Error("Buffer binário ausente.");
    return bin;
  });
  const bufferViews = json.bufferViews || [];
  const viewBytes = (i) => { const bv = bufferViews[i]; return new Uint8Array(buffers[bv.buffer], bv.byteOffset || 0, bv.byteLength); };
  function readAccessor(index) {
    const acc = json.accessors[index];
    if (acc.sparse) warnings.push('Accessor "sparse" ignorado (dados base usados).');
    const comp = COMP[acc.componentType];
    const itemSize = ITEM[acc.type];
    const count = acc.count;
    if (acc.bufferView === undefined) return { array: new comp.arr(count * itemSize), itemSize, normalized: !!acc.normalized };
    const bv = bufferViews[acc.bufferView];
    const buf = buffers[bv.buffer];
    const byteOffset = (bv.byteOffset || 0) + (acc.byteOffset || 0);
    const stride = bv.byteStride;
    if (stride && stride !== itemSize * comp.size) {
      const strideElems = stride / comp.size;
      const src = new comp.arr(buf, byteOffset, strideElems * (count - 1) + itemSize);
      const out = new comp.arr(count * itemSize);
      for (let i = 0; i < count; i++)
        for (let j = 0; j < itemSize; j++) out[i * itemSize + j] = src[i * strideElems + j];
      return { array: out, itemSize, normalized: !!acc.normalized };
    }
    const array = new comp.arr(buf, byteOffset, count * itemSize);
    return { array: array.slice(), itemSize, normalized: !!acc.normalized };
  }
  const canImg = typeof createImageBitmap === "function" && typeof Blob !== "undefined";
  const texCache = new Map(); const texPromises = [];
  function getTexture(texInfo, sRGB) {
    if (!texInfo || texInfo.index === undefined) return null;
    if ((texInfo.texCoord || 0) !== 0) { warnings.push("Textura usa TEXCOORD_1 (ignorada no protótipo)."); return null; }
    const key = `${texInfo.index}:${sRGB ? 1 : 0}`;
    if (texCache.has(key)) return texCache.get(key);
    const texDef = (json.textures || [])[texInfo.index]; if (!texDef) return null;
    const img = (json.images || [])[texDef.source]; if (!img) return null;
    let bytes = null, mime = img.mimeType || "image/png";
    if (img.bufferView !== undefined) bytes = viewBytes(img.bufferView);
    else if (img.uri) {
      const d = decodeDataURI(img.uri);
      if (!d) { warnings.push(`Imagem externa "${img.uri}" não carregada (use GLB).`); return null; }
      bytes = d.bytes; mime = d.mime || mime;
    }
    if (!bytes || !canImg) { if (!canImg) warnings.push("Ambiente sem decodificação de imagens — texturas ignoradas."); return null; }
    const tex = new THREE.Texture();
    tex.flipY = false;
    if (sRGB) tex.encoding = THREE.sRGBEncoding;
    const sampler = (json.samplers || [])[texDef.sampler] || {};
    const wrap = (w) => (w === 33071 ? THREE.ClampToEdgeWrapping : w === 33648 ? THREE.MirroredRepeatWrapping : THREE.RepeatWrapping);
    tex.wrapS = wrap(sampler.wrapS); tex.wrapT = wrap(sampler.wrapT);
    if (sampler.magFilter === 9728) tex.magFilter = THREE.NearestFilter;
    texPromises.push(createImageBitmap(new Blob([bytes], { type: mime }))
      .then((bmp) => { tex.image = bmp; tex.needsUpdate = true; })
      .catch(() => warnings.push("Falha ao decodificar uma textura embutida.")));
    stats.textures++;
    texCache.set(key, tex);
    return tex;
  }
  const matCache = new Map();
  function getMaterial(index) {
    if (index === undefined) {
      if (!matCache.has("default")) matCache.set("default", new THREE.MeshStandardMaterial({ color: 0xb8bcc2, roughness: 0.85, metalness: 0.05, name: "Material padrão" }));
      return matCache.get("default");
    }
    if (matCache.has(index)) return matCache.get(index);
    const def = (json.materials || [])[index] || {};
    const pbr = def.pbrMetallicRoughness || {};
    const unlit = def.extensions && def.extensions.KHR_materials_unlit;
    let mat;
    if (unlit) mat = new THREE.MeshBasicMaterial();
    else {
      mat = new THREE.MeshStandardMaterial();
      mat.metalness = pbr.metallicFactor !== undefined ? pbr.metallicFactor : 1;
      mat.roughness = pbr.roughnessFactor !== undefined ? pbr.roughnessFactor : 1;
      const mr = getTexture(pbr.metallicRoughnessTexture, false);
      if (mr) { mat.metalnessMap = mr; mat.roughnessMap = mr; }
      if (def.normalTexture) {
        const nt = getTexture(def.normalTexture, false);
        if (nt) { mat.normalMap = nt; if (def.normalTexture.scale !== undefined) mat.normalScale = new THREE.Vector2(def.normalTexture.scale, def.normalTexture.scale); }
      }
      if (def.emissiveFactor) mat.emissive = new THREE.Color().fromArray(def.emissiveFactor);
      const et = getTexture(def.emissiveTexture, true);
      if (et) mat.emissiveMap = et;
      if (def.occlusionTexture) warnings.push("Mapa de oclusão (AO) ignorado no protótipo.");
      if (opts.viewerFriendly !== false && !mat.metalnessMap && mat.metalness > 0.9) {
        mat.metalness = 0.6;
        warnings.push(`Material "${def.name || index}": metalness reduzida para pré-visualização sem HDRI.`);
      }
    }
    if (pbr.baseColorFactor) {
      mat.color = new THREE.Color().fromArray(pbr.baseColorFactor);
      if (pbr.baseColorFactor[3] !== undefined && pbr.baseColorFactor[3] < 1) mat.opacity = pbr.baseColorFactor[3];
    }
    const bct = getTexture(pbr.baseColorTexture, true);
    if (bct) mat.map = bct;
    if (def.alphaMode === "BLEND") { mat.transparent = true; mat.depthWrite = false; }
    else if (def.alphaMode === "MASK") mat.alphaTest = def.alphaCutoff !== undefined ? def.alphaCutoff : 0.5;
    if (def.doubleSided) mat.side = THREE.DoubleSide;
    mat.name = def.name || `Material ${index}`;
    matCache.set(index, mat);
    stats.materials++;
    return mat;
  }
  const meshCache = new Map();
  function buildMesh(index) {
    if (meshCache.has(index)) return meshCache.get(index).clone();
    const def = json.meshes[index];
    const group = new THREE.Group();
    group.name = def.name || `Malha ${index}`;
    for (const prim of def.primitives || []) {
      const mode = prim.mode === undefined ? 4 : prim.mode;
      if (mode !== 4) { warnings.push(`Primitiva de modo ${mode} (não-triângulos) ignorada.`); continue; }
      const attrs = prim.attributes || {};
      if (attrs.POSITION === undefined) { warnings.push("Primitiva sem POSITION ignorada."); continue; }
      const geo = new THREE.BufferGeometry();
      const map = { POSITION: "position", NORMAL: "normal", TEXCOORD_0: "uv", COLOR_0: "color", TANGENT: "tangent" };
      for (const [k, attr] of Object.entries(map)) {
        if (attrs[k] !== undefined) {
          const a = readAccessor(attrs[k]);
          geo.setAttribute(attr, new THREE.BufferAttribute(a.array, a.itemSize, a.normalized));
        }
      }
      if (prim.indices !== undefined) {
        const a = readAccessor(prim.indices);
        geo.setIndex(new THREE.BufferAttribute(a.array, 1));
        stats.triangles += a.array.length / 3;
      } else stats.triangles += geo.attributes.position.count / 3;
      if (!geo.attributes.normal) geo.computeVertexNormals();
      const mat = getMaterial(prim.material);
      if (geo.attributes.color) mat.vertexColors = true;
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = true; mesh.receiveShadow = true;
      mesh.name = group.name;
      group.add(mesh);
      stats.meshes++;
    }
    meshCache.set(index, group);
    return group;
  }
  function buildNode(index) {
    const def = json.nodes[index];
    stats.nodes++;
    const obj = def.mesh !== undefined ? buildMesh(def.mesh) : new THREE.Group();
    obj.name = def.name || obj.name || `Nó ${index}`;
    if (def.matrix) new THREE.Matrix4().fromArray(def.matrix).decompose(obj.position, obj.quaternion, obj.scale);
    else {
      if (def.translation) obj.position.fromArray(def.translation);
      if (def.rotation) obj.quaternion.fromArray(def.rotation);
      if (def.scale) obj.scale.fromArray(def.scale);
    }
    if (def.camera !== undefined) warnings.push(`Câmera "${obj.name}" do arquivo não importada — crie tomadas no SceneFlow.`);
    for (const c of def.children || []) obj.add(buildNode(c));
    return obj;
  }
  const root = new THREE.Group();
  root.name = "glTF";
  const sceneDef = (json.scenes || [])[json.scene || 0];
  const rootNodes = sceneDef ? sceneDef.nodes || [] : (json.nodes || []).map((_, i) => i);
  for (const n of rootNodes) root.add(buildNode(n));
  stats.animations = (json.animations || []).length;
  if (stats.animations) warnings.push(`${stats.animations} animação(ões) do glTF não importadas nesta versão.`);
  if (used.includes("KHR_texture_transform")) warnings.push("KHR_texture_transform ignorado (escala/rotação de UV pode diferir).");
  stats.triangles = Math.round(stats.triangles);
  await Promise.all(texPromises);
  return { root, warnings, stats, generator: json.asset && json.asset.generator };
}

function parseOBJ(text) {
  const warnings = [];
  const v = [], vt = [], vn = [];
  const groups = [];
  let cur = null, hasNormals = false, mtlRef = null;
  const start = (name, material) => { cur = { name: name || `Objeto ${groups.length + 1}`, material: material || (cur && cur.material) || null, pos: [], uv: [], nor: [] }; groups.push(cur); };
  start("Objeto 1", null);
  const idx = (i, arrLen) => (i < 0 ? arrLen + i : i - 1);
  const lines = text.split(/\r?\n/);
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li].trim();
    if (!line || line[0] === "#") continue;
    const parts = line.split(/\s+/);
    const key = parts[0];
    if (key === "v") v.push(+parts[1], +parts[2], +parts[3]);
    else if (key === "vt") vt.push(+parts[1], +parts[2]);
    else if (key === "vn") { vn.push(+parts[1], +parts[2], +parts[3]); hasNormals = true; }
    else if (key === "o" || key === "g") { if (cur.pos.length) start(parts.slice(1).join(" "), cur.material); else cur.name = parts.slice(1).join(" ") || cur.name; }
    else if (key === "usemtl") { const m = parts.slice(1).join(" "); if (cur.pos.length && cur.material !== m) start(cur.name, m); else cur.material = m; }
    else if (key === "mtllib") mtlRef = parts.slice(1).join(" ");
    else if (key === "f") {
      const verts = parts.slice(1).map((p) => {
        const [a, b, c] = p.split("/");
        return { v: idx(+a, v.length / 3), t: b ? idx(+b, vt.length / 2) : -1, n: c ? idx(+c, vn.length / 3) : -1 };
      });
      for (let i = 1; i < verts.length - 1; i++) {
        for (const w of [verts[0], verts[i], verts[i + 1]]) {
          cur.pos.push(v[w.v * 3], v[w.v * 3 + 1], v[w.v * 3 + 2]);
          if (w.t >= 0) cur.uv.push(vt[w.t * 2], vt[w.t * 2 + 1]); else cur.uv.push(0, 0);
          if (w.n >= 0) cur.nor.push(vn[w.n * 3], vn[w.n * 3 + 1], vn[w.n * 3 + 2]);
        }
      }
    }
  }
  const palette = [0xb8bcc2, 0xc9b294, 0x9db3a4, 0xb59a9a, 0x8fa3b8, 0xc2b8a3, 0xa3a8b8];
  const mats = new Map();
  const materialFor = (name) => {
    const key = name || "__default";
    if (!mats.has(key)) {
      let h = 0; for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
      mats.set(key, new THREE.MeshStandardMaterial({ color: palette[h % palette.length], roughness: 0.85, metalness: 0.05, name: name || "Material padrão" }));
    }
    return mats.get(key);
  };
  const root = new THREE.Group();
  root.name = "OBJ";
  let triangles = 0, meshes = 0;
  for (const g of groups) {
    if (!g.pos.length) continue;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(g.pos, 3));
    if (g.uv.length === (g.pos.length / 3) * 2) geo.setAttribute("uv", new THREE.Float32BufferAttribute(g.uv, 2));
    if (g.nor.length === g.pos.length) geo.setAttribute("normal", new THREE.Float32BufferAttribute(g.nor, 3));
    else geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, materialFor(g.material));
    mesh.name = g.name;
    mesh.castShadow = true; mesh.receiveShadow = true;
    root.add(mesh);
    triangles += g.pos.length / 9; meshes++;
  }
  if (!hasNormals) warnings.push("OBJ sem normais — normais recalculadas automaticamente.");
  if (mtlRef) warnings.push(`Materiais de "${mtlRef}" não carregados (pipeline de MTL: Fase 2) — cores neutras por usemtl.`);
  return { root, warnings, stats: { meshes, triangles: Math.round(triangles), materials: mats.size, textures: 0, nodes: meshes, animations: 0 } };
}

async function listZip(arrayBuffer) {
  const dv = new DataView(arrayBuffer);
  const u8 = new Uint8Array(arrayBuffer);
  let eocd = -1;
  for (let i = arrayBuffer.byteLength - 22; i >= Math.max(0, arrayBuffer.byteLength - 22 - 65535); i--) {
    if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error("ZIP inválido (diretório central não encontrado).");
  const count = dv.getUint16(eocd + 10, true);
  let off = dv.getUint32(eocd + 16, true);
  const entries = [];
  const td = new TextDecoder();
  for (let i = 0; i < count; i++) {
    if (dv.getUint32(off, true) !== 0x02014b50) break;
    const method = dv.getUint16(off + 10, true);
    const compSize = dv.getUint32(off + 20, true);
    const rawSize = dv.getUint32(off + 24, true);
    const nameLen = dv.getUint16(off + 28, true);
    const extraLen = dv.getUint16(off + 30, true);
    const commentLen = dv.getUint16(off + 32, true);
    const localOff = dv.getUint32(off + 42, true);
    const name = td.decode(u8.subarray(off + 46, off + 46 + nameLen));
    entries.push({
      name, size: rawSize, method,
      async getData() {
        const ldv = new DataView(arrayBuffer, localOff);
        if (ldv.getUint32(0, true) !== 0x04034b50) throw new Error("Entrada ZIP corrompida.");
        const ln = ldv.getUint16(26, true), le = ldv.getUint16(28, true);
        const dataStart = localOff + 30 + ln + le;
        const comp = u8.subarray(dataStart, dataStart + compSize);
        if (method === 0) return comp.slice();
        if (method === 8) {
          if (typeof DecompressionStream === "undefined") throw new Error("Navegador sem DecompressionStream — extraia o ZIP e envie o modelo diretamente.");
          const stream = new Blob([comp]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
          return new Uint8Array(await new Response(stream).arrayBuffer());
        }
        throw new Error(`Método de compressão ${method} não suportado.`);
      },
    });
    off += 46 + nameLen + extraLen + commentLen;
  }
  return entries.filter((e) => !e.name.endsWith("/"));
}

// ============================================================================
// 5. ADAPTADORES DE CONVERSÃO (SKP/DWG/DXF/IFC/FBX → glTF)
//    Interface real + implementação de demonstração. Nenhuma conversão é
//    declarada como concluída sem backend.
// ============================================================================
/**
 * interface ModelConversionAdapter {
 *   id: string; label: string; available: boolean;
 *   submit(job: ConversionJob, onProgress: (job) => void): Promise<ConversionJob>;
 * }
 */
const ConversionAdapters = {
  demo: {
    id: "demo", label: "Validação local (demonstração)", available: true,
    async submit(job, onProgress) {
      const steps = [
        ["recebido", "Arquivo recebido", 400],
        ["validando", "Validando cabeçalho e estrutura", 900],
        ["fila", "Posicionado na fila de conversão", 800],
      ];
      for (const [status, msg, ms] of steps) {
        await new Promise((r) => setTimeout(r, ms));
        onProgress({ ...job, status, message: msg });
      }
      return { ...job, status: "aguardando-backend", message: "Validado. A conversão real para glTF requer o serviço de backend (Fase 2)." };
    },
  },
  aps: {
    id: "aps", label: "Autodesk Platform Services", available: false, stamp: "FASE 2",
    async submit(job) { return { ...job, status: "indisponivel", message: "Integração APS (Model Derivative) prevista para a Fase 2." }; },
  },
  pixel: {
    id: "pixel", label: "Serviço de conversão Pixel Hub", available: false, stamp: "FASE 2",
    async submit(job) { return { ...job, status: "indisponivel", message: "Worker próprio (Blender headless/IfcOpenShell/ODA) previsto para a Fase 2." }; },
  },
};
const NATIVE_EXTS = ["glb", "gltf", "obj", "zip"];
const CONVERT_EXTS = ["skp", "dwg", "dxf", "ifc", "fbx", "dae", "rvt", "nwd", "3ds", "stl", "kml", "kmz", "geojson", "las", "laz", "dem", "tif"];

// ============================================================================
// 6. CATÁLOGOS — presets de ambiente, materiais, biblioteca, Pixel Hub
// ============================================================================
const ENV_DEFAULT = {
  preset: "meiodia", hour: 10.5, day: 172, cloud: 0.12, sunIntensity: 1.0, ambient: 0.55,
  exposure: 1.0, fog: 0.16, shadowSoft: 0.35, shadowsOn: true, tone: "ACES", vignette: 0,
};
const ENV_PRESETS = [
  { id: "manha", label: "Manhã", icon: Sunrise, p: { hour: 7.4, cloud: 0.18, sunIntensity: 0.95, ambient: 0.55, exposure: 1.02, fog: 0.3, shadowSoft: 0.45 } },
  { id: "meiodia", label: "Meio-dia", icon: Sun, p: { hour: 12, cloud: 0.08, sunIntensity: 1.1, ambient: 0.6, exposure: 1.0, fog: 0.1, shadowSoft: 0.2 } },
  { id: "fimtarde", label: "Fim de tarde", icon: Sunset, p: { hour: 17.6, cloud: 0.22, sunIntensity: 1.0, ambient: 0.45, exposure: 1.05, fog: 0.32, shadowSoft: 0.5 } },
  { id: "noite", label: "Noite", icon: Moon, p: { hour: 20.8, cloud: 0.15, sunIntensity: 0.9, ambient: 0.5, exposure: 1.15, fog: 0.22, shadowSoft: 0.5 } },
  { id: "nublado", label: "Nublado", icon: CloudSun, p: { hour: 13, cloud: 0.9, sunIntensity: 0.75, ambient: 0.85, exposure: 0.98, fog: 0.42, shadowSoft: 0.85 } },
  { id: "ensolarado", label: "Ensolarado", icon: Sun, p: { hour: 10.2, cloud: 0.03, sunIntensity: 1.2, ambient: 0.55, exposure: 1.02, fog: 0.06, shadowSoft: 0.15 } },
  { id: "dramatico", label: "Dramático", icon: Mountain, p: { hour: 17.9, cloud: 0.55, sunIntensity: 1.25, ambient: 0.3, exposure: 1.0, fog: 0.5, shadowSoft: 0.3 } },
  { id: "institucional", label: "Institucional", icon: Diamond, p: { hour: 10, cloud: 0.25, sunIntensity: 0.95, ambient: 0.75, exposure: 1.0, fog: 0.14, shadowSoft: 0.55 } },
  { id: "comercial", label: "Comercial", icon: Star, p: { hour: 15.5, cloud: 0.1, sunIntensity: 1.15, ambient: 0.65, exposure: 1.08, fog: 0.1, shadowSoft: 0.3 } },
  { id: "natural", label: "Natural", icon: Trees, p: { hour: 9, cloud: 0.3, sunIntensity: 0.95, ambient: 0.6, exposure: 0.98, fog: 0.26, shadowSoft: 0.5 } },
  { id: "cinematografico", label: "Cinematográfico", icon: Clapperboard, p: { hour: 18.15, cloud: 0.35, sunIntensity: 1.1, ambient: 0.32, exposure: 1.06, fog: 0.44, shadowSoft: 0.4, vignette: 0.35 } },
];
const MATERIAL_PRESETS = [
  { id: "concreto", label: "Concreto", color: "#b9b6ae", roughness: 0.92, metalness: 0.02 },
  { id: "concreto-polido", label: "Concreto polido", color: "#c9c6bf", roughness: 0.45, metalness: 0.05 },
  { id: "vidro", label: "Vidro", color: "#9fc4d4", roughness: 0.06, metalness: 0.15, opacity: 0.32 },
  { id: "madeira", label: "Madeira", color: "#8a5a38", roughness: 0.68, metalness: 0.0 },
  { id: "pedra", label: "Pedra", color: "#8d8a82", roughness: 0.88, metalness: 0.02 },
  { id: "asfalto", label: "Asfalto", color: "#3b3d40", roughness: 0.96, metalness: 0.0 },
  { id: "intertravado", label: "Piso intertravado", color: "#9d9289", roughness: 0.85, metalness: 0.0 },
  { id: "grama", label: "Grama", color: "#5f8b4c", roughness: 0.95, metalness: 0.0 },
  { id: "solo", label: "Solo", color: "#8a6f52", roughness: 0.95, metalness: 0.0 },
  { id: "agua", label: "Água", color: "#2a6b7c", roughness: 0.12, metalness: 0.85, opacity: 0.92 },
  { id: "metal", label: "Metal", color: "#9aa2ab", roughness: 0.3, metalness: 0.92 },
  { id: "pintura-branca", label: "Pintura branca", color: "#e9e5da", roughness: 0.75, metalness: 0.0 },
  { id: "pintura-areia", label: "Pintura areia", color: "#dccdb0", roughness: 0.78, metalness: 0.0 },
  { id: "pintura-terracota", label: "Pintura terracota", color: "#c07a5b", roughness: 0.8, metalness: 0.0 },
  { id: "telha-ceramica", label: "Telha cerâmica", color: "#96543f", roughness: 0.82, metalness: 0.0 },
  { id: "telha-concreto", label: "Telha de concreto", color: "#7d7a74", roughness: 0.9, metalness: 0.0 },
  { id: "revestimento", label: "Revest. arquitetônico", color: "#b5a48e", roughness: 0.6, metalness: 0.05 },
  { id: "emissivo", label: "Painel luminoso", color: "#ffffff", roughness: 0.4, metalness: 0.0, emissive: "#ffd9a0", emissiveIntensity: 1.4 },
];
const PROJECT_TYPES = ["Arquitetura residencial", "Arquitetura comercial", "Loteamento", "Condomínio", "Projeto urbano", "Empreendimento turístico", "Infraestrutura", "Evento", "Apresentação institucional"];
const ASPECTS = { "16:9": 16 / 9, "9:16": 9 / 16, "1:1": 1, "4:5": 4 / 5 };
const LIBRARY = [
  { id: "arvore", label: "Árvore", icon: TreePine, cat: "Áreas verdes", variants: 3, scatter: true },
  { id: "palmeira", label: "Palmeira", icon: TreePine, cat: "Áreas verdes", variants: 1, scatter: true },
  { id: "arbusto", label: "Arbusto", icon: Trees, cat: "Áreas verdes", variants: 2, scatter: true },
  { id: "pessoa", label: "Pessoa", icon: PersonStanding, cat: "Pessoas", variants: 4, scatter: true },
  { id: "carro", label: "Veículo", icon: Car, cat: "Veículos", variants: 5 },
  { id: "poste", label: "Poste de luz", icon: Lamp, cat: "Mobiliário urbano", variants: 1 },
  { id: "banco", label: "Banco de praça", icon: Armchair, cat: "Mobiliário urbano", variants: 1 },
  { id: "lixeira", label: "Lixeira", icon: Trash2, cat: "Mobiliário urbano", variants: 1 },
  { id: "placa", label: "Sinalização", icon: AlertTriangle, cat: "Mobiliário urbano", variants: 1 },
];
const CATEGORY_ORDER = ["Terreno", "Sistema viário", "Lotes", "Edificações", "Áreas verdes", "Equipamentos", "Mobiliário urbano", "Pessoas", "Veículos", "Infraestrutura", "Entorno", "Importados", "Elementos temporários"];
const CATEGORY_ICONS = { "Terreno": Mountain, "Sistema viário": Route, "Lotes": LayoutGrid, "Edificações": Box, "Áreas verdes": TreePine, "Equipamentos": Diamond, "Mobiliário urbano": Lamp, "Pessoas": Users, "Veículos": Car, "Infraestrutura": Layers, "Entorno": Mountain, "Importados": Import, "Elementos temporários": Clock };
const PH_PRESETS = [
  { id: "res-diurno", label: "Residencial diurno", env: "ensolarado", aspect: "16:9", dur: 32, seq: "padrao", desc: "Luz clara de manhã, sequência completa de apresentação." },
  { id: "res-por-do-sol", label: "Residencial pôr do sol", env: "fimtarde", aspect: "16:9", dur: 32, seq: "padrao", desc: "Golden hour com sombras longas." },
  { id: "lote-aereo", label: "Loteamento aéreo", env: "meiodia", aspect: "16:9", dur: 26, seq: "aereo", desc: "Sobrevoo de implantação com órbita alta." },
  { id: "lote-comercial", label: "Loteamento comercial", env: "comercial", aspect: "16:9", dur: 30, seq: "padrao", desc: "Tarde vibrante voltada a vendas." },
  { id: "cond-sustentavel", label: "Condomínio sustentável", env: "natural", aspect: "16:9", dur: 30, seq: "padrao", desc: "Manhã suave, ênfase em áreas verdes." },
  { id: "noturno", label: "Empreendimento noturno", env: "noite", aspect: "16:9", dur: 28, seq: "padrao", desc: "Iluminação artificial e fachadas acesas." },
  { id: "institucional", label: "Institucional", env: "institucional", aspect: "16:9", dur: 24, seq: "institucional", desc: "Ritmo sóbrio, enquadramentos estáveis." },
  { id: "evento", label: "Evento temporário", env: "fimtarde", aspect: "16:9", dur: 20, seq: "aereo", desc: "Leitura rápida do espaço do evento." },
  { id: "tecnica", label: "Apresentação técnica", env: "nublado", aspect: "16:9", dur: 24, seq: "institucional", desc: "Luz difusa e neutra para leitura do projeto." },
  { id: "instagram", label: "Vídeo para Instagram", env: "comercial", aspect: "9:16", dur: 15, seq: "vertical", desc: "Vertical 9:16, 15 s, cortes curtos." },
  { id: "youtube", label: "Vídeo para YouTube", env: "cinematografico", aspect: "16:9", dur: 45, seq: "padrao", desc: "16:9 com abertura cinematográfica." },
  { id: "aprovacao", label: "Vídeo de aprovação", env: "meiodia", aspect: "16:9", dur: 30, seq: "padrao", desc: "Neutro, para revisão do cliente." },
];

// ============================================================================
// 7. SCENE MANAGER — mundo Three.js, câmeras, luz, cena demonstrativa
// ============================================================================
const mulberry32 = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

function canvasTexture(size, draw, { repeat = 1, srgb = true } = {}) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  draw(c.getContext("2d"), size);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  if (srgb) t.encoding = THREE.sRGBEncoding;
  t.anisotropy = 4;
  return t;
}
function textTexture(text, { w = 512, h = 128, size = 64, color = "#ffe9c4", bg = null, font = "700 __px 'Segoe UI',sans-serif", spacing = 6 } = {}) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d");
  if (bg) { ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h); }
  ctx.font = font.replace("__", size);
  ctx.fillStyle = color;
  ctx.textBaseline = "middle";
  const letters = text.split("");
  let tw = 0; for (const l of letters) tw += ctx.measureText(l).width + spacing;
  let x = (w - tw + spacing) / 2;
  for (const l of letters) { ctx.fillText(l, x, h / 2 + 2); x += ctx.measureText(l).width + spacing; }
  const t = new THREE.CanvasTexture(c);
  t.encoding = THREE.sRGBEncoding;
  return t;
}

const SKY_VERT = `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); gl_Position.z = gl_Position.w; }`;
const SKY_FRAG = `
varying vec3 vDir;
uniform vec3 uTop; uniform vec3 uHorizon; uniform vec3 uGround;
uniform vec3 uSunDir; uniform vec3 uSunColor; uniform float uHaze; uniform float uSunVis;
void main(){
  float h = vDir.y;
  vec3 col = h >= 0.0 ? mix(uHorizon, uTop, pow(smoothstep(0.0, 0.55, h), 0.8))
                      : mix(uHorizon, uGround, smoothstep(0.0, -0.25, h));
  float d = max(dot(normalize(vDir), normalize(uSunDir)), 0.0);
  col += uSunColor * pow(d, 1400.0) * 3.0 * uSunVis;          // disco solar
  col += uSunColor * pow(d, 12.0) * (0.18 + uHaze * 0.5) * uSunVis; // halo
  gl_FragColor = vec4(col, 1.0);
}`;

class SceneManager {
  constructor(canvas, host, cb) {
    this.cb = cb;
    this.host = host;
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance" });
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.basePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    this.pixelRatio = 1;

    this.scene = new THREE.Scene();
    this.world = new THREE.Group(); this.world.name = "Mundo";
    this.scene.add(this.world);

    // câmeras
    this.persp = new THREE.PerspectiveCamera(45, 1, 0.3, 2200);
    this.persp.position.set(72, 46, 96);
    this.ortho = new THREE.OrthographicCamera(-80, 80, 45, -45, -400, 1400);
    this.activeCam = this.persp;

    // controle orbital
    this.orbit = { target: new THREE.Vector3(0, 3, 8), sph: new THREE.Spherical().setFromVector3(new THREE.Vector3(72, 46, 88)), damp: 0.16 };
    this.orbit.goal = { theta: this.orbit.sph.theta, phi: this.orbit.sph.phi, radius: this.orbit.sph.radius, target: this.orbit.target.clone() };
    this.fly = { yaw: 0, pitch: 0, keys: new Set() };
    this.viewMode = "orbit";
    this.tool = "select";

    // luz
    this.sun = new THREE.DirectionalLight(0xffffff, 1);
    this.sun.castShadow = true;
    const sc = this.sun.shadow.camera;
    sc.left = -170; sc.right = 170; sc.top = 170; sc.bottom = -170; sc.near = 20; sc.far = 720;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.bias = -0.0006;
    this.sun.shadow.normalBias = 1.6;
    this.sun.shadow.radius = 2;
    this.scene.add(this.sun, this.sun.target);
    this.hemi = new THREE.HemisphereLight(0xbcd3e8, 0x3a4034, 0.5);
    this.scene.add(this.hemi);
    this.fillAmb = new THREE.AmbientLight(0x223047, 0);
    this.scene.add(this.fillAmb);
    this.nightLights = [];

    // céu + estrelas
    this.skyUniforms = {
      uTop: { value: new THREE.Color(0.33, 0.52, 0.77) }, uHorizon: { value: new THREE.Color(0.78, 0.86, 0.92) },
      uGround: { value: new THREE.Color(0.16, 0.18, 0.17) }, uSunDir: { value: new THREE.Vector3(0, 1, 0) },
      uSunColor: { value: new THREE.Color(1, 0.95, 0.85) }, uHaze: { value: 0.2 }, uSunVis: { value: 1 },
    };
    const sky = new THREE.Mesh(new THREE.SphereGeometry(1000, 32, 18),
      new THREE.ShaderMaterial({ uniforms: this.skyUniforms, vertexShader: SKY_VERT, fragmentShader: SKY_FRAG, side: THREE.BackSide, depthWrite: false }));
    sky.frustumCulled = false;
    this.scene.add(sky);
    {
      const n = 700, pos = new Float32Array(n * 3), rnd = mulberry32(7);
      for (let i = 0; i < n; i++) {
        const a = rnd() * Math.PI * 2, e = Math.asin(rnd() * 0.96 + 0.03), r = 960;
        pos[i * 3] = r * Math.cos(e) * Math.cos(a); pos[i * 3 + 1] = r * Math.sin(e); pos[i * 3 + 2] = r * Math.cos(e) * Math.sin(a);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      this.stars = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xcfd8ea, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0 }));
      this.stars.frustumCulled = false;
      this.scene.add(this.stars);
    }
    this.scene.fog = new THREE.FogExp2(0xc4d2de, 0.0016);

    // grade + destaque de seleção + trajetória
    this.grid = new THREE.GridHelper(300, 60, 0x4a5361, 0x2b313b);
    this.grid.position.y = 0.02; this.grid.visible = false;
    this.scene.add(this.grid);
    this.selBox = new THREE.BoxHelper(new THREE.Object3D(), 0xf2a83c);
    this.selBox.visible = false; this.selBox.material.depthTest = false;
    this.scene.add(this.selBox);
    this.pathGroup = new THREE.Group(); this.scene.add(this.pathGroup);

    // gizmo de eixos (render em viewport de canto)
    this.axesScene = new THREE.Scene();
    this.axesCam = new THREE.PerspectiveCamera(38, 1, 0.1, 20); this.axesCam.position.set(0, 0, 5.4);
    const mkAxis = (color, dir) => {
      const g = new THREE.Group();
      const mat = new THREE.MeshBasicMaterial({ color });
      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 1.35, 8), mat);
      shaft.position.y = 0.675;
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.4, 10), mat);
      tip.position.y = 1.5;
      g.add(shaft, tip);
      g.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      return g;
    };
    this.axesScene.add(mkAxis(0xe2635c, new THREE.Vector3(1, 0, 0)), mkAxis(0x57be8c, new THREE.Vector3(0, 1, 0)), mkAxis(0x6fa8dc, new THREE.Vector3(0, 0, 1)));
    this.axesScene.add(new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), new THREE.MeshBasicMaterial({ color: 0x9aa3b2 })));

    // estado
    this.reg = new Map();
    this.pickables = [];
    this.selectedId = null;
    this.raycaster = new THREE.Raycaster();
    this.clock = new THREE.Clock();
    this.env = { ...ENV_DEFAULT };
    this.envCurrent = { ...ENV_DEFAULT };
    this.geo = { lat: -19.5, lng: -42.5, northDeg: 0, units: "m" };
    this.fpsEMA = 60; this.frameMs = 16;
    this.adaptive = { active: false, until: 0 };
    this.quality = "edicao";
    this.playState = { playing: false, t: 0, shots: [], total: 0, onTick: null, range: null, loop: false, prevCam: null };
    this.disposed = false;

    this._buildDemoScene();
    this.setQuality("edicao");
    this.applyEnv(this.env, true);
    this._bindInput();
    this._resize();
    this._ro = new ResizeObserver(() => this._resize());
    this._ro.observe(host);
    this._loop = this._loop.bind(this);
    requestAnimationFrame(this._loop);
  }

  register(id, name, category, obj, { kind = "demo", pickable = true, parent = this.world } = {}) {
    obj.name = name;
    obj.traverse((o) => { o.userData.rid = id; });
    parent.add(obj);
    const e = { id, name, category, obj, kind, pickable, visible: true, base: { p: obj.position.clone(), rY: obj.rotation.y, s: obj.scale.clone() } };
    this.reg.set(id, e);
    if (pickable) this.pickables.push(obj);
    return e;
  }

  // ---------------------------------------------------------------- demo
  _buildDemoScene() {
    const rnd = mulberry32(42);
    const M = (o) => new THREE.MeshStandardMaterial(o);

    // materiais compartilhados
    const grassTex = canvasTexture(256, (ctx, s) => {
      ctx.fillStyle = "#67894f"; ctx.fillRect(0, 0, s, s);
      const r2 = mulberry32(3);
      for (let i = 0; i < 900; i++) {
        ctx.fillStyle = `rgba(${60 + r2() * 50},${105 + r2() * 45},${50 + r2() * 35},${0.16 + r2() * 0.2})`;
        ctx.beginPath(); ctx.ellipse(r2() * s, r2() * s, 2 + r2() * 9, 1.5 + r2() * 6, r2() * 3, 0, 7); ctx.fill();
      }
      for (let i = 0; i < 26; i++) {
        ctx.fillStyle = `rgba(120,100,66,${0.05 + r2() * 0.08})`;
        ctx.beginPath(); ctx.ellipse(r2() * s, r2() * s, 12 + r2() * 26, 8 + r2() * 18, r2() * 3, 0, 7); ctx.fill();
      }
    }, { repeat: 26 });
    const asphaltTex = canvasTexture(256, (ctx, s) => {
      ctx.fillStyle = "#3a3d41"; ctx.fillRect(0, 0, s, s);
      const r2 = mulberry32(9);
      for (let i = 0; i < 2200; i++) { const g = 42 + r2() * 46; ctx.fillStyle = `rgba(${g},${g},${g + 4},${0.25})`; ctx.fillRect(r2() * s, r2() * s, 1.5, 1.5); }
    }, { repeat: 5 });
    const paverTex = canvasTexture(256, (ctx, s) => {
      ctx.fillStyle = "#9a9188"; ctx.fillRect(0, 0, s, s);
      ctx.strokeStyle = "rgba(52,48,44,.5)"; ctx.lineWidth = 2;
      const step = s / 6;
      for (let y = 0; y < 6; y++) for (let x = 0; x < 6; x++) {
        const off = (y % 2) * step * 0.5;
        ctx.strokeRect(((x * step + off) % s), y * step, step, step);
      }
      const r2 = mulberry32(5);
      for (let i = 0; i < 260; i++) { ctx.fillStyle = `rgba(70,64,58,${0.08 + r2() * 0.1})`; ctx.fillRect(r2() * s, r2() * s, 3, 3); }
    }, { repeat: 10 });

    this.matGround = M({ map: grassTex, color: 0xffffff, roughness: 0.96, metalness: 0 });
    this.matAsphalt = M({ map: asphaltTex, roughness: 0.95, metalness: 0 });
    this.matSidewalk = M({ color: 0xb6b1a6, roughness: 0.9, metalness: 0 });
    this.matPaver = M({ map: paverTex, roughness: 0.88, metalness: 0 });
    this.windowGlass = M({ color: 0x2a3642, roughness: 0.12, metalness: 0.4, emissive: 0xffc27a, emissiveIntensity: 0 });
    this.facadeGlass = M({ color: 0x8fb6c9, roughness: 0.08, metalness: 0.25, transparent: true, opacity: 0.4, emissive: 0xffd9a0, emissiveIntensity: 0 });
    this.lampMat = M({ color: 0xf4e6c8, roughness: 0.4, emissive: 0xffd9a0, emissiveIntensity: 0 });
    this.waterMat = M({ color: 0x2a6b7c, roughness: 0.14, metalness: 0.85, transparent: true, opacity: 0.92 });

    // TERRENO ------------------------------------------------------------
    const gGeo = new THREE.PlaneGeometry(360, 360, 72, 72);
    const pos = gGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i); // plano ainda em XY
      const d = Math.sqrt(x * x + y * y);
      const t = clamp((d - 118) / 62, 0, 1);
      const n = Math.sin(x * 0.045) * Math.cos(y * 0.052) * 4 + Math.sin(x * 0.11 + 3) * 1.6;
      pos.setZ(i, t * t * (7 + n + rnd() * 1.4));
    }
    gGeo.computeVertexNormals();
    const ground = new THREE.Mesh(gGeo, this.matGround);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.register("terreno", "Terreno natural", "Terreno", ground);
    this.groundY = 0;

    // SISTEMA VIÁRIO -------------------------------------------------------
    const road = (id, name, w, l, x, z, rotY = 0) => {
      const g = new THREE.Group();
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, l), this.matAsphalt);
      m.rotation.x = -Math.PI / 2; m.receiveShadow = true;
      g.add(m);
      // faixa central tracejada
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.22, l), M({ color: 0xd8dcdf, roughness: 0.8 }));
      dash.rotation.x = -Math.PI / 2; dash.position.y = 0.012;
      const dashTex = canvasTexture(64, (ctx, s) => { ctx.clearRect(0, 0, s, s); ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, s, s * 0.5); }, { repeat: 1, srgb: false });
      dashTex.repeat.set(1, l / 6);
      dash.material = new THREE.MeshStandardMaterial({ map: dashTex, transparent: true, roughness: 0.8, color: 0xdfe3e6 });
      g.add(dash);
      for (const side of [-1, 1]) {
        const sw = new THREE.Mesh(new THREE.PlaneGeometry(1.9, l), this.matSidewalk);
        sw.rotation.x = -Math.PI / 2; sw.position.set(side * (w / 2 + 0.95), 0.02, 0); sw.receiveShadow = true;
        g.add(sw);
      }
      g.position.set(x, 0.05, z); g.rotation.y = rotY;
      this.register(id, name, "Sistema viário", g);
    };
    road("via-avenida", "Avenida Horizonte", 9, 300, 0, 0, 0);
    road("via-rua-a", "Rua das Ipês", 8, 240, 0, 0, Math.PI / 2);
    { // cruzamento sem faixa
      const patch = new THREE.Mesh(new THREE.PlaneGeometry(9.4, 9.4), this.matAsphalt);
      patch.rotation.x = -Math.PI / 2; patch.position.set(0, 0.07, 0); patch.receiveShadow = true;
      this.register("via-cruzamento", "Cruzamento central", "Sistema viário", patch);
    }

    // LOTES (contornos) ----------------------------------------------------
    const lotLines = [];
    const addLot = (x, z, w, d) => {
      const y = 0.09, hw = w / 2, hd = d / 2;
      const c = [[x - hw, z - hd], [x + hw, z - hd], [x + hw, z + hd], [x - hw, z + hd]];
      for (let i = 0; i < 4; i++) { const a = c[i], b = c[(i + 1) % 4]; lotLines.push(a[0], y, a[1], b[0], y, b[1]); }
    };
    const housesNW = [16, 34, 52, 70].map((z) => ({ x: -17.5, z, rot: Math.PI / 2, kind: "terrea" }));
    const housesNE = [20, 42, 64].map((z) => ({ x: 17.5, z, rot: -Math.PI / 2, kind: "sobrado" }));
    const housesSW = [-58, -76].map((z) => ({ x: -17.5, z, rot: Math.PI / 2, kind: "terrea" }));
    for (const h of [...housesNW, ...housesSW]) addLot(h.x - 2.5, h.z, 24, 16);
    for (const h of housesNE) addLot(h.x + 2.5, h.z, 24, 20);
    const lotGeo = new THREE.BufferGeometry();
    lotGeo.setAttribute("position", new THREE.Float32BufferAttribute(lotLines, 3));
    const lots = new THREE.LineSegments(lotGeo, new THREE.LineBasicMaterial({ color: 0xf5efe2, transparent: true, opacity: 0.22 }));
    this.register("lotes", "Contornos de lotes", "Lotes", lots);

    // EDIFICAÇÕES ----------------------------------------------------------
    const wallColors = [0xe8e2d5, 0xdccdb0, 0xcfd8cf, 0xe3d4c0, 0xd8c8b0, 0xe6ded0];
    const roofColors = [0x96543f, 0x8a4f3d, 0x7d5a4a, 0x7d7a74];
    const pyramidGeo = (() => { const g = new THREE.ConeGeometry(Math.SQRT2, 1, 4, 1); g.rotateY(Math.PI / 4); return g; })();
    const buildHouse = (kind, wall, roof) => {
      const g = new THREE.Group();
      const bw = 8, bd = kind === "sobrado" ? 9 : 10, bh = kind === "sobrado" ? 6 : 3;
      const body = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), M({ color: wall, roughness: 0.82 }));
      body.position.y = bh / 2; body.castShadow = body.receiveShadow = true;
      g.add(body);
      const roofM = new THREE.Mesh(pyramidGeo, M({ color: roof, roughness: 0.85, flatShading: true }));
      const rh = 1.7;
      roofM.scale.set(bw / 2 + 0.7, rh, bd / 2 + 0.7);
      roofM.position.y = bh + rh / 2; roofM.castShadow = true;
      g.add(roofM);
      const door = new THREE.Mesh(new THREE.BoxGeometry(1.1, 2.2, 0.14), M({ color: 0x6b4a2f, roughness: 0.6 }));
      door.position.set(-1.6, 1.1, bd / 2 + 0.06);
      g.add(door);
      const rows = kind === "sobrado" ? [1.6, 4.6] : [1.7];
      for (const wy of rows) for (const wx of [0.6, 2.5]) {
        const win = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.15, 0.1), this.windowGlass);
        win.position.set(wx, wy, bd / 2 + 0.06);
        g.add(win);
      }
      const winL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.15, 1.6), this.windowGlass);
      winL.position.set(bw / 2 + 0.06, rows[0], -1);
      g.add(winL);
      return g;
    };
    let hi = 1;
    for (const h of [...housesNW, ...housesNE, ...housesSW]) {
      const wall = wallColors[(hi * 3) % wallColors.length], roof = roofColors[hi % roofColors.length];
      const g = buildHouse(h.kind, wall, roof);
      g.position.set(h.x, 0.05, h.z); g.rotation.y = h.rot;
      const label = h.kind === "sobrado" ? "Sobrado" : "Casa térrea";
      this.register(`casa-${String(hi).padStart(2, "0")}`, `${label} ${String(hi).padStart(2, "0")}`, "Edificações", g);
      hi++;
    }
    { // centro comercial
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(22, 7, 14), M({ color: 0xc9c4ba, roughness: 0.75 }));
      body.position.y = 3.5; body.castShadow = body.receiveShadow = true;
      g.add(body);
      const glass = new THREE.Mesh(new THREE.BoxGeometry(0.24, 5, 12.4), this.facadeGlass);
      glass.position.set(-11.05, 2.7, 0);
      g.add(glass);
      const marquee = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.3, 13.4), M({ color: 0x8d8a82, roughness: 0.8 }));
      marquee.position.set(-12, 5.4, 0); marquee.castShadow = true;
      g.add(marquee);
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(10, 1.5),
        new THREE.MeshBasicMaterial({ map: textTexture("GALERIA HORIZONTE", { w: 1024, h: 160, size: 92, color: "#ffe1ae" }), transparent: true }));
      sign.rotation.y = -Math.PI / 2; sign.position.set(-11.3, 6.1, 0);
      this.signMat = sign.material;
      g.add(sign);
      g.position.set(28, 0.05, -26);
      this.register("comercial-01", "Galeria Horizonte (comercial)", "Edificações", g);
    }
    { // totem de entrada
      const g = new THREE.Group();
      const slab = new THREE.Mesh(new THREE.BoxGeometry(3.4, 3.1, 0.4), M({ color: 0xb9b6ae, roughness: 0.9 }));
      slab.position.y = 1.55; slab.castShadow = true;
      g.add(slab);
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.16, 0.44), M({ color: 0xf2a83c, roughness: 0.5, emissive: 0xf2a83c, emissiveIntensity: 0.25 }));
      stripe.position.y = 2.62;
      g.add(stripe);
      const txt = new THREE.Mesh(new THREE.PlaneGeometry(3, 0.9),
        new THREE.MeshBasicMaterial({ map: textTexture("RESIDENCIAL HORIZONTE", { w: 1024, h: 256, size: 74, color: "#f6efe2" }), transparent: true }));
      txt.position.set(0, 1.7, 0.23);
      g.add(txt);
      g.position.set(9.4, 0.05, 96); g.rotation.y = Math.PI;
      this.register("totem", "Totem de entrada", "Equipamentos", g);
    }

    // PRAÇA ------------------------------------------------------------------
    {
      const g = new THREE.Group();
      const floor = new THREE.Mesh(new THREE.CircleGeometry(13, 36), this.matPaver);
      floor.rotation.x = -Math.PI / 2; floor.position.y = 0.06; floor.receiveShadow = true;
      g.add(floor);
      g.position.set(-30, 0.03, -30);
      this.register("praca", "Praça central", "Equipamentos", g);
    }
    { // lago
      const lake = new THREE.Mesh(new THREE.CircleGeometry(1, 30), this.waterMat);
      lake.scale.set(15, 10, 1);
      lake.rotation.x = -Math.PI / 2; lake.position.set(52, 0.08, -62);
      lake.receiveShadow = true;
      this.register("lago", "Lago paisagístico", "Áreas verdes", lake);
    }

    // BIBLIOTECA fixa da cena ------------------------------------------------
    const put = (idp, name, cat, builder, list) => {
      list.forEach((cfg, i) => {
        const g = builder(cfg);
        g.position.set(cfg.x, 0.05, cfg.z);
        if (cfg.rot) g.rotation.y = cfg.rot;
        if (cfg.s) g.scale.setScalar(cfg.s);
        this.register(`${idp}-${String(i + 1).padStart(2, "0")}`, `${name} ${String(i + 1).padStart(2, "0")}`, cat, g);
      });
    };
    const treeSpots = [];
    for (const z of [-96, -72, -48, 24, 48, 72, 96]) for (const sx of [-8.2, 8.2]) treeSpots.push({ x: sx, z: z + (rnd() - 0.5) * 4, v: Math.floor(rnd() * 3), s: 0.85 + rnd() * 0.45, rot: rnd() * 6.28 });
    for (let i = 0; i < 5; i++) { const a = rnd() * 6.28; treeSpots.push({ x: -30 + Math.cos(a) * 9.5, z: -30 + Math.sin(a) * 9.5, v: Math.floor(rnd() * 3), s: 0.9 + rnd() * 0.5, rot: rnd() * 6.28 }); }
    for (let i = 0; i < 7; i++) treeSpots.push({ x: -40 - rnd() * 45, z: 20 + rnd() * 80, v: Math.floor(rnd() * 3), s: 0.9 + rnd() * 0.7, rot: rnd() * 6.28 });
    put("arv", "Árvore", "Áreas verdes", (c) => buildLibraryObject("arvore", c.v), treeSpots);
    put("palm", "Palmeira", "Áreas verdes", () => buildLibraryObject("palmeira", 0),
      [{ x: 46, z: -50, s: 1 }, { x: 60, z: -70, s: 1.15 }, { x: 44, z: -74, s: 0.9 }]);
    put("poste", "Poste de luz", "Mobiliário urbano", () => this._buildPoste(),
      [-100, -60, -20, 20, 60, 100].map((z, i) => ({ x: i % 2 ? 6.4 : -6.4, z, rot: i % 2 ? Math.PI : 0 })));
    put("banco", "Banco de praça", "Mobiliário urbano", () => buildLibraryObject("banco", 0),
      [{ x: -34, z: -24, rot: 0.8 }, { x: -25, z: -36, rot: -2.2 }, { x: -36, z: -34, rot: 2.4 }]);
    put("lixeira", "Lixeira", "Mobiliário urbano", () => buildLibraryObject("lixeira", 0),
      [{ x: -27, z: -22 }, { x: 8, z: -46 }]);
    put("placa", "Placa PARE", "Mobiliário urbano", () => buildLibraryObject("placa", 0),
      [{ x: 6, z: 6.4, rot: Math.PI }, { x: -6, z: -6.4 }]);
    put("pessoa", "Pessoa", "Pessoas", (c) => buildLibraryObject("pessoa", c.v),
      [{ x: -28, z: -27, v: 0, rot: 1 }, { x: -32, z: -32, v: 1, rot: -0.6 }, { x: 7.6, z: 30, v: 2, rot: 3 }, { x: -7.6, z: -14, v: 3, rot: 0.2 }, { x: 14, z: -20, v: 1, rot: -1.4 }]);
    put("carro", "Veículo", "Veículos", (c) => buildLibraryObject("carro", c.v),
      [{ x: -2.4, z: 46, v: 0 }, { x: 2.4, z: -64, v: 1, rot: Math.PI }, { x: 22, z: -38, v: 2, rot: Math.PI / 2 }, { x: 22, z: -42.6, v: 3, rot: Math.PI / 2 }, { x: 22, z: -47.2, v: 4, rot: Math.PI / 2 }]);
    { // estacionamento
      const p = new THREE.Mesh(new THREE.PlaneGeometry(16, 15), this.matAsphalt);
      p.rotation.x = -Math.PI / 2; p.position.set(23, 0.04, -42); p.receiveShadow = true;
      this.register("estacionamento", "Estacionamento", "Sistema viário", p);
    }

    // ENTORNO -----------------------------------------------------------------
    {
      const g = new THREE.Group();
      const m = M({ color: 0x4b6152, roughness: 1 });
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2 + 0.3;
        const r = 205 + rnd() * 55;
        const hill = new THREE.Mesh(new THREE.ConeGeometry(34 + rnd() * 34, 16 + rnd() * 22, 7), m);
        hill.position.set(Math.cos(a) * r, -2, Math.sin(a) * r);
        hill.rotation.y = rnd() * 3;
        g.add(hill);
      }
      this.register("entorno", "Morros do entorno", "Entorno", g, { pickable: false });
    }

    this.sceneCenter = new THREE.Vector3(0, 2, 4);
    this.sceneRadius = 95;
  }

  _buildPoste() {
    const g = buildLibraryObject("poste", 0);
    const lamp = g.getObjectByName("lampada");
    if (lamp) {
      lamp.material = this.lampMat;
      const pl = new THREE.PointLight(0xffd9a0, 0, 26, 2);
      pl.position.copy(lamp.position);
      g.add(pl);
      this.nightLights.push(pl);
    }
    return g;
  }

  // ------------------------------------------------------------- ambiente
  applyEnv(next, immediate = false) {
    const goal = { ...this.env, ...next };
    this.env = goal;
    // parâmetros discretos aplicam de imediato
    this.renderer.toneMapping = { ACES: THREE.ACESFilmicToneMapping, Reinhard: THREE.ReinhardToneMapping, Cineon: THREE.CineonToneMapping, Linear: THREE.LinearToneMapping }[goal.tone] || THREE.ACESFilmicToneMapping;
    this.sun.castShadow = goal.shadowsOn;
    if (immediate) { this.envCurrent = { ...goal }; this._applyEnvNow(goal); this.envLerp = null; }
    else this.envLerp = { from: { ...this.envCurrent }, to: { ...goal }, t0: performance.now(), dur: 420 };
  }
  setGeo(g) { this.geo = { ...this.geo, ...g }; this._applyEnvNow(this.envCurrent); }
  _applyEnvNow(p) {
    this.envCurrent = { ...p };
    const { elev, az } = sunPosition(p.hour, p.day, this.geo.lat, this.geo.northDeg);
    const sinE = Math.sin(elev);
    const day = clamp((sinE + 0.06) / 0.3, 0, 1);
    const dusk = Math.exp(-Math.pow(Math.abs(sinE) * 9, 1.6)); // pico no horizonte
    const cloud = p.cloud;
    const dir = new THREE.Vector3(Math.sin(az) * Math.cos(elev), sinE, -Math.cos(az) * Math.cos(elev));
    this.sunDir = dir.clone();
    this.sun.position.copy(dir).multiplyScalar(320);
    this.sun.target.position.set(0, 0, 0);
    // cores
    const C = (h) => new THREE.Color(h);
    const mix = (a, b, t) => a.clone().lerp(b, t);
    const warm = C(0xff8e4d), cold = C(0xbfd6ee);
    let sunCol = mix(warm, C(0xfff4e0), clamp(day * 1.4 - dusk * 0.7, 0, 1));
    let top = mix(mix(C(0x080d1c), C(0x3d74b8), day), C(0x6d5f7d), dusk * 0.45);
    let hor = mix(mix(C(0x131c2a), C(0xbcd4e4), day), C(0xf09a5c), dusk * 0.85);
    // nublado dessatura
    const grayT = mix(top, C(0x74808c), 0.85), grayH = mix(hor, C(0xaeb6bd), 0.85);
    top = mix(top, grayT, cloud * day); hor = mix(hor, grayH, cloud * Math.max(day, 0.25));
    sunCol = mix(sunCol, C(0xdadfe4), cloud * 0.8);
    this.skyUniforms.uTop.value.copy(top);
    this.skyUniforms.uHorizon.value.copy(hor);
    this.skyUniforms.uGround.value.copy(mix(C(0x11150f), C(0x2c3328), day));
    this.skyUniforms.uSunDir.value.copy(dir);
    this.skyUniforms.uSunColor.value.copy(sunCol);
    this.skyUniforms.uHaze.value = p.fog;
    this.skyUniforms.uSunVis.value = clamp((sinE + 0.09) * 14, 0, 1) * (1 - cloud * 0.92);
    // luzes
    this.sun.color.copy(sunCol);
    this.sun.intensity = p.sunIntensity * clamp(day, 0, 1) * (1 - cloud * 0.72) * 2.2;
    this.sun.shadow.radius = 1 + p.shadowSoft * 8 + cloud * 3;
    this.hemi.color.copy(mix(hor, C(0x8fa6c4), 0.4));
    this.hemi.groundColor.copy(mix(C(0x2a2f26), C(0x55584a), day));
    this.hemi.intensity = p.ambient * (0.32 + day * 0.75) * (1 + cloud * 0.35);
    this.fillAmb.intensity = (1 - day) * 0.22;
    // noite
    const night = clamp((0.035 - sinE) * 16, 0, 1);
    this.nightFactor = night;
    this.windowGlass.emissiveIntensity = night * 1.15;
    this.facadeGlass.emissiveIntensity = night * 0.5;
    this.lampMat.emissiveIntensity = night * 1.8;
    if (this.signMat) this.signMat.color.setScalar(0.55 + night * 0.85);
    for (const l of this.nightLights) l.intensity = night * 1.5;
    this.stars.material.opacity = night * (1 - cloud * 0.85);
    // névoa + exposição
    const fogCol = mix(hor, top, 0.35);
    this.scene.fog.color.copy(fogCol);
    this.scene.fog.density = 0.00035 + p.fog * 0.0038;
    this.renderer.toneMappingExposure = p.exposure * (0.9 + day * 0.15);
    if (this.cb.onSun) this.cb.onSun({ elevDeg: elev / D2R, azDeg: ((az / D2R) % 360 + 360) % 360, night });
  }

  // ------------------------------------------------------------- entrada
  _bindInput() {
    const cv = this.canvas;
    const st = { down: false, btn: 0, x: 0, y: 0, moved: 0, mode: null, dragId: null, plane: new THREE.Plane(), off: new THREE.Vector3() };
    this._ptr = st;
    const ndc = (e) => {
      const r = cv.getBoundingClientRect();
      return new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    };
    this._ndc = ndc;
    cv.addEventListener("contextmenu", (e) => e.preventDefault());
    cv.addEventListener("pointerdown", (e) => {
      cv.setPointerCapture(e.pointerId);
      st.down = true; st.btn = e.button; st.x = e.clientX; st.y = e.clientY; st.moved = 0; st.mode = null;
      this._interact();
      if (e.button === 0 && this.tool === "move" && this.selectedId) {
        const hit = this._pick(ndc(e));
        if (hit && hit.id === this.selectedId) {
          const entry = this.reg.get(hit.id);
          st.mode = "drag"; st.dragId = hit.id;
          st.vertical = e.shiftKey;
          if (st.vertical) {
            const n = new THREE.Vector3().subVectors(this.activeCam.position, entry.obj.position); n.y = 0; n.normalize();
            st.plane.setFromNormalAndCoplanarPoint(n, entry.obj.position);
          } else st.plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, entry.obj.position.y, 0));
          this.raycaster.setFromCamera(ndc(e), this.activeCam);
          const p = new THREE.Vector3();
          this.raycaster.ray.intersectPlane(st.plane, p);
          if (p) st.off.subVectors(entry.obj.position, p);
        }
      }
      if (this.placing && e.button === 0) st.mode = "place";
    });
    cv.addEventListener("pointermove", (e) => {
      if (!st.down) return;
      const dx = e.clientX - st.x, dy = e.clientY - st.y;
      st.x = e.clientX; st.y = e.clientY; st.moved += Math.abs(dx) + Math.abs(dy);
      this._interact();
      if (st.mode === "drag") {
        const entry = this.reg.get(st.dragId); if (!entry) return;
        this.raycaster.setFromCamera(ndc(e), this.activeCam);
        const p = new THREE.Vector3();
        if (this.raycaster.ray.intersectPlane(st.plane, p)) {
          const np = p.add(st.off);
          if (st.vertical) entry.obj.position.y = Math.max(0, np.y);
          else { entry.obj.position.x = np.x; entry.obj.position.z = np.z; }
          if (this.cb.onTransform) this.cb.onTransform(st.dragId);
        }
        return;
      }
      const rotBtn = st.btn === 0 && !e.shiftKey && st.mode !== "place";
      const panBtn = st.btn === 2 || st.btn === 1 || (st.btn === 0 && e.shiftKey);
      if (this.viewMode === "orbit") {
        if (rotBtn) {
          this.orbit.goal.theta -= dx * 0.0052;
          this.orbit.goal.phi = clamp(this.orbit.goal.phi - dy * 0.0052, 0.05, Math.PI / 2 - 0.01);
        } else if (panBtn) this._pan(dx, dy);
      } else if (this.viewMode === "fly" || this.viewMode === "walk") {
        if (rotBtn || panBtn) {
          this.fly.yaw -= dx * 0.0042;
          this.fly.pitch = clamp(this.fly.pitch - dy * 0.0042, -1.45, 1.45);
        }
      } else { // vistas ortogonais: arrastar = pan
        if (rotBtn || panBtn) this._pan(dx, dy);
      }
    });
    cv.addEventListener("pointerup", (e) => {
      st.down = false;
      const wasDrag = st.mode === "drag";
      const wasPlace = st.mode === "place";
      st.mode = null; st.dragId = null;
      if (wasDrag) { if (this.cb.onTransformEnd) this.cb.onTransformEnd(); return; }
      if (st.moved < 6 && e.button === 0) {
        const p = ndc(e);
        if (wasPlace || this.placing) { this._placeAt(p); return; }
        const hit = this._pick(p);
        if (this.cb.onSelect) this.cb.onSelect(hit ? hit.id : null);
      }
    });
    cv.addEventListener("wheel", (e) => {
      e.preventDefault();
      this._interact();
      const k = Math.exp(e.deltaY * 0.0011);
      if (this.activeCam === this.ortho) { this.orthoHalf = clamp((this.orthoHalf || 90) * k, 6, 400); this._resize(); }
      else if (this.viewMode === "orbit") this.orbit.goal.radius = clamp(this.orbit.goal.radius * k, 2.5, 900);
      else { // fly/walk: avança
        const d = new THREE.Vector3(); this.activeCam.getWorldDirection(d);
        this.persp.position.addScaledVector(d, -e.deltaY * 0.05);
      }
    }, { passive: false });
    cv.addEventListener("dblclick", (e) => {
      const hit = this._pick(ndc(e), true);
      if (hit && hit.point) {
        if (this.viewMode !== "orbit") this.setViewMode("orbit");
        this.orbit.goal.target.copy(hit.point);
      }
    });
    window.addEventListener("keydown", this._keydown = (e) => {
      if (this.viewMode === "fly" || this.viewMode === "walk") this.fly.keys.add(e.code);
    });
    window.addEventListener("keyup", this._keyup = (e) => this.fly.keys.delete(e.code));
  }
  _interact() { this.interactUntil = performance.now() + 420; }
  _pan(dx, dy) {
    if (this.activeCam === this.ortho) {
      const s = (this.orthoHalf || 90) * 2 / this.canvas.clientHeight;
      const right = new THREE.Vector3(), up = new THREE.Vector3();
      this.ortho.matrix.extractBasis(right, up, new THREE.Vector3());
      this.orbit.goal.target.addScaledVector(right, -dx * s).addScaledVector(up, dy * s);
    } else {
      const s = this.orbit.goal.radius / this.canvas.clientHeight * 1.6;
      const right = new THREE.Vector3(), up = new THREE.Vector3();
      this.persp.matrix.extractBasis(right, up, new THREE.Vector3());
      this.orbit.goal.target.addScaledVector(right, -dx * s).addScaledVector(up, dy * s);
    }
  }
  _pick(ndcV, withPoint = false) {
    this.raycaster.setFromCamera(ndcV, this.activeCam);
    const hits = this.raycaster.intersectObjects(this.pickables, true);
    for (const h of hits) {
      let o = h.object;
      while (o && !o.userData.rid) o = o.parent;
      if (o && o.userData.rid) {
        const entry = this.reg.get(o.userData.rid);
        if (entry && entry.visible) return { id: o.userData.rid, point: h.point };
      }
      if (withPoint) return { id: null, point: h.point };
    }
    return null;
  }
  setSelected(id) {
    this.selectedId = id;
    const e = id ? this.reg.get(id) : null;
    if (e) { this.selBox.setFromObject(e.obj); this.selBox.visible = true; }
    else this.selBox.visible = false;
  }
  frameSelection(id = this.selectedId) {
    const e = id ? this.reg.get(id) : null;
    const box = new THREE.Box3();
    if (e) box.setFromObject(e.obj);
    else box.setFromCenterAndSize(this.sceneCenter, new THREE.Vector3(1, 1, 1).multiplyScalar(this.sceneRadius * 1.6));
    const c = box.getCenter(new THREE.Vector3()), s = box.getSize(new THREE.Vector3()).length();
    if (this.viewMode !== "orbit") this.setViewMode("orbit");
    this.orbit.goal.target.copy(c);
    this.orbit.goal.radius = clamp(s * 1.15 + 2, 4, 700);
  }
  setViewMode(mode) {
    const prev = this.viewMode;
    this.viewMode = mode;
    if (mode === "orbit") {
      this.activeCam = this.persp;
      if (prev === "fly" || prev === "walk") {
        // reconstruir órbita a partir da pose atual
        const dir = new THREE.Vector3(); this.persp.getWorldDirection(dir);
        const t = this.persp.position.clone().addScaledVector(dir, 24);
        this.orbit.goal.target.copy(t); this.orbit.target.copy(t);
        const off = this.persp.position.clone().sub(t);
        this.orbit.sph.setFromVector3(off);
        Object.assign(this.orbit.goal, { theta: this.orbit.sph.theta, phi: clamp(this.orbit.sph.phi, 0.05, Math.PI / 2 - 0.01), radius: this.orbit.sph.radius });
      }
    } else if (mode === "fly" || mode === "walk") {
      this.activeCam = this.persp;
      const dir = new THREE.Vector3(); this.persp.getWorldDirection(dir);
      this.fly.yaw = Math.atan2(-dir.x, -dir.z);
      this.fly.pitch = Math.asin(clamp(dir.y, -1, 1));
      if (mode === "walk") this.persp.position.y = this.groundY + 1.7;
    } else {
      this.activeCam = this.ortho;
      this.orthoHalf = this.orthoHalf || 95;
      const t = this.orbit.goal.target;
      if (mode === "top") { this.ortho.position.set(t.x, 300, t.z); this.ortho.up.set(0, 0, -1); }
      if (mode === "front") { this.ortho.position.set(t.x, t.y + 4, 300); this.ortho.up.set(0, 1, 0); }
      if (mode === "right") { this.ortho.position.set(300, t.y + 4, t.z); this.ortho.up.set(0, 1, 0); }
      this.ortho.lookAt(t);
      this._resize();
    }
    if (this.cb.onViewMode) this.cb.onViewMode(mode);
  }
  setTool(t) { this.tool = t; }
  setPlacing(item) { this.placing = item || null; }
  _placeAt(ndcV) {
    this.raycaster.setFromCamera(ndcV, this.activeCam);
    const p = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), p);
    if (p && this.cb.onPlace) this.cb.onPlace(this.placing, { x: +p.x.toFixed(2), z: +p.z.toFixed(2) });
  }
  rotateSelected(deg) {
    const e = this.selectedId && this.reg.get(this.selectedId);
    if (!e) return;
    e.obj.rotation.y += deg * D2R;
    if (this.cb.onTransform) this.cb.onTransform(this.selectedId);
    if (this.cb.onTransformEnd) this.cb.onTransformEnd();
  }

  // ------------------------------------------------------------- qualidade
  setQuality(q) {
    this.quality = q;
    const cfg = { eco: [0.62, 512], edicao: [1, 1024], apresentacao: [1.35, 2048], alta: [1.9, 4096] }[q] || [1, 1024];
    this.pixelRatio = Math.min(this.basePixelRatio, cfg[0] * (window.devicePixelRatio >= 2 ? 1.4 : 1));
    if (q === "eco") this.pixelRatio = Math.min(this.pixelRatio, 0.75);
    if (this.sun.shadow.map) { this.sun.shadow.map.dispose(); this.sun.shadow.map = null; }
    this.sun.shadow.mapSize.set(cfg[1], cfg[1]);
    this.renderer.setPixelRatio(this.pixelRatio);
    this._resize();
  }
  setAspect(aspect) { this.aspect = aspect; this._resize(); }
  _resize() {
    if (!this.host) return;
    const W = this.host.clientWidth, H = this.host.clientHeight;
    if (!W || !H) return;
    const a = this.aspect || 16 / 9;
    let w = W, h = Math.round(W / a);
    if (h > H) { h = H; w = Math.round(H * a); }
    this.renderer.setSize(w, h, true);
    this.persp.aspect = w / h;
    this.persp.updateProjectionMatrix();
    const half = this.orthoHalf || 95;
    this.ortho.left = -half * (w / h); this.ortho.right = half * (w / h);
    this.ortho.top = half; this.ortho.bottom = -half;
    this.ortho.updateProjectionMatrix();
    if (this.cb.onCanvasSize) this.cb.onCanvasSize({ w, h });
  }

  // --------------------------------------------------------- tomadas / vídeo
  captureViewState() {
    const p = this.activeCam.position.clone();
    let t;
    if (this.viewMode === "orbit") t = this.orbit.target.clone();
    else { const d = new THREE.Vector3(); this.activeCam.getWorldDirection(d); t = p.clone().addScaledVector(d, 22); }
    return { p: [+p.x.toFixed(2), +p.y.toFixed(2), +p.z.toFixed(2)], t: [+t.x.toFixed(2), +t.y.toFixed(2), +t.z.toFixed(2)], fov: this.persp.fov };
  }
  _shotCurves(shot) {
    if (!this._curveCache) this._curveCache = new Map();
    const key = shot.id + ":" + shot.rev;
    if (this._curveCache.has(key)) return this._curveCache.get(key);
    const ks = shot.keys;
    let c;
    if (ks.length === 1) {
      const p = new THREE.Vector3(...ks[0].p), t = new THREE.Vector3(...ks[0].t);
      c = { pos: () => p.clone(), tgt: () => t.clone() };
    } else {
      const pc = new THREE.CatmullRomCurve3(ks.map(k => new THREE.Vector3(...k.p)), false, "centripetal", 0.5);
      const tc = new THREE.CatmullRomCurve3(ks.map(k => new THREE.Vector3(...k.t)), false, "centripetal", 0.5);
      c = { pos: (u) => pc.getPoint(u), tgt: (u) => tc.getPoint(u), pc };
    }
    this._curveCache.set(key, c);
    return c;
  }
  sampleShot(shot, localT) {
    const u0 = shot.dur > 0 ? clamp(localT / shot.dur, 0, 1) : 0;
    const u = (EASINGS[shot.ease] || EASINGS.easeInOut).fn(u0);
    const c = this._shotCurves(shot);
    return { p: c.pos(u), t: c.tgt(u), fov: shot.fov || 45 };
  }
  applyCameraSample(s) {
    this.persp.position.copy(s.p);
    this.persp.fov = s.fov;
    this.persp.updateProjectionMatrix();
    this.persp.lookAt(s.t);
  }
  setTimeline(shots) {
    this.playState.shots = shots.filter(s => !s.muted);
    this.playState.total = this.playState.shots.reduce((a, s) => a + s.dur, 0);
  }
  timelineSample(t) {
    const shots = this.playState.shots;
    let acc = 0;
    for (const s of shots) {
      if (t <= acc + s.dur || s === shots[shots.length - 1]) return { shot: s, sample: this.sampleShot(s, clamp(t - acc, 0, s.dur)) };
      acc += s.dur;
    }
    return null;
  }
  scrub(t) {
    const r = this.timelineSample(t);
    if (!r) return;
    if (!this.playState.prevCam) this._savePose();
    this.playState.t = t;
    this.applyCameraSample(r.sample);
    this._enterShotMode();
    if (this.cb.onPlayhead) this.cb.onPlayhead(t, r.shot.id);
  }
  play(fromT = null) {
    if (!this.playState.shots.length) return;
    if (!this.playState.prevCam) this._savePose();
    if (fromT !== null) this.playState.t = fromT;
    const [a, b] = this._rangeAB();
    if (this.playState.t < a || this.playState.t >= b - 0.01) this.playState.t = a;
    this.playState.playing = true;
    this._enterShotMode();
    if (this.cb.onPlayState) this.cb.onPlayState(true);
  }
  pause() { this.playState.playing = false; if (this.cb.onPlayState) this.cb.onPlayState(false); }
  stopPlayback(restore = true) {
    this.playState.playing = false;
    if (restore) this._restorePose();
    if (this.cb.onPlayState) this.cb.onPlayState(false);
  }
  _enterShotMode() {
    if (this.viewMode !== "shot") {
      this.viewMode = "shot";
      this.activeCam = this.persp;
      if (this.cb.onViewMode) this.cb.onViewMode("shot");
    }
  }
  setRange(range) { this.playState.range = range; }
  setLoop(v) { this.playState.loop = v; }
  _rangeAB() {
    const r = this.playState.range;
    return r && r[1] > r[0] ? [Math.max(0, r[0]), Math.min(this.playState.total, r[1])] : [0, this.playState.total];
  }
  _savePose() {
    this.playState.prevCam = { pos: this.persp.position.clone(), quat: this.persp.quaternion.clone(), fov: this.persp.fov, mode: this.viewMode, target: this.orbit.goal.target.clone(), sph: { ...this.orbit.goal } };
  }
  _restorePose() {
    const pv = this.playState.prevCam;
    if (!pv) return;
    this.persp.position.copy(pv.pos); this.persp.quaternion.copy(pv.quat);
    this.persp.fov = pv.fov; this.persp.updateProjectionMatrix();
    Object.assign(this.orbit.goal, pv.sph);
    this.orbit.goal.target.copy(pv.target); this.orbit.target.copy(pv.target);
    this.orbit.sph.theta = pv.sph.theta; this.orbit.sph.phi = pv.sph.phi; this.orbit.sph.radius = pv.sph.radius;
    this.playState.prevCam = null;
    this.setViewMode(pv.mode === "shot" ? "orbit" : pv.mode);
  }
  invalidateShot(shot) { if (this._curveCache) for (const k of [...this._curveCache.keys()]) if (k.startsWith(shot.id + ":")) this._curveCache.delete(k); }
  showPath(shot) {
    this.pathGroup.clear();
    if (!shot || shot.keys.length < 1) return;
    const c = this._shotCurves(shot);
    if (c.pc) {
      const pts = c.pc.getPoints(140);
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xf2a83c, transparent: true, opacity: 0.9 }));
      this.pathGroup.add(line);
      for (let i = 0; i <= 10; i++) {
        const u = i / 10;
        const tick = new THREE.Line(new THREE.BufferGeometry().setFromPoints([c.pos(u), c.pos(u).lerp(c.tgt(u), 0.12)]), new THREE.LineBasicMaterial({ color: 0x6fa8dc, transparent: true, opacity: 0.5 }));
        this.pathGroup.add(tick);
      }
    }
    const sph = new THREE.SphereGeometry(0.55, 10, 8);
    shot.keys.forEach((k, i) => {
      const m = new THREE.Mesh(sph, new THREE.MeshBasicMaterial({ color: i === 0 ? 0x57be8c : 0xf2a83c }));
      m.position.set(...k.p);
      this.pathGroup.add(m);
    });
  }

  // geradores de movimento --------------------------------------------------
  makeMove(type, opts = {}) {
    const c = opts.center ? new THREE.Vector3(...opts.center) : this.sceneCenter.clone();
    const r = opts.radius || this.sceneRadius;
    const K = (p, t) => ({ p: [+p.x.toFixed(2), +p.y.toFixed(2), +p.z.toFixed(2)], t: [+t.x.toFixed(2), +t.y.toFixed(2), +t.z.toFixed(2)] });
    const arc = (a0, a1, n, rad, h, tgtH = c.y + 2) => {
      const ks = [];
      for (let i = 0; i < n; i++) {
        const a = lerp(a0, a1, i / (n - 1));
        ks.push(K(new THREE.Vector3(c.x + Math.cos(a) * rad, h, c.z + Math.sin(a) * rad), new THREE.Vector3(c.x, tgtH, c.z)));
      }
      return ks;
    };
    switch (type) {
      case "aerea": return { name: "Vista aérea", move: "aerea", fov: 50, dur: 8, ease: "cinematic", keys: arc(-2.2, -1.1, 4, r * 1.35, r * 0.95) };
      case "aproximacao": {
        const a = -Math.PI / 2.4;
        const far = new THREE.Vector3(c.x + Math.cos(a) * r * 1.7, r * 0.8, c.z + Math.sin(a) * r * 1.7);
        const mid = new THREE.Vector3(c.x + Math.cos(a) * r * 0.9, r * 0.34, c.z + Math.sin(a) * r * 0.9);
        const near = new THREE.Vector3(c.x + Math.cos(a) * r * 0.42, 4.5, c.z + Math.sin(a) * r * 0.42);
        return { name: "Aproximação", move: "aproximacao", fov: 46, dur: 8, ease: "cinematic", keys: [K(far, c), K(mid, c), K(near, new THREE.Vector3(c.x, 3, c.z))] };
      }
      case "orbita": return { name: "Órbita", move: "orbita", fov: 45, dur: 10, ease: "linear", keys: arc(0.3, 0.3 + Math.PI * 1.05, 6, r * 0.85, Math.max(9, r * 0.3)) };
      case "travelling": {
        const h = 2.1;
        return { name: "Travelling lateral", move: "travelling", fov: 42, dur: 7, ease: "easeInOut", keys: [K(new THREE.Vector3(c.x - r * 0.7, h, c.z + r * 0.55), new THREE.Vector3(c.x - r * 0.25, 3, c.z)), K(new THREE.Vector3(c.x + r * 0.7, h, c.z + r * 0.55), new THREE.Vector3(c.x + r * 0.25, 3, c.z))] };
      }
      case "caminhada": {
        const zs = [c.z + r * 0.85, c.z + r * 0.35, c.z - r * 0.2, c.z - r * 0.55];
        return { name: "Caminhada na avenida", move: "caminhada", fov: 58, dur: 10, ease: "linear", keys: zs.map((z, i) => K(new THREE.Vector3(0.8 * ((i % 2) * 2 - 1), 1.7, z), new THREE.Vector3(0, 2.4, z - 26))) };
      }
      case "panorama": {
        const p = new THREE.Vector3(c.x + r * 0.55, Math.max(7, r * 0.22), c.z + r * 0.55);
        const tg = (a) => new THREE.Vector3(c.x + Math.cos(a) * r * 0.5, 3, c.z + Math.sin(a) * r * 0.5);
        return { name: "Panorâmica", move: "panorama", fov: 55, dur: 8, ease: "easeInOut", keys: [K(p, tg(3.6)), K(p, tg(2.6)), K(p, tg(1.7))] };
      }
      case "elevacao": {
        const x = c.x + r * 0.5, z = c.z + r * 0.5;
        return { name: "Elevação", move: "elevacao", fov: 48, dur: 7, ease: "easeInOut", keys: [K(new THREE.Vector3(x, 2, z), new THREE.Vector3(c.x, 3, c.z)), K(new THREE.Vector3(x, r * 0.9, z), new THREE.Vector3(c.x, 2, c.z))] };
      }
      case "revelacao": {
        const a = Math.PI * 0.78;
        const bx = c.x + Math.cos(a) * r * 0.5, bz = c.z + Math.sin(a) * r * 0.5;
        return { name: "Revelação", move: "revelacao", fov: 47, dur: 9, ease: "cinematic", keys: [K(new THREE.Vector3(bx, 1.4, bz), new THREE.Vector3(bx, 6, bz - 8)), K(new THREE.Vector3(bx * 0.7, r * 0.35, bz * 0.7), new THREE.Vector3(c.x, 4, c.z)), K(new THREE.Vector3(c.x + r * 0.5, r * 0.5, c.z - r * 0.2), new THREE.Vector3(c.x, 2, c.z))] };
      }
      case "afastamento": {
        const a = Math.PI / 3;
        return { name: "Afastamento final", move: "afastamento", fov: 48, dur: 8, ease: "cinematic", keys: [K(new THREE.Vector3(c.x + Math.cos(a) * r * 0.4, 5, c.z + Math.sin(a) * r * 0.4), new THREE.Vector3(c.x, 3, c.z)), K(new THREE.Vector3(c.x + Math.cos(a) * r * 1.15, r * 0.55, c.z + Math.sin(a) * r * 1.15), new THREE.Vector3(c.x, 2, c.z)), K(new THREE.Vector3(c.x + Math.cos(a) * r * 1.8, r * 0.95, c.z + Math.sin(a) * r * 1.8), new THREE.Vector3(c.x, 0, c.z))] };
      }
      default: {
        const v = this.captureViewState();
        return { name: "Tomada estática", move: "estatica", fov: v.fov, dur: 5, ease: "easeInOut", keys: [{ p: v.p, t: v.t }] };
      }
    }
  }

  // -------------------------------------------------- biblioteca / dispersão
  addLibraryItem(item, variant, pos, id = null, scale = 1, rotY = null) {
    const obj = buildLibraryObject(item, variant);
    obj.position.set(pos.x, 0.05, pos.z);
    obj.rotation.y = rotY !== null ? rotY : Math.random() * Math.PI * 2;
    obj.scale.setScalar(scale);
    const def = LIBRARY.find(l => l.id === item);
    const rid = id || uid(item);
    const n = [...this.reg.values()].filter(e => e.libItem === item).length + 1;
    const e = this.register(rid, `${def ? def.label : item} ${String(n).padStart(2, "0")}`, def ? def.cat : "Elementos temporários", obj);
    e.libItem = item; e.variant = variant; e.added = true;
    if (item === "poste") { /* postes adicionados não recebem PointLight (orçamento de luzes) */ }
    return e;
  }
  addScatter(item, { count = 30, radius = 25, center, variation = 0.35, seed = Date.now() % 100000 }, id = null) {
    const def = LIBRARY.find(l => l.id === item);
    const template = buildLibraryObject(item, 0);
    template.updateMatrixWorld(true);
    const parts = [];
    template.traverse(o => { if (o.isMesh) parts.push(o); });
    const g = new THREE.Group();
    const rnd = mulberry32(seed);
    const c = center || { x: this.sceneCenter.x, z: this.sceneCenter.z };
    const mats = [];
    for (let i = 0; i < count; i++) {
      const a = rnd() * Math.PI * 2, rr = Math.sqrt(rnd()) * radius;
      const s = 1 + (rnd() - 0.5) * 2 * variation;
      const m = new THREE.Matrix4().compose(
        new THREE.Vector3(c.x + Math.cos(a) * rr, 0.05, c.z + Math.sin(a) * rr),
        new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rnd() * Math.PI * 2),
        new THREE.Vector3(s, s, s));
      const v = def && def.variants > 1 ? Math.floor(rnd() * def.variants) : 0;
      mats.push({ m, v });
    }
    // uma InstancedMesh por sub-malha do template (variante 0 p/ instancing eficiente)
    for (const part of parts) {
      const im = new THREE.InstancedMesh(part.geometry, part.material, count);
      im.castShadow = true; im.receiveShadow = true;
      const local = part.matrixWorld.clone();
      const tmp = new THREE.Matrix4();
      mats.forEach((e2, i) => { tmp.multiplyMatrices(e2.m, local); im.setMatrixAt(i, tmp); });
      im.instanceMatrix.needsUpdate = true;
      g.add(im);
    }
    const rid = id || uid("disp");
    const e = this.register(rid, `Dispersão · ${def ? def.label : item} ×${count}`, def ? def.cat : "Áreas verdes", g);
    e.scatter = { item, count, radius, center: { ...c }, variation, seed };
    e.added = true;
    return e;
  }
  removeObject(id) {
    const e = this.reg.get(id);
    if (!e) return;
    e.obj.parent && e.obj.parent.remove(e.obj);
    this.pickables = this.pickables.filter(o => o !== e.obj);
    this.reg.delete(id);
    if (this.selectedId === id) this.setSelected(null);
  }
  setVisible(id, v) {
    const e = this.reg.get(id);
    if (!e) return;
    e.visible = v; e.obj.visible = v;
    if (!v && this.selectedId === id) this.setSelected(null);
  }
  setTransform(id, { p, rY, s }) {
    const e = this.reg.get(id);
    if (!e) return;
    if (p) e.obj.position.set(p[0], p[1], p[2]);
    if (rY !== undefined) e.obj.rotation.y = rY;
    if (s !== undefined) e.obj.scale.setScalar(s);
    if (this.selectedId === id) this.selBox.setFromObject(e.obj);
  }

  // -------------------------------------------------------------- materiais
  listMaterials(id) {
    const e = this.reg.get(id);
    if (!e) return [];
    const map = new Map();
    e.obj.traverse(o => {
      if (o.isMesh && o.material && !o.material.isShaderMaterial) {
        const m = o.material;
        if (!map.has(m.uuid)) map.set(m.uuid, m);
      }
    });
    return [...map.values()].map(m => ({ key: m.uuid, name: m.name || "Material", ref: m }));
  }
  getMatProps(m) {
    return {
      color: "#" + (m.color ? m.color.getHexString() : "ffffff"),
      roughness: m.roughness !== undefined ? m.roughness : 0.5,
      metalness: m.metalness !== undefined ? m.metalness : 0,
      opacity: m.opacity !== undefined ? m.opacity : 1,
      emissive: "#" + (m.emissive ? m.emissive.getHexString() : "000000"),
      emissiveIntensity: m.emissiveIntensity !== undefined ? m.emissiveIntensity : 1,
      hasMap: !!m.map, mapRepeat: m.map ? m.map.repeat.x : 1, mapRot: m.map ? m.map.rotation : 0,
      transparent: !!m.transparent, name: m.name,
    };
  }
  _snapshotMat(m) {
    if (!m.userData.__orig) m.userData.__orig = this.getMatProps(m);
  }
  setMatProps(m, props) {
    this._snapshotMat(m);
    if (props.color !== undefined && m.color) m.color.set(props.color);
    if (props.roughness !== undefined) m.roughness = props.roughness;
    if (props.metalness !== undefined) m.metalness = props.metalness;
    if (props.opacity !== undefined) {
      m.opacity = props.opacity;
      m.transparent = props.opacity < 0.999;
      m.depthWrite = props.opacity > 0.55;
    }
    if (props.emissive !== undefined && m.emissive) m.emissive.set(props.emissive);
    if (props.emissiveIntensity !== undefined) m.emissiveIntensity = props.emissiveIntensity;
    if (m.map && props.mapRepeat !== undefined) { m.map.repeat.set(props.mapRepeat, props.mapRepeat); m.map.needsUpdate = true; }
    if (m.map && props.mapRot !== undefined) { m.map.center.set(0.5, 0.5); m.map.rotation = props.mapRot; m.map.needsUpdate = true; }
    m.needsUpdate = true;
  }
  restoreMat(m) {
    if (m.userData.__orig) { const o = m.userData.__orig; delete m.userData.__orig; this.setMatProps(m, o); delete m.userData.__orig; }
  }
  applySimilar(m, props) {
    let n = 0;
    this.world.traverse(o => {
      if (o.isMesh && o.material && o.material.name === m.name && o.material !== m) { this.setMatProps(o.material, props); n++; }
    });
    this.setMatProps(m, props);
    return n;
  }

  // ------------------------------------------------------------- importação
  async importModel(file, onWarn) {
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    const buf = await file.arrayBuffer();
    let parsed;
    if (ext === "glb" || ext === "gltf") parsed = await parseGLTF(buf);
    else if (ext === "obj") parsed = parseOBJ(new TextDecoder().decode(buf));
    else if (ext === "zip") {
      const entries = await listZip(buf);
      const pick = entries.find(e => /\.glb$/i.test(e.name)) || entries.find(e => /\.gltf$/i.test(e.name)) || entries.find(e => /\.obj$/i.test(e.name));
      if (!pick) {
        const conv = entries.find(e => CONVERT_EXTS.includes((e.name.split(".").pop() || "").toLowerCase()));
        if (conv) return { needsConversion: true, inner: conv.name };
        throw new Error("O ZIP não contém GLB/glTF/OBJ. Formatos nativos: " + NATIVE_EXTS.join(", ").toUpperCase() + ".");
      }
      const data = await pick.getData();
      if (/\.obj$/i.test(pick.name)) parsed = parseOBJ(new TextDecoder().decode(data));
      else parsed = await parseGLTF(data.buffer.byteLength === data.byteLength ? data.buffer : data.slice().buffer);
      parsed.warnings.push(`Extraído de ${file.name}: ${pick.name}`);
    } else throw new Error(`Extensão .${ext} não é aberta diretamente no navegador.`);
    const root = new THREE.Group();
    root.add(parsed.root);
    const id = uid("imp");
    const nice = file.name.replace(/\.[^.]+$/, "");
    this.register(id, nice, "Importados", root);
    const e = this.reg.get(id);
    e.imported = { fileName: file.name, size: file.size, stats: parsed.stats };
    if (onWarn && parsed.warnings.length) parsed.warnings.forEach(w => onWarn(w));
    return { id, stats: parsed.stats, warnings: parsed.warnings, diag: this.diagnose(id) };
  }

  // ------------------------------------------------------------- diagnóstico
  diagnose(id = null) {
    const target = id ? this.reg.get(id)?.obj : this.world;
    if (!target) return null;
    target.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(target);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    let tris = 0, meshes = 0, mats = new Set(), texs = new Set(), geos = new Map();
    target.traverse(o => {
      if (o.isMesh) {
        meshes++;
        const g = o.geometry;
        tris += (g.index ? g.index.count : g.attributes.position ? g.attributes.position.count : 0) / 3 * (o.isInstancedMesh ? o.count : 1);
        geos.set(g.uuid, (geos.get(g.uuid) || 0) + 1);
        const ms = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of ms) { if (m) { mats.add(m.uuid); ["map", "normalMap", "roughnessMap", "metalnessMap", "emissiveMap"].forEach(k => m[k] && texs.add(m[k].uuid)); } }
      }
    });
    tris = Math.round(tris);
    const distOrigin = Math.sqrt(center.x * center.x + center.z * center.z);
    const maxDim = Math.max(size.x, size.y, size.z);
    const issues = [];
    if (maxDim > 0 && maxDim < 0.08) issues.push({ level: "warn", msg: "Dimensões muito pequenas — o arquivo pode estar em milímetros. Sugerido: ×1000.", fix: "scale1000" });
    else if (maxDim > 4000) issues.push({ level: "warn", msg: "Dimensões muito grandes — unidades podem estar em milímetros interpretados como metros. Sugerido: ×0,001.", fix: "scale0001" });
    if (distOrigin > 800) issues.push({ level: "err", msg: `Modelo a ${fmtLen(distOrigin, "m")} da origem (coordenadas georreferenciadas?). Pode causar tremido de precisão.`, fix: "center" });
    else if (distOrigin > 120) issues.push({ level: "warn", msg: `Centro a ${fmtLen(distOrigin, "m")} da origem da cena.`, fix: "center" });
    if (box.min.y > 1.5) issues.push({ level: "warn", msg: `Base flutuando ${fmtLen(box.min.y, "m")} acima do piso.`, fix: "ground" });
    if (box.min.y < -1.5) issues.push({ level: "warn", msg: `Base ${fmtLen(-box.min.y, "m")} abaixo do piso.`, fix: "ground" });
    if (tris > 1500000) issues.push({ level: "err", msg: "Malha muito pesada para navegação fluida no navegador (>1,5 mi de triângulos)." });
    else if (tris > 500000) issues.push({ level: "warn", msg: "Malha pesada — considere o modo Econômico ao navegar." });
    const dup = [...geos.values()].filter(v => v > 3).length;
    const perf = tris > 1200000 || meshes > 900 ? "pesado" : tris > 400000 || meshes > 350 ? "moderado" : "leve";
    return {
      size: [size.x, size.y, size.z], center: [center.x, center.y, center.z], minY: box.min.y,
      tris, meshes, materials: mats.size, textures: texs.size, distOrigin, duplicatesReused: dup, perf, issues,
    };
  }
  fixModel(id, fix) {
    const e = this.reg.get(id);
    if (!e) return null;
    const obj = e.obj;
    obj.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(obj);
    const c = box.getCenter(new THREE.Vector3());
    if (fix === "center") { obj.position.x -= c.x; obj.position.z -= c.z; }
    if (fix === "ground") obj.position.y -= box.min.y;
    if (fix === "scale1000") obj.scale.multiplyScalar(1000);
    if (fix === "scale0001") obj.scale.multiplyScalar(0.001);
    if (fix === "origin") { obj.position.set(0, obj.position.y - box.min.y, 0); }
    if (fix === "basicmats") {
      const pal = [0xb8bcc2, 0xc9b294, 0x9db3a4, 0xb59a9a, 0x8fa3b8];
      let i = 0;
      obj.traverse(o => { if (o.isMesh) { o.material = new THREE.MeshStandardMaterial({ color: pal[i++ % pal.length], roughness: 0.85, metalness: 0.05, name: `Básico ${i}` }); } });
    }
    if (this.selectedId === id) this.selBox.setFromObject(obj);
    return this.diagnose(id);
  }

  // ------------------------------------------------------- captura / gravação
  _ensureCaptureRig(w, h) {
    if (!this.capCanvas) {
      this.capCanvas = document.createElement("canvas");
      this.capRenderer = new THREE.WebGLRenderer({ canvas: this.capCanvas, antialias: true, preserveDrawingBuffer: true });
      this.capRenderer.outputEncoding = THREE.sRGBEncoding;
      this.capRenderer.shadowMap.enabled = true;
      this.capRenderer.shadowMap.type = THREE.PCFShadowMap;
      this.capCam = this.persp.clone();
    }
    this.capCanvas.width = w; this.capCanvas.height = h;
    this.capRenderer.setPixelRatio(1);
    this.capRenderer.setSize(w, h, false);
    this.capRenderer.toneMapping = this.renderer.toneMapping;
    this.capRenderer.toneMappingExposure = this.renderer.toneMappingExposure;
    this.capCam.aspect = w / h;
  }
  _renderCapture(sample) {
    this.capCam.fov = sample ? sample.fov : this.persp.fov;
    this.capCam.aspect = this.capCanvas.width / this.capCanvas.height;
    this.capCam.updateProjectionMatrix();
    if (sample) { this.capCam.position.copy(sample.p); this.capCam.lookAt(sample.t); }
    else { this.capCam.position.copy(this.activeCam.position); this.capCam.quaternion.copy(this.activeCam.quaternion); }
    const gv = this.grid.visible, sv = this.selBox.visible, pv = this.pathGroup.visible;
    this.grid.visible = false; this.selBox.visible = false; this.pathGroup.visible = false;
    this.capRenderer.render(this.scene, this.capCam);
    this.grid.visible = gv; this.selBox.visible = sv; this.pathGroup.visible = pv;
  }
  _compose(ctx, w, h, brand, fade = 0) {
    ctx.drawImage(this.capCanvas, 0, 0, w, h);
    if (this.env.vignette > 0.02) {
      const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.42, w / 2, h / 2, Math.max(w, h) * 0.72);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(1, `rgba(0,0,0,${0.55 * this.env.vignette})`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    }
    if (brand && brand.watermark) {
      ctx.save();
      ctx.translate(w / 2, h / 2); ctx.rotate(-0.42);
      ctx.font = `700 ${Math.round(h * 0.075)}px system-ui`;
      ctx.fillStyle = "rgba(255,255,255,.09)";
      ctx.textAlign = "center";
      ctx.fillText(brand.watermark, 0, 0);
      ctx.fillText(brand.watermark, -w * 0.42, h * 0.34);
      ctx.fillText(brand.watermark, w * 0.42, -h * 0.34);
      ctx.restore();
    }
    if (brand && brand.logoImg) {
      const lw = Math.round(w * 0.11), lh = Math.round(lw * (brand.logoImg.height / brand.logoImg.width));
      ctx.globalAlpha = 0.92;
      ctx.drawImage(brand.logoImg, w - lw - Math.round(w * 0.025), h - lh - Math.round(w * 0.025), lw, lh);
      ctx.globalAlpha = 1;
    } else if (brand && brand.logoText) {
      ctx.font = `600 ${Math.round(h * 0.03)}px system-ui`;
      ctx.fillStyle = "rgba(255,255,255,.85)";
      ctx.textAlign = "right";
      ctx.fillText(brand.logoText, w - Math.round(w * 0.025), h - Math.round(h * 0.035));
    }
    if (fade > 0.002) { ctx.fillStyle = `rgba(0,0,0,${clamp(fade, 0, 1)})`; ctx.fillRect(0, 0, w, h); }
  }
  async capturePNG({ w, h, brand }) {
    this._ensureCaptureRig(w, h);
    const inShot = this.viewMode === "shot" ? this.timelineSample(this.playState.t) : null;
    this._renderCapture(inShot ? inShot.sample : null);
    const comp = document.createElement("canvas");
    comp.width = w; comp.height = h;
    this._compose(comp.getContext("2d"), w, h, brand, 0);
    return new Promise(res => comp.toBlob(b => res(b), "image/png"));
  }
  shotThumb(shot) {
    try {
      this._ensureCaptureRig(352, 198);
      this._renderCapture(this.sampleShot(shot, Math.min(0.4, shot.dur * 0.1)));
      return this.capCanvas.toDataURL("image/jpeg", 0.72);
    } catch (e) { return null; }
  }
  recordWebM({ w, h, fps, brand, fades, onProgress }) {
    return new Promise((resolve, reject) => {
      if (typeof MediaRecorder === "undefined") return reject(new Error("Este navegador não suporta MediaRecorder — use a exportação de imagens ou outro navegador."));
      const [a, b] = this._rangeAB();
      const total = b - a;
      if (total < 0.2) return reject(new Error("Timeline vazia — crie ao menos uma tomada."));
      this._ensureCaptureRig(w, h);
      const comp = document.createElement("canvas");
      comp.width = w; comp.height = h;
      const ctx = comp.getContext("2d");
      const stream = comp.captureStream(fps);
      const mime = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"].find(m => MediaRecorder.isTypeSupported(m));
      if (!mime) return reject(new Error("Codec WebM indisponível neste navegador."));
      const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: Math.min(28_000_000, w * h * fps * 0.14) });
      const chunks = [];
      rec.ondataavailable = e => e.data.size && chunks.push(e.data);
      rec.onstop = () => resolve({ blob: new Blob(chunks, { type: "video/webm" }), mime });
      rec.onerror = e => reject(e.error || new Error("Falha na gravação."));
      const wasPlaying = this.playState.playing;
      this.pause();
      let t = a, last = performance.now();
      this._recording = true;
      rec.start(250);
      const step = () => {
        if (!this._recording) { rec.stop(); return; }
        const now = performance.now();
        t += Math.min(0.1, (now - last) / 1000);
        last = now;
        if (t >= b) {
          const r = this.timelineSample(b - 0.001);
          if (r) { this._renderCapture(r.sample); this._compose(ctx, w, h, brand, fades ? 1 : 0); }
          this._recording = false;
          setTimeout(() => rec.stop(), 120);
          onProgress && onProgress(1);
          return;
        }
        const r = this.timelineSample(t);
        if (r) {
          this._renderCapture(r.sample);
          let fade = 0;
          if (fades) {
            const fi = clamp(1 - (t - a) / 0.8, 0, 1);
            const fo = clamp(1 - (b - t) / 0.8, 0, 1);
            fade = Math.max(fi, fo);
          }
          this._compose(ctx, w, h, brand, fade);
          onProgress && onProgress((t - a) / total, r.shot);
        }
        requestAnimationFrame(step);
      };
      step();
      this._afterRecord = () => { if (wasPlaying) this.play(); };
    });
  }
  cancelRecord() { this._recording = false; }

  // ------------------------------------------------------------ estado/ciclo
  collectOverrides() {
    const tr = {}, added = [], scat = [];
    for (const [id, e] of this.reg) {
      if (e.added) {
        if (e.scatter) scat.push({ id, ...e.scatter });
        else added.push({ id, item: e.libItem, variant: e.variant || 0, p: e.obj.position.toArray(), rY: e.obj.rotation.y, s: e.obj.scale.x });
        continue;
      }
      const b = e.base, o = e.obj;
      const moved = !o.position.equals(b.p) || Math.abs(o.rotation.y - b.rY) > 1e-4 || Math.abs(o.scale.x - b.s.x) > 1e-4 || !e.visible;
      if (moved) tr[id] = { p: o.position.toArray(), rY: o.rotation.y, s: o.scale.x, v: e.visible };
    }
    const mats = {};
    this.world.traverse(o => {
      if (o.isMesh && o.material && o.material.userData.__orig && o.material.name) mats[o.material.name] = this.getMatProps(o.material);
    });
    return { tr, added, scat, mats };
  }
  applyOverrides(ov) {
    if (!ov) return;
    for (const [id, t] of Object.entries(ov.tr || {})) {
      const e = this.reg.get(id);
      if (!e) continue;
      this.setTransform(id, { p: t.p, rY: t.rY, s: t.s });
      this.setVisible(id, t.v !== false);
    }
    for (const a of ov.added || []) this.addLibraryItem(a.item, a.variant, { x: a.p[0], z: a.p[2] }, a.id, a.s, a.rY);
    for (const s of ov.scat || []) this.addScatter(s.item, s, s.id);
    for (const [name, props] of Object.entries(ov.mats || {})) {
      let applied = false;
      this.world.traverse(o => {
        if (o.isMesh && o.material && o.material.name === name) { this.setMatProps(o.material, props); applied = true; }
      });
    }
  }
  getStats() {
    const i = this.renderer.info;
    return { fps: Math.round(this.fpsEMA), ms: this.frameMs.toFixed(1), tris: i.render.triangles, calls: i.render.calls, geos: i.memory.geometries, texs: i.memory.textures, pr: this.pixelRatio.toFixed(2) };
  }
  _loop() {
    if (this.disposed) return;
    requestAnimationFrame(this._loop);
    const dt = Math.min(0.05, this.clock.getDelta());
    this.frameMs = this.frameMs * 0.9 + dt * 1000 * 0.1;
    this.fpsEMA = this.fpsEMA * 0.92 + (1 / Math.max(dt, 1e-4)) * 0.08;
    // interpolação de ambiente
    if (this.envLerp) {
      const L = this.envLerp;
      const u = clamp((performance.now() - L.t0) / L.dur, 0, 1);
      const e = {};
      for (const k of Object.keys(L.to)) e[k] = typeof L.to[k] === "number" ? lerp(L.from[k] ?? L.to[k], L.to[k], u) : L.to[k];
      this._applyEnvNow(e);
      if (u >= 1) this.envLerp = null;
    }
    // órbita com amortecimento
    if (this.viewMode === "orbit") {
      const o = this.orbit, d = 1 - Math.pow(1 - o.damp, dt * 60);
      o.sph.theta = lerp(o.sph.theta, o.goal.theta, d);
      o.sph.phi = lerp(o.sph.phi, o.goal.phi, d);
      o.sph.radius = lerp(o.sph.radius, o.goal.radius, d);
      o.target.lerp(o.goal.target, d);
      const p = new THREE.Vector3().setFromSpherical(o.sph).add(o.target);
      this.persp.position.copy(p);
      this.persp.lookAt(o.target);
    } else if (this.viewMode === "fly" || this.viewMode === "walk") {
      const f = this.fly;
      const dir = new THREE.Vector3(-Math.sin(f.yaw) * Math.cos(f.pitch), Math.sin(f.pitch), -Math.cos(f.yaw) * Math.cos(f.pitch));
      const flat = new THREE.Vector3(-Math.sin(f.yaw), 0, -Math.cos(f.yaw));
      const right = new THREE.Vector3(-flat.z, 0, flat.x);
      const sp = (f.keys.has("ShiftLeft") || f.keys.has("ShiftRight") ? 3 : 1) * (this.viewMode === "walk" ? 5.4 : 16) * dt;
      const mv = new THREE.Vector3();
      if (f.keys.has("KeyW") || f.keys.has("ArrowUp")) mv.add(this.viewMode === "walk" ? flat : dir);
      if (f.keys.has("KeyS") || f.keys.has("ArrowDown")) mv.addScaledVector(this.viewMode === "walk" ? flat : dir, -1);
      if (f.keys.has("KeyA") || f.keys.has("ArrowLeft")) mv.addScaledVector(right, -1);
      if (f.keys.has("KeyD") || f.keys.has("ArrowRight")) mv.add(right);
      if (this.viewMode === "fly") {
        if (f.keys.has("KeyE")) mv.y += 1;
        if (f.keys.has("KeyQ")) mv.y -= 1;
      }
      if (mv.lengthSq() > 0) this.persp.position.addScaledVector(mv.normalize(), sp);
      if (this.viewMode === "walk") this.persp.position.y = this.groundY + 1.7;
      this.persp.quaternion.setFromEuler(new THREE.Euler(f.pitch, f.yaw, 0, "YXZ"));
    }
    // reprodução
    if (this.playState.playing) {
      const [a, b] = this._rangeAB();
      this.playState.t += dt;
      if (this.playState.t >= b) {
        if (this.playState.loop) this.playState.t = a;
        else { this.playState.t = b; this.pause(); }
      }
      const r = this.timelineSample(this.playState.t);
      if (r) {
        this.applyCameraSample(r.sample);
        if (this.cb.onPlayhead) this.cb.onPlayhead(this.playState.t, r.shot.id);
      }
    }
    if (this.selectedId && this.selBox.visible) {
      const e = this.reg.get(this.selectedId);
      if (e && this._ptr && this._ptr.mode === "drag") this.selBox.setFromObject(e.obj);
    }
    // pixel ratio adaptativo durante interação
    const interacting = performance.now() < (this.interactUntil || 0) || this.playState.playing;
    if (!this._recording) {
      if (interacting && this.fpsEMA < 42 && !this.adaptive.active) {
        this.adaptive.active = true;
        this.renderer.setPixelRatio(Math.max(0.55, this.pixelRatio * 0.68));
      } else if (this.adaptive.active && (!interacting || this.fpsEMA > 54)) {
        this.adaptive.active = false;
        this.renderer.setPixelRatio(this.pixelRatio);
      }
    }
    // render principal
    this.renderer.setViewport(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.render(this.scene, this.activeCam);
    // gizmo de eixos
    const gs = 76, pad = 10;
    const W = this.canvas.clientWidth, H = this.canvas.clientHeight;
    this.renderer.autoClear = false;
    this.renderer.clearDepth();
    this.renderer.setScissorTest(true);
    this.renderer.setScissor(W - gs - pad, H - gs - pad, gs, gs);
    this.renderer.setViewport(W - gs - pad, H - gs - pad, gs, gs);
    this.axesScene.quaternion.copy(this.activeCam.quaternion).invert();
    this.renderer.render(this.axesScene, this.axesCam);
    this.renderer.setScissorTest(false);
    this.renderer.autoClear = true;
    // stats periódicos
    if (!this._statT || performance.now() - this._statT > 500) {
      this._statT = performance.now();
      if (this.cb.onStats) this.cb.onStats(this.getStats());
    }
  }
  dispose() {
    this.disposed = true;
    this._ro && this._ro.disconnect();
    window.removeEventListener("keydown", this._keydown);
    window.removeEventListener("keyup", this._keyup);
    this.renderer.dispose();
    this.capRenderer && this.capRenderer.dispose();
  }
}

// ============================================================================
// 8. FÁBRICA DE OBJETOS DA BIBLIOTECA (geometrias procedurais leves)
// ============================================================================
function buildLibraryObject(type, variant = 0) {
  const M = (o) => new THREE.MeshStandardMaterial(o);
  const g = new THREE.Group();
  const cast = (m) => { m.castShadow = true; m.receiveShadow = true; return m; };
  const greens = [0x4f7a3d, 0x5e8a48, 0x6a9152, 0x47703a];
  if (type === "arvore") {
    const trunk = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, 2.3, 6), M({ color: 0x6b4a30, roughness: 0.9 })));
    trunk.position.y = 1.15;
    g.add(trunk);
    if (variant === 2) {
      const cone = cast(new THREE.Mesh(new THREE.ConeGeometry(1.35, 3.4, 8), M({ color: 0x3f6a3a, roughness: 0.95, flatShading: true })));
      cone.position.y = 3.4;
      g.add(cone);
    } else {
      const col = greens[variant % greens.length];
      const blobs = variant === 1 ? [[0, 3.4, 0, 1.7]] : [[0, 3.1, 0, 1.35], [0.8, 2.7, 0.35, 0.95], [-0.7, 2.8, -0.3, 0.9]];
      for (const [x, y, z, r] of blobs) {
        const s = cast(new THREE.Mesh(new THREE.SphereGeometry(r, 9, 7), M({ color: col, roughness: 0.95, flatShading: true })));
        s.position.set(x, y, z);
        s.scale.y = 0.82;
        g.add(s);
      }
    }
  } else if (type === "palmeira") {
    const trunk = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.2, 4.6, 6), M({ color: 0x8a6a48, roughness: 0.9 })));
    trunk.position.y = 2.3;
    g.add(trunk);
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      const leaf = cast(new THREE.Mesh(new THREE.SphereGeometry(1, 7, 5), M({ color: 0x4a7c3f, roughness: 0.95, flatShading: true })));
      leaf.scale.set(1.7, 0.09, 0.4);
      leaf.position.set(Math.cos(a) * 1.15, 4.55, Math.sin(a) * 1.15);
      leaf.rotation.set(0, -a, 0);
      leaf.rotateZ(-0.5);
      g.add(leaf);
    }
  } else if (type === "arbusto") {
    const col = greens[(variant + 1) % greens.length];
    const b1 = cast(new THREE.Mesh(new THREE.SphereGeometry(0.6, 8, 6), M({ color: col, roughness: 0.96, flatShading: true })));
    b1.position.y = 0.5; b1.scale.y = 0.75;
    g.add(b1);
    if (variant === 1) {
      const b2 = b1.clone();
      b2.position.set(0.5, 0.38, 0.2); b2.scale.setScalar(0.7); b2.scale.y = 0.55;
      g.add(b2);
    }
  } else if (type === "pessoa") {
    const shirts = [0x9a4f4f, 0x4f6f9a, 0x7a8a5a, 0x8a6f9a];
    const legs = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.135, 0.8, 7), M({ color: 0x3a4048, roughness: 0.85 })));
    legs.position.y = 0.4;
    const torso = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.185, 0.62, 7), M({ color: shirts[variant % 4], roughness: 0.85 })));
    torso.position.y = 1.11;
    const head = cast(new THREE.Mesh(new THREE.SphereGeometry(0.115, 8, 7), M({ color: 0xd9b08c, roughness: 0.7 })));
    head.position.y = 1.56;
    g.add(legs, torso, head);
  } else if (type === "carro") {
    const cols = [0xb8bfc6, 0x7c2f2f, 0x2f4a7c, 0x3a3d40, 0xc7c2b4];
    const body = cast(new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.55, 4.3), M({ color: cols[variant % 5], roughness: 0.35, metalness: 0.55 })));
    body.position.y = 0.62;
    const cab = cast(new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.5, 2.15), M({ color: 0x1e2830, roughness: 0.15, metalness: 0.4 })));
    cab.position.set(0, 1.12, -0.22);
    g.add(body, cab);
    const wg = new THREE.CylinderGeometry(0.32, 0.32, 0.24, 10);
    const wm = M({ color: 0x1c1e20, roughness: 0.9 });
    for (const [x, z] of [[-0.82, 1.35], [0.82, 1.35], [-0.82, -1.35], [0.82, -1.35]]) {
      const w = cast(new THREE.Mesh(wg, wm));
      w.rotation.z = Math.PI / 2;
      w.position.set(x, 0.32, z);
      g.add(w);
    }
  } else if (type === "poste") {
    const pole = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 6, 8), M({ color: 0x3c424a, roughness: 0.7, metalness: 0.4 })));
    pole.position.y = 3;
    const arm = cast(new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 1.5), M({ color: 0x3c424a, roughness: 0.7, metalness: 0.4 })));
    arm.position.set(0, 5.9, 0.72);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 6), M({ color: 0xf4e6c8, emissive: 0xffd9a0, emissiveIntensity: 0 }));
    lamp.name = "lampada";
    lamp.position.set(0, 5.82, 1.4);
    g.add(pole, arm, lamp);
  } else if (type === "banco") {
    const wood = M({ color: 0x7d5a3a, roughness: 0.8 });
    const seat = cast(new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.09, 0.52), wood));
    seat.position.y = 0.46;
    const back = cast(new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.42, 0.07), wood));
    back.position.set(0, 0.82, -0.24);
    back.rotation.x = -0.14;
    const legM = M({ color: 0x3a4048, roughness: 0.6, metalness: 0.5 });
    for (const x of [-0.72, 0.72]) {
      const leg = cast(new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.46, 0.46), legM));
      leg.position.set(x, 0.23, 0);
      g.add(leg);
    }
    g.add(seat, back);
  } else if (type === "lixeira") {
    const body = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.2, 0.66, 10), M({ color: 0x3f5a48, roughness: 0.7, metalness: 0.3 })));
    body.position.y = 0.36;
    const rim = cast(new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.03, 6, 12), M({ color: 0x2c3e33, roughness: 0.6 })));
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.7;
    g.add(body, rim);
  } else if (type === "placa") {
    const pole = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 2.5, 8), M({ color: 0x8a9098, roughness: 0.5, metalness: 0.6 })));
    pole.position.y = 1.25;
    const plate = cast(new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.04, 8), M({ color: 0xb03030, roughness: 0.45, emissive: 0x701818, emissiveIntensity: 0.15 })));
    plate.rotation.x = Math.PI / 2;
    plate.position.y = 2.35;
    g.add(pole, plate);
  } else {
    const box = cast(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), M({ color: 0xb8bcc2 })));
    box.position.y = 0.5;
    g.add(box);
  }
  return g;
}

// ============================================================================
// 9. DIRETOR PIXEL — sequências determinísticas + comandos em linguagem natural
// ============================================================================
function mkShot(base, over = {}) {
  return { id: uid("shot"), rev: 1, status: "rascunho", muted: false, comments: [], ...base, ...over };
}
function directorSequence(sm, kind = "padrao", targetDur = null) {
  const defs = {
    padrao: ["aerea", "aproximacao", "orbita", "caminhada", "afastamento"],
    aereo: ["aerea", "orbita", "panorama", "afastamento"],
    institucional: ["panorama", "travelling", "orbita", "afastamento"],
    vertical: ["aproximacao", "elevacao", "orbita"],
  };
  const types = defs[kind] || defs.padrao;
  let shots = types.map(t => mkShot(sm.makeMove(t)));
  if (targetDur) {
    const cur = shots.reduce((a, s) => a + s.dur, 0);
    const k = targetDur / cur;
    shots = shots.map(s => ({ ...s, dur: Math.max(2, +(s.dur * k).toFixed(1)) }));
  }
  return shots;
}
const NL_RULES = [
  { rx: /(\d+)\s*(s\b|seg|segundos?)/i, apply: (m, ctx) => { ctx.dur = clamp(parseInt(m[1], 10), 5, 180); ctx.log.push(`Duração alvo: ${ctx.dur} s`); } },
  { rx: /(\d+)\s*min/i, apply: (m, ctx) => { ctx.dur = clamp(parseInt(m[1], 10) * 60, 10, 300); ctx.log.push(`Duração alvo: ${ctx.dur} s`); } },
  { rx: /instagram|reels|stories|tik\s*tok|vertical|9\s*:\s*16/i, apply: (m, ctx) => { ctx.aspect = "9:16"; ctx.seq = ctx.seq || "vertical"; ctx.log.push("Formato vertical 9:16 (redes sociais)"); } },
  { rx: /youtube|16\s*:\s*9|horizontal|widescreen/i, apply: (m, ctx) => { ctx.aspect = "16:9"; ctx.log.push("Formato 16:9"); } },
  { rx: /quadrado|1\s*:\s*1|feed/i, apply: (m, ctx) => { ctx.aspect = "1:1"; ctx.log.push("Formato quadrado 1:1"); } },
  { rx: /p[ôo]r\s*do\s*sol|entardecer|golden|dourad/i, apply: (m, ctx) => { ctx.env = "fimtarde"; ctx.log.push("Ambientação: fim de tarde"); } },
  { rx: /amanhecer|manh[ãa]|nascer/i, apply: (m, ctx) => { ctx.env = "manha"; ctx.log.push("Ambientação: manhã"); } },
  { rx: /noite|noturn/i, apply: (m, ctx) => { ctx.env = "noite"; ctx.log.push("Ambientação: noturna"); } },
  { rx: /nublado|difus/i, apply: (m, ctx) => { ctx.env = "nublado"; ctx.log.push("Ambientação: nublada"); } },
  { rx: /cinematogr|dram[áa]t/i, apply: (m, ctx) => { ctx.env = ctx.env || "cinematografico"; ctx.log.push("Ambientação: cinematográfica"); } },
  { rx: /a[ée]re[oa]|drone|sobrevoo|implanta[çc][ãa]o|vista\s+de\s+cima/i, apply: (m, ctx) => { ctx.seq = "aereo"; ctx.log.push("Sequência com ênfase aérea"); } },
  { rx: /institucional|s[óo]bri[oa]|t[ée]cnic/i, apply: (m, ctx) => { ctx.seq = "institucional"; ctx.log.push("Sequência institucional"); } },
  { rx: /avenida|caminhada|pedestre|caminhar|rua|n[íi]vel\s+do\s+observador/i, apply: (m, ctx) => { ctx.addMoves.push("caminhada"); ctx.log.push("Incluída caminhada no nível do observador"); } },
  { rx: /[óo]rbita|girar|ao\s*redor|360/i, apply: (m, ctx) => { ctx.addMoves.push("orbita"); ctx.log.push("Incluída órbita"); } },
  { rx: /revela[çc][ãa]o/i, apply: (m, ctx) => { ctx.addMoves.push("revelacao"); ctx.log.push("Incluída revelação"); } },
  { rx: /lento|calm[oa]|suave/i, apply: (m, ctx) => { ctx.pace = 1.3; ctx.log.push("Ritmo mais lento"); } },
  { rx: /r[áa]pid|din[âa]mic|curt[oa]/i, apply: (m, ctx) => { ctx.pace = 0.72; ctx.log.push("Ritmo mais dinâmico"); } },
];
function runDirectorNL(sm, text) {
  const ctx = { dur: null, aspect: null, env: null, seq: null, pace: 1, addMoves: [], log: [] };
  for (const r of NL_RULES) {
    const m = text.match(r.rx);
    if (m) r.apply(m, ctx);
  }
  if (!ctx.log.length) return { ok: false, log: ["Não reconheci comandos. Experimente termos como: \u201c30 segundos\u201d, \u201cpôr do sol\u201d, \u201cInstagram\u201d, \u201caéreo\u201d, \u201cmostrar a avenida\u201d."] };
  let shots = directorSequence(sm, ctx.seq || "padrao", ctx.dur ? ctx.dur / ctx.pace : null);
  for (const mv of ctx.addMoves) {
    if (!shots.some(s => s.move === mv)) {
      shots.splice(Math.max(1, shots.length - 1), 0, mkShot(sm.makeMove(mv)));
      }
  }
  if (ctx.pace !== 1) shots = shots.map(s => ({ ...s, dur: Math.max(2, +(s.dur * ctx.pace).toFixed(1)) }));
  if (ctx.dur) {
    const cur = shots.reduce((a, s) => a + s.dur, 0);
    const k = ctx.dur / cur;
    shots = shots.map(s => ({ ...s, dur: Math.max(1.5, +(s.dur * k).toFixed(1)) }));
  }
  ctx.log.push(`Roteiro: ${shots.map(s => s.name).join(" → ")}`);
  return { ok: true, shots, env: ctx.env, aspect: ctx.aspect, log: ctx.log };
}

// ============================================================================
// 10. PRIMITIVAS DE UI
// ============================================================================
const Stamp = ({ kind = "demo", children }) => <span className={`stamp ${kind}`}>{children || (kind === "f2" ? "Fase 2" : "Demonstração")}</span>;
const SectionLabel = ({ children, right }) => <div className="seclabel"><span>{children}</span>{right}</div>;
const Slider = ({ value, min = 0, max = 1, step = 0.01, onChange, onCommit, onStart, fmt, label }) => {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="field">
      <label title={label}>{label}</label>
      <div className="row" style={{ gap: 8 }}>
        <input type="range" min={min} max={max} step={step} value={value} style={{ flex: 1, "--p": pct + "%" }}
          onPointerDown={() => onStart && onStart()}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          onPointerUp={() => onCommit && onCommit()} onKeyUp={(e) => { if (onCommit && (e.key === "ArrowLeft" || e.key === "ArrowRight")) onCommit(); }} />
        <span className="mono" style={{ width: 44, textAlign: "right", color: "var(--tx2)" }}>{fmt ? fmt(value) : value.toFixed(2)}</span>
      </div>
    </div>
  );
};
const Field = ({ label, children }) => <div className="field"><label>{label}</label>{children}</div>;
const Toggle = ({ on, onChange, label }) => (
  <div className="field">
    <label>{label}</label>
    <button onClick={() => onChange(!on)} aria-pressed={on}
      style={{ width: 34, height: 18, borderRadius: 12, background: on ? "var(--accent)" : "var(--bg4)", position: "relative", transition: "background .15s" }}>
      <span style={{ position: "absolute", top: 2, left: on ? 18 : 2, width: 14, height: 14, borderRadius: "50%", background: on ? "var(--accent-ink)" : "var(--tx2)", transition: "left .15s" }} />
    </button>
  </div>
);
const Modal = ({ title, icon: Icon, onClose, children, footer, width = 560 }) => (
  <div className="modalback" onPointerDown={(e) => { if (e.target === e.currentTarget && onClose) onClose(); }}>
    <div className="modal" style={{ width, maxWidth: "94vw" }} role="dialog" aria-label={title}>
      <div className="row" style={{ padding: "13px 16px", borderBottom: "1px solid var(--line)" }}>
        {Icon && <Icon size={15} style={{ color: "var(--accent)" }} />}
        <b style={{ fontSize: 13 }}>{title}</b>
        <span style={{ flex: 1 }} />
        {onClose && <button className="iconbtn" onClick={onClose} aria-label="Fechar"><X size={15} /></button>}
      </div>
      <div style={{ padding: 16, overflowY: "auto", minHeight: 0 }}>{children}</div>
      {footer && <div className="row" style={{ padding: "12px 16px", borderTop: "1px solid var(--line)", justifyContent: "flex-end", gap: 8 }}>{footer}</div>}
    </div>
  </div>
);
const STATUS = {
  rascunho: { label: "Rascunho", color: "var(--tx3)" },
  revisao: { label: "Em revisão", color: "var(--info)" },
  ajustes: { label: "Precisa de ajustes", color: "var(--warn)" },
  aprovado: { label: "Aprovado", color: "var(--ok)" },
  exportado: { label: "Exportado", color: "var(--accent)" },
};

// ============================================================================
// 11. ESTADO DO DOCUMENTO
// ============================================================================
const initialDoc = () => ({
  version: 1,
  project: {
    name: "Residencial Horizonte", client: "Pixel Hub · cena demonstrativa", venture: "Loteamento Horizonte — Fase 1",
    owner: "", location: "Ipatinga · MG", type: "Loteamento", deadline: "", notes: "",
    createdAt: Date.now(), importedAt: null, firstPreviewAt: null,
  },
  geo: { lat: -19.47, lng: -42.54, northDeg: 0, units: "m", origin: "Origem local no cruzamento da Avenida Horizonte" },
  env: { ...ENV_DEFAULT },
  aspect: "16:9",
  output: { res: "1080", fps: 30, logoText: "PIXEL HUB", logoImg: null, watermark: "", fades: true },
  shots: [],
  accent: "#F2A83C",
  scenePresets: [],
  cloudId: null,
  reviewToken: null,
  reviewSyncAt: 0,
});
function docReducer(doc, a) {
  switch (a.type) {
    case "INIT": return a.doc;
    case "PROJECT": return { ...doc, project: { ...doc.project, ...a.patch } };
    case "GEO": return { ...doc, geo: { ...doc.geo, ...a.patch } };
    case "ENV": return { ...doc, env: { ...doc.env, ...a.patch } };
    case "OUTPUT": return { ...doc, output: { ...doc.output, ...a.patch } };
    case "ASPECT": return { ...doc, aspect: a.aspect };
    case "ACCENT": return { ...doc, accent: a.accent };
    case "SHOTS": return { ...doc, shots: a.shots };
    case "SHOT": return { ...doc, shots: doc.shots.map(s => s.id === a.id ? { ...s, ...a.patch, rev: a.bump ? s.rev + 1 : s.rev } : s) };
    case "PRESET_ADD": return { ...doc, scenePresets: [...doc.scenePresets, a.preset] };
    case "DOC": return { ...doc, ...a.patch };
    default: return doc;
  }
}

// ============================================================================
// 12. APLICATIVO
// ============================================================================
function App() {
  const hostRef = useRef(null);
  const canvasRef = useRef(null);
  const smRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [doc, dispatch] = useReducer(docReducer, null, initialDoc);
  const docRef = useRef(doc); docRef.current = doc;

  // interface
  const [sel, setSel] = useState(null);
  const [selShot, setSelShot] = useState(null);
  const [tab, setTab] = useState("ambiente");
  const [tool, setToolState] = useState("select");
  const [viewMode, setViewModeState] = useState("orbit");
  const [playing, setPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0);
  const [activeShotId, setActiveShotId] = useState(null);
  const [loop, setLoopState] = useState(false);
  const [rangeAB, setRangeAB] = useState(null);
  const [stats, setStats] = useState(null);
  const [sun, setSun] = useState({ elevDeg: 45, azDeg: 60, night: 0 });
  const [quality, setQualityState] = useState("edicao");
  const [showGrid, setShowGrid] = useState(false);
  const [showHUD, setShowHUD] = useState(false);
  const [placing, setPlacing] = useState(null);
  const [treeFilter, setTreeFilter] = useState("");
  const [collapsed, setCollapsed] = useState({});
  const [toasts, setToasts] = useState([]);
  const [modal, setModal] = useState(null); // {kind, ...}
  const [board, setBoard] = useState(false);
  const [thumbs, setThumbs] = useState({});
  const [recording, setRecording] = useState(null); // {progress, label}
  const [restorable, setRestorable] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [compare, setCompare] = useState(false);
  const compareEnvRef = useRef(null);
  const historyRef = useRef({ past: [], future: [] });
  const [histSize, setHistSize] = useState({ past: 0, future: 0 });

  const toast = useCallback((msg, kind = "info", ms = 4200) => {
    const id = uid("t");
    setToasts(ts => [...ts.slice(-3), { id, msg, kind }]);
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), ms);
  }, []);

  const sm = () => smRef.current;

  // -------- histórico (undo/redo por instantâneos do documento + cena)
  const snapshot = useCallback(() => {
    const s = sm(); if (!s) return;
    const snap = JSON.stringify({ doc: docRef.current, ov: s.collectOverrides() });
    const h = historyRef.current;
    if (h.past[h.past.length - 1] === snap) return;
    h.past.push(snap);
    if (h.past.length > 30) h.past.shift();
    h.future = [];
    setHistSize({ past: h.past.length, future: 0 });
    setDirty(true);
  }, []);
  const restoreSnap = useCallback((snap) => {
    const s = sm(); if (!s) return;
    const { doc: d, ov } = JSON.parse(snap);
    // remover objetos adicionados atuais e reaplicar
    for (const [id, e] of [...s.reg]) if (e.added) s.removeObject(id);
    for (const [id, e] of s.reg) { s.setTransform(id, { p: e.base.p.toArray(), rY: e.base.rY, s: e.base.s.x }); s.setVisible(id, true); }
    s.applyOverrides(ov);
    dispatch({ type: "INIT", doc: d });
    s.applyEnv(d.env, true);
    s.setGeo(d.geo);
    s.setTimeline(d.shots);
    setSel(null); s.setSelected(null);
    setDirty(true);
  }, []);
  const undo = useCallback(() => {
    const h = historyRef.current;
    if (!h.past.length) return;
    const s = sm();
    const cur = JSON.stringify({ doc: docRef.current, ov: s.collectOverrides() });
    const snap = h.past.pop();
    h.future.push(cur);
    restoreSnap(snap);
    setHistSize({ past: h.past.length, future: h.future.length });
  }, [restoreSnap]);
  const redo = useCallback(() => {
    const h = historyRef.current;
    if (!h.future.length) return;
    const s = sm();
    h.past.push(JSON.stringify({ doc: docRef.current, ov: s.collectOverrides() }));
    restoreSnap(h.future.pop());
    setHistSize({ past: h.past.length, future: h.future.length });
  }, [restoreSnap]);

  // -------- persistência
  const buildSave = useCallback(() => {
    const s = sm();
    return JSON.stringify({ savedAt: Date.now(), doc: docRef.current, ov: s ? s.collectOverrides() : null, imports: s ? [...s.reg.values()].filter(e => e.imported).map(e => ({ name: e.name, file: e.imported.fileName, stats: e.imported.stats, cloudId: e.imported.cloudId || null, p: e.obj.position.toArray(), rY: e.obj.rotation.y, s: e.obj.scale.x })) : [] });
  }, []);
  const saveNow = useCallback(async (silent = false) => {
    const ok = await Store.set(SAVE_KEY, buildSave());
    setDirty(false); setSavedAt(Date.now());
    if (!silent) toast(ok || Store.persistent ? `Projeto salvo (${Store.backend === "artifact" ? "armazenamento do artifact" : Store.backend === "local" ? "armazenamento local" : "memória da sessão"}).` : "Salvo apenas na memória desta sessão — use Exportar JSON para guardar de forma durável.", ok || Store.persistent ? "ok" : "warn");
  }, [buildSave, toast]);
  const loadSave = useCallback(async () => {
    const raw = await Store.get(SAVE_KEY);
    if (!raw) return false;
    try {
      const data = JSON.parse(raw);
      restoreSnap(JSON.stringify({ doc: { ...initialDoc(), ...data.doc }, ov: data.ov }));
      if (data.imports && data.imports.length) {
        const withCloud = data.imports.filter(i => i.cloudId);
        if (withCloud.length && cloudRef.current) { toast(`Baixando ${withCloud.length} maquete(s) da nuvem…`, "info", 3500); rehydrateImports(data.imports); }
        else toast(`Este projeto tinha ${data.imports.length} modelo(s) importado(s): ${data.imports.map(i => i.file).join(", ")}. Sem cópia na nuvem, a geometria não persiste — reimporte os arquivos.`, "warn", 9000);
      }
      setDirty(false); setSavedAt(data.savedAt || Date.now());
      return true;
    } catch (e) { toast("Não foi possível restaurar o salvamento anterior.", "err"); return false; }
  }, [restoreSnap, toast]);

  // -------- nuvem (Fase 2): projetos, maquetes persistentes, revisão do cliente
  const [cloud, setCloud] = useState(null);
  const cloudRef = useRef(null);
  const [cloudBusy, setCloudBusy] = useState(false);
  const saveCloudCfg = useCallback((cfg) => {
    cloudRef.current = cfg; setCloud(cfg);
    Store.set(CLOUD_KEY, cfg ? JSON.stringify(cfg) : "");
    if (!cfg) Store.del(CLOUD_KEY);
  }, []);
  const cloudOn = !!(cloud && cloud.url && cloud.key);
  const rehydrateImports = useCallback(async (imports) => {
    const s = sm(); const cfg = cloudRef.current;
    if (!s || !cfg) return 0;
    let n = 0;
    for (const im of imports || []) {
      if (!im.cloudId) continue;
      try {
        const ab = await apiReq(cfg, `/api/assets/${im.cloudId}`, { asBlob: true });
        const file = new File([ab], im.file, { type: "model/gltf-binary" });
        const res = await s.importModel(file, () => {});
        if (res && res.id) {
          const e = s.reg.get(res.id);
          e.imported.cloudId = im.cloudId;
          if (im.p) s.setTransform(res.id, { p: im.p, rY: im.rY, s: im.s });
          n++;
        }
      } catch (e) { toast(`Não foi possível baixar “${im.file}” da nuvem: ${e.message}`, "err", 7000); }
    }
    if (n) { toast(`${n} maquete(s) restaurada(s) da nuvem com posição e correções.`, "ok", 6000); force(); }
    return n;
  }, [toast]);
  const ensureCloudProject = useCallback(async () => {
    const cfg = cloudRef.current;
    if (!cfg) throw new Error("Nuvem não configurada.");
    if (docRef.current.cloudId) return docRef.current.cloudId;
    const d = docRef.current;
    const res = await apiReq(cfg, "/api/projects", { method: "POST", json: { name: d.project.name, client: d.project.client, type: d.project.type, doc: JSON.parse(buildSave()) } });
    dispatch({ type: "DOC", patch: { cloudId: res.id } });
    docRef.current = { ...docRef.current, cloudId: res.id };
    return res.id;
  }, [buildSave]);
  const cloudSave = useCallback(async () => {
    const cfg = cloudRef.current;
    if (!cfg) { setModal({ kind: "nuvem" }); return; }
    setCloudBusy(true);
    try {
      const id = await ensureCloudProject();
      const d = docRef.current;
      await apiReq(cfg, "/api/projects", { method: "POST", json: { id, name: d.project.name, client: d.project.client, type: d.project.type, doc: JSON.parse(buildSave()) } });
      setDirty(false); setSavedAt(Date.now());
      const semNuvem = sm() ? [...sm().reg.values()].filter(e => e.imported && !e.imported.cloudId).length : 0;
      toast(semNuvem
        ? `Projeto salvo na nuvem. Atenção: ${semNuvem} maquete(s) importada(s) antes da conexão não têm cópia na nuvem — reimporte-as para persistir a geometria.`
        : "Projeto salvo na nuvem — abra em qualquer máquina com a mesma chave.", semNuvem ? "warn" : "ok", 7000);
    } catch (e) { toast(`Falha ao salvar na nuvem: ${e.message}`, "err", 7000); }
    finally { setCloudBusy(false); }
  }, [ensureCloudProject, buildSave, toast]);
  const cloudOpenProject = useCallback(async (id) => {
    const cfg = cloudRef.current;
    setCloudBusy(true);
    try {
      const data = await apiReq(cfg, `/api/projects/${id}`);
      const save = data.doc || {};
      snapshot();
      restoreSnap(JSON.stringify({ doc: { ...initialDoc(), ...save.doc, cloudId: data.id }, ov: save.ov }));
      setModal(null);
      const withCloud = (save.imports || []).filter(i => i.cloudId);
      if (withCloud.length) { toast(`Baixando ${withCloud.length} maquete(s) da nuvem…`, "info", 3500); await rehydrateImports(save.imports); }
      const semNuvem = (save.imports || []).length - withCloud.length;
      if (semNuvem > 0) toast(`${semNuvem} maquete(s) deste projeto não têm cópia na nuvem — reimporte os arquivos originais.`, "warn", 8000);
      toast(`Projeto “${data.name}” aberto da nuvem.`, "ok");
      setDirty(false); setSavedAt(data.updated_at);
    } catch (e) { toast(`Falha ao abrir da nuvem: ${e.message}`, "err", 7000); }
    finally { setCloudBusy(false); }
  }, [snapshot, restoreSnap, rehydrateImports, toast]);
  const makeReviewLink = useCallback(async () => {
    const cfg = cloudRef.current; const s = sm();
    if (!cfg || !s) return;
    const shots = docRef.current.shots.filter(x => !x.muted);
    if (!shots.length) { toast("Crie tomadas antes de gerar o link de revisão.", "warn"); return; }
    setCloudBusy(true);
    try {
      const id = await ensureCloudProject();
      const payload = {
        projectName: docRef.current.project.name,
        client: docRef.current.project.client,
        aspect: docRef.current.aspect,
        total: shots.reduce((a, x) => a + x.dur, 0),
        shots: shots.map(x => ({ id: x.id, name: x.name, dur: x.dur, move: x.move, status: x.status, thumb: thumbs[x.id] || s.shotThumb(x) })),
      };
      const res = await apiReq(cfg, "/api/reviews", { method: "POST", json: { projectId: id, payload } });
      const url = `${window.location.origin}${window.location.pathname}?review=${res.token}&api=${encodeURIComponent(cfg.url)}`;
      dispatch({ type: "DOC", patch: { reviewToken: res.token, reviewSyncAt: Date.now() } });
      setModal({ kind: "share", reviewUrl: url });
      try { await navigator.clipboard.writeText(url); toast("Link de revisão criado e copiado — envie ao cliente.", "ok", 6000); }
      catch (e) { toast("Link de revisão criado — copie no modal.", "ok", 5000); }
    } catch (e) { toast(`Falha ao gerar link: ${e.message}`, "err", 7000); }
    finally { setCloudBusy(false); }
  }, [thumbs, ensureCloudProject, toast]);
  const pullReviews = useCallback(async () => {
    const cfg = cloudRef.current;
    const tok = docRef.current.reviewToken;
    if (!cfg || !tok) return;
    setCloudBusy(true);
    try {
      const fb = await apiReq(cfg, `/api/reviews/${tok}/feedback`);
      const since = docRef.current.reviewSyncAt || 0;
      const newC = fb.comments.filter(c => c.created_at > since);
      const latest = {};
      for (const a of fb.approvals) if (a.shot_id) latest[a.shot_id] = a;
      snapshot();
      const shots = docRef.current.shots.map(x => {
        const add = newC.filter(c => c.shot_id === x.id).map(c => ({ text: `${c.author}: ${c.text}`, at: c.created_at }));
        const ap = latest[x.id];
        return { ...x, comments: [...(x.comments || []), ...add], status: ap ? (ap.decision === "aprovado" ? "aprovado" : "ajustes") : x.status };
      });
      dispatch({ type: "SHOTS", shots });
      dispatch({ type: "DOC", patch: { reviewSyncAt: Date.now() } });
      const nA = Object.values(latest).filter(a => a.decision === "aprovado").length;
      const nJ = Object.values(latest).filter(a => a.decision === "ajustes").length;
      toast(`Revisões sincronizadas: ${newC.length} comentário(s) novo(s), ${nA} aprovada(s), ${nJ} com ajustes.`, "ok", 7000);
    } catch (e) { toast(`Falha ao puxar revisões: ${e.message}`, "err", 6000); }
    finally { setCloudBusy(false); }
  }, [snapshot, toast]);

  // -------- inicialização do motor 3D
  useEffect(() => {
    const s = new SceneManager(canvasRef.current, hostRef.current, {
      onSelect: (id) => { setSel(id); s.setSelected(id); if (id) setTab("objeto"); },
      onStats: setStats,
      onSun: setSun,
      onPlayhead: (t, shotId) => { setPlayhead(t); setActiveShotId(shotId); },
      onPlayState: setPlaying,
      onViewMode: setViewModeState,
      onTransform: () => {},
      onTransformEnd: () => snapshot(),
      onPlace: (item, pos) => {
        snapshot();
        const e = s.addLibraryItem(item.id, item.variant || 0, pos);
        setSel(e.id); s.setSelected(e.id); setTab("objeto");
        toast(`${e.name} inserido. Clique para inserir outro ou Esc para sair.`, "ok", 2600);
      },
    });
    smRef.current = s;
    s.setAspect(ASPECTS[docRef.current.aspect]);
    s.applyEnv(docRef.current.env, true);
    s.setGeo(docRef.current.geo);
    setReady(true);
    Store.get(SAVE_KEY).then(r => { if (r) setRestorable(true); });
    Store.get(CLOUD_KEY).then(r => { if (r) { try { const c = JSON.parse(r); cloudRef.current = c; setCloud(c); } catch (e) {} } });
    if (!docRef.current.project.firstPreviewAt) dispatch({ type: "PROJECT", patch: { firstPreviewAt: Date.now() } });
    return () => s.dispose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // sincronizações declarativas → motor
  useEffect(() => { const s = sm(); if (s) s.setTimeline(doc.shots); }, [doc.shots]);
  useEffect(() => { const s = sm(); if (s) s.setAspect(ASPECTS[doc.aspect]); }, [doc.aspect]);
  useEffect(() => { const s = sm(); if (s) { s.grid.visible = showGrid; } }, [showGrid]);
  useEffect(() => { const s = sm(); if (s) s.setLoop(loop); }, [loop]);
  useEffect(() => { const s = sm(); if (s) s.setRange(rangeAB); }, [rangeAB]);
  useEffect(() => { document.documentElement.style.setProperty("--accent", doc.accent); }, [doc.accent]);
  useEffect(() => {
    const s = sm(); if (!s) return;
    const shot = doc.shots.find(x => x.id === selShot);
    s.showPath(shot || null);
  }, [selShot, doc.shots]);

  // salvamento automático
  useEffect(() => {
    const iv = setInterval(() => { if (docRef.current && dirty) saveNow(true); }, 20000);
    return () => clearInterval(iv);
  }, [dirty, saveNow]);

  // -------- ações
  const setEnv = useCallback((patch, live = false) => {
    dispatch({ type: "ENV", patch });
    const s = sm(); if (s) s.applyEnv({ ...docRef.current.env, ...patch }, live);
  }, []);
  const applyEnvPreset = useCallback((id) => {
    const p = ENV_PRESETS.find(x => x.id === id);
    if (!p) return;
    snapshot();
    const patch = { ...p.p, preset: id, vignette: p.p.vignette || 0 };
    dispatch({ type: "ENV", patch });
    const s = sm(); if (s) s.applyEnv({ ...docRef.current.env, ...patch }, false);
  }, [snapshot]);
  const setShots = useCallback((shots, snap = true) => { if (snap) snapshot(); dispatch({ type: "SHOTS", shots }); }, [snapshot]);
  const addShotFromView = useCallback(() => {
    const s = sm(); if (!s) return;
    snapshot();
    const v = s.captureViewState();
    const shot = mkShot({ name: `Tomada ${docRef.current.shots.length + 1}`, move: "personalizada", fov: v.fov, dur: 5, ease: "easeInOut", keys: [{ p: v.p, t: v.t }] });
    dispatch({ type: "SHOTS", shots: [...docRef.current.shots, shot] });
    setSelShot(shot.id); setTab("tomada");
    setTimeout(() => setThumbs(t => ({ ...t, [shot.id]: s.shotThumb(shot) })), 60);
    toast("Tomada criada da vista atual. Mova a câmera e use K para adicionar pontos-chave.", "ok");
  }, [snapshot, toast]);
  const addKeyToShot = useCallback(() => {
    const s = sm(); if (!s) return;
    const shot = docRef.current.shots.find(x => x.id === selShot);
    if (!shot) { toast("Selecione uma tomada na timeline antes de adicionar pontos-chave (K).", "warn"); return; }
    snapshot();
    const v = s.captureViewState();
    dispatch({ type: "SHOT", id: shot.id, bump: true, patch: { keys: [...shot.keys, { p: v.p, t: v.t }] } });
    s.invalidateShot(shot);
    toast(`Ponto-chave ${shot.keys.length + 1} adicionado a “${shot.name}”.`, "ok", 2400);
  }, [selShot, snapshot, toast]);
  const addMoveShot = useCallback((type) => {
    const s = sm(); if (!s) return;
    snapshot();
    const selEntry = sel ? s.reg.get(sel) : null;
    let opts = {};
    if (selEntry) {
      const box = new THREE.Box3().setFromObject(selEntry.obj);
      const c = box.getCenter(new THREE.Vector3());
      opts = { center: [c.x, c.y, c.z], radius: Math.max(10, box.getSize(new THREE.Vector3()).length() * 0.9) };
    }
    const shot = mkShot(s.makeMove(type, opts));
    dispatch({ type: "SHOTS", shots: [...docRef.current.shots, shot] });
    setSelShot(shot.id);
    setTimeout(() => setThumbs(t => ({ ...t, [shot.id]: s.shotThumb(shot) })), 60);
  }, [sel, snapshot]);
  const runDirector = useCallback((kind, targetDur, envId, aspect, fromText) => {
    const s = sm(); if (!s) return null;
    snapshot();
    const shots = directorSequence(s, kind, targetDur);
    dispatch({ type: "SHOTS", shots });
    if (envId) applyEnvPreset(envId);
    if (aspect) dispatch({ type: "ASPECT", aspect });
    setSelShot(shots[0].id);
    setTimeout(() => {
      const th = {};
      shots.forEach(sh => { th[sh.id] = s.shotThumb(sh); });
      setThumbs(t => ({ ...t, ...th }));
    }, 80);
    return shots;
  }, [snapshot, applyEnvPreset]);
  const applyPHPreset = useCallback((p) => {
    runDirector(p.seq, p.dur, p.env, p.aspect);
    toast(`Preset “${p.label}” aplicado: ambientação, formato ${p.aspect} e roteiro de ${p.dur} s.`, "ok");
    setModal(null);
  }, [runDirector, toast]);
  const doCapture = useCallback(async () => {
    const s = sm(); if (!s) return;
    const o = docRef.current.output;
    const hpx = { "720": 720, "1080": 1080, "1440": 1440 }[o.res] || 1080;
    const a = ASPECTS[docRef.current.aspect];
    const w = Math.max(16, Math.round(hpx * a)), h = hpx;
    let logoImg = null;
    if (o.logoImg) { logoImg = new Image(); await new Promise(r => { logoImg.onload = r; logoImg.onerror = r; logoImg.src = o.logoImg; }); }
    const blob = await s.capturePNG({ w, h, brand: { logoText: o.logoText, logoImg: logoImg && logoImg.width ? logoImg : null, watermark: o.watermark } });
    download(`${docRef.current.project.name.replace(/\s+/g, "-").toLowerCase()}-quadro.png`, blob);
    toast(`Imagem ${w}×${h} exportada.`, "ok");
  }, [toast]);
  const doRecord = useCallback(async () => {
    const s = sm(); if (!s) return;
    if (!docRef.current.shots.filter(x => !x.muted).length) { toast("Crie tomadas na timeline antes de gravar.", "warn"); return; }
    const o = docRef.current.output;
    const hpx = { "720": 720, "1080": 1080, "1440": 1440 }[o.res] || 1080;
    const a = ASPECTS[docRef.current.aspect];
    const w = Math.round(hpx * a) & ~1, h = hpx & ~1;
    let logoImg = null;
    if (o.logoImg) { logoImg = new Image(); await new Promise(r => { logoImg.onload = r; logoImg.onerror = r; logoImg.src = o.logoImg; }); }
    setRecording({ progress: 0, label: "Preparando gravação…" });
    try {
      const { blob } = await s.recordWebM({
        w, h, fps: o.fps, fades: o.fades,
        brand: { logoText: o.logoText, logoImg: logoImg && logoImg.width ? logoImg : null, watermark: o.watermark },
        onProgress: (p, shot) => setRecording({ progress: p, label: shot ? `Gravando: ${shot.name}` : "Gravando…" }),
      });
      download(`${docRef.current.project.name.replace(/\s+/g, "-").toLowerCase()}-preview.webm`, blob);
      dispatch({ type: "SHOTS", shots: docRef.current.shots.map(x => x.muted ? x : { ...x, status: x.status === "aprovado" ? "exportado" : x.status }) });
      toast(`Vídeo WebM ${w}×${h} @ ${o.fps} fps exportado. MP4 e 4K entram com o serviço de render da Fase 2.`, "ok", 7000);
    } catch (e) {
      toast(e.message || "Falha na gravação.", "err", 7000);
    } finally { setRecording(null); }
  }, [toast]);
  const exportJSON = useCallback(() => {
    download(`${docRef.current.project.name.replace(/\s+/g, "-").toLowerCase()}.sceneflow.json`, new Blob([buildSave()], { type: "application/json" }));
    toast("Projeto exportado em JSON — caminho durável para backup e reimportação.", "ok");
  }, [buildSave, toast]);
  const importJSON = useCallback((file) => {
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const data = JSON.parse(rd.result);
        snapshot();
        restoreSnap(JSON.stringify({ doc: { ...initialDoc(), ...data.doc }, ov: data.ov }));
        toast("Projeto restaurado do JSON.", "ok");
      } catch (e) { toast("Arquivo JSON inválido.", "err"); }
    };
    rd.readAsText(file);
  }, [restoreSnap, snapshot, toast]);
  const handleModelFiles = useCallback(async (files) => {
    const s = sm(); if (!s) return;
    for (const file of files) {
      const ext = (file.name.split(".").pop() || "").toLowerCase();
      if (NATIVE_EXTS.includes(ext)) {
        toast(`Lendo ${file.name}…`, "info", 2200);
        try {
          snapshot();
          const res = await s.importModel(file, (w) => toast(w, "warn", 6500));
          if (res.needsConversion) {
            setModal({ kind: "import", queueFile: file, inner: res.inner });
            continue;
          }
          dispatch({ type: "PROJECT", patch: { importedAt: docRef.current.project.importedAt || Date.now() } });
          if (cloudRef.current) {
            (async () => {
              try {
                const pid = await ensureCloudProject();
                const bytes = await file.arrayBuffer();
                const up = await apiReq(cloudRef.current, `/api/assets?projectId=${encodeURIComponent(pid)}&fileName=${encodeURIComponent(file.name)}`, { method: "POST", body: bytes, headers: { "Content-Type": "application/octet-stream" } });
                const e2 = sm().reg.get(res.id);
                if (e2 && e2.imported) e2.imported.cloudId = up.id;
                toast(`${file.name} enviado à nuvem (${fmtBytes(up.size)}) — a geometria agora persiste com o projeto.`, "ok", 6000);
              } catch (e3) { toast(`Maquete importada localmente, mas o envio à nuvem falhou: ${e3.message}`, "warn", 7000); }
            })();
          }
          setSel(res.id); s.setSelected(res.id);
          s.frameSelection(res.id);
          setModal({ kind: "diag", targetId: res.id, diag: res.diag, fileName: file.name, stats: res.stats });
          toast(`${file.name}: ${res.stats.meshes} malhas · ${res.stats.triangles.toLocaleString("pt-BR")} triângulos.`, "ok", 6000);
        } catch (e) { toast(`${file.name}: ${e.message}`, "err", 9000); }
      } else if (CONVERT_EXTS.includes(ext)) {
        setModal({ kind: "import", queueFile: file });
      } else {
        toast(`.${ext} não reconhecido. Nativos: GLB, glTF, OBJ, ZIP. Via conversão (Fase 2): ${CONVERT_EXTS.slice(0, 6).join(", ").toUpperCase()}…`, "warn", 8000);
      }
    }
  }, [snapshot, toast]);
  const deleteSelected = useCallback(() => {
    const s = sm(); if (!s || !sel) return;
    const e = s.reg.get(sel);
    if (!e) return;
    snapshot();
    if (e.added || e.imported) { s.removeObject(sel); toast(`${e.name} removido.`, "ok", 2500); }
    else { s.setVisible(sel, false); toast(`${e.name} oculto (objeto da cena base — restaure pelo olho na árvore).`, "info", 4200); }
    setSel(null);
  }, [sel, snapshot, toast]);
  const setTool = useCallback((t) => { setToolState(t); const s = sm(); if (s) s.setTool(t); if (t !== "select") setPlacing(null); }, []);
  const setViewMode = useCallback((m) => { const s = sm(); if (s) s.setViewMode(m); }, []);
  const setQuality = useCallback((q) => { setQualityState(q); const s = sm(); if (s) s.setQuality(q); }, []);
  const startPlacing = useCallback((item) => {
    setPlacing(item);
    const s = sm(); if (s) s.setPlacing(item);
    setTool("select");
    toast(`Clique no terreno para inserir ${item.label}. Esc encerra.`, "info", 3600);
  }, [setTool, toast]);
  useEffect(() => { const s = sm(); if (s) s.setPlacing(placing); }, [placing]);

  const togglePlay = useCallback(() => {
    const s = sm(); if (!s) return;
    if (s.playState.playing) s.pause();
    else {
      if (!docRef.current.shots.filter(x => !x.muted).length) { toast("A timeline está vazia — crie uma tomada (tecla C) ou chame o Diretor Pixel.", "warn"); return; }
      if (!docRef.current.project.firstPreviewAt) dispatch({ type: "PROJECT", patch: { firstPreviewAt: Date.now() } });
      s.play();
    }
  }, [toast]);

  // -------- atalhos de teclado
  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select" || e.target.isContentEditable) return;
      const s = sm(); if (!s) return;
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z") { e.preventDefault(); undo(); }
        else if (e.key === "y" || (e.key === "Z" && e.shiftKey)) { e.preventDefault(); redo(); }
        else if (e.key === "s") { e.preventDefault(); saveNow(); }
        return;
      }
      switch (e.key) {
        case " ": e.preventDefault(); togglePlay(); break;
        case "f": case "F": s.frameSelection(); break;
        case "g": case "G": setTool(tool === "move" ? "select" : "move"); break;
        case "m": case "M": setTool(tool === "move" ? "select" : "move"); break;
        case "c": case "C": addShotFromView(); break;
        case "k": case "K": addKeyToShot(); break;
        case "r": s.rotateSelected(15); break;
        case "R": s.rotateSelected(-15); break;
        case "Escape":
          if (placing) setPlacing(null);
          else if (board) setBoard(false);
          else if (modal) setModal(null);
          else if (viewMode === "shot") s.stopPlayback(true);
          else { setSel(null); s.setSelected(null); }
          break;
        case "Delete": case "Backspace": deleteSelected(); break;
        case "Home": s.frameSelection(null); break;
        case "?": setModal({ kind: "help" }); break;
        case "1": setViewMode("orbit"); break;
        case "2": setViewMode("walk"); break;
        case "3": setViewMode("fly"); break;
        case "4": setViewMode("top"); break;
        case "5": setViewMode("front"); break;
        case "6": setViewMode("right"); break;
        default: break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tool, placing, board, modal, viewMode, undo, redo, saveNow, togglePlay, addShotFromView, addKeyToShot, deleteSelected, setTool, setViewMode]);

  // comparação antes/depois (segurar)
  const holdCompare = useCallback((down) => {
    const s = sm(); if (!s) return;
    if (down) {
      compareEnvRef.current = { ...docRef.current.env };
      s.applyEnv({ ...ENV_DEFAULT }, true);
      setCompare(true);
    } else if (compareEnvRef.current) {
      s.applyEnv(compareEnvRef.current, true);
      compareEnvRef.current = null;
      setCompare(false);
    }
  }, []);

  const [, force] = useReducer(x => x + 1, 0);
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 });
  useEffect(() => { const s = sm(); if (s) s.cb.onCanvasSize = setCanvasSize; }, [ready]);

  const total = doc.shots.reduce((a, s) => a + (s.muted ? 0 : s.dur), 0);
  const selEntry = ready && sel ? sm().reg.get(sel) : null;
  const shotSel = doc.shots.find(s => s.id === selShot) || null;
  const reg = ready ? [...sm().reg.values()] : [];
  const groups = useMemo(() => {
    const g = new Map();
    for (const e of reg) {
      if (treeFilter && !e.name.toLowerCase().includes(treeFilter.toLowerCase())) continue;
      if (!g.has(e.category)) g.set(e.category, []);
      g.get(e.category).push(e);
    }
    return [...g.entries()].sort((a, b) => CATEGORY_ORDER.indexOf(a[0]) - CATEGORY_ORDER.indexOf(b[0]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reg.length, treeFilter, sel, ready]);

  const fmtHour = (h) => `${String(Math.floor(h)).padStart(2, "0")}:${String(Math.round((h % 1) * 60)).padStart(2, "0")}`;
  const dayToDate = (d) => { const dt = new Date(2026, 0, d); return dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }); };

  // ------------------------------------------------------------- SUBVISTAS
  const renderTopBar = () => (
    <div className="row" style={{ height: 46, padding: "0 10px", background: "var(--bg1)", borderBottom: "1px solid var(--line)", gap: 6, flexShrink: 0 }}>
      <button className="row" onClick={() => setModal({ kind: "menu" })} style={{ gap: 8, padding: "5px 9px", borderRadius: 7 }} title="Menu do projeto">
        <span style={{ width: 22, height: 22, borderRadius: 5, background: "var(--accent)", color: "var(--accent-ink)", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 11 }}>PH</span>
        <span style={{ fontWeight: 650, letterSpacing: ".02em" }}>SceneFlow</span>
        <ChevronDown size={13} style={{ color: "var(--tx3)" }} />
      </button>
      <div style={{ width: 1, height: 20, background: "var(--line)" }} />
      <button className="row" onClick={() => setTab("projeto")} style={{ gap: 7, padding: "4px 8px", borderRadius: 6, minWidth: 0 }} title="Abrir dados do projeto">
        <span style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 220 }}>{doc.project.name}</span>
        <span className="mono" style={{ color: "var(--tx3)", fontSize: 10 }}>{doc.project.type}</span>
        {dirty && <span className="dot" style={{ background: "var(--warn)" }} title="Alterações não salvas" />}
      </button>
      <span style={{ flex: 1 }} />
      <button className="iconbtn" onClick={undo} disabled={!histSize.past} title="Desfazer (Ctrl+Z)"><Undo2 size={15} /></button>
      <button className="iconbtn" onClick={redo} disabled={!histSize.future} title="Refazer (Ctrl+Y)"><Redo2 size={15} /></button>
      <div style={{ width: 1, height: 20, background: "var(--line)" }} />
      <button className="btn sm ghost" onClick={() => setModal({ kind: "import" })}><Import size={13} />Importar</button>
      <button className="btn sm ghost" onClick={() => setModal({ kind: "diretor" })}><Wand2 size={13} />Diretor Pixel</button>
      <button className="btn sm ghost" onClick={() => setModal({ kind: "presets" })}><Sparkles size={13} />Presets</button>
      <button className="btn sm ghost" onClick={() => setBoard(true)}><LayoutGrid size={13} />Storyboard</button>
      <div style={{ width: 1, height: 20, background: "var(--line)" }} />
      <select value={quality} onChange={(e) => setQuality(e.target.value)} title="Qualidade de visualização" style={{ padding: "4px 6px" }}>
        <option value="eco">Econômico</option><option value="edicao">Edição</option>
        <option value="apresentacao">Apresentação</option><option value="alta">Alta</option>
      </select>
      <button className="btn sm ghost" onClick={() => setModal({ kind: "share" })}><Share2 size={13} />Compartilhar</button>
      <button className="btn sm" onClick={() => saveNow()} title="Salvar (Ctrl+S)"><Save size={13} />{savedAt && !dirty ? "Salvo" : "Salvar"}</button>
      <button className="btn sm primary" onClick={() => setTab("saida")}><MonitorPlay size={13} />Exportar</button>
      <button className="iconbtn" onClick={() => setModal({ kind: "config" })} title="Configurações"><Settings size={15} /></button>
      <button className="iconbtn" onClick={() => setModal({ kind: "help" })} title="Ajuda e atalhos (?)"><HelpCircle size={15} /></button>
    </div>
  );

  const renderTree = () => (
    <div className="panel" style={{ width: 262, flexShrink: 0, borderTop: "none", borderBottom: "none", borderLeft: "none" }}>
      <div style={{ padding: "10px 10px 6px" }}>
        <div className="row" style={{ background: "var(--bg0)", border: "1px solid var(--line2)", borderRadius: 6, padding: "0 8px" }}>
          <Search size={13} style={{ color: "var(--tx3)" }} />
          <input value={treeFilter} onChange={(e) => setTreeFilter(e.target.value)} placeholder="Filtrar cena…" style={{ border: "none", background: "none", flex: 1, boxShadow: "none" }} />
          {treeFilter && <button className="iconbtn" style={{ width: 20, height: 20 }} onClick={() => setTreeFilter("")}><X size={12} /></button>}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 6px 10px" }}>
        {groups.map(([cat, items]) => {
          const Icon = CATEGORY_ICONS[cat] || Box;
          const closed = collapsed[cat];
          return (
            <div key={cat}>
              <button className="row" onClick={() => setCollapsed(c => ({ ...c, [cat]: !closed }))}
                style={{ width: "100%", padding: "7px 6px 3px", color: "var(--tx3)", fontSize: 10, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", gap: 6 }}>
                {closed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                <Icon size={12} />
                <span>{cat}</span>
                <span className="mono" style={{ marginLeft: "auto", fontWeight: 400 }}>{items.length}</span>
              </button>
              {!closed && items.map(e => (
                <div key={e.id} className={`treerow ${sel === e.id ? "sel" : ""}`}
                  onClick={() => { setSel(e.id); sm().setSelected(e.id); setTab("objeto"); }}
                  onDoubleClick={() => sm().frameSelection(e.id)} title="Duplo clique enquadra">
                  <span className="dot" style={{ background: e.visible ? (e.added || e.imported ? "var(--accent)" : "var(--tx3)") : "transparent", border: e.visible ? "none" : "1px solid var(--tx3)" }} />
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", opacity: e.visible ? 1 : 0.45 }}>{e.name}</span>
                  <span className="rowtools">
                    <button className="iconbtn" style={{ width: 22, height: 22 }} title={e.visible ? "Ocultar" : "Mostrar"}
                      onClick={(ev) => { ev.stopPropagation(); snapshot(); sm().setVisible(e.id, !e.visible); force(); }}>
                      {e.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                    </button>
                  </span>
                </div>
              ))}
            </div>
          );
        })}
        {!groups.length && <div className="hint" style={{ padding: 12 }}>Nada encontrado para “{treeFilter}”.</div>}
      </div>
      <div style={{ padding: 8, borderTop: "1px solid var(--line)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        <button className="btn sm" onClick={() => setModal({ kind: "biblioteca" })}><Plus size={13} />Objeto</button>
        <button className="btn sm" onClick={() => setModal({ kind: "dispersar" })}><Trees size={13} />Dispersar</button>
      </div>
    </div>
  );

  const VIEWBTNS = [
    ["orbit", "Órbita", Compass, "1"], ["walk", "Caminhar", Footprints, "2"], ["fly", "Voo", Route, "3"],
    ["top", "Topo", Grid3x3, "4"], ["front", "Frente", Box, "5"], ["right", "Lateral", Box, "6"],
  ];
  const renderViewport = () => (
    <div style={{ flex: 1, minWidth: 0, position: "relative", background: "#101216", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }} ref={hostRef}
      onDragOver={(e) => { e.preventDefault(); }}
      onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files.length) handleModelFiles([...e.dataTransfer.files]); }}>
      <canvas ref={canvasRef} style={{ display: "block", boxShadow: "0 0 0 1px var(--line), 0 18px 60px rgba(0,0,0,.45)", cursor: placing ? "crosshair" : tool === "move" ? "move" : "default" }} />
      {doc.env.vignette > 0.02 && canvasSize.w > 0 && (
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: canvasSize.w, height: canvasSize.h, pointerEvents: "none",
          background: `radial-gradient(ellipse at center, transparent 52%, rgba(0,0,0,${(0.55 * doc.env.vignette).toFixed(2)}) 100%)` }} />
      )}
      {/* barra de vistas */}
      <div className="row" style={{ position: "absolute", top: 10, left: 12, gap: 5, flexWrap: "wrap" }}>
        {VIEWBTNS.map(([m, label, Icon, k]) => (
          <button key={m} className={`vpbtn ${viewMode === m ? "on" : ""}`} onClick={() => setViewMode(m)} title={`${label} (${k})`}>
            <Icon size={12} />{label}
          </button>
        ))}
      </div>
      <div className="row" style={{ position: "absolute", top: 10, right: 96, gap: 5 }}>
        <button className={`vpbtn ${tool === "move" ? "on" : ""}`} onClick={() => setTool(tool === "move" ? "select" : "move")} title="Mover seleção (G) · arraste no plano; Shift = altura; R gira">
          <Move size={12} />Mover
        </button>
        <button className={`vpbtn ${showGrid ? "on" : ""}`} onClick={() => setShowGrid(g => !g)} title="Grade de referência"><Grid3x3 size={12} /></button>
        <button className={`vpbtn ${showHUD ? "on" : ""}`} onClick={() => setShowHUD(h => !h)} title="HUD de desempenho"><Gauge size={12} /></button>
        <button className="vpbtn" onClick={addShotFromView} title="Criar tomada da vista atual (C)"><Camera size={12} />Tomada</button>
      </div>
      {/* OSD inferior estilo viewfinder */}
      <div className="row mono" style={{ position: "absolute", left: "50%", bottom: 10, transform: "translateX(-50%)", gap: 14, padding: "5px 12px", background: "rgba(21,23,28,.8)", border: "1px solid var(--line2)", borderRadius: 7, color: "var(--tx2)", backdropFilter: "blur(6px)", whiteSpace: "nowrap" }}>
        <span title="Formato ativo">{doc.aspect}</span>
        <span title="Resolução do quadro">{canvasSize.w}×{canvasSize.h}</span>
        <span title="Hora da cena"><Clock size={10} style={{ verticalAlign: -1 }} /> {fmtHour(doc.env.hour)}</span>
        <span title="Sol: elevação / azimute"><Sun size={10} style={{ verticalAlign: -1 }} /> {sun.elevDeg.toFixed(0)}° / {sun.azDeg.toFixed(0)}°</span>
        {stats && <span title="Quadros por segundo">{stats.fps} fps</span>}
        {viewMode === "shot" && <span style={{ color: "var(--accent)" }}>REPRODUÇÃO {fmtT(playhead)}</span>}
      </div>
      {/* dicas contextuais */}
      {placing && (
        <div className="row fadein" style={{ position: "absolute", top: 52, left: "50%", transform: "translateX(-50%)", gap: 8, padding: "6px 12px", background: "rgba(21,23,28,.9)", border: "1px solid var(--accent)", borderRadius: 8 }}>
          <Crosshair size={13} style={{ color: "var(--accent)" }} />
          <span>Inserindo <b>{placing.label}</b> — clique no terreno · <span className="kbd">Esc</span> encerra</span>
        </div>
      )}
      {(viewMode === "walk" || viewMode === "fly") && (
        <div className="mono fadein" style={{ position: "absolute", bottom: 46, left: "50%", transform: "translateX(-50%)", color: "var(--tx3)", fontSize: 10 }}>
          Arraste para olhar · WASD move{viewMode === "fly" ? " · Q/E sobe e desce" : ""} · Shift acelera · 1 volta à órbita
        </div>
      )}
      {compare && (
        <div style={{ position: "absolute", top: 52, right: 12, padding: "4px 10px", background: "var(--bg2)", border: "1px dashed var(--info)", borderRadius: 6, color: "var(--info)", fontSize: 11, fontWeight: 600 }}>ANTES — solte para voltar</div>
      )}
      {showHUD && stats && (
        <div className="mono fadein" style={{ position: "absolute", left: 12, bottom: 10, padding: "8px 10px", background: "rgba(21,23,28,.85)", border: "1px solid var(--line2)", borderRadius: 7, color: "var(--tx2)", fontSize: 10, lineHeight: 1.7 }}>
          <div>fps <b style={{ color: stats.fps < 30 ? "var(--err)" : stats.fps < 48 ? "var(--warn)" : "var(--ok)" }}>{stats.fps}</b> · {stats.ms} ms</div>
          <div>triângulos {Number(stats.tris).toLocaleString("pt-BR")}</div>
          <div>draw calls {stats.calls} · texturas {stats.texs}</div>
          <div>pixel ratio {stats.pr}{sm() && sm().adaptive.active ? " (reduzido)" : ""} · modo {quality}</div>
        </div>
      )}
      {recording && (
        <div className="modalback" style={{ zIndex: 70 }}>
          <div className="modal" style={{ width: 380, padding: 20 }}>
            <div className="row" style={{ gap: 10 }}>
              <span className="dot rec" style={{ background: "var(--err)", width: 10, height: 10 }} />
              <b>Gravando prévia WebM</b>
            </div>
            <div className="hint" style={{ margin: "10px 0 8px" }}>{recording.label}</div>
            <div style={{ height: 6, background: "var(--bg3)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: `${Math.round(recording.progress * 100)}%`, height: "100%", background: "var(--accent)", transition: "width .2s" }} />
            </div>
            <div className="row" style={{ justifyContent: "flex-end", marginTop: 14 }}>
              <button className="btn sm danger" onClick={() => sm().cancelRecord()}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
      {restorable && (
        <div className="row fadein" style={{ position: "absolute", top: 52, left: 12, gap: 10, padding: "8px 12px", background: "var(--bg2)", border: "1px solid var(--line2)", borderRadius: 8, boxShadow: "0 8px 30px rgba(0,0,0,.4)" }}>
          <FolderOpen size={14} style={{ color: "var(--accent)" }} />
          <span>Há um projeto salvo neste navegador.</span>
          <button className="btn sm primary" onClick={async () => { await loadSave(); setRestorable(false); }}>Restaurar</button>
          <button className="btn sm ghost" onClick={() => setRestorable(false)}>Agora não</button>
        </div>
      )}
    </div>
  );

  const MOVES = [
    ["aerea", "Vista aérea"], ["aproximacao", "Aproximação"], ["orbita", "Órbita"],
    ["travelling", "Travelling"], ["caminhada", "Caminhada"], ["panorama", "Panorâmica"],
    ["elevacao", "Elevação"], ["revelacao", "Revelação"], ["afastamento", "Afastamento"],
  ];
  const [matKey, setMatKey] = useState(null);
  const [matTick, setMatTick] = useState(0);
  const selMats = selEntry ? sm().listMaterials(sel) : [];
  useEffect(() => { setMatKey(k => (selMats.some(m => m.key === k) ? k : (selMats[0] ? selMats[0].key : null))); /* eslint-disable-next-line */ }, [sel, selMats.length]);
  const matRef = selMats.find(m => m.key === matKey)?.ref || null;
  const matProps = matRef ? sm().getMatProps(matRef) : null;
  const editMat = (patch) => { if (!matRef) return; sm().setMatProps(matRef, patch); setMatTick(t => t + 1); setDirty(true); };

  const renderSunArc = () => {
    const W = 268, H = 96, cx = W / 2, cy = H - 14, R = 74;
    const pts = [];
    for (let hh = 5; hh <= 19; hh += 0.5) {
      const s2 = sunPosition(hh, doc.env.day, doc.geo.lat, 0);
      pts.push([cx + ((hh - 12) / 7) * R, cy - Math.max(-6, Math.sin(s2.elev) * (H - 30))]);
    }
    const cur = sunPosition(doc.env.hour, doc.env.day, doc.geo.lat, 0);
    const sx = cx + ((clamp(doc.env.hour, 5, 19) - 12) / 7) * R;
    const sy = cy - Math.max(-6, Math.sin(cur.elev) * (H - 30));
    const setFromX = (clientX, el) => {
      const r = el.getBoundingClientRect();
      const x = clamp((clientX - r.left) / r.width, 0, 1);
      setEnv({ hour: +(5 + x * 14).toFixed(2), preset: "custom" }, true);
    };
    return (
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block", cursor: "ew-resize", touchAction: "none" }}
        onPointerDown={(e) => { snapshot(); e.currentTarget.setPointerCapture(e.pointerId); setFromX(e.clientX, e.currentTarget); }}
        onPointerMove={(e) => { if (e.buttons) setFromX(e.clientX, e.currentTarget); }}>
        <line x1={8} y1={cy} x2={W - 8} y2={cy} stroke="var(--line2)" strokeDasharray="3 3" />
        <polyline points={pts.map(p => p.join(",")).join(" ")} fill="none" stroke="var(--tx3)" strokeWidth="1.4" />
        <circle cx={sx} cy={sy} r={6} fill={sun.elevDeg > 0 ? "var(--accent)" : "var(--bg4)"} stroke="var(--tx)" strokeWidth="1.2" />
        <text x={8} y={12} fill="var(--tx3)" fontSize="9" fontFamily="var(--mono)">SOL · {fmtHour(doc.env.hour)} · {sun.elevDeg.toFixed(0)}°</text>
        <text x={8} y={cy - 4} fill="var(--tx3)" fontSize="8" fontFamily="var(--mono)">05h</text>
        <text x={W - 26} y={cy - 4} fill="var(--tx3)" fontSize="8" fontFamily="var(--mono)">19h</text>
      </svg>
    );
  };

  const TABS = [
    ...(selEntry ? [["objeto", "Objeto", Box], ["material", "Material", Palette]] : []),
    ["ambiente", "Ambiente", Sun], ["tomada", "Tomada", Video], ["saida", "Saída", MonitorPlay], ["projeto", "Projeto", MapPin],
  ];
  const activeTab = TABS.some(t => t[0] === tab) ? tab : "ambiente";

  const renderRight = () => (
    <div className="panel" style={{ width: 304, flexShrink: 0, borderTop: "none", borderBottom: "none", borderRight: "none" }}>
      <div className="row" style={{ padding: "8px 8px 0", gap: 2, borderBottom: "1px solid var(--line)", flexShrink: 0 }}>
        {TABS.map(([id, label, Icon]) => (
          <button key={id} onClick={() => setTab(id)} title={label}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 2px 8px", color: activeTab === id ? "var(--accent)" : "var(--tx3)", borderBottom: activeTab === id ? "2px solid var(--accent)" : "2px solid transparent", fontSize: 10 }}>
            <Icon size={14} /><span>{label}</span>
          </button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 14px 18px" }}>
        {activeTab === "objeto" && selEntry && (() => {
          const o = selEntry.obj;
          const num = (v) => +v.toFixed(2);
          const setT = (patch) => { sm().setTransform(sel, patch); force(); setDirty(true); };
          return (
            <>
              <SectionLabel>Objeto</SectionLabel>
              <div className="row" style={{ gap: 8, marginBottom: 4 }}>
                <b style={{ fontSize: 13 }}>{selEntry.name}</b>
                {selEntry.imported && <Stamp kind="demo">Importado</Stamp>}
              </div>
              <div className="hint">{selEntry.category}{selEntry.added ? " · inserido da biblioteca" : selEntry.imported ? ` · ${selEntry.imported.fileName}` : " · cena base"}</div>
              <SectionLabel>Transformação</SectionLabel>
              {["x", "y", "z"].map((ax) => (
                <Field key={ax} label={`Posição ${ax.toUpperCase()}`}>
                  <input type="number" step="0.5" value={num(o.position[ax])}
                    onFocus={snapshot}
                    onChange={(e) => setT({ p: ["x", "y", "z"].map(a2 => a2 === ax ? parseFloat(e.target.value) || 0 : o.position[a2]) })} />
                </Field>
              ))}
              <Field label="Rotação Y">
                <div className="row">
                  <input type="number" step="5" value={Math.round(o.rotation.y / D2R)} onFocus={snapshot}
                    onChange={(e) => setT({ rY: (parseFloat(e.target.value) || 0) * D2R })} style={{ flex: 1 }} />
                  <button className="iconbtn" onClick={() => { snapshot(); sm().rotateSelected(15); force(); }} title="Girar 15° (R)"><RotateCw size={13} /></button>
                </div>
              </Field>
              <Field label="Escala">
                <input type="number" step="0.05" min="0.05" value={num(o.scale.x)} onFocus={snapshot}
                  onChange={(e) => setT({ s: Math.max(0.05, parseFloat(e.target.value) || 1) })} />
              </Field>
              <div className="row" style={{ marginTop: 10, gap: 6, flexWrap: "wrap" }}>
                <button className="btn sm" onClick={() => sm().frameSelection(sel)}><Maximize2 size={12} />Enquadrar (F)</button>
                <button className="btn sm" onClick={() => setTool(tool === "move" ? "select" : "move")}><Move size={12} />{tool === "move" ? "Movendo…" : "Mover (G)"}</button>
                <button className="btn sm danger" onClick={deleteSelected}><Trash2 size={12} />{selEntry.added || selEntry.imported ? "Excluir" : "Ocultar"}</button>
              </div>
              {selEntry.imported && (
                <>
                  <SectionLabel>Maquete importada</SectionLabel>
                  <div className="hint mono" style={{ lineHeight: 1.8 }}>
                    {selEntry.imported.stats.meshes} malhas · {selEntry.imported.stats.triangles.toLocaleString("pt-BR")} tris<br />
                    {selEntry.imported.stats.materials} materiais · {selEntry.imported.stats.textures} texturas
                  </div>
                  <button className="btn sm" style={{ marginTop: 8 }} onClick={() => setModal({ kind: "diag", targetId: sel, diag: sm().diagnose(sel), fileName: selEntry.imported.fileName, stats: selEntry.imported.stats })}>
                    <Gauge size={12} />Diagnóstico da maquete
                  </button>
                  <div className="hint" style={{ marginTop: 8 }}>A geometria importada vive só nesta sessão — o projeto salva nome, correções e transformações para reaplicar ao reimportar.</div>
                </>
              )}
              {selEntry.scatter && <div className="hint" style={{ marginTop: 10 }}>Dispersão instanciada: {selEntry.scatter.count}× num raio de {selEntry.scatter.radius} m (semente {selEntry.scatter.seed}).</div>}
            </>
          );
        })()}

        {activeTab === "material" && selEntry && (
          <>
            <SectionLabel>Materiais do objeto</SectionLabel>
            {!selMats.length && <div className="hint">Este objeto não tem materiais editáveis.</div>}
            {selMats.length > 1 && (
              <select value={matKey || ""} onChange={(e) => setMatKey(e.target.value)} style={{ width: "100%", marginBottom: 8 }}>
                {selMats.map(m => <option key={m.key} value={m.key}>{m.name}</option>)}
              </select>
            )}
            {matProps && (
              <>
                <Field label="Cor base">
                  <div className="row">
                    <input type="color" value={matProps.color} onFocus={snapshot} onChange={(e) => editMat({ color: e.target.value })} />
                    <span className="mono" style={{ color: "var(--tx3)" }}>{matProps.color}</span>
                  </div>
                </Field>
                <Slider label="Rugosidade" value={matProps.roughness} onChange={(v) => editMat({ roughness: v })} onStart={snapshot} />
                <Slider label="Metalicidade" value={matProps.metalness} onChange={(v) => editMat({ metalness: v })} onStart={snapshot} />
                <Slider label="Opacidade" value={matProps.opacity} min={0.05} onChange={(v) => editMat({ opacity: v })} onStart={snapshot} />
                <Field label="Emissão">
                  <div className="row">
                    <input type="color" value={matProps.emissive} onFocus={snapshot} onChange={(e) => editMat({ emissive: e.target.value })} />
                    <input type="range" min={0} max={3} step={0.05} value={matProps.emissiveIntensity} style={{ flex: 1, "--p": (matProps.emissiveIntensity / 3) * 100 + "%" }}
                      onPointerDown={snapshot} onChange={(e) => editMat({ emissiveIntensity: parseFloat(e.target.value) })} />
                  </div>
                </Field>
                {matProps.hasMap && (
                  <>
                    <Slider label="Escala textura" value={matProps.mapRepeat} min={0.1} max={20} step={0.1} fmt={(v) => v.toFixed(1)} onChange={(v) => editMat({ mapRepeat: v })} onStart={snapshot} />
                    <Slider label="Rotação UV" value={matProps.mapRot} min={0} max={Math.PI} step={0.02} fmt={(v) => Math.round(v / D2R) + "°"} onChange={(v) => editMat({ mapRot: v })} onStart={snapshot} />
                  </>
                )}
                <div className="row" style={{ gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                  <button className="btn sm" onClick={() => { snapshot(); const n = sm().applySimilar(matRef, sm().getMatProps(matRef)); toast(`Aplicado a ${n} material(is) semelhante(s) por nome.`, "ok"); }}>
                    <Copy size={12} />Aplicar a semelhantes
                  </button>
                  <button className="btn sm ghost" onClick={() => { snapshot(); sm().restoreMat(matRef); setMatTick(t => t + 1); }}>Restaurar original</button>
                </div>
                <SectionLabel>Biblioteca de materiais</SectionLabel>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {MATERIAL_PRESETS.map(p => (
                    <button key={p.id} className="row" onClick={() => { snapshot(); editMat({ color: p.color, roughness: p.roughness, metalness: p.metalness, opacity: p.opacity !== undefined ? p.opacity : 1, emissive: p.emissive || "#000000", emissiveIntensity: p.emissiveIntensity !== undefined ? p.emissiveIntensity : 1 }); }}
                      style={{ gap: 7, padding: "6px 8px", borderRadius: 6, background: "var(--bg2)", border: "1px solid var(--line)", textAlign: "left" }}>
                      <span style={{ width: 16, height: 16, borderRadius: 4, background: p.color, border: "1px solid var(--line2)", flexShrink: 0, opacity: p.opacity !== undefined ? Math.max(0.4, p.opacity) : 1 }} />
                      <span style={{ fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {activeTab === "ambiente" && (
          <>
            <SectionLabel>Cenários rápidos</SectionLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {ENV_PRESETS.map(p => (
                <button key={p.id} className={`chip ${doc.env.preset === p.id ? "on" : ""}`} onClick={() => applyEnvPreset(p.id)}>
                  <p.icon size={12} />{p.label}
                </button>
              ))}
            </div>
            <SectionLabel>Posição solar real</SectionLabel>
            <div className="card" style={{ padding: "8px 6px 2px" }}>{renderSunArc()}</div>
            <Slider label="Hora do dia" value={doc.env.hour} min={0} max={24} step={0.05} fmt={fmtHour} onChange={(v) => setEnv({ hour: v, preset: "custom" }, true)} onStart={snapshot} />
            <Slider label="Dia do ano" value={doc.env.day} min={1} max={365} step={1} fmt={dayToDate} onChange={(v) => setEnv({ day: v }, true)} onStart={snapshot} />
            <div className="hint">Calculada por latitude ({doc.geo.lat.toFixed(2)}°), data e norte do projeto — ajuste-os na aba Projeto.</div>
            <SectionLabel>Atmosfera</SectionLabel>
            <Slider label="Nuvens" value={doc.env.cloud} onChange={(v) => setEnv({ cloud: v, preset: "custom" }, true)} onStart={snapshot} />
            <Slider label="Névoa" value={doc.env.fog} onChange={(v) => setEnv({ fog: v }, true)} onStart={snapshot} />
            <Slider label="Sol · força" value={doc.env.sunIntensity} min={0} max={1.6} onChange={(v) => setEnv({ sunIntensity: v }, true)} onStart={snapshot} />
            <Slider label="Luz ambiente" value={doc.env.ambient} min={0} max={1.4} onChange={(v) => setEnv({ ambient: v }, true)} onStart={snapshot} />
            <SectionLabel>Imagem</SectionLabel>
            <Slider label="Exposição" value={doc.env.exposure} min={0.4} max={1.8} onChange={(v) => setEnv({ exposure: v }, true)} onStart={snapshot} />
            <Field label="Tone mapping">
              <select value={doc.env.tone} onChange={(e) => { snapshot(); setEnv({ tone: e.target.value }, true); }}>
                <option>ACES</option><option>Reinhard</option><option>Cineon</option><option>Linear</option>
              </select>
            </Field>
            <Toggle label="Sombras" on={doc.env.shadowsOn} onChange={(v) => { snapshot(); setEnv({ shadowsOn: v }, true); }} />
            <Slider label="Suavidade" value={doc.env.shadowSoft} onChange={(v) => setEnv({ shadowSoft: v }, true)} onStart={snapshot} />
            <Slider label={"Vinheta"} value={doc.env.vignette} onChange={(v) => setEnv({ vignette: v }, true)} onStart={snapshot} />
            <div className="hint">Vinheta aparece na imagem e no vídeo exportados (prévia de pós-produção). Bloom, profundidade de campo e oclusão ambiental chegam com o pipeline de render <Stamp kind="f2" />.</div>
            <div className="row" style={{ gap: 6, marginTop: 12 }}>
              <button className="btn sm" style={{ flex: 1 }}
                onPointerDown={() => holdCompare(true)} onPointerUp={() => holdCompare(false)} onPointerLeave={() => compare && holdCompare(false)}>
                <Eye size={12} />Segurar p/ comparar
              </button>
              <button className="btn sm" style={{ flex: 1 }} onClick={() => setModal({ kind: "savepreset" })}><Star size={12} />Salvar preset</button>
            </div>
            {doc.scenePresets.length > 0 && (
              <>
                <SectionLabel>Presets de Cena Pixel Hub</SectionLabel>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {doc.scenePresets.map(p => (
                    <button key={p.id} className="chip" onClick={() => { snapshot(); setEnv({ ...p.env, preset: "custom" }); if (p.aspect) dispatch({ type: "ASPECT", aspect: p.aspect }); toast(`Preset “${p.name}” aplicado.`, "ok", 2500); }}>
                      <Star size={11} />{p.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {activeTab === "tomada" && (
          <>
            {!shotSel && (
              <>
                <SectionLabel>Tomadas de câmera</SectionLabel>
                <div className="hint">Nenhuma tomada selecionada. Crie a partir da vista atual ou insira um movimento pronto{sel ? " ao redor da seleção" : ""}.</div>
                <button className="btn primary" style={{ width: "100%", margin: "10px 0 6px" }} onClick={addShotFromView}><Camera size={13} />Tomada da vista atual (C)</button>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {MOVES.map(([id, label]) => <button key={id} className="btn sm" onClick={() => addMoveShot(id)}>{label}</button>)}
                </div>
                <div className="hint" style={{ marginTop: 10 }}>Ou peça uma sequência completa ao <b>Diretor Pixel</b> na barra superior.</div>
              </>
            )}
            {shotSel && (
              <>
                <SectionLabel right={<span className="mono" style={{ color: STATUS[shotSel.status].color }}>{STATUS[shotSel.status].label}</span>}>Tomada</SectionLabel>
                <Field label="Nome"><input value={shotSel.name} onFocus={snapshot} onChange={(e) => dispatch({ type: "SHOT", id: shotSel.id, patch: { name: e.target.value } })} /></Field>
                <Field label="Status">
                  <select value={shotSel.status} onChange={(e) => { snapshot(); dispatch({ type: "SHOT", id: shotSel.id, patch: { status: e.target.value } }); }}>
                    {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </Field>
                <Slider label="Duração" value={shotSel.dur} min={1} max={30} step={0.5} fmt={(v) => v.toFixed(1) + " s"} onChange={(v) => dispatch({ type: "SHOT", id: shotSel.id, patch: { dur: v } })} onStart={snapshot} />
                <Field label="Suavização">
                  <select value={shotSel.ease} onChange={(e) => { snapshot(); dispatch({ type: "SHOT", id: shotSel.id, patch: { ease: e.target.value } }); }}>
                    {Object.entries(EASINGS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </Field>
                <Slider label="Campo (FOV)" value={shotSel.fov} min={18} max={95} step={1} fmt={(v) => v.toFixed(0) + "°"} onChange={(v) => { dispatch({ type: "SHOT", id: shotSel.id, patch: { fov: v } }); }} onStart={snapshot} />
                <SectionLabel>Trajetória · {shotSel.keys.length} ponto(s)</SectionLabel>
                <div className="hint">Mova a câmera e pressione <span className="kbd">K</span> para acrescentar um ponto-chave. A curva (Catmull-Rom) aparece no viewport.</div>
                <div className="col" style={{ gap: 4, margin: "8px 0" }}>
                  {shotSel.keys.map((k, i) => (
                    <div key={i} className="row" style={{ gap: 6, padding: "4px 8px", background: "var(--bg2)", borderRadius: 6, border: "1px solid var(--line)" }}>
                      <CircleDot size={11} style={{ color: i === 0 ? "var(--ok)" : "var(--accent)" }} />
                      <span className="mono" style={{ fontSize: 10, color: "var(--tx2)", flex: 1 }}>#{i + 1} · {k.p.map(n => n.toFixed(0)).join(", ")}</span>
                      <button className="iconbtn" style={{ width: 20, height: 20 }} title="Ver deste ponto" onClick={() => { sm().applyCameraSample({ p: new THREE.Vector3(...k.p), t: new THREE.Vector3(...k.t), fov: shotSel.fov }); }}><Eye size={11} /></button>
                      {shotSel.keys.length > 1 && (
                        <button className="iconbtn" style={{ width: 20, height: 20 }} title="Remover ponto" onClick={() => { snapshot(); dispatch({ type: "SHOT", id: shotSel.id, bump: true, patch: { keys: shotSel.keys.filter((_, j) => j !== i) } }); sm().invalidateShot(shotSel); }}><X size={11} /></button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                  <button className="btn sm" onClick={addKeyToShot}><Plus size={12} />Ponto-chave (K)</button>
                  <button className="btn sm" onClick={() => {
                    const start = doc.shots.filter(s2 => !s2.muted).slice(0, doc.shots.filter(s2 => !s2.muted).findIndex(s2 => s2.id === shotSel.id)).reduce((a, s2) => a + s2.dur, 0);
                    sm().play(start);
                  }}><Play size={12} />Reproduzir daqui</button>
                  <button className="btn sm ghost" onClick={() => { setTimeout(() => setThumbs(t => ({ ...t, [shotSel.id]: sm().shotThumb(shotSel) })), 30); }}>Atualizar miniatura</button>
                </div>
                <SectionLabel>Comentários · {(shotSel.comments || []).length}</SectionLabel>
                {(shotSel.comments || []).map((c, i) => (
                  <div key={i} className="card" style={{ padding: "7px 10px", marginBottom: 5 }}>
                    <div className="hint" style={{ color: "var(--tx)" }}>{c.text}</div>
                    <div className="mono" style={{ fontSize: 9, color: "var(--tx3)", marginTop: 3 }}>{new Date(c.at).toLocaleString("pt-BR")}</div>
                  </div>
                ))}
                <div className="row" style={{ gap: 6 }}>
                  <input placeholder="Anotar revisão local…" onKeyDown={(e) => {
                    if (e.key === "Enter" && e.target.value.trim()) {
                      snapshot();
                      dispatch({ type: "SHOT", id: shotSel.id, patch: { comments: [...(shotSel.comments || []), { text: e.target.value.trim(), at: Date.now() }] } });
                      e.target.value = "";
                    }
                  }} style={{ flex: 1 }} />
                  <StickyNote size={14} style={{ color: "var(--tx3)" }} />
                </div>
                <div className="hint" style={{ marginTop: 6 }}>Comentários ficam no arquivo do projeto. Revisão multiusuário com aprovação do cliente <Stamp kind="f2" />.</div>
              </>
            )}
          </>
        )}

        {activeTab === "saida" && (
          <>
            <SectionLabel>Formato de entrega</SectionLabel>
            <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
              {Object.keys(ASPECTS).map(a => (
                <button key={a} className={`chip ${doc.aspect === a ? "on" : ""}`} onClick={() => { snapshot(); dispatch({ type: "ASPECT", aspect: a }); }}>
                  {a}{a === "9:16" ? " · social" : a === "16:9" ? " · vídeo" : ""}
                </button>
              ))}
            </div>
            <div className="hint" style={{ marginTop: 6 }}>O viewport recorta para o formato real — o que você vê é o quadro exportado.</div>
            <Field label="Resolução">
              <select value={doc.output.res} onChange={(e) => dispatch({ type: "OUTPUT", patch: { res: e.target.value } })}>
                <option value="720">HD · 720</option><option value="1080">Full HD · 1080</option><option value="1440">QHD · 1440</option>
              </select>
            </Field>
            <Field label="Quadros/s">
              <select value={doc.output.fps} onChange={(e) => dispatch({ type: "OUTPUT", patch: { fps: +e.target.value } })}>
                <option value={24}>24 fps</option><option value={30}>30 fps</option><option value={60}>60 fps</option>
              </select>
            </Field>
            <SectionLabel>Marca</SectionLabel>
            <Field label="Assinatura"><input value={doc.output.logoText} placeholder="PIXEL HUB" onChange={(e) => dispatch({ type: "OUTPUT", patch: { logoText: e.target.value } })} /></Field>
            <Field label="Logotipo">
              <div className="row">
                <label className="btn sm" style={{ cursor: "pointer" }}>
                  <Upload size={12} />{doc.output.logoImg ? "Trocar" : "Enviar PNG"}
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
                    const f = e.target.files[0]; if (!f) return;
                    const rd = new FileReader();
                    rd.onload = () => dispatch({ type: "OUTPUT", patch: { logoImg: rd.result } });
                    rd.readAsDataURL(f);
                  }} />
                </label>
                {doc.output.logoImg && <button className="btn sm ghost" onClick={() => dispatch({ type: "OUTPUT", patch: { logoImg: null } })}>Remover</button>}
              </div>
            </Field>
            <Field label="Marca-d’água"><input value={doc.output.watermark} placeholder="ex.: PRÉVIA — NÃO APROVADO" onChange={(e) => dispatch({ type: "OUTPUT", patch: { watermark: e.target.value } })} /></Field>
            <Toggle label="Fade inicial/final" on={doc.output.fades} onChange={(v) => dispatch({ type: "OUTPUT", patch: { fades: v } })} />
            <SectionLabel>Exportar agora</SectionLabel>
            <div className="col" style={{ gap: 6 }}>
              <button className="btn" onClick={doCapture}><ImageIcon size={13} />Capturar imagem PNG</button>
              <button className="btn primary" onClick={doRecord}><Film size={13} />Gravar prévia em vídeo (WebM)</button>
              <div className="hint">A prévia grava a timeline em tempo real no navegador, com logotipo, marca-d’água e fades compostos no quadro.</div>
              <button className="btn" onClick={exportJSON}><FileJson size={13} />Exportar projeto (JSON)</button>
              <button className="btn" onClick={() => {
                const data = doc.shots.map((s2, i) => ({ ordem: i + 1, nome: s2.name, movimento: s2.move, duracao: s2.dur, status: STATUS[s2.status].label, comentarios: (s2.comments || []).map(c => c.text) }));
                download(`${doc.project.name.replace(/\s+/g, "-").toLowerCase()}-storyboard.json`, new Blob([JSON.stringify({ projeto: doc.project.name, formato: doc.aspect, total, tomadas: data }, null, 2)], { type: "application/json" }));
              }}><LayoutGrid size={13} />Exportar storyboard (JSON)</button>
            </div>
            <SectionLabel>Render de alta qualidade</SectionLabel>
            <div className="col" style={{ gap: 6 }}>
              <button className="btn" disabled><Film size={13} />MP4 H.264 <Stamp kind="f2" /></button>
              <button className="btn" disabled><Aperture size={13} />4K · ray tracing <Stamp kind="f2" /></button>
              <button className="btn" disabled><Loader2 size={13} />Fila de render na nuvem <Stamp kind="f2" /></button>
              <div className="hint">O serviço da Fase 2 renderiza a mesma timeline (JSON exportado acima) em MP4/4K com pós-produção completa, sem depender do navegador.</div>
            </div>
          </>
        )}

        {activeTab === "projeto" && (
          <>
            <SectionLabel>Identificação</SectionLabel>
            {[["name", "Nome"], ["client", "Cliente"], ["venture", "Empreendimento"], ["owner", "Responsável"], ["location", "Localização"]].map(([k, label]) => (
              <Field key={k} label={label}><input value={doc.project[k]} onFocus={snapshot} onChange={(e) => dispatch({ type: "PROJECT", patch: { [k]: e.target.value } })} /></Field>
            ))}
            <Field label="Tipo">
              <select value={doc.project.type} onChange={(e) => { snapshot(); dispatch({ type: "PROJECT", patch: { type: e.target.value } }); }}>
                {PROJECT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Prazo"><input type="date" value={doc.project.deadline} onChange={(e) => dispatch({ type: "PROJECT", patch: { deadline: e.target.value } })} /></Field>
            <Field label="Observações"><textarea rows={2} value={doc.project.notes} onFocus={snapshot} onChange={(e) => dispatch({ type: "PROJECT", patch: { notes: e.target.value } })} /></Field>
            <SectionLabel>Georreferência</SectionLabel>
            <Slider label="Norte do projeto" value={doc.geo.northDeg} min={-180} max={180} step={1} fmt={(v) => v.toFixed(0) + "°"} onChange={(v) => { dispatch({ type: "GEO", patch: { northDeg: v } }); sm().setGeo({ northDeg: v }); }} onStart={snapshot} />
            <Field label="Latitude"><input type="number" step="0.01" value={doc.geo.lat} onFocus={snapshot} onChange={(e) => { const v = clamp(parseFloat(e.target.value) || 0, -66, 66); dispatch({ type: "GEO", patch: { lat: v } }); sm().setGeo({ lat: v }); }} /></Field>
            <Field label="Longitude"><input type="number" step="0.01" value={doc.geo.lng} onChange={(e) => dispatch({ type: "GEO", patch: { lng: parseFloat(e.target.value) || 0 } })} /></Field>
            <Field label="Unidades">
              <select value={doc.geo.units} onChange={(e) => dispatch({ type: "GEO", patch: { units: e.target.value } })}>
                <option value="m">Metros</option><option value="cm">Centímetros</option><option value="mm">Milímetros</option>
              </select>
            </Field>
            <Field label="Origem local"><input value={doc.geo.origin} onChange={(e) => dispatch({ type: "GEO", patch: { origin: e.target.value } })} /></Field>
            <div className="hint">Norte e latitude alimentam o cálculo solar. Importações do Civil 3D distantes da origem são recentradas pelo Diagnóstico, preservando esta anotação.</div>
            <SectionLabel>Métricas do fluxo</SectionLabel>
            <div className="hint mono" style={{ lineHeight: 1.9 }}>
              Criado: {new Date(doc.project.createdAt).toLocaleDateString("pt-BR")}<br />
              Modelo importado: {doc.project.importedAt ? new Date(doc.project.importedAt).toLocaleTimeString("pt-BR") : "— (cena demo)"}<br />
              Primeira prévia: {doc.project.firstPreviewAt ? new Date(doc.project.firstPreviewAt).toLocaleTimeString("pt-BR") : "—"}<br />
              Tomadas: {doc.shots.length} · {fmtT(total)} · Armazenamento: {Store.backend === "artifact" ? "artifact (persistente)" : Store.backend === "local" ? "navegador (persistente)" : "memória da sessão"}
            </div>
            <SectionLabel>Aparência</SectionLabel>
            <div className="row" style={{ gap: 8 }}>
              {["#F2A83C", "#57BE8C", "#6FA8DC", "#C68BD4"].map(c => (
                <button key={c} onClick={() => dispatch({ type: "ACCENT", accent: c })} title={c}
                  style={{ width: 24, height: 24, borderRadius: "50%", background: c, border: doc.accent === c ? "2px solid var(--tx)" : "2px solid transparent" }} />
              ))}
              <span className="hint">Cor de destaque da interface</span>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // ------------------------------------------------------------- timeline
  const [convJobs, setConvJobs] = useState([]);
  const startConversion = useCallback(async (file, adapterId = "demo") => {
    const job = { id: uid("conv"), file: file.name, size: file.size, adapter: adapterId, status: "enviando", message: "Preparando envio…" };
    setConvJobs(j => [...j, job]);
    if (cloudRef.current) {
      // caminho real: o arquivo é armazenado no servidor e entra na fila de verdade
      try {
        const pid = docRef.current.cloudId || await ensureCloudProject();
        const bytes = await file.arrayBuffer();
        const res = await apiReq(cloudRef.current, `/api/conversions?projectId=${encodeURIComponent(pid)}&fileName=${encodeURIComponent(file.name)}`, { method: "POST", body: bytes, headers: { "Content-Type": "application/octet-stream" } });
        setConvJobs(js => js.map(x => x.id === job.id ? { ...x, id: res.id, server: true, status: "fila", message: "Armazenado no servidor. Na fila real, aguardando o worker de conversão (Fase 2b)." } : x));
        toast(`${file.name} enviado ao servidor e enfileirado (${fmtBytes(file.size)}).`, "ok", 6000);
      } catch (e) {
        setConvJobs(js => js.map(x => x.id === job.id ? { ...x, status: "erro", message: `Falha no envio: ${e.message}` } : x));
      }
      return;
    }
    const adapter = ConversionAdapters[adapterId];
    const done = await adapter.submit(job, (j2) => setConvJobs(js => js.map(x => x.id === job.id ? { ...x, ...j2 } : x)));
    setConvJobs(js => js.map(x => x.id === job.id ? { ...x, ...done } : x));
  }, [ensureCloudProject, toast]);
  // com nuvem ativa, o modal de importação lista a fila real do servidor
  useEffect(() => {
    if (!modal || modal.kind !== "import" || !cloudRef.current || !docRef.current.cloudId) return;
    apiReq(cloudRef.current, `/api/conversions?projectId=${encodeURIComponent(docRef.current.cloudId)}`)
      .then(rows => setConvJobs(rows.map(r => ({ id: r.id, file: r.file_name, size: r.size, server: true, status: r.status, message: r.message }))))
      .catch(() => {});
  }, [modal]);

  const visShots = doc.shots;
  const scrubTo = useCallback((t) => { sm().scrub(clamp(t, 0, total)); }, [total]);
  const moveShot = useCallback((id, dir) => {
    const i = doc.shots.findIndex(s2 => s2.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= doc.shots.length) return;
    snapshot();
    const arr = [...doc.shots];
    [arr[i], arr[j]] = [arr[j], arr[i]];
    dispatch({ type: "SHOTS", shots: arr });
  }, [doc.shots, snapshot]);

  const renderTimeline = () => {
    let acc = 0;
    return (
      <div className="panel" style={{ height: 186, flexShrink: 0, borderLeft: "none", borderRight: "none", borderBottom: "none" }}>
        <div className="row" style={{ padding: "7px 12px", gap: 8, borderBottom: "1px solid var(--line)" }}>
          <button className="iconbtn" onClick={() => scrubTo(rangeAB ? rangeAB[0] : 0)} title="Início"><SkipBack size={14} /></button>
          <button className="iconbtn on" onClick={togglePlay} title="Reproduzir/pausar (Espaço)" style={{ width: 32, height: 32, background: "var(--accent)", color: "var(--accent-ink)" }}>
            {playing ? <Pause size={15} /> : <Play size={15} />}
          </button>
          <button className="iconbtn" onClick={() => scrubTo(total)} title="Fim"><SkipForward size={14} /></button>
          <button className={`iconbtn ${loop ? "on" : ""}`} onClick={() => setLoopState(l => !l)} title="Repetir"><Repeat size={14} /></button>
          <span className="mono" style={{ color: "var(--tx2)", minWidth: 110 }}>{fmtT(playhead)} <span style={{ color: "var(--tx3)" }}>/ {fmtT(total)}</span></span>
          <div style={{ width: 1, height: 18, background: "var(--line)" }} />
          <button className="btn sm ghost" onClick={() => setRangeAB(r => [playhead, r ? r[1] : total])} title="Marcar entrada no cursor">⇤ A</button>
          <button className="btn sm ghost" onClick={() => setRangeAB(r => [r ? r[0] : 0, playhead])} title="Marcar saída no cursor">B ⇥</button>
          {rangeAB && <button className="btn sm ghost" onClick={() => setRangeAB(null)}>Limpar A–B <span className="mono">{fmtT(rangeAB[0])}–{fmtT(rangeAB[1])}</span></button>}
          <span style={{ flex: 1 }} />
          {viewMode === "shot" && <button className="btn sm" onClick={() => sm().stopPlayback(true)}>Sair da reprodução (Esc)</button>}
          <button className="btn sm" onClick={addShotFromView}><Camera size={12} />Tomada (C)</button>
          <button className="btn sm" onClick={() => setModal({ kind: "diretor" })}><Wand2 size={12} />Diretor</button>
        </div>
        {/* régua */}
        <div style={{ position: "relative", height: 22, margin: "6px 14px 0", cursor: "pointer" }}
          onPointerDown={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            const go = (cx) => scrubTo(((cx - r.left) / r.width) * total);
            go(e.clientX);
            const mv = (ev) => go(ev.clientX);
            const up = () => { window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up); };
            window.addEventListener("pointermove", mv); window.addEventListener("pointerup", up);
          }}>
          <div style={{ position: "absolute", inset: "9px 0 9px", background: "var(--bg3)", borderRadius: 3 }} />
          {rangeAB && total > 0 && (
            <div style={{ position: "absolute", top: 7, bottom: 7, left: `${(rangeAB[0] / total) * 100}%`, width: `${((rangeAB[1] - rangeAB[0]) / total) * 100}%`, background: "color-mix(in srgb,var(--accent) 30%,transparent)", borderRadius: 3 }} />
          )}
          {total > 0 && [...Array(Math.floor(total) + 1)].map((_, i) => i % Math.ceil(total / 24 || 1) === 0 && (
            <div key={i} style={{ position: "absolute", left: `${(i / total) * 100}%`, top: 6, bottom: 6, width: 1, background: "var(--line2)" }} />
          ))}
          {total > 0 && (
            <div style={{ position: "absolute", left: `${clamp(playhead / total, 0, 1) * 100}%`, top: 0, bottom: 0 }}>
              <div style={{ position: "absolute", left: -1, top: 0, bottom: 0, width: 2, background: "var(--accent)" }} />
              <div style={{ position: "absolute", left: -5, top: -1, width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "7px solid var(--accent)" }} />
            </div>
          )}
        </div>
        {/* blocos */}
        <div className="row" style={{ flex: 1, gap: 6, padding: "8px 14px 12px", overflowX: "auto", alignItems: "stretch" }}>
          {!visShots.length && (
            <div className="row" style={{ flex: 1, justifyContent: "center", gap: 14, color: "var(--tx3)" }}>
              <Clapperboard size={18} />
              <span>Timeline vazia — crie uma <b>tomada da vista atual</b> (<span className="kbd">C</span>), insira um movimento pronto na aba Tomada, ou chame o <b>Diretor Pixel</b>.</span>
            </div>
          )}
          {visShots.map((s2, i) => {
            const w = total > 0 ? Math.max(7, (s2.muted ? 0.001 : s2.dur / total) * 100) : 20;
            const active = activeShotId === s2.id && viewMode === "shot";
            const el = (
              <div key={s2.id} className={`shotblk ${selShot === s2.id ? "sel" : ""}`} style={{ width: `${w}%`, minWidth: 96, opacity: s2.muted ? 0.4 : 1 }}
                onClick={() => { setSelShot(s2.id); setTab("tomada"); }}
                onDoubleClick={() => { const start = visShots.filter(x => !x.muted).slice(0, visShots.filter(x => !x.muted).findIndex(x => x.id === s2.id)).reduce((a, x) => a + x.dur, 0); sm().play(start); }}
                title={`${s2.name} · ${s2.dur.toFixed(1)} s · duplo clique reproduz`}>
                <div style={{ position: "absolute", inset: 0, background: thumbs[s2.id] ? `url(${thumbs[s2.id]}) center/cover` : "var(--bg3)", opacity: 0.5 }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(15,17,21,.15),rgba(15,17,21,.82))" }} />
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: STATUS[s2.status].color }} />
                {active && <div style={{ position: "absolute", inset: 0, border: "1px solid var(--accent)", borderRadius: 6 }} />}
                <div style={{ position: "absolute", left: 8, right: 6, bottom: 5 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{i + 1}. {s2.name}</div>
                  <div className="mono" style={{ fontSize: 9, color: "var(--tx2)" }}>{s2.dur.toFixed(1)} s · {s2.move}</div>
                </div>
                <div className="row" style={{ position: "absolute", top: 3, right: 3, gap: 1 }}>
                  <button className="iconbtn" style={{ width: 20, height: 20 }} title="Mover antes" onClick={(e) => { e.stopPropagation(); moveShot(s2.id, -1); }}><ChevronRight size={11} style={{ transform: "rotate(180deg)" }} /></button>
                  <button className="iconbtn" style={{ width: 20, height: 20 }} title="Mover depois" onClick={(e) => { e.stopPropagation(); moveShot(s2.id, 1); }}><ChevronRight size={11} /></button>
                  <button className="iconbtn" style={{ width: 20, height: 20 }} title={s2.muted ? "Reativar" : "Silenciar (fora da reprodução)"} onClick={(e) => { e.stopPropagation(); snapshot(); dispatch({ type: "SHOT", id: s2.id, patch: { muted: !s2.muted } }); }}>
                    {s2.muted ? <EyeOff size={11} /> : <Eye size={11} />}
                  </button>
                  <button className="iconbtn" style={{ width: 20, height: 20 }} title="Excluir tomada" onClick={(e) => { e.stopPropagation(); snapshot(); dispatch({ type: "SHOTS", shots: doc.shots.filter(x => x.id !== s2.id) }); if (selShot === s2.id) setSelShot(null); }}><Trash2 size={11} /></button>
                </div>
              </div>
            );
            acc += s2.dur;
            return el;
          })}
        </div>
      </div>
    );
  };

  // ------------------------------------------------------------ storyboard
  const renderBoard = () => (
    <div className="modalback" style={{ zIndex: 55 }} onPointerDown={(e) => { if (e.target === e.currentTarget) setBoard(false); }}>
      <div className="modal" style={{ width: "min(1040px,94vw)", height: "84vh" }}>
        <div className="row" style={{ padding: "13px 18px", borderBottom: "1px solid var(--line)" }}>
          <LayoutGrid size={15} style={{ color: "var(--accent)" }} />
          <b style={{ fontSize: 13 }}>Storyboard — {doc.project.name}</b>
          <span className="mono" style={{ color: "var(--tx3)", marginLeft: 10 }}>{visShots.length} tomadas · {fmtT(total)} · {doc.aspect}</span>
          <span style={{ flex: 1 }} />
          <button className="btn sm" onClick={() => { visShots.forEach(s2 => setThumbs(t => ({ ...t, [s2.id]: sm().shotThumb(s2) }))); }}>Atualizar miniaturas</button>
          <button className="iconbtn" onClick={() => setBoard(false)}><X size={15} /></button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 18, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))", gap: 14, alignContent: "start" }}>
          {!visShots.length && <div className="hint">Sem tomadas ainda — crie na timeline ou com o Diretor Pixel.</div>}
          {visShots.map((s2, i) => (
            <div key={s2.id} className="card" style={{ padding: 0, overflow: "hidden", border: selShot === s2.id ? "1px solid var(--accent)" : undefined }}>
              <button style={{ display: "block", width: "100%", aspectRatio: "16/9", background: thumbs[s2.id] ? `url(${thumbs[s2.id]}) center/cover` : "var(--bg3)", position: "relative" }}
                onClick={() => { setSelShot(s2.id); setTab("tomada"); setBoard(false); }} title="Abrir tomada">
                {!thumbs[s2.id] && <Camera size={20} style={{ position: "absolute", inset: 0, margin: "auto", color: "var(--tx3)" }} />}
                <span className="mono" style={{ position: "absolute", left: 7, top: 6, fontSize: 10, background: "rgba(15,17,21,.8)", padding: "1px 6px", borderRadius: 4 }}>{i + 1}</span>
                <span className="mono" style={{ position: "absolute", right: 7, bottom: 6, fontSize: 10, background: "rgba(15,17,21,.8)", padding: "1px 6px", borderRadius: 4 }}>{s2.dur.toFixed(1)} s</span>
              </button>
              <div style={{ padding: "9px 11px" }}>
                <div className="row" style={{ gap: 6 }}>
                  <b style={{ fontSize: 12, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s2.name}</b>
                  {(s2.comments || []).length > 0 && <span className="row mono" style={{ gap: 3, color: "var(--tx3)", fontSize: 10 }}><MessageSquare size={11} />{s2.comments.length}</span>}
                </div>
                <div className="hint" style={{ margin: "2px 0 7px" }}>{s2.move} · suavização {EASINGS[s2.ease].label.toLowerCase()}</div>
                <select value={s2.status} onChange={(e) => { snapshot(); dispatch({ type: "SHOT", id: s2.id, patch: { status: e.target.value } }); }}
                  style={{ width: "100%", borderColor: STATUS[s2.status].color, color: STATUS[s2.status].color }}>
                  {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // --------------------------------------------------------------- modais
  const [nlText, setNlText] = useState("");
  const [nlLog, setNlLog] = useState(null);
  const [newP, setNewP] = useState(null);
  const [presetName, setPresetName] = useState("");
  const [dispCfg, setDispCfg] = useState({ item: "arvore", count: 40, radius: 30, variation: 0.35 });

  const newProject = useCallback((data) => {
    const s = sm();
    for (const [id, e] of [...s.reg]) if (e.added || e.imported) s.removeObject(id);
    for (const [id, e] of s.reg) { s.setTransform(id, { p: e.base.p.toArray(), rY: e.base.rY, s: e.base.s.x }); s.setVisible(id, true); }
    const d = initialDoc();
    d.project = { ...d.project, ...data, createdAt: Date.now(), importedAt: null, firstPreviewAt: Date.now() };
    dispatch({ type: "INIT", doc: d });
    s.applyEnv(d.env, true); s.setGeo(d.geo); s.setTimeline([]);
    historyRef.current = { past: [], future: [] };
    setHistSize({ past: 0, future: 0 });
    setSel(null); s.setSelected(null); setSelShot(null); setThumbs({});
    setModal(null);
    toast(`Projeto “${data.name}” criado sobre a cena demonstrativa. Importe sua maquete quando quiser.`, "ok", 6000);
  }, [toast]);

  const renderModal = () => {
    if (!modal) return null;
    const K = modal.kind;
    if (K === "menu") return (
      <Modal title="Pixel Hub SceneFlow" icon={Clapperboard} onClose={() => setModal(null)} width={430}>
        <div className="col" style={{ gap: 7 }}>
          <button className="btn" onClick={() => { setNewP({ name: "", client: "", venture: "", owner: "", location: "", type: PROJECT_TYPES[2], deadline: "", notes: "" }); setModal({ kind: "novo" }); }}><Plus size={14} />Novo projeto</button>
          <button className="btn" onClick={async () => { const ok = await loadSave(); if (ok) { setModal(null); toast("Projeto restaurado.", "ok"); } else toast("Nenhum salvamento encontrado.", "warn"); }}><FolderOpen size={14} />Restaurar projeto salvo</button>
          <div className="seclabel" style={{ margin: "8px 2px 2px" }}><span>Nuvem Pixel Hub</span></div>
          {cloudOn ? (
            <>
              <button className="btn" disabled={cloudBusy} onClick={() => { cloudSave(); setModal(null); }}><Upload size={14} />Salvar na nuvem</button>
              <button className="btn" disabled={cloudBusy} onClick={async () => {
                try {
                  const list = await apiReq(cloudRef.current, "/api/projects");
                  setModal({ kind: "nuvem-abrir", list });
                } catch (e) { toast(`Falha ao listar projetos: ${e.message}`, "err", 6000); }
              }}><FolderOpen size={14} />Abrir da nuvem</button>
              <button className="btn ghost" onClick={() => setModal({ kind: "nuvem" })}><Settings size={14} />Servidor conectado — configurar</button>
            </>
          ) : (
            <button className="btn" onClick={() => setModal({ kind: "nuvem" })}><Share2 size={14} />Conectar servidor da equipe…</button>
          )}
          <button className="btn" onClick={() => { exportJSON(); }}><Download size={14} />Exportar projeto (JSON)</button>
          <label className="btn" style={{ cursor: "pointer" }}>
            <Upload size={14} />Importar projeto (JSON)
            <input type="file" accept=".json" style={{ display: "none" }} onChange={(e) => { if (e.target.files[0]) { importJSON(e.target.files[0]); setModal(null); } }} />
          </label>
          <button className="btn danger" onClick={async () => { await Store.del(SAVE_KEY); setRestorable(false); toast("Dados salvos removidos deste navegador.", "ok"); }}><Trash2 size={14} />Limpar salvamento local</button>
        </div>
        <div className="hint" style={{ marginTop: 12 }}>Protótipo funcional (Fase 1) — preparação de cena e prévia de vídeo no navegador. Conversão SKP/DWG, render MP4/4K e colaboração chegam nas fases seguintes.</div>
      </Modal>
    );
    if (K === "novo" && newP) return (
      <Modal title="Novo projeto" icon={Plus} onClose={() => setModal(null)} width={500}
        footer={<>
          <button className="btn ghost" onClick={() => setModal(null)}>Cancelar</button>
          <button className="btn primary" disabled={!newP.name.trim()} onClick={() => newProject(newP)}>Criar projeto</button>
        </>}>
        {[["name", "Nome *"], ["client", "Cliente"], ["venture", "Empreendimento"], ["owner", "Responsável"], ["location", "Localização"]].map(([k, label]) => (
          <Field key={k} label={label}><input value={newP[k]} onChange={(e) => setNewP(p => ({ ...p, [k]: e.target.value }))} autoFocus={k === "name"} /></Field>
        ))}
        <Field label="Tipo"><select value={newP.type} onChange={(e) => setNewP(p => ({ ...p, type: e.target.value }))}>{PROJECT_TYPES.map(t => <option key={t}>{t}</option>)}</select></Field>
        <Field label="Prazo"><input type="date" value={newP.deadline} onChange={(e) => setNewP(p => ({ ...p, deadline: e.target.value }))} /></Field>
        <Field label="Observações"><textarea rows={2} value={newP.notes} onChange={(e) => setNewP(p => ({ ...p, notes: e.target.value }))} /></Field>
        <div className="hint">O projeto abre com a cena demonstrativa “Residencial Horizonte” como base de trabalho — importe GLB/glTF/OBJ para substituí-la ou complementá-la.</div>
      </Modal>
    );
    if (K === "import") return (
      <Modal title="Importar maquete" icon={Import} onClose={() => setModal(null)} width={620}>
        <label style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "26px 16px", border: "1.5px dashed var(--line2)", borderRadius: 10, cursor: "pointer", background: "var(--bg2)" }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); if (e.dataTransfer.files.length) { setModal(null); handleModelFiles([...e.dataTransfer.files]); } }}>
          <Upload size={22} style={{ color: "var(--accent)" }} />
          <b>Arraste arquivos aqui ou clique para escolher</b>
          <span className="hint">Abertos direto no navegador: <b>GLB · glTF · OBJ · ZIP</b> (parsers próprios, sem servidor)</span>
          <input type="file" multiple accept=".glb,.gltf,.obj,.zip,.skp,.dwg,.dxf,.ifc,.fbx,.dae,.stl,.3ds,.rvt" style={{ display: "none" }}
            onChange={(e) => { if (e.target.files.length) { setModal(null); handleModelFiles([...e.target.files]); } }} />
        </label>
        <SectionLabel>Recebimento para conversão <Stamp kind="demo" /></SectionLabel>
        <div className="hint">SKP, DWG, DXF, IFC, FBX e afins exigem conversão para glTF num serviço de backend. Aqui o arquivo é <b>validado e enfileirado de verdade</b>, mas a conversão em si só executa na Fase 2 — nada é simulado como concluído.</div>
        {modal.queueFile && (
          <div className="card row" style={{ marginTop: 10, gap: 10 }}>
            <Layers size={16} style={{ color: "var(--warn)" }} />
            <div style={{ flex: 1 }}>
              <b>{modal.queueFile.name}</b>{modal.inner ? <span className="hint"> · contém {modal.inner}</span> : null}
              <div className="hint">{fmtBytes(modal.queueFile.size)} · requer conversão no servidor</div>
            </div>
            <button className="btn sm primary" onClick={() => { startConversion(modal.queueFile); setModal({ kind: "import" }); }}>Enviar para fila</button>
          </div>
        )}
        {convJobs.length > 0 && (
          <>
            <SectionLabel>Fila de conversão</SectionLabel>
            <div className="col" style={{ gap: 6 }}>
              {convJobs.map(j => (
                <div key={j.id} className="card row" style={{ gap: 10, padding: "8px 12px" }}>
                  {j.status === "aguardando-backend" || j.status === "indisponivel" ? <Clock size={14} style={{ color: "var(--warn)" }} /> : <Loader2 size={14} className="spin" style={{ color: "var(--info)" }} />}
                  <div style={{ flex: 1 }}>
                    <b style={{ fontSize: 12 }}>{j.file}</b>
                    <div className="hint">{j.message}</div>
                  </div>
                  {(j.status === "aguardando-backend") && <Stamp kind="f2">Aguardando backend</Stamp>}
                </div>
              ))}
            </div>
          </>
        )}
        <SectionLabel>Adaptadores de conversão</SectionLabel>
        <div className="col" style={{ gap: 5 }}>
          {Object.values(ConversionAdapters).map(a => (
            <div key={a.id} className="row" style={{ gap: 8, fontSize: 12 }}>
              <span className="dot" style={{ background: a.available ? "var(--ok)" : "var(--bg4)" }} />
              <span style={{ color: a.available ? "var(--tx)" : "var(--tx3)" }}>{a.label}</span>
              {a.stamp && <Stamp kind="f2" />}
            </div>
          ))}
        </div>
      </Modal>
    );
    if (K === "diag" && modal.diag) {
      const d = modal.diag;
      const lvl = { err: ["var(--err)", AlertTriangle], warn: ["var(--warn)", AlertTriangle], info: ["var(--info)", Info] };
      return (
        <Modal title={`Diagnóstico — ${modal.fileName || "maquete"}`} icon={Gauge} onClose={() => setModal(null)} width={640}
          footer={<button className="btn primary" onClick={() => setModal(null)}>Concluir</button>}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
            {[["Extensão", `${fmtLen(d.size[0], "m")} × ${fmtLen(d.size[2], "m")}`], ["Altura", fmtLen(d.size[1], "m")], ["Triângulos", d.tris.toLocaleString("pt-BR")], ["Objetos", d.meshes],
              ["Materiais", d.materials], ["Texturas", d.textures], ["Da origem", fmtLen(d.distOrigin, "m")], ["Desempenho", d.perf]].map(([k, v]) => (
              <div key={k} className="card" style={{ padding: "8px 10px" }}>
                <div className="hint" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".08em" }}>{k}</div>
                <div className="mono" style={{ fontSize: 12, marginTop: 2, color: k === "Desempenho" ? (d.perf === "pesado" ? "var(--err)" : d.perf === "moderado" ? "var(--warn)" : "var(--ok)") : "var(--tx)" }}>{v}</div>
              </div>
            ))}
          </div>
          {d.duplicatesReused > 0 && <div className="hint" style={{ marginTop: 8 }}><Check size={11} style={{ color: "var(--ok)", verticalAlign: -2 }} /> {d.duplicatesReused} geometria(s) reutilizada(s) entre objetos — bom para o desempenho.</div>}
          <SectionLabel>Verificações</SectionLabel>
          {!d.issues.length && <div className="row" style={{ gap: 8, color: "var(--ok)" }}><CheckCircle2 size={15} />Nenhum problema encontrado — modelo pronto para visualização.</div>}
          <div className="col" style={{ gap: 6 }}>
            {d.issues.map((it, i) => {
              const [color, Icon] = lvl[it.level] || lvl.info;
              return (
                <div key={i} className="card row" style={{ gap: 10, padding: "8px 12px", borderLeft: `3px solid ${color}` }}>
                  <Icon size={14} style={{ color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 12 }}>{it.msg}</span>
                  {it.fix && <button className="btn sm" onClick={() => { snapshot(); const nd = sm().fixModel(modal.targetId, it.fix); setModal(m => ({ ...m, diag: nd })); toast("Correção aplicada.", "ok", 2200); }}>Corrigir</button>}
                </div>
              );
            })}
          </div>
          <SectionLabel>Correções rápidas</SectionLabel>
          <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
            {[["center", "Centralizar na origem"], ["ground", "Apoiar no piso"], ["origin", "Redefinir origem local"], ["basicmats", "Gerar materiais básicos"]].map(([f, label]) => (
              <button key={f} className="btn sm" onClick={() => { snapshot(); const nd = sm().fixModel(modal.targetId, f); setModal(m => ({ ...m, diag: nd })); }}>{label}</button>
            ))}
            <button className="btn sm" disabled>Otimizar malha <Stamp kind="f2" /></button>
            <button className="btn sm" disabled>Reprojetar UVs <Stamp kind="f2" /></button>
          </div>
          <div className="hint" style={{ marginTop: 10 }}>As correções alteram só a cópia em cena — o arquivo original permanece intacto. Elas ficam registradas no projeto para reaplicar ao reimportar.</div>
        </Modal>
      );
    }
    if (K === "diretor") return (
      <Modal title="Diretor Pixel" icon={Wand2} onClose={() => setModal(null)} width={560}>
        <div className="hint">Descreva o vídeo em linguagem natural. O Diretor monta o roteiro com regras determinísticas — reconhece duração, formato, ambientação e movimentos. <Stamp kind="demo">Regras locais</Stamp></div>
        <textarea rows={3} value={nlText} onChange={(e) => setNlText(e.target.value)} autoFocus
          placeholder="ex.: vídeo de 30 segundos para Instagram, começando aéreo, mostrando a avenida ao pôr do sol"
          style={{ width: "100%", margin: "10px 0 8px", resize: "vertical" }} />
        <div className="row" style={{ gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          {["30 segundos ao pôr do sol", "vertical para Instagram, 15 s, dinâmico", "sobrevoo aéreo do loteamento com órbita", "institucional calmo, 45 segundos", "mostrar a avenida caminhando à noite"].map(t => (
            <button key={t} className="chip" onClick={() => setNlText(t)}>{t}</button>
          ))}
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn primary" style={{ flex: 1 }} onClick={() => {
            const res = runDirectorNL(sm(), nlText || "");
            setNlLog(res.log);
            if (res.ok) {
              snapshot();
              dispatch({ type: "SHOTS", shots: res.shots });
              if (res.env) applyEnvPreset(res.env);
              if (res.aspect) dispatch({ type: "ASPECT", aspect: res.aspect });
              setSelShot(res.shots[0].id);
              setTimeout(() => { const th = {}; res.shots.forEach(sh => th[sh.id] = sm().shotThumb(sh)); setThumbs(t => ({ ...t, ...th })); }, 80);
            }
          }}><Wand2 size={14} />Montar roteiro</button>
          <button className="btn" onClick={() => { runDirector("padrao"); setNlLog(["Sequência padrão de apresentação criada: aérea → aproximação → órbita → caminhada → afastamento."]); }}>Sequência padrão</button>
        </div>
        {nlLog && (
          <div className="card" style={{ marginTop: 12, padding: "10px 12px" }}>
            <div className="hint" style={{ textTransform: "uppercase", fontSize: 9, letterSpacing: ".1em", marginBottom: 6 }}>Registro de decisões</div>
            {nlLog.map((l, i) => <div key={i} className="row" style={{ gap: 7, fontSize: 12, padding: "2px 0" }}><span className="dot" style={{ background: "var(--accent)" }} />{l}</div>)}
            {doc.shots.length > 0 && <button className="btn sm primary" style={{ marginTop: 8 }} onClick={() => { setModal(null); sm().play(0); }}><Play size={12} />Reproduzir prévia</button>}
          </div>
        )}
      </Modal>
    );
    if (K === "presets") return (
      <Modal title="Presets Pixel Hub" icon={Sparkles} onClose={() => setModal(null)} width={720}>
        <div className="hint" style={{ marginBottom: 12 }}>Combinações prontas de ambientação, formato e roteiro para os produtos recorrentes da Pixel Hub. Aplicar substitui a timeline atual.</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: 10 }}>
          {PH_PRESETS.map(p => (
            <button key={p.id} className="card" style={{ textAlign: "left", cursor: "pointer" }} onClick={() => applyPHPreset(p)}>
              <div className="row" style={{ gap: 7 }}>
                <b style={{ fontSize: 12, flex: 1 }}>{p.label}</b>
                <span className="mono" style={{ fontSize: 10, color: "var(--accent)" }}>{p.aspect}</span>
              </div>
              <div className="hint" style={{ margin: "5px 0 7px" }}>{p.desc}</div>
              <div className="mono" style={{ fontSize: 10, color: "var(--tx3)" }}>{p.dur} s · {ENV_PRESETS.find(e => e.id === p.env)?.label}</div>
            </button>
          ))}
        </div>
      </Modal>
    );
    if (K === "biblioteca") return (
      <Modal title="Biblioteca de objetos" icon={Box} onClose={() => setModal(null)} width={520}>
        <div className="hint" style={{ marginBottom: 10 }}>Escolha um item e clique no terreno para inseri-lo. Objetos são leves e procedurais — catálogo ampliado com modelos de alta qualidade na Fase 2.</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          {LIBRARY.map(item => (
            <button key={item.id} className="card col" style={{ alignItems: "center", gap: 6, cursor: "pointer", padding: "14px 8px" }}
              onClick={() => { setModal(null); startPlacing(item); }}>
              <item.icon size={20} style={{ color: "var(--accent)" }} />
              <b style={{ fontSize: 12 }}>{item.label}</b>
              <span className="hint" style={{ fontSize: 10 }}>{item.cat}{item.variants > 1 ? ` · ${item.variants} var.` : ""}</span>
            </button>
          ))}
        </div>
      </Modal>
    );
    if (K === "dispersar") return (
      <Modal title="Dispersão de vegetação e elementos" icon={Trees} onClose={() => setModal(null)} width={460}
        footer={<>
          <button className="btn ghost" onClick={() => setModal(null)}>Cancelar</button>
          <button className="btn primary" onClick={() => {
            snapshot();
            const center = selEntry ? { x: selEntry.obj.position.x, z: selEntry.obj.position.z } : undefined;
            const e = sm().addScatter(dispCfg.item, { ...dispCfg, center });
            setSel(e.id); sm().setSelected(e.id);
            setModal(null);
            toast(`${e.name} criada com instâncias (1 draw call por malha).`, "ok", 4500);
          }}>Dispersar</button>
        </>}>
        <Field label="Elemento">
          <select value={dispCfg.item} onChange={(e) => setDispCfg(c => ({ ...c, item: e.target.value }))}>
            {LIBRARY.filter(l => l.scatter).map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
        </Field>
        <Slider label="Quantidade" value={dispCfg.count} min={5} max={200} step={5} fmt={(v) => v.toFixed(0)} onChange={(v) => setDispCfg(c => ({ ...c, count: v }))} />
        <Slider label="Raio (m)" value={dispCfg.radius} min={5} max={120} step={1} fmt={(v) => v.toFixed(0)} onChange={(v) => setDispCfg(c => ({ ...c, radius: v }))} />
        <Slider label="Variação" value={dispCfg.variation} min={0} max={0.7} onChange={(v) => setDispCfg(c => ({ ...c, variation: v }))} />
        <div className="hint">Centro: {selEntry ? `posição de “${selEntry.name}”` : "centro da cena"} (selecione um objeto antes para dispersar ao redor dele). Usa InstancedMesh — dezenas de cópias custam o mesmo que uma.</div>
      </Modal>
    );
    if (K === "savepreset") return (
      <Modal title="Salvar Preset de Cena Pixel Hub" icon={Star} onClose={() => setModal(null)} width={420}
        footer={<>
          <button className="btn ghost" onClick={() => setModal(null)}>Cancelar</button>
          <button className="btn primary" disabled={!presetName.trim()} onClick={() => {
            dispatch({ type: "PRESET_ADD", preset: { id: uid("cp"), name: presetName.trim(), env: { ...doc.env }, aspect: doc.aspect } });
            setPresetName(""); setModal(null); setDirty(true);
            toast("Preset de cena salvo no projeto — disponível na aba Ambiente.", "ok");
          }}>Salvar</button>
        </>}>
        <Field label="Nome"><input value={presetName} onChange={(e) => setPresetName(e.target.value)} placeholder="ex.: Golden hour Pixel Hub" autoFocus /></Field>
        <div className="hint">Guarda a ambientação atual (hora, atmosfera, imagem) e o formato {doc.aspect} para reutilizar em outros vídeos deste projeto.</div>
      </Modal>
    );
    if (K === "share") return (
      <Modal title="Compartilhar" icon={Share2} onClose={() => setModal(null)} width={500}>
        <SectionLabel>Revisão do cliente {cloudOn ? null : <Stamp kind="f2">requer servidor</Stamp>}</SectionLabel>
        {cloudOn ? (
          <div className="col" style={{ gap: 6 }}>
            <button className="btn primary" disabled={cloudBusy} onClick={makeReviewLink}>
              {cloudBusy ? <Loader2 size={13} className="spin" /> : <Share2 size={13} />}Gerar link de revisão do cliente
            </button>
            {(modal.reviewUrl || doc.reviewToken) && (
              <div className="card" style={{ padding: "9px 11px" }}>
                <div className="hint" style={{ marginBottom: 6 }}>O cliente abre o link, vê o storyboard com miniaturas e pode <b>comentar</b> e <b>aprovar/pedir ajustes</b> por tomada — sem senha, o link é a chave.</div>
                {modal.reviewUrl && (
                  <div className="row" style={{ gap: 6 }}>
                    <input readOnly value={modal.reviewUrl} onFocus={(e) => e.target.select()} style={{ flex: 1, fontSize: 10 }} className="mono" />
                    <button className="btn sm" onClick={async () => { try { await navigator.clipboard.writeText(modal.reviewUrl); toast("Link copiado.", "ok", 2200); } catch (e) {} }}><Copy size={12} />Copiar</button>
                  </div>
                )}
                {doc.reviewToken && (
                  <button className="btn sm" style={{ marginTop: 8 }} disabled={cloudBusy} onClick={pullReviews}>
                    <MessageSquare size={12} />Puxar revisões do cliente
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="col" style={{ gap: 6 }}>
            <div className="hint">Conecte o servidor da equipe para gerar links de revisão reais com aprovação por tomada.</div>
            <button className="btn" onClick={() => setModal({ kind: "nuvem" })}><Settings size={13} />Conectar servidor…</button>
          </div>
        )}
        <SectionLabel>Enviar arquivos</SectionLabel>
        <div className="col" style={{ gap: 6 }}>
          <button className="btn" onClick={exportJSON}><FileJson size={13} />Arquivo do projeto (JSON)</button>
          <button className="btn" onClick={doCapture}><ImageIcon size={13} />Imagem do quadro atual</button>
          <button className="btn" onClick={() => { setModal(null); doRecord(); }}><Film size={13} />Prévia em vídeo (WebM)</button>
        </div>
        <SectionLabel>Fase 3</SectionLabel>
        <button className="btn" disabled>Comentários multiusuário em tempo real <Stamp kind="f2">Fase 3</Stamp></button>
      </Modal>
    );
    if (K === "nuvem") return (
      <Modal title="Servidor da equipe (Fase 2)" icon={Share2} onClose={() => setModal(null)} width={500}
        footer={<>
          {cloudOn && <button className="btn ghost danger" onClick={() => { saveCloudCfg(null); setModal(null); toast("Servidor desconectado deste navegador.", "info"); }}>Desconectar</button>}
          <span style={{ flex: 1 }} />
          <button className="btn ghost" onClick={() => setModal(null)}>Fechar</button>
          <button className="btn primary" disabled={cloudBusy || !(modal.url || (cloud && cloud.url))} onClick={async () => {
            const cfg = { url: (modal.url ?? (cloud && cloud.url)) || "", key: (modal.key ?? (cloud && cloud.key)) || "" };
            setCloudBusy(true);
            try {
              const h = await apiReq(cfg, "/api/health");
              if (!h.ok) throw new Error("Resposta inesperada do servidor.");
              saveCloudCfg(cfg);
              toast("Servidor conectado — projetos e maquetes agora persistem na nuvem.", "ok", 6000);
              setModal({ kind: "menu" });
            } catch (e) { toast(`Não conectou: ${e.message}`, "err", 7000); }
            finally { setCloudBusy(false); }
          }}>{cloudBusy ? <Loader2 size={13} className="spin" /> : <Check size={13} />}Testar e conectar</button>
        </>}>
        <div className="hint" style={{ marginBottom: 10 }}>Aponte para a SceneFlow API da equipe (pasta <span className="mono">server/</span> do projeto — Node, hospedável de graça em Render/Railway). Com ela, os itens FASE 2 abaixo tornam-se reais: <b>projetos na nuvem</b>, <b>maquetes importadas persistentes</b>, <b>link de revisão do cliente</b> e <b>fila de conversão no servidor</b>.</div>
        <Field label="URL da API"><input placeholder="https://sceneflow-api.onrender.com" defaultValue={cloud ? cloud.url : ""} onChange={(e) => setModal(m => ({ ...m, url: e.target.value.trim() }))} /></Field>
        <Field label="Chave da equipe"><input type="password" placeholder="TEAM_KEY definida no servidor" defaultValue={cloud ? cloud.key : ""} onChange={(e) => setModal(m => ({ ...m, key: e.target.value.trim() }))} /></Field>
        <div className="hint">A chave fica salva só neste navegador e vai em cada requisição (cabeçalho X-PH-Key). Links de revisão de clientes não exigem chave — o token do link é o segredo.</div>
      </Modal>
    );
    if (K === "nuvem-abrir") return (
      <Modal title="Abrir projeto da nuvem" icon={FolderOpen} onClose={() => setModal(null)} width={520}>
        {!(modal.list || []).length && <div className="hint">Nenhum projeto na nuvem ainda — use “Salvar na nuvem” no menu.</div>}
        <div className="col" style={{ gap: 6 }}>
          {(modal.list || []).map(p => (
            <button key={p.id} className="card row" style={{ gap: 10, cursor: "pointer", textAlign: "left" }} disabled={cloudBusy} onClick={() => cloudOpenProject(p.id)}>
              <FolderOpen size={15} style={{ color: "var(--accent)", flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <b style={{ fontSize: 12 }}>{p.name}</b>
                <div className="hint">{p.client || "—"} · {p.type || "—"}</div>
              </div>
              <span className="mono" style={{ fontSize: 10, color: "var(--tx3)" }}>{new Date(p.updated_at).toLocaleString("pt-BR")}</span>
            </button>
          ))}
        </div>
        <div className="hint" style={{ marginTop: 10 }}>Abrir substitui o projeto atual (o estado atual entra no histórico de desfazer). Maquetes com cópia na nuvem são baixadas e reposicionadas automaticamente.</div>
      </Modal>
    );
    if (K === "config") return (
      <Modal title="Configurações" icon={Settings} onClose={() => setModal(null)} width={460}>
        <SectionLabel>Desempenho</SectionLabel>
        <Field label="Qualidade">
          <select value={quality} onChange={(e) => setQuality(e.target.value)}>
            <option value="eco">Econômico — pixel ratio reduzido, sombras 512</option>
            <option value="edicao">Edição — equilíbrio padrão</option>
            <option value="apresentacao">Apresentação — nitidez alta</option>
            <option value="alta">Alta — máxima (exige GPU boa)</option>
          </select>
        </Field>
        <Toggle label="HUD de desempenho" on={showHUD} onChange={setShowHUD} />
        <Toggle label="Grade de referência" on={showGrid} onChange={setShowGrid} />
        <div className="hint">Durante a navegação, a resolução cai automaticamente se os fps baixarem de ~42 e volta ao parar — a gravação sempre usa resolução plena.</div>
        <SectionLabel>Armazenamento</SectionLabel>
        <div className="hint mono" style={{ lineHeight: 1.8 }}>
          Camada ativa: {Store.backend === "artifact" ? "window.storage do artifact (persistente)" : Store.backend === "local" ? "localStorage do navegador" : "memória volátil da sessão"}<br />
          Salvamento automático: a cada 20 s quando há alterações<br />
          Geometria importada: não persiste — reimporte os arquivos
        </div>
        <div className="hint" style={{ marginTop: 6 }}>Para backup durável e portátil, use <b>Exportar projeto (JSON)</b>.</div>
      </Modal>
    );
    if (K === "help") return (
      <Modal title="Atalhos e ajuda" icon={HelpCircle} onClose={() => setModal(null)} width={560}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 22px" }}>
          {[["Espaço", "Reproduzir / pausar"], ["C", "Tomada da vista atual"], ["K", "Ponto-chave na tomada"], ["F", "Enquadrar seleção"], ["Home", "Enquadrar cena"], ["G / M", "Ferramenta mover"], ["R · Shift+R", "Girar seleção ±15°"], ["Del", "Excluir / ocultar"], ["Esc", "Cancelar / sair"], ["Ctrl+Z / Y", "Desfazer / refazer"], ["Ctrl+S", "Salvar"], ["1–6", "Órbita · Caminhar · Voo · Topo · Frente · Lateral"], ["Arrastar", "Orbitar"], ["Shift+arrastar / botão direito", "Pan"], ["Roda", "Zoom"], ["Duplo clique", "Focar ponto"]].map(([k, v]) => (
            <div key={k} className="row" style={{ gap: 8, padding: "3px 0" }}><span className="kbd" style={{ minWidth: 66, textAlign: "center" }}>{k}</span><span style={{ fontSize: 12, color: "var(--tx2)" }}>{v}</span></div>
          ))}
        </div>
        <SectionLabel>Convenções de honestidade</SectionLabel>
        <div className="hint" style={{ lineHeight: 1.7 }}>
          Sem carimbo = funciona de verdade no navegador. <Stamp kind="demo" /> = interface real com resultado simulado localmente. <Stamp kind="f2" /> = depende de backend/pipeline das próximas fases. Nenhuma conversão ou render é anunciado como concluído sem realmente existir.
        </div>
      </Modal>
    );
    return null;
  };

  // ------------------------------------------------------------------ raiz
  return (
    <div className="phsf">
      <style>{CSS}</style>
      {renderTopBar()}
      <div className="row" style={{ flex: 1, minHeight: 0, alignItems: "stretch", gap: 0 }}>
        {renderTree()}
        {renderViewport()}
        {renderRight()}
      </div>
      {renderTimeline()}
      {board && renderBoard()}
      {renderModal()}
      <div style={{ position: "fixed", right: 14, bottom: 200, display: "flex", flexDirection: "column", gap: 8, zIndex: 80, pointerEvents: "none" }}>
        {toasts.map(t => (
          <div key={t.id} className="toast" style={{ borderLeftColor: t.kind === "ok" ? "var(--ok)" : t.kind === "warn" ? "var(--warn)" : t.kind === "err" ? "var(--err)" : "var(--info)" }}>
            {t.kind === "ok" ? <CheckCircle2 size={14} style={{ color: "var(--ok)", flexShrink: 0, marginTop: 1 }} /> : t.kind === "err" ? <AlertTriangle size={14} style={{ color: "var(--err)", flexShrink: 0, marginTop: 1 }} /> : t.kind === "warn" ? <AlertTriangle size={14} style={{ color: "var(--warn)", flexShrink: 0, marginTop: 1 }} /> : <Info size={14} style={{ color: "var(--info)", flexShrink: 0, marginTop: 1 }} />}
            <span style={{ fontSize: 12, lineHeight: 1.5 }}>{t.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


// ============================================================================
// 13. PÁGINA DE REVISÃO DO CLIENTE (aberta pelo link ?review=TOKEN&api=URL)
//     Sem chave de equipe: o token é o segredo. Sem 3D — leve e direta.
// ============================================================================
function ReviewPage({ token, api }) {
  const cfg = { url: api, key: "" };
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [author, setAuthor] = useState("");
  const [busy, setBusy] = useState(false);
  const [drafts, setDrafts] = useState({});
  const [sent, setSent] = useState(0);
  const load = useCallback(async () => {
    try { setData(await apiReq(cfg, `/api/public/reviews/${token}`, { pub: true })); setErr(null); }
    catch (e) { setErr(e.message); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, api]);
  useEffect(() => { load(); }, [load]);

  const send = async (path, json, okMsg) => {
    if (!author.trim()) { setErr("Informe seu nome antes de enviar."); return; }
    setBusy(true); setErr(null);
    try {
      await apiReq(cfg, path, { method: "POST", json: { ...json, author: author.trim() }, pub: true });
      await load();
      setSent(s => s + 1);
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  };
  const decisionOf = (shotId) => {
    if (!data) return null;
    const list = data.approvals.filter(a => a.shot_id === shotId);
    return list.length ? list[list.length - 1] : null;
  };
  if (err && !data) return (
    <div className="phsf" style={{ alignItems: "center", justifyContent: "center" }}>
      <style>{CSS}</style>
      <div className="card" style={{ maxWidth: 420, textAlign: "center" }}>
        <AlertTriangle size={22} style={{ color: "var(--warn)" }} />
        <div style={{ marginTop: 8, fontWeight: 600 }}>Não foi possível abrir a revisão</div>
        <div className="hint" style={{ marginTop: 4 }}>{err}</div>
      </div>
    </div>
  );
  if (!data) return (
    <div className="phsf" style={{ alignItems: "center", justifyContent: "center" }}>
      <style>{CSS}</style>
      <div className="row" style={{ gap: 10, color: "var(--tx2)" }}><Loader2 size={18} className="spin" />Carregando revisão…</div>
    </div>
  );
  const P = data.payload;
  return (
    <div className="phsf" style={{ overflowY: "auto", display: "block", userSelect: "text" }}>
      <style>{CSS}</style>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "26px 20px 60px" }}>
        <div className="row" style={{ gap: 10 }}>
          <span style={{ width: 30, height: 30, borderRadius: 7, background: "var(--accent)", color: "var(--accent-ink)", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 13 }}>PH</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{P.projectName}</div>
            <div className="hint">Revisão de storyboard · {P.shots.length} tomadas · {fmtT(P.total || 0)} · formato {P.aspect}{P.client ? ` · ${P.client}` : ""}</div>
          </div>
          <span style={{ flex: 1 }} />
          <button className="btn sm ghost" onClick={load} disabled={busy}>Atualizar</button>
        </div>
        <div className="card row" style={{ margin: "16px 0", gap: 10 }}>
          <PersonStanding size={15} style={{ color: "var(--accent)" }} />
          <label style={{ fontSize: 12, color: "var(--tx2)" }}>Seu nome</label>
          <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="ex.: Marcos — Incorporadora Horizonte" style={{ flex: 1 }} />
          {sent > 0 && <span className="row" style={{ gap: 5, color: "var(--ok)", fontSize: 11 }}><CheckCircle2 size={13} />{sent} envio(s) registrado(s)</span>}
        </div>
        {err && <div className="hint" style={{ color: "var(--err)", marginBottom: 10 }}>{err}</div>}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 14 }}>
          {P.shots.map((s2, i) => {
            const dec = decisionOf(s2.id);
            const cms = data.comments.filter(c => c.shot_id === s2.id);
            return (
              <div key={s2.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ aspectRatio: "16/9", background: s2.thumb ? `url(${s2.thumb}) center/cover` : "var(--bg3)", position: "relative" }}>
                  <span className="mono" style={{ position: "absolute", left: 8, top: 7, fontSize: 10, background: "rgba(15,17,21,.8)", padding: "1px 6px", borderRadius: 4 }}>{i + 1}</span>
                  <span className="mono" style={{ position: "absolute", right: 8, bottom: 7, fontSize: 10, background: "rgba(15,17,21,.8)", padding: "1px 6px", borderRadius: 4 }}>{(s2.dur || 0).toFixed(1)} s</span>
                  {dec && (
                    <span style={{ position: "absolute", right: 8, top: 7, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: dec.decision === "aprovado" ? "var(--ok)" : "var(--warn)", color: "#101418" }}>
                      {dec.decision === "aprovado" ? "APROVADA" : "AJUSTES"}
                    </span>
                  )}
                </div>
                <div style={{ padding: "10px 12px" }}>
                  <b style={{ fontSize: 12 }}>{s2.name}</b>
                  <div className="hint" style={{ marginBottom: 8 }}>{s2.move}</div>
                  {cms.map((c, j) => (
                    <div key={j} style={{ fontSize: 11, padding: "5px 8px", background: "var(--bg3)", borderRadius: 6, marginBottom: 4 }}>
                      <b style={{ color: "var(--tx2)" }}>{c.author}:</b> {c.text}
                    </div>
                  ))}
                  <div className="row" style={{ gap: 5, marginTop: 6 }}>
                    <input placeholder="Comentar esta tomada…" value={drafts[s2.id] || ""} onChange={(e) => setDrafts(d => ({ ...d, [s2.id]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === "Enter" && (drafts[s2.id] || "").trim()) { send(`/api/public/reviews/${token}/comments`, { shotId: s2.id, text: drafts[s2.id].trim() }); setDrafts(d => ({ ...d, [s2.id]: "" })); } }}
                      style={{ flex: 1, fontSize: 11 }} />
                    <button className="iconbtn" disabled={busy || !(drafts[s2.id] || "").trim()} title="Enviar comentário"
                      onClick={() => { send(`/api/public/reviews/${token}/comments`, { shotId: s2.id, text: drafts[s2.id].trim() }); setDrafts(d => ({ ...d, [s2.id]: "" })); }}>
                      <MessageSquare size={13} />
                    </button>
                  </div>
                  <div className="row" style={{ gap: 6, marginTop: 8 }}>
                    <button className="btn sm" style={{ flex: 1, borderColor: "var(--ok)", color: "var(--ok)" }} disabled={busy}
                      onClick={() => send(`/api/public/reviews/${token}/approvals`, { shotId: s2.id, decision: "aprovado" })}>
                      <Check size={12} />Aprovar
                    </button>
                    <button className="btn sm" style={{ flex: 1, borderColor: "var(--warn)", color: "var(--warn)" }} disabled={busy}
                      onClick={() => send(`/api/public/reviews/${token}/approvals`, { shotId: s2.id, decision: "ajustes", note: (drafts[s2.id] || "").trim() })}>
                      <PenLine size={12} />Pedir ajustes
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="card" style={{ marginTop: 16 }}>
          <SectionLabel>Comentário geral do vídeo</SectionLabel>
          <div className="row" style={{ gap: 6 }}>
            <input placeholder="Observações sobre o vídeo como um todo…" value={drafts.__geral || ""} onChange={(e) => setDrafts(d => ({ ...d, __geral: e.target.value }))} style={{ flex: 1 }} />
            <button className="btn sm primary" disabled={busy || !(drafts.__geral || "").trim()}
              onClick={() => { send(`/api/public/reviews/${token}/comments`, { shotId: null, text: drafts.__geral.trim() }); setDrafts(d => ({ ...d, __geral: "" })); }}>Enviar</button>
          </div>
          {data.comments.filter(c => !c.shot_id).map((c, j) => (
            <div key={j} style={{ fontSize: 11, padding: "5px 8px", background: "var(--bg3)", borderRadius: 6, marginTop: 6 }}>
              <b style={{ color: "var(--tx2)" }}>{c.author}:</b> {c.text}
            </div>
          ))}
        </div>
        <div className="hint" style={{ marginTop: 16, textAlign: "center" }}>Suas respostas ficam registradas para a equipe Pixel Hub sincronizar no projeto. Pixel Hub SceneFlow.</div>
      </div>
    </div>
  );
}

// Raiz: decide entre o aplicativo completo e a página de revisão do cliente
export default function Root() {
  const rv = useMemo(parseReviewLink, []);
  return rv ? <ReviewPage token={rv.token} api={rv.api} /> : <App />;
}
