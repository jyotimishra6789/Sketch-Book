import { useRef, useState, useEffect } from "react";

export default function SketchApp() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext("2d");
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctx.lineWidth = size;

    ctxRef.current = ctx;
  }, []);

  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.strokeStyle = color;
      ctxRef.current.lineWidth = size;
    }
  }, [color, size]);

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
    ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
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
        }}
      >
        <label>
          Brush Color:{" "}
          <input
            type="color"
            value={color}
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
            onChange={(e) => setSize(e.target.value)}
          />
        </label>

        <button onClick={clearCanvas}>Clear</button>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        style={{ display: "block" }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      ></canvas>
    </>
  );
}
