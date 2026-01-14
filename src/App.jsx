import React, { useMemo, useRef, useState } from "react";

export default function App() {
  const fileRef = useRef(null);
  const [imageUrl, setImageUrl] = useState(null);

  const [text, setText] = useState("made with ChatGPT by hiromi");
  const [fontSize, setFontSize] = useState(32);
  const [opacity, setOpacity] = useState(0.7);
  const [padding, setPadding] = useState(24);
  const [pos, setPos] = useState("br"); // br, bl, tr, tl, center
  const [color, setColor] = useState("#ffffff");

  const posLabel = useMemo(
    () => ({
      tl: "左上",
      tr: "右上",
      bl: "左下",
      br: "右下",
      center: "中央",
    }),
    []
  );

  function onPickFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
  }

  async function downloadMerged() {
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    const scale = canvas.width / 1200;
    const fs = Math.max(12, Math.round(fontSize * scale));
    const pad = Math.round(padding * scale);

    ctx.font = `${fs}px system-ui, -apple-system, Segoe UI, Roboto, sans-serif`;
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity;

    const metrics = ctx.measureText(text);
    const textW = metrics.width;
    const textH = fs;

    let x = pad;
    let y = canvas.height - pad;

    ctx.textBaseline = "bottom";

    if (pos === "br") {
      x = canvas.width - pad - textW;
      y = canvas.height - pad;
    } else if (pos === "bl") {
      x = pad;
      y = canvas.height - pad;
    } else if (pos === "tr") {
      x = canvas.width - pad - textW;
      y = pad + textH;
    } else if (pos === "tl") {
      x = pad;
      y = pad + textH;
    } else if (pos === "center") {
      x = (canvas.width - textW) / 2;
      y = canvas.height / 2;
      ctx.textBaseline = "middle";
    }

    // 読みやすくする影
    ctx.save();
    ctx.globalAlpha = Math.min(1, opacity);
    ctx.shadowColor = "rgba(0,0,0,0.35)";
    ctx.shadowBlur = Math.round(8 * scale);
    ctx.shadowOffsetX = Math.round(2 * scale);
    ctx.shadowOffsetY = Math.round(2 * scale);
    ctx.fillText(text, x, y);
    ctx.restore();

    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "signed.png";
    a.click();
  }

  const ColorChip = ({ value, label }) => {
    const selected = color.toLowerCase() === value.toLowerCase();
    return (
      <button
        type="button"
        onClick={() => setColor(value)}
        className={[
          "h-10 w-10 rounded-full border-2 transition-all",
          "shadow-sm",
          selected ? "border-pink-500 ring-4 ring-pink-200" : "border-white/60 hover:ring-4 hover:ring-pink-100",
        ].join(" ")}
        aria-label={label}
        title={label}
        style={{ backgroundColor: value }}
      />
    );
  };

  const PosButton = ({ value, children }) => {
    const active = pos === value;
    return (
      <button
        type="button"
        onClick={() => setPos(value)}
        className={[
          "rounded-2xl px-4 py-3 text-sm font-semibold transition-all",
          "shadow-sm",
          active
            ? "bg-pink-500 text-white shadow-md"
            : "bg-white/70 text-pink-600 hover:bg-white",
        ].join(" ")}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-rose-50 to-white text-slate-800">
      <div className="mx-auto max-w-5xl p-6 md:p-10 space-y-6">
        {/* Header */}
        <div className="rounded-[28px] bg-white/80 backdrop-blur border border-pink-100 shadow-[0_20px_60px_-35px_rgba(244,114,182,0.65)] px-6 py-6 md:px-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-400 grid place-items-center shadow-md">
              <span className="text-white text-2xl font-black">T</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-pink-600">
                署名メーカー
              </h1>
              <p className="text-xs md:text-sm text-pink-400 font-semibold tracking-widest">
                SIGN YOUR WORK
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Controls */}
          <div className="rounded-[28px] bg-white/80 backdrop-blur border border-pink-100 shadow-[0_20px_60px_-35px_rgba(244,114,182,0.65)] p-6 md:p-7 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white px-5 py-3 font-bold shadow-md hover:opacity-95 active:scale-[0.99] transition"
              >
                画像を選ぶ
              </button>
              <button
                type="button"
                onClick={downloadMerged}
                disabled={!imageUrl}
                className={[
                  "rounded-2xl px-5 py-3 font-bold shadow-md transition",
                  !imageUrl
                    ? "bg-pink-200 text-white/70 cursor-not-allowed"
                    : "bg-white text-pink-600 border border-pink-200 hover:bg-pink-50 active:scale-[0.99]",
                ].join(" ")}
              >
                署名入りPNGを保存
              </button>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onPickFile}
              />
            </div>

            {/* Text */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-pink-500 font-extrabold">
                <span className="inline-block text-lg">T</span>
                <span>署名テキスト</span>
              </div>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full rounded-2xl bg-pink-50 border border-pink-100 px-4 py-4 text-lg font-semibold outline-none focus:ring-4 focus:ring-pink-200"
                placeholder="例：made with ChatGPT by hiromi"
              />
            </div>

            {/* Sliders */}
            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">サイズ</span>
                  <span className="text-sm font-bold text-pink-500">{fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="96"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-pink-500"
                />
              </label>

              <label className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">透明度</span>
                  <span className="text-sm font-bold text-pink-500">{opacity}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-full accent-pink-500"
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">余白</span>
                  <span className="text-sm font-bold text-pink-500">{padding}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={padding}
                  onChange={(e) => setPadding(Number(e.target.value))}
                  className="w-full accent-pink-500"
                />
              </label>
            </div>

            {/* Colors */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-pink-500 font-extrabold">
                <span>🎨</span>
                <span>文字色</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <ColorChip value="#ffffff" label="白" />
                <ColorChip value="#111827" label="黒" />
                <ColorChip value="#ff4da6" label="ピンク" />
                <ColorChip value="#93c5fd" label="水色" />
                <ColorChip value="#a7f3d0" label="ミント" />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-600">自由</span>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="h-10 w-14 rounded-2xl border-2 border-white/60 shadow-sm"
                    title="カスタム色"
                  />
                </div>
              </div>
            </div>

            {/* Position */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-pink-500 font-extrabold">
                <span>✥</span>
                <span>位置</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <PosButton value="tl">左上</PosButton>
                <PosButton value="tr">右上</PosButton>
                <PosButton value="center">中央</PosButton>
                <PosButton value="bl">左下</PosButton>
                <PosButton value="br">右下</PosButton>
                <div className="rounded-2xl bg-white/40 border border-pink-100 grid place-items-center text-xs font-bold text-pink-400">
                  {posLabel[pos]}
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              画像は端末内で合成して保存します（ローカル処理）。外部に送信しません。
            </p>
          </div>

          {/* Preview */}
          <div className="rounded-[28px] bg-white/80 backdrop-blur border border-pink-100 shadow-[0_20px_60px_-35px_rgba(244,114,182,0.65)] p-6 md:p-7">
            <div className="flex items-center justify-between mb-3">
              <div className="text-pink-600 font-black">プレビュー</div>
              <div className="text-xs font-bold text-pink-400 bg-pink-50 border border-pink-100 px-3 py-1 rounded-full">
                {imageUrl ? "画像あり" : "画像なし"}
              </div>
            </div>

            <div className="aspect-[4/3] rounded-[22px] bg-gradient-to-b from-pink-50 to-white border border-dashed border-pink-200 flex items-center justify-center overflow-hidden">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="preview"
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="text-pink-300 text-sm font-semibold">
                  左の「画像を選ぶ」からプレビューできます
                </div>
              )}
            </div>

            <div className="mt-4 rounded-2xl bg-pink-50 border border-pink-100 p-4">
              <div className="text-xs text-pink-500 font-black mb-1">いまの設定</div>
              <div className="text-sm text-slate-700 font-semibold break-words">
                {text}
              </div>
              <div className="mt-2 text-xs text-slate-500 font-semibold">
                サイズ {fontSize}px / 透明度 {opacity} / 余白 {padding}px / 位置 {posLabel[pos]}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom cute spacer */}
        <div className="h-8" />
      </div>
    </div>
  );
}
