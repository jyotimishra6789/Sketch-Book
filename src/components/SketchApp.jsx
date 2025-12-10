import { useRef, useState, useEffect } from "react";

export default function SketchApp() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(5);
  const [isEraser, setIsEraser] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  
  const pathsRef = useRef([]);
  const undoRef = useRef([]);

  
  const currentPath = useRef(null);

  
  const saveToLocalStorage = () => {
    try {
      const data = JSON.stringify(pathsRef.current);
      localStorage.setItem("sketch_paths", data);
    } catch (e) {
      console.error("Failed to save sketch", e);
    }
  };

  
  const redraw = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    pathsRef.current.forEach((path) => {
      if (!path.points || path.points.length === 0) return;

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

    
    try {
      const saved = localStorage.getItem("sketch_paths");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          pathsRef.current = parsed;
          redraw();
        }
      }
    } catch (e) {
      console.error("Failed to load sketch", e);
    }
  }, []);

  
  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.strokeStyle = isEraser ? "white" : color;
      ctxRef.current.lineWidth = size;
    }
  }, [color, size, isEraser]);

  
  const startDrawing = (e) => {
    setIsDrawing(true);

    const x = e.clientX;
    const y = e.clientY;

    currentPath.current = {
      color: isEraser ? "white" : color,
      size: size,
      points: [{ x, y }],
    };

    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);
  };

  
  const draw = (e) => {
    if (!isDrawing) return;

    const x = e.clientX;
    const y = e.clientY;

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
    if (pathsRef.current.length === 0) return;

    const removed = pathsRef.current.pop();
    undoRef.current.push(removed);

    redraw();
    saveToLocalStorage();
  };

  
  const redo = () => {
    if (undoRef.current.length === 0) return;

    const restored = undoRef.current.pop();
    pathsRef.current.push(restored);

    redraw();
    saveToLocalStorage();
  };

  
  const clearCanvas = () => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    pathsRef.current = [];
    undoRef.current = [];

    saveToLocalStorage();
  };

  
  const saveImage = () => {
    const canvas = canvasRef.current;
    const imageURL = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = imageURL;
    link.download = "sketch.png";
    link.click();
  };

  return (
    <>
    
      <div
        style={{
          position: "fixed",
          top: 20,
          left: 20,
          background: "white",
          padding: "12px 18px",
          borderRadius: "10px",
          display: "flex",
          gap: "10px",
          alignItems: "center",
          boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
          zIndex: 10,
        }}
      >
        <label>
          Brush Color:{" "}
          <input
            type="color"
            value={color}
            disabled={isEraser}
            onChange={(e) => setColor(e.target.value)}
          />
        </label>

        <label>
          Size:{" "}
          <input
            type="range"
            min="1"
            max="40"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
          />
        </label>

        <button onClick={() => setIsEraser(!isEraser)}>
          {isEraser ? "Switch to Brush" : "Use Eraser"}
        </button>

        <button onClick={undo}>Undo</button>
        <button onClick={redo}>Redo</button>

        <button onClick={clearCanvas}>Clear</button>
        <button onClick={saveImage}>Save Image</button>
      </div>

      
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          cursor: isEraser ? "cell" : "crosshair",
        }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    </>
  );
}
