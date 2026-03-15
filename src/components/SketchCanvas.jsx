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

  // ================= CANVAS INIT =================
  useEffect(() => {
    const canvas = canvasRef.current;

    const initCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const ctx = canvas.getContext("2d");
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctxRef.current = ctx;

      redraw();
    };

    initCanvas();
    window.addEventListener("resize", initCanvas);
    return () => window.removeEventListener("resize", initCanvas);
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
      
      if (item.tool === "pencil") {
        ctx.lineCap = "butt";
        ctx.lineJoin = "miter";
        ctx.lineWidth = 2; // Fixed pencil size
      } else {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.lineWidth = item.size;
      }

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
      setTextInput({ x, y, value: "" });
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

    const activeColor = tool === "eraser" ? "white" : color;

    pathsRef.current.push({
      type: "draw",
      tool: tool,
      color: activeColor,
      size,
      points: [{ x, y }],
    });

    ctx.strokeStyle = activeColor;
    if (tool === "pencil") {
      ctx.lineCap = "butt";
      ctx.lineJoin = "miter";
      ctx.lineWidth = 2;
    } else {
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = size;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const finalizeText = () => {
    if (!textInput || !textInput.value.trim()) {
      setTextInput(null);
      return;
    }

    const { x, y, value } = textInput;
    const fontSize = size * 4;
    const ctx = ctxRef.current;

    ctx.fillStyle = color;
    ctx.font = `${fontSize}px Arial`;
    ctx.fillText(value, x, y);

    pathsRef.current.push({
      type: "text",
      text: value,
      x,
      y,
      color,
      size: fontSize,
    });

    setTextInput(null);
    redraw();
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
    if (window.confirm("Are you sure you want to clear the entire canvas?")) {
      pathsRef.current = [];
      undoRef.current = [];
      redraw();
    }
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
          touchAction: "none",
          cursor: tool === "text" ? "text" : "crosshair",
        }}
        onMouseDown={(e) => startDrawing(e.clientX, e.clientY)}
        onMouseMove={(e) => draw(e.clientX, e.clientY)}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={(e) => startDrawing(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => draw(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={stopDrawing}
      />
      {textInput && (
        <input
          autoFocus
          value={textInput.value}
          onChange={(e) => setTextInput({ ...textInput, value: e.target.value })}
          onBlur={finalizeText}
          onKeyDown={(e) => {
            if (e.key === "Enter") finalizeText();
          }}
          style={{
            position: "absolute",
            left: textInput.x,
            top: textInput.y - size * 4,
            fontSize: size * 4,
            color: color,
            background: "transparent",
            border: "1px dashed #ccc",
            outline: "none",
            fontFamily: "Arial",
            margin: 0,
            padding: 0,
          }}
        />
      )}
    </div>
  );
}
