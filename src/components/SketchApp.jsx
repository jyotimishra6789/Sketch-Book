import { useRef, useState, useEffect } from "react";

export default function SketchApp() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [tool, setTool] = useState("brush"); // paint | brush | pencil | eraser
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);

  const pathsRef = useRef([]);
  const undoRef = useRef([]);
  const currentPath = useRef(null);

  const saveToLocalStorage = () => {
    localStorage.setItem("sketch_paths", JSON.stringify(pathsRef.current));
  };

  const redraw = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    pathsRef.current.forEach((item) => {
      if (item.type === "fill") {
        ctx.fillStyle = item.color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.strokeStyle = item.color;
      ctx.lineWidth = item.size;
      ctx.lineCap = item.tool === "pencil" ? "butt" : "round";

      ctx.beginPath();
      ctx.moveTo(item.points[0].x, item.points[0].y);
      item.points.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext("2d");
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctxRef.current = ctx;

    const saved = localStorage.getItem("sketch_paths");
    if (saved) {
      pathsRef.current = JSON.parse(saved);
      redraw();
    }
  }, []);

  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;

    ctx.globalAlpha = 1;

    if (tool === "pencil") {
      ctx.strokeStyle = color;
      ctx.lineWidth = size * 0.6;
      ctx.lineCap = "butt";
    }

    if (tool === "brush") {
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
      ctx.lineCap = "round";
    }

    if (tool === "eraser") {
      ctx.strokeStyle = "white";
      ctx.lineWidth = size * 1.2;
      ctx.lineCap = "round";
    }
  }, [tool, color, size]);

  const startDrawing = (x, y) => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;

    // 🪣 Paint Tool
    if (tool === "paint") {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      pathsRef.current.push({ type: "fill", color });
      saveToLocalStorage();
      return;
    }

    setIsDrawing(true);

    currentPath.current = {
      type: "draw",
      tool,
      color: tool === "eraser" ? "white" : color,
      size,
      points: [{ x, y }],
    };

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (x, y) => {
    if (!isDrawing || tool === "paint") return;

    currentPath.current.points.push({ x, y });
    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;

    setIsDrawing(false);
    ctxRef.current.closePath();

    pathsRef.current.push(currentPath.current);
    undoRef.current = [];
    saveToLocalStorage();
  };

  const undo = () => {
    if (!pathsRef.current.length) return;
    undoRef.current.push(pathsRef.current.pop());
    redraw();
    saveToLocalStorage();
  };

  const redo = () => {
    if (!undoRef.current.length) return;
    pathsRef.current.push(undoRef.current.pop());
    redraw();
    saveToLocalStorage();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    ctxRef.current.fillStyle = "white";
    ctxRef.current.fillRect(0, 0, canvas.width, canvas.height);
    pathsRef.current = [];
    undoRef.current = [];
    saveToLocalStorage();
  };

  const saveImage = () => {
    const link = document.createElement("a");
    link.href = canvasRef.current.toDataURL("image/png");
    link.download = "sketch.png";
    link.click();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <div
        style={{
          position: "fixed",
          top: 20,
          left: 20,
          background: "#fff",
          padding: "14px",
          borderRadius: "14px",
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
          zIndex: 10,
        }}
      >
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />

        <input
          type="range"
          min="1"
          max="40"
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
        />

        <button onClick={() => setTool("paint")}>🪣 Paint</button>
        <button onClick={() => setTool("brush")}>🖌️ Brush</button>
        <button onClick={() => setTool("pencil")}>✏️ Pencil</button>
        <button onClick={() => setTool("eraser")}>🧽 Eraser</button>

        <button onClick={undo}>Undo</button>
        <button onClick={redo}>Redo</button>
        <button onClick={clearCanvas}>Clear</button>
        <button onClick={saveImage}>Save</button>
      </div>

      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          cursor:
            tool === "paint"
              ? "pointer"
              : tool === "eraser"
              ? "cell"
              : "crosshair",
          touchAction: "none",
        }}
        onMouseDown={(e) => startDrawing(e.clientX, e.clientY)}
        onMouseMove={(e) => draw(e.clientX, e.clientY)}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={(e) =>
          startDrawing(e.touches[0].clientX, e.touches[0].clientY)
        }
        onTouchMove={(e) =>
          draw(e.touches[0].clientX, e.touches[0].clientY)
        }
        onTouchEnd={stopDrawing}
      />
    </div>
  );
}
