import { useRef, useState, useEffect } from "react";

export default function SketchApp() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [theme, setTheme] = useState("light");
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(5);
  const [isEraser, setIsEraser] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  const pathsRef = useRef([]);
  const undoRef = useRef([]);
  const currentPath = useRef(null);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const themeStyles = {
    light: {
      background: "#f5f5f5",
      toolbar: "#ffffff",
      text: "#000000",
      button: "#f1f1f1",
    },
    dark: {
      background: "#121212",
      toolbar: "#1e1e1e",
      text: "#ffffff",
      button: "#2a2a2a",
    },
  };

  const saveToLocalStorage = () => {
    localStorage.setItem("sketch_paths", JSON.stringify(pathsRef.current));
  };

  const redraw = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    pathsRef.current.forEach((path) => {
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.size;

      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y);
      path.points.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

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
    if (ctxRef.current) {
      ctxRef.current.strokeStyle = isEraser ? "white" : color;
      ctxRef.current.lineWidth = size;
    }
  }, [color, size, isEraser]);

  const startDrawing = (x, y) => {
    setIsDrawing(true);

    currentPath.current = {
      color: isEraser ? "white" : color,
      size,
      points: [{ x, y }],
    };

    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);
  };

  const draw = (x, y) => {
    if (!isDrawing) return;

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
    ctxRef.current.fillStyle = "white";
    ctxRef.current.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
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
    <div
      style={{
        background: themeStyles[theme].background,
        minHeight: "100vh",
        color: themeStyles[theme].text,
      }}
    >
      <div
        style={{
          position: "fixed",
          top: 20,
          left: 20,
          background: themeStyles[theme].toolbar,
          padding: "14px",
          borderRadius: "14px",
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          alignItems: "center",
          boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
          zIndex: 10,
        }}
      >
        <input
          type="color"
          value={color}
          disabled={isEraser}
          onChange={(e) => setColor(e.target.value)}
        />

        <input
          type="range"
          min="1"
          max="40"
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
        />

        <button onClick={() => setIsEraser(!isEraser)}>
          {isEraser ? "🧼 Eraser" : "🖌️ Brush"}
        </button>

        <button onClick={undo}>Undo</button>
        <button onClick={redo}>Redo</button>
        <button onClick={clearCanvas}>Clear</button>
        <button onClick={saveImage}>Save</button>

        <button onClick={toggleTheme}>
          {theme === "light" ? "🌙 Dark" : "🌞 Light"}
        </button>
      </div>

      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          cursor: isEraser ? "cell" : "crosshair",
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
