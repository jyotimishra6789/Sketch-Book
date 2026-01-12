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

    if (tool === "eraser") {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = size * 1.2;
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = tool === "pencil" ? size * 0.6 : size;
    }
  }, [tool, color, size]);

  const startDrawing = (x, y) => {
    if (tool === "paint") {
      ctxRef.current.fillStyle = color;
      ctxRef.current.fillRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
      pathsRef.current.push({ type: "fill", color });
      saveToLocalStorage();
      return;
    }

    setIsDrawing(true);
    currentPath.current = {
      type: "draw",
      tool,
      color: tool === "eraser" ? "#ffffff" : color,
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
  };

  const redo = () => {
    if (!undoRef.current.length) return;
    pathsRef.current.push(undoRef.current.pop());
    redraw();
  };

  const clearCanvas = () => {
    ctxRef.current.fillStyle = "white";
    ctxRef.current.fillRect(
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );
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
    <>
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
        style={{ display: "block", touchAction: "none" }}
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
    </>
  );
}
