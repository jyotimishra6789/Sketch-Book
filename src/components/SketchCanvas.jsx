import { useRef, useState, useEffect } from "react";
import Toolbar from "./Toolbar";

export default function SketchCanvas() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [tool, setTool] = useState("brush");
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(5);

  const [texts, setTexts] = useState([]);
  const [activeTextId, setActiveTextId] = useState(null);

  const pathsRef = useRef([]);

  // ================= CANVAS INIT =================
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctxRef.current = ctx;

    redraw();
  }, []);

  // ================= REDRAW =================
  const redraw = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw paths
    pathsRef.current.forEach((p) => {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = p.size;
      ctx.beginPath();
      ctx.moveTo(p.points[0].x, p.points[0].y);
      p.points.forEach((pt) => ctx.lineTo(pt.x, pt.y));
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

  // ================= DRAW =================
  const startDrawing = (x, y) => {
    if (tool !== "brush") return;

    pathsRef.current.push({
      color,
      size,
      points: [{ x, y }],
    });

    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);
  };

  const draw = (x, y) => {
    if (tool !== "brush") return;

    const path = pathsRef.current.at(-1);
    if (!path) return;

    path.points.push({ x, y });
    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();
  };

  const stopDrawing = () => {
    redraw();
  };

  // ================= TEXT =================
  const handleTextClick = (x, y) => {
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

  // ================= RENDER =================
  return (
    <div style={{ position: "relative" }}>
      <Toolbar
        tool={tool}
        setTool={setTool}
        color={color}
        setColor={setColor}
        size={size}
        setSize={setSize}
        undo={() => {}}
        redo={() => {}}
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

      {/* ========= TEXT INPUT ========= */}
      {texts.map(
        (t) =>
          activeTextId === t.id && (
            <textarea
              key={t.id}
              autoFocus
              value={t.value}
              onChange={(e) => {
                setTexts((prev) =>
                  prev.map((x) =>
                    x.id === t.id
                      ? { ...x, value: e.target.value }
                      : x
                  )
                );
              }}
              onBlur={() => {
                setActiveTextId(null);
                redraw();
              }}
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
                zIndex: 20,
                caretColor: t.color,
                whiteSpace: "pre-wrap",
              }}
            />
          )
      )}

      {/* ========= CANVAS ========= */}
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          cursor: tool === "text" ? "text" : "crosshair",
          position: "relative",
          zIndex: 1,
        }}
        onMouseDown={(e) => {
          if (activeTextId) return;

          if (tool === "text") {
            handleTextClick(e.clientX, e.clientY);
          } else {
            startDrawing(e.clientX, e.clientY);
          }
        }}
        onMouseMove={(e) => draw(e.clientX, e.clientY)}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    </div>
  );
}
