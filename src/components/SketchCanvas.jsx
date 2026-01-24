import { useRef, useState, useEffect } from "react";
import Toolbar from "./Toolbar";

export default function SketchCanvas() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [tool, setTool] = useState("brush");
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);

  const [texts, setTexts] = useState([]);
  const [activeTextId, setActiveTextId] = useState(null);

  const pathsRef = useRef([]);

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

  const redraw = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // strokes
    pathsRef.current.forEach((p) => {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = p.size;

      ctx.beginPath();
      ctx.moveTo(p.points[0].x, p.points[0].y);
      p.points.forEach(pt => ctx.lineTo(pt.x, pt.y));
      ctx.stroke();
    });

    // texts
    texts.forEach(t => {
      ctx.fillStyle = t.color;
      ctx.font = `${t.size}px Arial`;
      t.value.split("\n").forEach((line, i) => {
        ctx.fillText(line, t.x, t.y + i * t.size * 1.2);
      });
    });
  };

  // ---------------- DRAW ----------------

  const startDrawing = (x, y) => {
    if (tool === "text") return;

    setIsDrawing(true);
    pathsRef.current.push({
      color,
      size,
      points: [{ x, y }],
    });

    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);
  };

  const draw = (x, y) => {
    if (!isDrawing || tool === "text") return;

    const path = pathsRef.current.at(-1);
    path.points.push({ x, y });

    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    redraw();
  };

  // ---------------- TEXT ----------------

  const handleTextClick = (x, y) => {
    const id = Date.now();

    setTexts(prev => [
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
          link.href = canvasRef.current.toDataURL();
          link.download = "sketch.png";
          link.click();
        }}
      />

      {/* TEXT EDITOR */}
      {texts.map(
        t =>
          activeTextId === t.id && (
            <textarea
              key={t.id}
              autoFocus
              value={t.value}
              onChange={(e) => {
                setTexts(prev =>
                  prev.map(x =>
                    x.id === t.id
                      ? { ...x, value: e.target.value }
                      : x
                  )
                );
              }}
              onBlur={() => setActiveTextId(null)}
              style={{
                position: "absolute",
                left: t.x,
                top: t.y,
                fontSize: t.size,
                color: t.color,
                background: "transparent",
                border: "none",
                outline: "none",
                resize: "none",
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
