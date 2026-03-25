import React, { useState, useCallback } from "react";
import { ProcessedItem } from "../types";

const DPR = 3;
const W = 390;

const formatDate = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const days = ["日", "一", "二", "三", "四", "五", "六"];
  return { full: `${y}.${m}.${d}`, weekday: `星期${days[now.getDay()]}` };
};

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const lines = [];
  let line = "";
  for (const char of text) {
    const test = line + char;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = char;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawCard(canvas: HTMLCanvasElement, items: any[]) {
  const date = formatDate();
  const pad = 28;
  const dpr = DPR;
  const w = W;

  const C = {
    bg: "#f5f0e8", bg2: "#ede5d5", fg: "#1a1a1a", accent: "#c43e27",
    muted: "#8a7e6b", tagBg: "#e8e0d0", border: "#d4c9b5",
  };

  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  
  ctx.scale(dpr, dpr);
  ctx.font = "600 14.5px sans-serif";

  let totalH = 32;
  totalH += 40;
  totalH += 6 + 4 + 26; // divider area (extra space for date)

  const itemHeights = items.map((item, i) => {
    const textW = w - pad * 2 - 36;
    const lines = wrapText(ctx, item.title, textW);
    let h = Math.max(26, lines.length * 22.5) + 22;
    if (i < items.length - 1) h += 12;
    return { lines, h };
  });

  totalH += itemHeights.reduce((s, x) => s + x.h, 0);
  totalH += 22 + 16 + 36 + 24;

  canvas.width = w * dpr;
  canvas.height = totalH * dpr;
  canvas.style.width = w + "px";
  canvas.style.height = totalH + "px";

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);

  const grad = ctx.createLinearGradient(0, 0, w, totalH);
  grad.addColorStop(0, C.bg);
  grad.addColorStop(1, C.bg2);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, totalH);

  ctx.fillStyle = C.accent;
  ctx.fillRect(0, 0, w, 3);

  let y = 32;

  // ── Header ──
  ctx.fillStyle = C.fg;
  ctx.font = "900 26px 'Helvetica Neue', sans-serif";
  ctx.textBaseline = "top";
  ctx.fillText("每日AI简报", pad, y);

  ctx.fillStyle = C.muted;
  ctx.font = "400 11px sans-serif";
  ctx.fillText(`${date.full} ${date.weekday}`, pad, y + 32);

  // URL top right
  const urlY = y + 6;
  ctx.textAlign = "left";
  ctx.font = "700 12px 'Helvetica Neue', sans-serif";
  const partA = "amazing";
  const partB = "index.com";
  ctx.font = "400 12px 'Helvetica Neue', sans-serif";
  const partBW = ctx.measureText(partB).width;
  ctx.font = "700 12px 'Helvetica Neue', sans-serif";
  const partAW = ctx.measureText(partA).width;
  const urlX = w - pad - partAW - partBW;

  ctx.fillStyle = C.accent;
  ctx.font = "700 12px 'Helvetica Neue', sans-serif";
  ctx.fillText(partA, urlX, urlY);
  ctx.fillStyle = C.fg;
  ctx.font = "400 12px 'Helvetica Neue', sans-serif";
  ctx.fillText(partB, urlX + partAW, urlY);

  ctx.textAlign = "left";

  y += 52;

  // ── Divider ──
  ctx.strokeStyle = C.fg;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(pad, y);
  ctx.lineTo(w - pad, y);
  ctx.stroke();

  ctx.strokeStyle = C.border;
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(pad, y + 3);
  ctx.lineTo(w - pad, y + 3);
  ctx.stroke();

  y += 18;

  // ── News Items ──
  items.forEach((item, i) => {
    const { lines, h } = itemHeights[i];
    const rankSize = 26;
    const rankX = pad;
    const rankY = y;

    if (item.rank <= 3) {
      roundRect(ctx, rankX, rankY, rankSize, rankSize, 4);
      ctx.fillStyle = C.accent;
      ctx.fill();
      ctx.fillStyle = "#fff";
    } else {
      roundRect(ctx, rankX + 0.5, rankY + 0.5, rankSize - 1, rankSize - 1, 13);
      ctx.strokeStyle = C.border;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = C.muted;
    }

    ctx.font = "700 13px 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(item.rank), rankX + rankSize / 2, rankY + rankSize / 2 + 1);
    ctx.textAlign = "left";
    ctx.textBaseline = "top";

    const textX = pad + 36;
    ctx.fillStyle = C.fg;
    ctx.font = "600 14.5px sans-serif";
    lines.forEach((line: string, li: number) => {
      ctx.fillText(line, textX, rankY + li * 22.5 + 2);
    });

    const metaY = rankY + lines.length * 22.5 + 5;

    const tagText = item.tag;
    ctx.font = "400 10px sans-serif";
    const tagW = ctx.measureText(tagText).width + 14;
    roundRect(ctx, textX, metaY, tagW, 16, 3);
    ctx.fillStyle = C.tagBg;
    ctx.fill();
    ctx.fillStyle = C.muted;
    ctx.fillText(tagText, textX + 7, metaY + 3);

    ctx.fillStyle = C.muted;
    ctx.font = "400 10px sans-serif";
    ctx.fillText(item.source, textX + tagW + 8, metaY + 3);

    y += h;

    if (i < items.length - 1) {
      ctx.strokeStyle = C.border;
      ctx.lineWidth = 0.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(pad, y - 6);
      ctx.lineTo(w - pad, y - 6);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  });

  // ── Footer ──
  y += 6;
  ctx.strokeStyle = C.border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, y);
  ctx.lineTo(w - pad, y);
  ctx.stroke();

  y += 16;

  // Footer URL - centered, branded
  ctx.textAlign = "center";
  const cx = w / 2;
  ctx.font = "700 13px 'Helvetica Neue', sans-serif";
  const fPartAW = ctx.measureText("amazing").width;
  ctx.font = "400 13px 'Helvetica Neue', sans-serif";
  const fPartBW = ctx.measureText("index.com").width;
  const fTotalW = fPartAW + fPartBW;
  const fStartX = cx - fTotalW / 2;

  ctx.textAlign = "left";
  ctx.fillStyle = C.accent;
  ctx.font = "700 13px 'Helvetica Neue', sans-serif";
  ctx.fillText("amazing", fStartX, y);
  ctx.fillStyle = C.fg;
  ctx.font = "400 13px 'Helvetica Neue', sans-serif";
  ctx.fillText("index.com", fStartX + fPartAW, y);

  ctx.textAlign = "center";
  ctx.fillStyle = C.muted;
  ctx.font = "400 9px sans-serif";
  ctx.fillText("每日 AI 行业精选 · 工程师/创始人/投资人都在看", cx, y + 18);
  ctx.textAlign = "left";

  return canvas;
}

