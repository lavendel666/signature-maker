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

  useEffect(() => {
    if (!imageFile) return;
    const url = URL.createObjectURL(imageFile);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const presetColors = useMemo(
    () => ["#ffffff", "#111111", "#ff4da6", "#4dc3ff", "#3fe0c5"],
    []
  );

  const drawToCanvas = async () => {
    if (!canvasRef.current || !imageUrl) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = imageUrl;

    await new Promise((r) => (img.onload = r));

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.font = `${fontSize}px system-ui, -apple-system, sans-serif`;
    ctx.textBaseline = "top";

    const textW = ctx.measureText(signatureText).width;
    const textH = fontSize;

    let x = padding;
    let y = padding;

    if (position === "tr") x = canvas.width - padding - textW;
    if (position === "bl") y = canvas.height - padding - textH;
    if (position === "br") {
      x = canvas.width - padding - textW;
      y = canvas.height - padding - textH;
    }

    ctx.fillText(signatureText, x, y);
  };

  const handleDownload = async () => {
    if (!imageUrl) return alert("先に画像を選んでね");

    await drawToCanvas();
    canvasRef.current.toBlob((blob) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "signed.png";
      a.click();
    });
  };

  const styles = {
    page: {
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      padding: 24,
      background: "#fff6fb",
      fontFamily: "system-ui, -apple-system, sans-serif",
    },
    card: {
      width: "100%",
      maxWidth: 520,
      background: "#fff",
      borderRadius: 24,
      padding: 18,
      boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    },
    btnPrimary: {
      width: "100%",
      border: "none",
      borderRadius: 18,
      padding: "14px 16px",
      fontSize: 15,
      fontWeight: 700,
      background: "linear-gradient(135deg, #ff4da6, #ff7bc4)",
      color: "#fff",
      cursor: "pointer",
    },
    btnSave: {
      width: "100%",
      marginTop: 18,
      border: "none",
      borderRadius: 20,
      padding: "16px",
      fontSize: 16,
      fontWeight: 800,
      background: "linear-gradient(135deg, #4dc3ff, #76d7ff)",
      color: "#fff",
      cursor: "pointer",
    },
    field: {
      marginTop: 14,
      padding: 12,
      borderRadius: 16,
      border: "1px solid #eee",
    },
    label: { fontWeight: 700, fontSize: 13 },
    range: { width: "100%", marginTop: 8 },
    text: {
      width: "100%",
      marginTop: 8,
      padding: 10,
      borderRadius: 12,
      border: "1px solid #ddd",
    },
    grid2: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 10,
      marginTop: 10,
    },
    posBtn: (active) => ({
      padding: 10,
      borderRadius: 14,
      border: active ? "2px solid #ff4da6" : "1px solid #ddd",
      background: active ? "#ffe3f1" : "#fff",
      fontWeight: 700,
      cursor: "pointer",
    }),
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* 画像を選ぶ（横長） */}
        <label>
          <div style={styles.btnPrimary}>画像を選ぶ</div>
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => setImageFile(e.target.files[0])}
          />
        </label>

        <div style={styles.field}>
          <div style={styles.label}>署名テキスト</div>
          <input
            style={styles.text}
            value={signatureText}
            onChange={(e) => setSignatureText(e.target.value)}
          />
        </div>

        <div style={styles.field}>
          <div style={styles.label}>サイズ {fontSize}px</div>
          <input
            style={styles.range}
            type="range"
            min={12}
            max={120}
            value={fontSize}
            onChange={(e) => setFontSize(+e.target.value)}
          />
        </div>

        <div style={styles.field}>
          <div style={styles.label}>透明度 {opacity}</div>
          <input
            style={styles.range}
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={opacity}
            onChange={(e) => setOpacity(+e.target.value)}
          />
        </div>

        <div style={styles.field}>
          <div style={styles.label}>余白 {padding}px</div>
          <input
            style={styles.range}
            type="range"
            min={0}
            max={200}
            value={padding}
            onChange={(e) => setPadding(+e.target.value)}
          />
        </div>

        <div style={styles.field}>
          <div style={styles.label}>文字色</div>
          <div style={styles.grid2}>
            {presetColors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{
                  height: 34,
                  borderRadius: 999,
                  border: color === c ? "3px solid #ff4da6" : "1px solid #ddd",
                  background: c,
                }}
              />
            ))}
          </div>
        </div>

        <div style={styles.field}>
          <div style={styles.label}>位置</div>
          <div style={styles.grid2}>
            {POSITIONS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPosition(p.key)}
                style={styles.posBtn(position === p.key)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* 保存ボタンは一番下 */}
        <button style={styles.btnSave} onClick={handleDownload}>
          署名入りPNGを保存
        </button>

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  );
}
