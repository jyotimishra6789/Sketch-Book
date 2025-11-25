import { useRef, useState, useEffect } from "react";

export default function SketchApp() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  // Brush states
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(5);
  const [isEraser, setIsEraser] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  // Paths storage (NOT state — useRef to avoid rerenders)
  const pathsRef = useRef([]);
  const undoRef = useRef([]);

  // Current path while drawing
  const currentPath = useRef(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // White background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctxRef.current = ctx;
  }, []);

  // Brush / Eraser settings updated
  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.strokeStyle = isEraser ? "white" : color;
      ctxRef.current.lineWidth = size;
    }
  }, [color, size, isEraser]);

  // Start Drawing
  const startDrawing = (e) => {
    setIsDrawing(true);

    const x = e.clientX;
    const y = e.clientY;

    // New path object
    currentPath.current = {
      color: isEraser ? "white" : color,
      size: size,
      points: [{ x, y }],
    };

    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);
  };

  // Draw
  const draw = (e) => {
    if (!isDrawing) return;

    const x = e.clientX;
    const y = e.clientY;

    currentPath.current.points.push({ x, y });

    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();
  };

  // Stop Drawing
  const stopDrawing = () => {
    if (!isDrawing) return;

    setIsDrawing(false);
    ctxRef.current.closePath();

    // Save finished path
    pathsRef.current.push(currentPath.current);

    // After new path → redo stack clear
    undoRef.current = [];
  };

  // Redraw entire canvas
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

  // Undo
  const undo = () => {
    if (pathsRef.current.length === 0) return;

    const removed = pathsRef.current.pop();
    undoRef.current.push(removed);

    redraw();
  };

  // Redo
  const redo = () => {
    if (undoRef.current.length === 0) return;

    const restored = undoRef.current.pop();
    pathsRef.current.push(restored);

    redraw();
  };

  // Clear Canvas
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    pathsRef.current = [];
    undoRef.current = [];
  };

  return (
    <>
      {/* Controls */}
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
      </div>

      {/* Canvas */}
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
