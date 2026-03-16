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

  // Instead of baking text into the canvas immediately,
  // we'll keep interactive text elements in a separate state.
  const [texts, setTexts] = useState([]);
  const [textInput, setTextInput] = useState(null);
  const [selectedTextId, setSelectedTextId] = useState(null);
  const [draggingText, setDraggingText] = useState(null);
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isHoveringCanvas, setIsHoveringCanvas] = useState(false);

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

      // ✏️ text (legacy support for already drawn text)
      if (item.type === "text") {
        ctx.fillStyle = item.color;
        ctx.textBaseline = "top";
        ctx.font = `${item.size}px ${item.font || "Arial"}`;
        
        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate((item.rotation || 0) * Math.PI / 180);
        ctx.fillText(item.text, 0, 0);
        ctx.restore();
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
    
    // Deselect text if clicking outside of a selected text area
    if (selectedTextId && tool !== "text") {
      setSelectedTextId(null);
    }

    // ✏️ TEXT TOOL (Create new interactive text)
    if (tool === "text") {
      setTimeout(() => {
        setTextInput({ 
          id: Date.now(), 
          x, 
          y, 
          value: "", 
          color, 
          font, 
          size: size * 4,
          rotation: 0
        });
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

  const handleTextInteraction = (e, textId, type) => {
    e.stopPropagation();
    if (tool !== "text") return;

    if (type === "drag") {
      setSelectedTextId(textId);
      setDraggingText({ id: textId, startX: e.clientX, startY: e.clientY, type: "move" });
    } else if (type === "rotate") {
      setSelectedTextId(textId);
      
      const txt = texts.find(t => t.id === textId);
      const rect = e.target.closest("div").getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      setDraggingText({ id: textId, centerX, centerY, type: "rotate", initialRotation: txt.rotation });
    } else if (type === "edit") {
      const txtToEdit = texts.find(t => t.id === textId);
      if (txtToEdit) {
        setTextInput({ 
          id: txtToEdit.id, 
          x: txtToEdit.x, 
          y: txtToEdit.y, 
          value: txtToEdit.text, 
          color: txtToEdit.color, 
          font: txtToEdit.font, 
          size: txtToEdit.size,
          rotation: txtToEdit.rotation 
        });
        
        // Remove from rendered texts while editing
        setTexts(prev => prev.filter(t => t.id !== textId));
      }
    }
  };

  const handleGlobalMouseMove = (e) => {
    if (!draggingText) return;

    if (draggingText.type === "move") {
      const dx = e.clientX - draggingText.startX;
      const dy = e.clientY - draggingText.startY;

      setTexts(prev => prev.map(t => 
        t.id === draggingText.id ? { ...t, x: t.x + dx, y: t.y + dy } : t
      ));

      setDraggingText(prev => ({ ...prev, startX: e.clientX, startY: e.clientY }));
    } else if (draggingText.type === "rotate") {
      const { centerX, centerY, initialRotation } = draggingText;
      
      // Calculate angle
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
      let degrees = (angle * 180 / Math.PI) + 90; // +90 because rotation handle is usually at top
      
      setTexts(prev => prev.map(t => 
        t.id === draggingText.id ? { ...t, rotation: degrees } : t
      ));
    }
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

  const handleGlobalMouseUp = () => {
    setDraggingText(null);
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [draggingText]);

  // ================= KEYBOARD SHORTCUTS =================
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts if user is typing in the text input
      if (e.target.tagName.toLowerCase() === 'input' && e.target.type === 'text') {
        return;
      }

      // Undo / Redo
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          undo();
        } else if (e.key === 'y') {
          e.preventDefault();
          redo();
        }
        return;
      }

      // Tool Switching
      switch (e.key.toLowerCase()) {
        case 'b': setTool('brush'); break;
        case 'p': setTool('pencil'); break;
        case 'e': setTool('eraser'); break;
        case 't': setTool('text'); break;
        case 'r': setTool('rect'); break;
        case 'c': setTool('circle'); break;
        case 'f': setTool('paint'); break;
        default: break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const finalizeText = () => {
    if (!textInput || !textInput.value.trim()) {
      setTextInput(null);
      return;
    }

    const { id, x, y, value, color: txtColor, font: txtFont, size: txtSize, rotation } = textInput;

    // We no longer push text directly to pathsRef immediately.
    // Instead we add it to the interactive `texts` array.
    setTexts(prev => [
      ...prev,
      {
        id,
        text: value,
        x,
        y,
        color: txtColor,
        size: txtSize,
        font: txtFont,
        rotation: rotation || 0,
      }
    ]);

    setSelectedTextId(id);
    setTextInput(null);
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

  // ================= CLEAR =================
  const clearCanvas = () => {
    if (window.confirm("Are you sure you want to clear the entire canvas?")) {
      pathsRef.current = [];
      undoRef.current = [];
      setTexts([]);
      redraw();
    }
  };

  // ================= SAVE =================
  const saveImage = () => {
    // Before saving, we need to draw all interactive texts onto the canvas temporarily
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    
    ctx.save();
    texts.forEach(txt => {
      ctx.fillStyle = txt.color;
      ctx.textBaseline = "top";
      ctx.font = `${txt.size}px ${txt.font}`;
      
      ctx.translate(txt.x, txt.y);
      ctx.rotate((txt.rotation || 0) * Math.PI / 180);
      ctx.fillText(txt.text, 0, 0);
      ctx.rotate(-(txt.rotation || 0) * Math.PI / 180);
      ctx.translate(-txt.x, -txt.y);
    });
    ctx.restore();

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "sketch.png";
    link.click();
    
    // Redraw to remove texts from canvas (since they are DOM elements)
    redraw();
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

        {/* Dynamic Cursor */}
        {isHoveringCanvas && (tool === "brush" || tool === "eraser" || tool === "pencil") && (
          <div
            style={{
              position: "absolute",
              left: mousePos.x,
              top: mousePos.y,
              width: tool === "pencil" ? 2 : size,
              height: tool === "pencil" ? 2 : size,
              borderRadius: "50%",
              border: "1px solid rgba(0,0,0,0.5)",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
              zIndex: 9999,
            }}
          />
        )}

        <canvas
          ref={canvasRef}
          style={{
            display: "block",
            touchAction: "none",
            cursor: (tool === "brush" || tool === "eraser" || tool === "pencil") ? "none" : (tool === "text" ? "text" : "crosshair"),
          }}
          onMouseDown={(e) => startDrawing(e.clientX, e.clientY)}
          onMouseMove={(e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
            draw(e.clientX, e.clientY);
          }}
          onMouseEnter={() => setIsHoveringCanvas(true)}
          onMouseUp={stopDrawing}
          onMouseLeave={() => {
            setIsHoveringCanvas(false);
            stopDrawing();
          }}
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
            fontSize: textInput.size,
            color: textInput.color,
            background: "transparent",
            border: "1px dashed #ccc",
            outline: "none",
            fontFamily: textInput.font,
            margin: 0,
            padding: 0,
            lineHeight: 1,
            transform: `rotate(${textInput.rotation}deg)`,
            transformOrigin: "center center",
          }}
        />
      )}

      {texts.map((txt) => {
        const isSelected = selectedTextId === txt.id && tool === "text";
        return (
          <div
            key={txt.id}
            onMouseDown={(e) => handleTextInteraction(e, txt.id, "drag")}
            onDoubleClick={(e) => handleTextInteraction(e, txt.id, "edit")}
            style={{
              position: "absolute",
              left: txt.x,
              top: txt.y,
              fontSize: txt.size,
              color: txt.color,
              fontFamily: txt.font,
              lineHeight: 1,
              whiteSpace: "pre",
              cursor: tool === "text" ? "move" : "default",
              pointerEvents: tool === "text" ? "auto" : "none",
              userSelect: "none",
              transform: `rotate(${txt.rotation || 0}deg)`,
              transformOrigin: "center center",
              border: isSelected ? "1px dashed #4f46e5" : "none",
              padding: "2px",
            }}
          >
            {txt.text}

            {isSelected && (
              <div
                onMouseDown={(e) => handleTextInteraction(e, txt.id, "rotate")}
                style={{
                  position: "absolute",
                  top: -24,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 12,
                  height: 12,
                  background: "#4f46e5",
                  borderRadius: "50%",
                  cursor: "crosshair",
                }}
              />
            )}
            {isSelected && (
              <div
                style={{
                  position: "absolute",
                  top: -12,
                  left: "50%",
                  width: 1,
                  height: 12,
                  background: "#4f46e5",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
