import { useRef, useState, useEffect } from "react";
import Toolbar from "./Toolbar";

const floodFill = (ctx, startX, startY, fillColorHex) => {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  const visited = new Uint8Array(w * h);
  
  let x = Math.floor(startX);
  let y = Math.floor(startY);
  if (x < 0 || y < 0 || x >= w || y >= h) return;
  
  const startPos = (y * w + x) * 4;
  const startR = data[startPos];
  const startG = data[startPos + 1];
  const startB = data[startPos + 2];
  const startA = data[startPos + 3];
  
  const r = parseInt(fillColorHex.slice(1, 3), 16) || 0;
  const g = parseInt(fillColorHex.slice(3, 5), 16) || 0;
  const b = parseInt(fillColorHex.slice(5, 7), 16) || 0;
  const a = 255;
  
  const tolerance = 64;
  const matchStartColor = (pos) => {
    return Math.abs(data[pos] - startR) <= tolerance &&
           Math.abs(data[pos + 1] - startG) <= tolerance &&
           Math.abs(data[pos + 2] - startB) <= tolerance &&
           Math.abs(data[pos + 3] - startA) <= tolerance;
  };
  
  const stack = [x, y];
  
  while (stack.length > 0) {
    let cy = stack.pop();
    let cx = stack.pop();
    
    let pixelIdx = cy * w + cx;
    let pos = pixelIdx * 4;
    
    while (cx >= 0 && matchStartColor(pos) && !visited[pixelIdx]) {
      cx--;
      pos -= 4;
      pixelIdx--;
    }
    cx++;
    pos += 4;
    pixelIdx++;
    
    let reachUp = false;
    let reachDown = false;
    
    while (cx < w && matchStartColor(pos) && !visited[pixelIdx]) {
      data[pos] = r;
      data[pos + 1] = g;
      data[pos + 2] = b;
      data[pos + 3] = a;
      visited[pixelIdx] = 1;
      
      if (cy > 0) {
        if (matchStartColor(pos - w * 4) && !visited[pixelIdx - w]) {
          if (!reachUp) {
            stack.push(cx, cy - 1);
            reachUp = true;
          }
        } else if (reachUp) {
          reachUp = false;
        }
      }
      
      if (cy < h - 1) {
        if (matchStartColor(pos + w * 4) && !visited[pixelIdx + w]) {
          if (!reachDown) {
            stack.push(cx, cy + 1);
            reachDown = true;
          }
        } else if (reachDown) {
          reachDown = false;
        }
      }
      
      cx++;
      pos += 4;
      pixelIdx++;
    }
  }
  
  ctx.putImageData(imgData, 0, 0);
};

export default function SketchCanvas() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [tool, setTool] = useState("brush");
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(5);
  const [font, setFont] = useState("Arial");
  const [fillShape, setFillShape] = useState(false);
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
        if (item.x !== undefined && item.y !== undefined) {
          floodFill(ctx, item.x, item.y, item.color);
        } else {
          ctx.fillStyle = item.color;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        return;
      }

      // ✏️ text
      if (item.type === "text") {
        ctx.fillStyle = item.color;
        ctx.textBaseline = "top";
        ctx.font = `${item.size}px ${item.font || "Arial"}`;
        ctx.fillText(item.text, item.x, item.y);
        return;
      }

      // 🟥 shape (rect/circle)
      if (item.type === "shape") {
        ctx.beginPath();
        if (item.shape === "rect") {
          ctx.rect(item.x, item.y, item.w, item.h);
        } else if (item.shape === "circle") {
          ctx.arc(item.x, item.y, item.r, 0, 2 * Math.PI);
        }
        
        if (item.fillShape) {
          ctx.fillStyle = item.color;
          ctx.fill();
        } else {
          ctx.strokeStyle = item.color;
          ctx.lineWidth = item.size;
          ctx.stroke();
        }
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
      setTimeout(() => {
        setTextInput({ x, y, value: "" });
      }, 50);
      return;
    }

    // 🪣 PAINT
    if (tool === "paint") {
      pathsRef.current.push({
        type: "fill",
        x,
        y,
        color,
      });

      redraw();
      return;
    }

    // 🖌 DRAW OR SHAPE
    setIsDrawing(true);

    const activeColor = tool === "eraser" ? "white" : color;

    // For shapes, we record the starting point
    if (tool === "rect" || tool === "circle") {
      pathsRef.current.push({
        type: "shape",
        shape: tool,
        color: activeColor,
        size,
        fillShape,
        x,
        y,
        w: 0,
        h: 0,
        r: 0,
      });
      return;
    }

    // Standard drawing
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
    ctx.textBaseline = "top";
    ctx.font = `${fontSize}px ${font}`;
    ctx.fillText(value, x, y);

    pathsRef.current.push({
      type: "text",
      text: value,
      x,
      y,
      color,
      size: fontSize,
      font,
    });

    setTextInput(null);
    redraw();
  };

  const draw = (x, y) => {
    if (!isDrawing || tool === "text") return;

    const path = pathsRef.current.at(-1);

    // Live preview for shapes
    if (path.type === "shape") {
      if (tool === "rect") {
        path.w = x - path.x;
        path.h = y - path.y;
      } else if (tool === "circle") {
        path.r = Math.sqrt(Math.pow(x - path.x, 2) + Math.pow(y - path.y, 2));
      }
      redraw();
      return;
    }

    // Standard draw
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
        font={font}
        setFont={setFont}
        fillShape={fillShape}
        setFillShape={setFillShape}
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
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            left: textInput.x,
            top: textInput.y,
            fontSize: size * 4,
            color: color,
            background: "transparent",
            border: "1px dashed #ccc",
            outline: "none",
            fontFamily: font,
            margin: 0,
            padding: 0,
            lineHeight: 1,
          }}
        />
      )}
    </div>
  );
}