export function ShareModal({ imageUrl, onClose }: { imageUrl: string | null, onClose: () => void }) {
  if (!imageUrl) return null;
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.75)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: 20,
        animation: "fadeIn 0.2s ease",
      }}
      onClick={onClose}
    >
      <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } } @keyframes slideUp { from { transform: translateY(30px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }`}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#1c1c1e", borderRadius: 16,
          padding: 20, maxWidth: 400, width: "100%",
          maxHeight: "90vh", overflow: "auto",
          animation: "slideUp 0.25s ease",
        }}
      >
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "center", marginBottom: 16,
        }}>
          <span style={{
            color: "#fff", fontSize: 15, fontWeight: 700,
            fontFamily: "'Noto Sans SC', sans-serif",
          }}>
            长按图片保存
          </span>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.1)", border: "none",
              borderRadius: 20, width: 32, height: 32,
              color: "#aaa", fontSize: 18, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>
        <img
          src={imageUrl}
          alt="每日AI简报"
          style={{
            width: "100%", borderRadius: 10,
            boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
          }}
        />
        <p style={{
          color: "#666", fontSize: 11, textAlign: "center",
          marginTop: 16, fontFamily: "'Noto Sans SC', sans-serif",
          lineHeight: 1.6,
        }}>
          长按图片 → 保存到相册
        </p>
      </div>
    </div>
  );
}

export function useShareCard(items: ProcessedItem[]) {
  const [shareImage, setShareImage] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleShare = useCallback(() => {
    setGenerating(true);
    requestAnimationFrame(() => {
      const canvas = document.createElement("canvas");
      const shareData = items.slice(0, 6).map((item, i) => ({
        rank: i + 1,
        title: item.processed_title,
        source: item.source_name,
        tag: item.category || item.tags?.[0] || '资讯'
      }));
      drawCard(canvas, shareData);
      const url = canvas.toDataURL("image/png");
      setShareImage(url);
      setGenerating(false);
    });
  }, [items]);

  return { shareImage, setShareImage, generating, handleShare };
}
