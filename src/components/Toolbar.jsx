export default function Toolbar({
  tool,
  setTool,
  color,
  setColor,
  size,
  setSize,
  font,
  setFont,
  fillShape,
  setFillShape,
  undo,
  redo,
  clearCanvas,
  saveImage,
}) {
  return (
    <div style={styles.toolbar}>
      <div style={styles.group}>
        <input
          type="color"
          value={color}
          disabled={tool === "eraser"}
          onChange={(e) => setColor(e.target.value)}
        />
        <input
          type="range"
          min="1"
          max="40"
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
        />
        {(tool === "rect" || tool === "circle") && (
          <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14 }}>
            <input 
              type="checkbox" 
              checked={fillShape} 
              onChange={(e) => setFillShape(e.target.checked)} 
            />
            Fill
          </label>
        )}
        {tool === "text" && (
          <select 
            value={font} 
            onChange={(e) => setFont(e.target.value)}
            style={styles.fontSelect}
          >
            <option value="Arial">Arial</option>
            <option value="'Courier New', Courier, monospace">Courier</option>
            <option value="'Times New Roman', Times, serif">Times New</option>
            <option value="'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif">Trebuchet</option>
            <option value="'Comic Sans MS', 'Comic Sans', cursive">Comic Sans</option>
          </select>
        )}
      </div>

      <div style={styles.group}>
        <IconButton icon="paint-bucket.png" active={tool === "paint"} onClick={() => setTool("paint")} />
        <IconButton icon="brush.png" active={tool === "brush"} onClick={() => setTool("brush")} />
        <IconButton icon="pencil.png" active={tool === "pencil"} onClick={() => setTool("pencil")} />
        <IconButton icon="eraser.png" active={tool === "eraser"} onClick={() => setTool("eraser")} />
        <IconButton icon="text.png" active={tool === "text"} onClick={() => setTool("text")} />
        <div style={{ width: 1, height: 24, background: "#ccc", margin: "0 4px" }} />
        <IconButton icon="rect.png" active={tool === "rect"} onClick={() => setTool("rect")} />
        <IconButton icon="circle.png" active={tool === "circle"} onClick={() => setTool("circle")} />
      </div>

      <div style={styles.group}>
        <button style={styles.actionBtn} onClick={undo}>Undo</button>
        <button style={styles.actionBtn} onClick={redo}>Redo</button>
        <button style={styles.actionBtn} onClick={clearCanvas}>Clear</button>
        <button style={styles.actionBtn} onClick={saveImage}>Save</button>
      </div>
    </div>
  );
}

function IconButton({ icon, onClick, active }) {
  return (
    <button
      onClick={onClick}
      style={{
        ...styles.iconBtn,
        ...(active ? styles.activeIcon : {}),
      }}
    >
      <img src={icon} alt="" style={styles.iconImg} />
    </button>
  );
}

const styles = {
  toolbar: {
    position: "fixed",
    top: 20,
    left: 20,
    background: "#fff",
    padding: 14,
    borderRadius: 14,
    display: "flex",
    gap: 16,
    alignItems: "center",
    flexWrap: "wrap",
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
    zIndex: 10,
  },
  group: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },
  iconBtn: {
    background: "none",
    border: "1px solid transparent",
    padding: 6,
    borderRadius: 8,
    cursor: "pointer",
  },
  activeIcon: {
    border: "1px solid #4f46e5",
    background: "#eef2ff",
  },
  iconImg: {
    width: 26,
    height: 26,
  },
  actionBtn: {
    padding: "6px 12px",
    borderRadius: 8,
    border: "1px solid #ddd",
    background: "#f9f9f9",
    cursor: "pointer",
  },
  fontSelect: {
    padding: "4px 8px",
    borderRadius: 6,
    border: "1px solid #ccc",
    outline: "none",
    cursor: "pointer",
  }
};
