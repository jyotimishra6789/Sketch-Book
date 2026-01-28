import { useRef, useState, useEffect } from "react";
import Toolbar from "./Toolbar";

export default function SketchCanvas() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [tool, setTool] = useState("brush");
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);

  const pathsRef = useRef([]);
  const undoRef = useRef([]);

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

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    pathsRef.current.forEach((item) => {
      // 🎨 fill
      if (item.type === "fill") {
        ctx.fillStyle = item.color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        return;
      }

      // ✏️ text
      if (item.type === "text") {
        ctx.fillStyle = item.color;
        ctx.font = `${item.size}px Arial`;
        ctx.fillText(item.text, item.x, item.y);
        return;
      }

      // 🖌 draw
      ctx.strokeStyle = item.color;
      ctx.lineWidth = item.size;

      ctx.beginPath();
      ctx.moveTo(item.points[0].x, item.points[0].y);
      item.points.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.stroke();
    });
  };

  // ================= DRAW =================
  const startDrawing = (x, y) => {
    const ctx = ctxRef.current;

    // ✏️ TEXT TOOL (SIMPLE)
    if (tool === "text") {
      const text = prompt("Enter text");
      if (!text) return;

      const fontSize = size * 4;

      ctx.fillStyle = color;
      ctx.font = `${fontSize}px Arial`;
      ctx.fillText(text, x, y);

      pathsRef.current.push({
        type: "text",
        text,
        x,
        y,
        color,
        size: fontSize,
      });

      redraw();
      return;
    }

    // 🪣 PAINT
    if (tool === "paint") {
      ctx.fillStyle = color;
      ctx.fillRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );

      pathsRef.current.push({
        type: "fill",
        color,
      });

      redraw();
      return;
    }

    // 🖌 DRAW
    setIsDrawing(true);

    pathsRef.current.push({
      type: "draw",
      color,
      size,
      points: [{ x, y }],
    });

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (x, y) => {
    if (!isDrawing || tool === "text") return;

    const path = pathsRef.current.at(-1);
    path.points.push({ x, y });

    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    redraw();
  };

  // ================= UNDO / REDO =================
  const undo = () => {
    if (!pathsRef.current.length) return;
    undoRef.current.push(pathsRef.current.pop());
    redraw();
  };

  const redo = () => {
    if (!undoRef.current.length) return;
    pathsRef.current.push(undoRef.current.pop());
    redraw();
  };

  // ================= CLEAR =================
  const clearCanvas = () => {
    pathsRef.current = [];
    undoRef.current = [];
    redraw();
  };

  // ================= SAVE =================
  const saveImage = () => {
    const link = document.createElement("a");
    link.href = canvasRef.current.toDataURL("image/png");
    link.download = "sketch.png";
    link.click();
  };

  return (
    <div>
      <Toolbar
        tool={tool}
        setTool={setTool}
        color={color}
        setColor={setColor}
        size={size}
        setSize={setSize}
        undo={undo}
        redo={redo}
        clearCanvas={clearCanvas}
        saveImage={saveImage}
      />

      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          cursor: tool === "text" ? "text" : "crosshair",
        }}
        onMouseDown={(e) => startDrawing(e.clientX, e.clientY)}
        onMouseMove={(e) => draw(e.clientX, e.clientY)}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    </div>
  );
}
