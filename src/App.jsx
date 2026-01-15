import React, { useEffect, useMemo, useRef, useState } from "react";

const POSITIONS = [
  { key: "tl", label: "左上" },
  { key: "tr", label: "右上" },
  { key: "bl", label: "左下" },
  { key: "br", label: "右下" },
];

export default function App() {
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [signatureText, setSignatureText] = useState("made with ChatGPT by hiromi");

  const [fontSize, setFontSize] = useState(32);
  const [opacity, setOpacity] = useState(0.7);
  const [padding, setPadding] = useState(24);

  const [color, setColor] = useState("#ffffff");
  const [position, setPosition] = useState("br");

  const canvasRef = useRef(null);

  // ObjectURL cleanup
  useEffect(() => {
    if (!imageFile) return;
    const url = URL.createObjectURL(imageFile);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const presetColors = useMemo(
    () => [
      { label: "白", value: "#ffffff" },
      { label: "黒", value: "#111111" },
      { label: "ピンク", value: "#ff4da6" },
      { label: "水色", value: "#4dc3ff" },
      { label: "ミント", value: "#3fe0c5" },
    ],
    []
  );

  const handlePickImage = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
  };

  const ensureFont = async (ctx) => {
    // Use system fonts; no external loading needed
    ctx.font = `${fontSize}px ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans JP", "Hiragino Sans", "Helvetica Neue", Arial`;
  };

  const drawToCanvas = async () => {
    if (!canvasRef.current) return;
    if (!imageUrl) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    // Fit canvas to image size
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;

    // Draw base image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    // Signature settings
    await ensureFont(ctx);

    const text = (signatureText || "").trim();
    if (!text) return;

    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, opacity));
    ctx.fillStyle = color;
    ctx.textBaseline = "top";

    const metrics = ctx.measureText(text);
    const textW = metrics.width;
    const textH = fontSize; // approximate

    const pad = Math.max(0, padding);

    let x = pad;
    let y = pad;

    if (position === "tr") {
      x = canvas.width - pad - textW;
      y = pad;
    } else if (position === "bl") {
      x = pad;
      y = canvas.height - pad - textH;
    } else if (position === "br") {
      x = canvas.width - pad - textW;
      y = canvas.height - pad - textH;
    } // "tl" default already set

    // Keep inside bounds (safety)
    x = Math.max(0, Math.min(canvas.width - textW, x));
    y = Math.max(0, Math.min(canvas.height - textH, y));

    ctx.fillText(text, x, y);
    ctx.restore();
  };

  const handleDownload = async () => {
    if (!imageUrl) {
      alert("先に画像を選んでね。");
      return;
    }

    try {
      await drawToCanvas();
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.toBlob(
        (blob) => {
          if (!blob) return;

          const a = document.createElement("a");
          const outUrl = URL.createObjectURL(blob);

          const base = (imageFile?.name || "signed").replace(/\.[^/.]+$/, "");
          a.href = outUrl;
          a.download = `${base}_signed.png`;

          document.body.appendChild(a);
          a.click();
          a.remove();

          setTimeout(() => URL.revokeObjectURL(outUrl), 1000);
        },
        "image/png",
        1.0
      );
    } catch (e) {
      console.error(e);
      alert("保存に失敗しちゃった… 画像を選び直してみてね。");
    }
  };

  // Keep canvas up-to-date even without a visible preview
  useEffect(() => {
    if (!imageUrl) return;
    drawToCanvas().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl, signatureText, fontSize, opacity, padding, color, position]);

  const styles = {
    page: {
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      padding: "28px 16px",
      background:
        "radial-gradient(1200px 600px at 20% 10%, rgba(255, 77, 166, 0.18), transparent 55%), radial-gradient(1000px 700px at 85% 15%, rgba(77, 195, 255, 0.16), transparent 55%), linear-gradient(180deg, #fff6fb 0%, #ffffff 45%, #f7fbff 100%)",
      color: "#2b2b2b",
      fontFamily:
        'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans JP", "Hiragino Sans", "Helvetica Neue", Arial',
    },
    card: {
      width: "min(520px, 100%)",
      background: "rgba(255,255,255,0.9)",
      border: "1px solid rgba(255, 77, 166, 0.18)",
      borderRadius: 24,
      boxShadow:
        "0 18px 40px rgba(255, 77, 166, 0.10), 0 10px 24px rgba(0, 0, 0, 0.06)",
      padding: 18,
      backdropFilter: "blur(8px)",
    },
    header: {
      padding: "10px 10px 14px",
      borderRadius: 18,
      background:
        "linear-gradient(135deg, rgba(255, 77, 166, 0.16), rgba(77, 195, 255, 0.10))",
      border: "1px solid rgba(255, 77, 166, 0.10)",
    },
    title: { margin: 0, fontSize: 22, letterSpacing: 0.2 },
    subtitle: { margin: "6px 0 0", fontSize: 12, opacity: 0.7, letterSpacing: 0.9 },

    row: { display: "grid", gap: 12, marginTop: 14 },
    btnRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },

    btn: (variant = "primary") => ({
      width: "100%",
      border: "none",
      borderRadius: 16,
      padding: "12px 14px",
      fontSize: 14,
      fontWeight: 700,
      cursor: "pointer",
      transition: "transform 0.06s ease, filter 0.12s ease",
      boxShadow:
        variant === "primary"
          ? "0 10px 22px rgba(255, 77, 166, 0.18)"
          : "0 10px 22px rgba(77, 195, 255, 0.12)",
      background:
        variant === "primary"
          ? "linear-gradient(135deg, #ff4da6, #ff7bc4)"
          : "linear-gradient(135deg, #4dc3ff, #76d7ff)",
      color: "#fff",
    }),

    fileWrap: {
      position: "relative",
      overflow: "hidden",
    },
    fileInput: {
      position: "absolute",
      inset: 0,
      opacity: 0,
      cursor: "pointer",
    },

    field: {
      borderRadius: 18,
      border: "1px solid rgba(0,0,0,0.08)",
      background: "#fff",
      padding: 12,
    },
    label: { display: "flex", justifyContent: "space-between", gap: 10, fontSize: 13, fontWeight: 700 },
    helper: { fontSize: 12, opacity: 0.7 },

    textInput: {
      marginTop: 10,
      width: "100%",
      borderRadius: 14,
      border: "1px solid rgba(0,0,0,0.10)",
      padding: "10px 12px",
      fontSize: 14,
      outline: "none",
    },

    range: { width: "100%", marginTop: 10 },

    colorsRow: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginTop: 10 },
    colorDot: (v, selected) => ({
      width: 34,
      height: 34,
      borderRadius: 999,
      border: selected ? "3px solid #ff4da6" : "2px solid rgba(0,0,0,0.10)",
      boxShadow: selected ? "0 0 0 4px rgba(255,77,166,0.16)" : "none",
      background: v,
      cursor: "pointer",
      transition: "transform 0.08s ease",
    }),

    posGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 },
    posBtn: (active) => ({
      borderRadius: 16,
      padding: "10px 12px",
      fontSize: 14,
      fontWeight: 800,
      cursor: "pointer",
      border: active ? "2px solid #ff4da6" : "1px solid rgba(0,0,0,0.10)",
      background: active
        ? "linear-gradient(135deg, rgba(255,77,166,0.22), rgba(255,123,196,0.12))"
        : "#fff",
      boxShadow: active ? "0 10px 18px rgba(255,77,166,0.14)" : "none",
      color: "#2b2b2b",
      transition: "transform 0.06s ease, filter 0.12s ease",
    }),

    note: {
      marginTop: 14,
      fontSize: 12,
      lineHeight: 1.5,
      padding: "10px 12px",
      borderRadius: 16,
      background: "rgba(255,77,166,0.08)",
      border: "1px solid rgba(255,77,166,0.16)",
    },
  };

  const onPress = (e) => {
    e.currentTarget.style.transform = "scale(0.99)";
  };
  const onRelease = (e) => {
    e.currentTarget.style.transform = "scale(1)";
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>署名メーカー</h1>
          <p style={styles.subtitle}>SIGN YOUR WORK</p>
        </div>

        <div style={styles.row}>
          <div style={styles.btnRow}>
            <div style={styles.fileWrap}>
              <button
                style={styles.btn("primary")}
                onMouseDown={onPress}
                onMouseUp={onRelease}
                onMouseLeave={onRelease}
                type="button"
              >
                画像を選ぶ
              </button>
              <input
                style={styles.fileInput}
                type="file"
                accept="image/*"
                onChange={handlePickImage}
              />
            </div>

            <button
              style={styles.btn("secondary")}
              onClick={handleDownload}
              onMouseDown={onPress}
              onMouseUp={onRelease}
              onMouseLeave={onRelease}
              type="button"
            >
              署名入りPNGを保存
            </button>
          </div>

          <div style={styles.field}>
            <div style={styles.label}>
              <span>署名テキスト</span>
              <span style={styles.helper}>画像に焼き込み</span>
            </div>
            <input
              style={styles.textInput}
              value={signatureText}
              onChange={(e) => setSignatureText(e.target.value)}
              placeholder="例: made with ChatGPT by hiromi"
            />
          </div>

          <div style={styles.field}>
            <div style={styles.label}>
              <span>サイズ</span>
              <span style={styles.helper}>{fontSize}px</span>
            </div>
            <input
              style={styles.range}
              type="range"
              min={12}
              max={120}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
            />
          </div>

          <div style={styles.field}>
            <div style={styles.label}>
              <span>透明度</span>
              <span style={styles.helper}>{opacity.toFixed(1)}</span>
            </div>
            <input
              style={styles.range}
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
            />
          </div>

          <div style={styles.field}>
            <div style={styles.label}>
              <span>余白</span>
              <span style={styles.helper}>{padding}px</span>
            </div>
            <input
              style={styles.range}
              type="range"
              min={0}
              max={200}
              value={padding}
              onChange={(e) => setPadding(Number(e.target.value))}
            />
          </div>

          <div style={styles.field}>
            <div style={styles.label}>
              <span>🎨 文字色</span>
            </div>

            <div style={styles.colorsRow}>
              {presetColors.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  aria-label={c.label}
                  title={c.label}
                  onClick={() => setColor(c.value)}
                  style={styles.colorDot(c.value, color.toLowerCase() === c.value.toLowerCase())}
                />
              ))}

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 2 }}>
                <span style={{ fontSize: 12, fontWeight: 800, opacity: 0.75 }}>自由</span>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  style={{
                    width: 42,
                    height: 34,
                    border: "1px solid rgba(0,0,0,0.14)",
                    borderRadius: 12,
                    padding: 0,
                    background: "#fff",
                    cursor: "pointer",
                  }}
                />
              </div>
            </div>
          </div>

          <div style={styles.field}>
            <div style={styles.label}>
              <span>✥ 位置</span>
            </div>

            <div style={styles.posGrid}>
              {POSITIONS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPosition(p.key)}
                  style={styles.posBtn(position === p.key)}
                  onMouseDown={onPress}
                  onMouseUp={onRelease}
                  onMouseLeave={onRelease}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* ✅ 「右下」などの現在位置表示は不要なので削除 */}
          </div>

          <div style={styles.note}>
            画像は端末内で合成して保存します（ローカル処理）。外部に送信しません。
          </div>

          {/* プレビューは表示しないけど、合成用にcanvasは保持 */}
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
      </div>
    </div>
  );
}
