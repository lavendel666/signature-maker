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
    () => ["#ffffff", "#111111", "#E96A9A", "#9EC9F5", "#BFE9D5"],
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
      background: "#FFF7FA",
      fontFamily: "system-ui, -apple-system, sans-serif",
      color: "#333",
    },
    card: {
      width: "100%",
      maxWidth: 520,
      background: "#ffffff",
      borderRadius: 28,
      padding: 20,
      boxShadow: "0 12px 30px rgba(233,106,154,0.15)",
    },
    header: {
      marginBottom: 18,
      padding: "12px 14px 16px",
      borderRadius: 22,
      background: "#ffffff",
      boxShadow: "0 6px 20px rgba(233,106,154,0.18)",
      textAlign: "center",
    },
    title: {
      margin: 0,
      fontSize: 22,
      fontWeight: 800,
      color: "#E96A9A",
      letterSpacing: 0.5,
    },
    subtitle: {
      margin: "4px 0 0",
      fontSize: 12,
      opacity: 0.6,
      letterSpacing: 1.2,
    },
    btnPrimary: {
      width: "100%",
      border: "none",
      borderRadius: 20,
      padding: "14px 16px",
      fontSize: 15,
      fontWeight: 700,
      background: "#E96A9A",
      color: "#fff",
      cursor: "pointer",
      boxShadow: "0 6px 16px rgba(233,106,154,0.35)",
    },
    btnSave: {
      width: "100%",
      marginTop: 22,
      border: "none",
      borderRadius: 22,
      padding: "16px",
      fontSize: 16,
      fontWeight: 800,
      background: "#9EC9F5",
      color: "#fff",
      cursor: "pointer",
      boxShadow: "0 6px 18px rgba(158,201,245,0.45)",
    },
    field: {
      marginTop: 16,
      padding: 14,
      borderRadius: 18,
      background: "#ffffff",
      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    },
    label: {
      fontWeight: 700,
      fontSize: 13,
      color: "#E96A9A",
    },
    range: { width: "100%", marginTop: 10 },
    text: {
      width: "100%",
      marginTop: 10,
      padding: 12,
      borderRadius: 14,
      border: "1px solid #F2D6E1",
      fontSize: 14,
    },
    grid2: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 12,
      marginTop: 12,
    },
    posBtn: (active) => ({
      padding: 12,
      borderRadius: 16,
      border: active ? "2px solid #E96A9A" : "1px solid #F2D6E1",
      background: active ? "#FCE4EE" : "#ffffff",
      fontWeight: 700,
      cursor: "pointer",
    }),
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>署名メーカー</h1>
          <p style={styles.subtitle}>SIGN YOUR WORK</p>
        </div>

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
                  height: 36,
                  borderRadius: 999,
                  border: color === c ? "3px solid #E96A9A" : "1px solid #F2D6E1",
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

        <button style={styles.btnSave} onClick={handleDownload}>
          署名入りPNGを保存
        </button>

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </div>
  );
}
