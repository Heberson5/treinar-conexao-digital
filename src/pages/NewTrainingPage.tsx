import React, { useEffect, useRef, useState } from "react";

/**
 * NewTrainingPage — página responsiva, herdando o layout por padrão,
 * com opção de Tela Inteira e suporte a blocos (texto, imagem, vídeo, arquivo).
 * Sem dependências externas.
 */

type BlockText   = { id: string; type: "text";  html: string };
type BlockImage  = { id: string; type: "image"; src?: string; alt?: string };
type BlockVideo  = { id: string; type: "video"; url?: string };
type BlockFile   = { id: string; type: "file";  name?: string };
type Block = BlockText | BlockImage | BlockVideo | BlockFile;

type Playable = { kind: "video"; src: string } | { kind: "iframe"; src: string };

const uid = () => Math.random().toString(36).slice(2, 10);

export default function NewTrainingPage(): JSX.Element {
  const [title, setTitle] = useState<string>("");
  const [blocks, setBlocks] = useState<Block[]>([
    { id: uid(), type: "text", html: "<p>Descrição inicial do treinamento...</p>" }
  ]);
  const [fullscreen, setFullscreen] = useState<boolean>(false);

  useEffect(() => {
    // Responsivo: a grid vira 2 colunas >= 1024px
    const onResize = () => {
      const el = document.getElementById("nt-grid");
      if (!el) return;
      (el.style as any).gridTemplateColumns = window.innerWidth >= 1024 ? "280px 1fr" : "1fr";
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (fullscreen) document.body.classList.add("body-lock");
    return () => document.body.classList.remove("body-lock");
  }, [fullscreen]);

  const addBlock = (type: Block["type"]) => {
    if (type === "text")  setBlocks((b) => [...b, { id: uid(), type, html: "" } as BlockText]);
    if (type === "image") setBlocks((b) => [...b, { id: uid(), type, src: "", alt: "" } as BlockImage]);
    if (type === "video") setBlocks((b) => [...b, { id: uid(), type, url: "" } as BlockVideo]);
    if (type === "file")  setBlocks((b) => [...b, { id: uid(), type, name: "" } as BlockFile]);
  };

  const moveBlock = (id: string, dir: -1 | 1) => {
    setBlocks((prev) => {
      const i = prev.findIndex((x) => x.id === id);
      if (i < 0) return prev;
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(i, 1);
      copy.splice(j, 0, item);
      return copy;
    });
  };

  const removeBlock = (id: string) => setBlocks((prev) => prev.filter((x) => x.id !== id));

  const handleSave = () => {
    // Training save logic - payload ready for backend integration
    alert("Treinamento pronto para salvar.");
  };

  const container: React.CSSProperties = { maxWidth: 1200, margin: "0 auto", padding: "16px" };

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    if (!fullscreen) return <div style={container}>{children}</div>;
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 999, background: "var(--bg, #0b1220)", color: "var(--text, #f8fafc)", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, overflow: "auto" }}>{children}</div>
      </div>
    );
  };

  return (
    <Wrapper>
      {/* Topbar */}
      <div style={{ position: "sticky", top: 0, zIndex: 5, backdropFilter: "blur(6px)", background: "var(--panel, rgba(255,255,255,0.9))", borderBottom: "1px solid var(--border, #e5e7eb)", marginBottom: 16 }}>
        <div style={{ ...container, display: "flex", alignItems: "center", gap: 12 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Novo Treinamento</h1>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={() => setFullscreen((f) => !f)} style={btn()}>{fullscreen ? "Sair da tela inteira" : "Tela inteira"}</button>
            <button onClick={handleSave} style={{ ...btn(), background: "#059669", color: "#fff", borderColor: "#059669" }}>Salvar</button>
            <button onClick={() => window.history.back()} style={btn()}>Cancelar</button>
          </div>
        </div>
      </div>

      {/* Grid responsivo */}
      <div id="nt-grid" style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr" }}>
        {/* Paleta */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={card()}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Adicionar bloco</div>
            <div style={{ display: "grid", gap: 8 }}>
              <button onClick={() => addBlock("text")}  style={btn()}>Texto rico</button>
              <button onClick={() => addBlock("image")} style={btn()}>Imagem</button>
              <button onClick={() => addBlock("video")} style={btn()}>Vídeo (URL)</button>
              <button onClick={() => addBlock("file")}  style={btn()}>Arquivo</button>
            </div>
          </div>
        </aside>

        {/* Canvas */}
        <main style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={card()}>
            <label style={{ display: "block", fontSize: 14, opacity: 0.8, marginBottom: 8 }}>Título do treinamento</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título..."
              style={{ width: "100%", borderRadius: 12, border: "1px solid var(--border, #e5e7eb)", padding: "10px 12px", background: "var(--panel, #fff)", color: "inherit" }}
            />
          </div>

          {blocks.map((b, idx) => (
            <div key={b.id} style={{ ...card(), overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderBottom: "1px solid var(--border, #e5e7eb)" }}>
                <div style={{ fontSize: 13, opacity: 0.8 }}>Bloco {idx + 1} — {b.type}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button onClick={() => moveBlock(b.id, -1)} style={btn()}>↑ Subir</button>
                  <button onClick={() => moveBlock(b.id, +1)} style={btn()}>↓ Descer</button>
                  <button onClick={() => removeBlock(b.id)} style={{ ...btn(), background: "#fee2e2", borderColor: "#fecaca", color: "#b91c1c" }}>Remover</button>
                </div>
              </div>
              <div style={{ padding: 16 }}>
                <BlockBody block={b} onChange={(patch) => setBlocks((prev) => prev.map(x => x.id === b.id ? ({ ...x, ...patch } as Block) : x))} />
              </div>
            </div>
          ))}
        </main>
      </div>
    </Wrapper>
  );
}

function BlockBody({ block, onChange }: { block: Block; onChange: (patch: Partial<Block>) => void }): JSX.Element | null {
  if (block.type === "text") return <RichEditor value={block.html} onChange={(html) => onChange({ html })} />;

  if (block.type === "image") {
    const img = block as BlockImage;
    return (
      <div style={{ display: "grid", gap: 8 }}>
        <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const url = URL.createObjectURL(f); onChange({ src: url }); }} />
        {img.src && <img src={img.src} alt={img.alt || "Imagem"} style={{ maxWidth: "100%", height: "auto", borderRadius: 12, border: "1px solid var(--border, #e5e7eb)" }} />}
        <input value={img.alt || ""} onChange={(e) => onChange({ alt: e.target.value })} placeholder="Descrição da imagem (alt)" style={{ width: "100%", borderRadius: 12, border: "1px solid var(--border, #e5e7eb)", padding: "8px 12px", background: "var(--panel, #fff)", color: "inherit" }} />
      </div>
    );
  }

  if (block.type === "video") {
    const v = block as BlockVideo;
    const playable = toPlayable(v.url || "");
    return (
      <div style={{ display: "grid", gap: 8 }}>
        <input value={v.url || ""} onChange={(e) => onChange({ url: e.target.value })} placeholder="Cole a URL do vídeo (YouTube/Vimeo/MP4 público)" style={{ width: "100%", borderRadius: 12, border: "1px solid var(--border, #e5e7eb)", padding: "8px 12px", background: "var(--panel, #fff)", color: "inherit" }} />
        {v.url && playable.kind === "video" && (
          <video controls style={{ width: "100%", borderRadius: 12 }}>
            <source src={playable.src} />
            Seu navegador não suporta o elemento de vídeo.
          </video>
        )}
        {v.url && playable.kind === "iframe" && (
          <div style={{ aspectRatio: "16/9", width: "100%", borderRadius: 12, overflow: "hidden", background: "black" }}>
            <iframe
              src={playable.src}
              style={{ width: "100%", height: "100%", border: "none" }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title="Vídeo"
            />
          </div>
        )}
      </div>
    );
  }

  if (block.type === "file") {
    const f = block as BlockFile;
    return (
      <div style={{ display: "grid", gap: 8 }}>
        <input type="file" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; onChange({ name: file.name }); }} />
        {f.name && <div style={{ fontSize: 14 }}>Selecionado: {f.name}</div>}
      </div>
    );
  }

  return null;
}

