import { useRef, useState, useEffect } from "react";
import Toolbar from "./Toolbar";

export default function SketchCanvas() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [tool, setTool] = useState("brush");
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(5);

  // 🔥 TEXT SYSTEM
  const [texts, setTexts] = useState([]);
  const [activeTextId, setActiveTextId] = useState(null);

  const pathsRef = useRef([]);
  const undoRef = useRef([]);

  // ---------------- CANVAS DRAW ----------------
  const redraw = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw strokes
    pathsRef.current.forEach((item) => {
      ctx.strokeStyle = item.color;
      ctx.lineWidth = item.size;
      ctx.beginPath();
      ctx.moveTo(item.points[0].x, item.points[0].y);
      item.points.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    });

    // draw texts
    texts.forEach((t) => {
      ctx.fillStyle = t.color;
      ctx.font = `${t.size}px Arial`;

      t.value.split("\n").forEach((line, i) => {
        ctx.fillText(line, t.x, t.y + i * t.size * 1.3);
      });
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext("2d");
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctxRef.current = ctx;

    redraw();
  }, [texts]);

  // ---------------- TEXT TOOL CLICK ----------------
  const handleCanvasClick = (x, y) => {
    if (tool !== "text") return;

    const id = Date.now();

    setTexts((prev) => [
      ...prev,
      {
        id,
        x,
        y,
        value: "",
        size: size * 4,
        color,
      },
    ]);

    setActiveTextId(id);
  };

  // ---------------- TEXT UPDATE ----------------
  const updateText = (id, value) => {
    setTexts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, value } : t))
    );
  };

  const stopEditing = () => {
    setActiveTextId(null);
  };

  // ---------------- DRAWING ----------------
  const startDrawing = (x, y) => {
    if (tool === "text") return;

    const path = {
      color,
      size,
      points: [{ x, y }],
    };

    pathsRef.current.push(path);
    undoRef.current = [];

    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);
  };

  const draw = (x, y) => {
    if (tool === "text") return;

    const path = pathsRef.current.at(-1);
    if (!path) return;

    path.points.push({ x, y });
    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();
  };

  return (
    <div style={{ position: "relative" }}>
      <Toolbar
        tool={tool}
        setTool={setTool}
        color={color}
        setColor={setColor}
        size={size}
        setSize={setSize}
        undo={() => {
          if (!pathsRef.current.length) return;
          undoRef.current.push(pathsRef.current.pop());
          redraw();
        }}
        redo={() => {
          if (!undoRef.current.length) return;
          pathsRef.current.push(undoRef.current.pop());
          redraw();
        }}
        clearCanvas={() => {
          pathsRef.current = [];
          setTexts([]);
          redraw();
        }}
        saveImage={() => {
          const link = document.createElement("a");
          link.href = canvasRef.current.toDataURL("image/png");
          link.download = "sketch.png";
          link.click();
        }}
      />

      {/* 🔥 FIGMA STYLE TEXT EDITOR */}
      {texts.map(
        (t) =>
          activeTextId === t.id && (
            <textarea
              key={t.id}
              autoFocus
              value={t.value}
              onChange={(e) => updateText(t.id, e.target.value)}
              onBlur={stopEditing}
              style={{
                position: "absolute",
                left: t.x,
                top: t.y,
                fontSize: t.size,
                fontFamily: "Arial",
                color: t.color,
                background: "transparent",
                border: "none",
                outline: "none",
                resize: "none",
                padding: 0,
                lineHeight: "1.3",
                caretColor: t.color,
                whiteSpace: "pre-wrap",
                overflow: "hidden",
              }}
            />
          )
      )}

      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          cursor: tool === "text" ? "text" : "crosshair",
        }}
        onMouseDown={(e) => {
          if (tool === "text") {
            handleCanvasClick(e.clientX, e.clientY);
          } else {
            startDrawing(e.clientX, e.clientY);
          }
        }}
        onMouseMove={(e) => draw(e.clientX, e.clientY)}
      />
    </div>
  );
}
