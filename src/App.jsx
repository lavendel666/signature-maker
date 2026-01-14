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
      center: "中央"
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

    const scale = canvas.width / 1200; // だいたいのスケール補正
    const fs = Math.max(12, Math.round(fontSize * scale));
    const pad = Math.round(padding * scale);

    ctx.font = `${fs}px system-ui, -apple-system, Segoe UI, Roboto, sans-serif`;
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity;
    ctx.textBaseline = "bottom";

    const metrics = ctx.measureText(text);
    const textW = metrics.width;
    const textH = fs;

    let x = pad;
    let y = canvas.height - pad;

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
      y = (canvas.height + textH) / 2;
      ctx.textBaseline = "middle";
    }

    // 影（読みやすくする）
    ctx.save();
    ctx.globalAlpha = Math.min(1, opacity);
    ctx.shadowColor = "rgba(0,0,0,0.55)";
    ctx.shadowBlur = Math.round(6 * scale);
    ctx.shadowOffsetX = Math.round(2 * scale);
    ctx.shadowOffsetY = Math.round(2 * scale);
    ctx.fillText(text, x, y);
    ctx.restore();

    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "signed.png";
    a.click();
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-5xl p-6 space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold">署名メーカー</h1>
          <p className="text-neutral-300">
            画像を選んで、文字の署名を重ねて、PNGで保存できます。
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-neutral-900 p-5 space-y-4 shadow">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => fileRef.current?.click()}
                className="rounded-xl bg-white text-black px-4 py-2 font-medium hover:opacity-90"
              >
                画像を選ぶ
              </button>
              <button
                onClick={downloadMerged}
                disabled={!imageUrl}
                className="rounded-xl bg-blue-600 px-4 py-2 font-medium disabled:opacity-40 hover:opacity-90"
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

            <label className="block text-sm text-neutral-300">
              署名テキスト
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="mt-1 w-full rounded-xl bg-neutral-800 px-3 py-2 outline-none"
                placeholder="例：made with ChatGPT by hiromi"
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="block text-sm text-neutral-300">
                サイズ
                <input
                  type="range"
                  min="12"
                  max="96"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="mt-2 w-full"
                />
                <div className="text-xs text-neutral-400 mt-1">{fontSize}px</div>
              </label>

              <label className="block text-sm text-neutral-300">
                透明度
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="mt-2 w-full"
                />
                <div className="text-xs text-neutral-400 mt-1">{opacity}</div>
              </label>

              <label className="block text-sm text-neutral-300">
                余白
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={padding}
                  onChange={(e) => setPadding(Number(e.target.value))}
                  className="mt-2 w-full"
                />
                <div className="text-xs text-neutral-400 mt-1">{padding}px</div>
              </label>

              <label className="block text-sm text-neutral-300">
                色
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="mt-2 h-10 w-full rounded-xl bg-neutral-800"
                />
              </label>
            </div>

            <label className="block text-sm text-neutral-300">
              位置
              <select
                value={pos}
                onChange={(e) => setPos(e.target.value)}
                className="mt-1 w-full rounded-xl bg-neutral-800 px-3 py-2 outline-none"
              >
                {Object.keys(posLabel).map((k) => (
                  <option key={k} value={k}>
                    {posLabel[k]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="rounded-2xl bg-neutral-900 p-5 shadow">
            <div className="aspect-[4/3] rounded-xl bg-neutral-800 flex items-center justify-center overflow-hidden">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="preview"
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="text-neutral-400 text-sm">
                  左の「画像を選ぶ」からプレビューできます
                </div>
              )}
            </div>
            <p className="mt-3 text-xs text-neutral-400">
              保存は端末内で合成するので、画像はサーバーに送られません（ローカル処理）。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