function toPlayable(videoUrl: string): Playable {
  try {
    const url = new URL(videoUrl);
    const path = url.pathname.toLowerCase();

    // MP4/WEBM/OGG -> video tag
    if (path.endsWith(".mp4") || path.endsWith(".webm") || path.endsWith(".ogg")) {
      return { kind: "video", src: videoUrl };
    }

    // YouTube (inclui Shorts)
    if (url.hostname.includes("youtube.com") || url.hostname.includes("youtu.be")) {
      let id = "";
      if (url.hostname === "youtu.be") id = url.pathname.slice(1);
      else if (url.pathname.startsWith("/shorts/")) id = url.pathname.split("/").filter(Boolean).pop() || "";
      else id = url.searchParams.get("v") || "";
      if (id) return { kind: "iframe", src: `https://www.youtube.com/embed/${id}` };
    }

    // Vimeo
    if (url.hostname.includes("vimeo.com")) {
      const id = url.pathname.split("/").filter(Boolean).pop();
      if (id) return { kind: "iframe", src: `https://player.vimeo.com/video/${id}` };
    }

    // Fallback
    return { kind: "iframe", src: videoUrl };
  } catch {
    return { kind: "iframe", src: videoUrl };
  }
}

function RichEditor({ value, onChange }: { value: string; onChange: (html: string) => void }): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.innerHTML !== value) el.innerHTML = value || "";
  }, [value]);

  const cmd = (command: string, v?: string) => {
    document.execCommand(command, false, v);
    onChange(ref.current?.innerHTML || "");
  };
  const onInput = () => onChange(ref.current?.innerHTML || "");

  const btnStyle: React.CSSProperties = { padding: "6px 8px", fontSize: 13, borderRadius: 8, border: "1px solid var(--border, #e5e7eb)", background: "var(--panel, #fff)" };

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", padding: 8, border: "1px solid var(--border, #e5e7eb)", borderTopLeftRadius: 12, borderTopRightRadius: 12, background: "var(--panel, #fff)", position: "sticky", top: 0, zIndex: 2 }}>
        <button onClick={() => cmd("bold")} style={btnStyle}>B</button>
        <button onClick={() => cmd("italic")} style={btnStyle}>I</button>
        <button onClick={() => cmd("underline")} style={btnStyle}>U</button>
        <button onClick={() => cmd("insertUnorderedList")} style={btnStyle}>• Lista</button>
        <button onClick={() => cmd("insertOrderedList")} style={btnStyle}>1. Lista</button>
        <button onClick={() => cmd("formatBlock", "H2")} style={btnStyle}>H2</button>
        <button onClick={() => cmd("formatBlock", "H3")} style={btnStyle}>H3</button>
        <span style={{ fontSize: 12, opacity: 0.8 }}>Cor</span>
        <input type="color" onChange={(e) => cmd("foreColor", e.target.value)} style={{ height: 28, width: 28, cursor: "pointer", background: "transparent", border: "none" }} />
        <button onClick={() => cmd("backColor", "#fff59d")} style={btnStyle}>Destacar</button>
        <button onClick={() => { const url = prompt("Cole a URL"); if (url) cmd("createLink", url); }} style={btnStyle}>🔗</button>
        <button onClick={() => cmd("unlink")} style={btnStyle}>⛔🔗</button>
      </div>
      <div
        ref={ref}
        onInput={onInput}
        contentEditable
        suppressContentEditableWarning
        style={{ minHeight: 140, border: "1px solid var(--border, #e5e7eb)", borderBottomLeftRadius: 12, borderBottomRightRadius: 12, padding: 16, background: "var(--panel, #fff)", color: "inherit" }}
      />
    </div>
  );
}

function card(): React.CSSProperties {
  return { background: "var(--panel, #fff)", border: "1px solid var(--border, #e5e7eb)", borderRadius: 16, padding: 16 };
}

function btn(): React.CSSProperties {
  return { padding: "8px 12px", borderRadius: 12, border: "1px solid var(--border, #e5e7eb)", background: "var(--panel, #fff)", color: "inherit" };
}
