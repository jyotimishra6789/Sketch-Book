import { useRef, useState, useEffect } from "react";
import Toolbar from "./Toolbar";

export default function SketchCanvas() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [tool, setTool] = useState("brush");
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);
  const [textInput, setTextInput] = useState(null);

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

      if (item.type === "text") {
        ctx.fillStyle = item.color;
        ctx.font = `${item.size}px Arial`;
        item.text.split("\n").forEach((line, i) => {
          ctx.fillText(line, item.x, item.y + i * item.size * 1.2);
        });
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

  const startDrawing = (x, y) => {
    if (tool === "text") {
      setTextInput({ x, y });
      return;
    }

    if (tool === "paint") {
      ctxRef.current.fillStyle = color;
      ctxRef.current.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      pathsRef.current.push({ type: "fill", color });
      saveToLocalStorage();
      return;
    }

    setIsDrawing(true);
    currentPath.current = {
      type: "draw",
      tool,
      color: tool === "eraser" ? "#fff" : color,
      size,
      points: [{ x, y }],
    };

    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);
  };

  const draw = (x, y) => {
    if (!isDrawing || textInput) return;
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

  const commitText = (value) => {
    if (!value.trim()) {
      setTextInput(null);
      return;
    }

    const fontSize = size * 4;
    pathsRef.current.push({
      type: "text",
      text: value,
      x: textInput.x,
      y: textInput.y,
      color,
      size: fontSize,
    });

    redraw();
    setTextInput(null);
    saveToLocalStorage();
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
        undo={() => {
          if (!pathsRef.current.length) return;
          undoRef.current.push(pathsRef.current.pop());
          redraw();
        }}
        redo={() => {
          if (!undoRef.current.length) return;
          pathsRef.current.push(undoRef.current.pop());
          redraw();
        }}
        clearCanvas={() => {
          ctxRef.current.fillStyle = "white";
          ctxRef.current.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          pathsRef.current = [];
          undoRef.current = [];
          saveToLocalStorage();
        }}
        saveImage={() => {
          const link = document.createElement("a");
          link.href = canvasRef.current.toDataURL("image/png");
          link.download = "sketch.png";
          link.click();
        }}
      />

      {/* ✨ TRUE FIGMA-STYLE TEXTAREA */}
      {textInput && (
        <textarea
          autoFocus
          rows={1}
          onBlur={(e) => commitText(e.target.value)}
          onInput={(e) => {
            e.target.style.height = "auto";
            e.target.style.height = e.target.scrollHeight + "px";
          }}
          style={{
            position: "absolute",
            left: textInput.x,
            top: textInput.y,
            fontSize: size * 4,
            fontFamily: "Arial",
            color,
            background: "transparent",
            border: "none",
            outline: "none",
            resize: "none",
            padding: 0,
            lineHeight: "1.2",
            caretColor: color,
            whiteSpace: "pre-wrap",
            overflow: "hidden",
          }}
        />
      )}

      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          cursor: tool === "text" ? "text" : "crosshair",
          touchAction: "none",
        }}
        onMouseDown={(e) => startDrawing(e.clientX, e.clientY)}
        onMouseMove={(e) => draw(e.clientX, e.clientY)}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    </div>
  );
}
