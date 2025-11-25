import { useRef, useState, useEffect } from "react";

export default function SketchApp() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const [isEraser, setIsEraser] = useState(false);
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);
let paths=[];
let undoPaths=[];
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.lineWidth = size;
    ctx.strokeStyle = color;

    // Set background to white
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctxRef.current = ctx;
  }, []);

  // Apply brush/eraser settings when changed
  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.strokeStyle = isEraser ? "#FFFFFF" : color;
      ctxRef.current.lineWidth = size;
    }
  }, [color, size, isEraser]);

  const startDrawing = (e) => {
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(e.clientX, e.clientY);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    ctxRef.current.lineTo(e.clientX, e.clientY);
    ctxRef.current.stroke();
  };

  const stopDrawing = () => {
    ctxRef.current.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;

    // Keep white background after clearing
    ctxRef.current.fillStyle = "white";
    ctxRef.current.fillRect(0, 0, canvas.width, canvas.height);
  };
  function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    paths.forEach(path => {
        ctx.strokeStyle = path.color;
        ctx.lineWidth = path.size;

        ctx.beginPath();
        ctx.moveTo(path.points[0].x, path.points[0].y);

        path.points.forEach(point => {
            ctx.lineTo(point.x, point.y);
        });

        ctx.stroke();
    });
}
// function redo(){
//   if(undoPaths.length>0){
//     const restored=undoPaths.pop();
//     paths.push(restored);
//     redraw();
//   }
// }
function undo(){
  if(paths.length>0){
    const removed=paths.pop();
    undoPaths.push(removed);
    redraw();
  }
}

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
            onChange={(e) => setColor(e.target.value)}
            disabled={isEraser}
          />
        </label>

        <label>
          Size:{" "}
          <input
            type="range"
            min="1"
            max="40"
            value={size}
            onChange={(e) => setSize(e.target.value)}
          />
        </label>

        <button
          onClick={() => setIsEraser(!isEraser)}
          style={{ padding: "6px 12px" }}
        >
          {isEraser ? "Switch to Brush" : "Use Eraser"}
        </button>

        <button onClick={clearCanvas}>Clear</button>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        style={{ display: "block", cursor: isEraser ? "cell" : "crosshair" }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      ></canvas>
    </>
  );
}
