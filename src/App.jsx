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
      boxShadow: "0 12px 30px rgba(233,106,154,
