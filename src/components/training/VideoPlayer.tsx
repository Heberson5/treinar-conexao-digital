// src/components/training/VideoPlayer.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  /** URL do vídeo (pode ser mp4/webm/ogg, YouTube, ou blob:) */
  url?: string | null;
  /** Texto alternativo quando não há vídeo */
  fallbackText?: string;
  /** Poster opcional (imagem de capa) */
  poster?: string;
  /** Se o arquivo veio de um input <File>, você pode passar o próprio File aqui */
  file?: File | null;
  /** Altura máxima (css) — o width é 100% */
  maxHeight?: number | string;
  /** Se true, tenta autoplay sem som */
  autoPlayMuted?: boolean;
  /** Mostra controles do player */
  controls?: boolean;
};

const isYouTube = (u: string) =>
  /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/)/i.test(u);

const getYouTubeId = (u: string): string | null => {
  try {
    const url = new URL(u);
    if (url.hostname.includes("youtu.be")) {
      // https://youtu.be/VIDEOID
      return url.pathname.slice(1);
    }
    if (url.searchParams.get("v")) {
      // https://www.youtube.com/watch?v=VIDEOID
      return url.searchParams.get("v");
    }
    // https://www.youtube.com/embed/VIDEOID
    const parts = url.pathname.split("/");
    const idx = parts.findIndex((p) => p === "embed");
    if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
  } catch {}
  return null;
};

const isDirectVideo = (u: string) => /\.(mp4|webm|ogg)(\?.*)?$/i.test(u);

export default function VideoPlayer({
  url,
  fallbackText = "Nenhum vídeo disponível.",
  poster,
  file,
  maxHeight = 420,
  autoPlayMuted = false,
  controls = true,
}: Props) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Se veio um File (upload local), cria um blob URL
  useEffect(() => {
    if (file) {
      const u = URL.createObjectURL(file);
      setBlobUrl(u);
      return () => URL.revokeObjectURL(u);
    }
    setBlobUrl(null);
  }, [file]);

  const finalUrl = blobUrl ?? url ?? "";

  const kind: "youtube" | "direct" | "none" = useMemo(() => {
    if (!finalUrl) return "none";
    if (isYouTube(finalUrl)) return "youtube";
    if (isDirectVideo(finalUrl) || finalUrl.startsWith("blob:")) return "direct";
    return "direct"; // assume direto; se não for, o <video> falha e mostra fallback
  }, [finalUrl]);

  // Tenta autoplay (muted) se configurado
  useEffect(() => {
    if (autoPlayMuted && kind === "direct" && videoRef.current) {
      const v = videoRef.current;
      v.muted = true;
      v.play().catch(() => {
        // Alguns browsers bloqueiam autoplay; ignorar
      });
    }
  }, [autoPlayMuted, kind]);

  const containerStyle: React.CSSProperties = {
    width: "100%",
    maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
    borderRadius: 12,
    overflow: "hidden",
    background: "var(--card, #111827)",
    border: "1px solid var(--border, #1f2937)",
  };

  if (kind === "youtube") {
    const id = getYouTubeId(finalUrl || "");
    if (!id) {
      return <FallbackBox text="URL do YouTube inválida." style={containerStyle} />;
    }
    const src = `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
    return (
      <div style={containerStyle}>
        <div style={{ position: "relative", paddingTop: "56.25%" }}>
          <iframe
            src={src}
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              border: 0,
            }}
          />
        </div>
      </div>
    );
  }

  if (kind === "direct") {
    const type = guessMime(finalUrl);
    return (
      <div style={containerStyle}>
        <video
          ref={videoRef}
          src={finalUrl}
          controls={controls}
          poster={poster}
          preload="metadata"
          crossOrigin="anonymous"
          style={{ width: "100%", height: "auto", display: "block", background: "black" }}
        >
          {type && <source src={finalUrl} type={type} />}
          Seu navegador não suporta a reprodução de vídeos.
        </video>
      </div>
    );
  }

  return <FallbackBox text={fallbackText} style={containerStyle} />;
}

function FallbackBox({ text, style }: { text: string; style?: React.CSSProperties }) {
  return (
    <div
      className="p-4 text-sm text-muted-foreground flex items-center justify-center"
      style={style}
    >
      {text}
    </div>
  );
}

function guessMime(u: string): string | undefined {
  if (/\.mp4(\?.*)?$/i.test(u)) return "video/mp4";
  if (/\.webm(\?.*)?$/i.test(u)) return "video/webm";
  if (/\.ogg(\?.*)?$/i.test(u)) return "video/ogg";
  return undefined;
}
