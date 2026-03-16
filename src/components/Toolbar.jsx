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
            <optgroup label="Popular (Figma-like)">
              <option value="'Inter', sans-serif">Inter</option>
              <option value="'Roboto', sans-serif">Roboto</option>
              <option value="'Open Sans', sans-serif">Open Sans</option>
              <option value="'Lato', sans-serif">Lato</option>
              <option value="'Montserrat', sans-serif">Montserrat</option>
              <option value="'Poppins', sans-serif">Poppins</option>
              <option value="'Playfair Display', serif">Playfair Display</option>
              <option value="'Merriweather', serif">Merriweather</option>
              <option value="'Nunito', sans-serif">Nunito</option>
              <option value="'Raleway', sans-serif">Raleway</option>
              <option value="'Ubuntu', sans-serif">Ubuntu</option>
              <option value="'Roboto Mono', monospace">Roboto Mono</option>
            </optgroup>
            <optgroup label="System Fonts">
              <option value="Arial, sans-serif">Arial</option>
              <option value="'Courier New', Courier, monospace">Courier</option>
              <option value="'Times New Roman', Times, serif">Times New</option>
              <option value="'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif">Trebuchet</option>
              <option value="'Comic Sans MS', 'Comic Sans', cursive">Comic Sans</option>
            </optgroup>
          </select>
        )}
      </div>

      <div style={styles.group}>
        <IconButton title="Paint Bucket (f)" icon="paint-bucket.png" active={tool === "paint"} onClick={() => setTool("paint")} />
        <IconButton title="Brush (b)" icon="brush.png" active={tool === "brush"} onClick={() => setTool("brush")} />
        <IconButton title="Pencil (p)" icon="pencil.png" active={tool === "pencil"} onClick={() => setTool("pencil")} />
        <IconButton title="Eraser (e)" icon="eraser.png" active={tool === "eraser"} onClick={() => setTool("eraser")} />
        <IconButton title="Text (t)" icon="text.png" active={tool === "text"} onClick={() => setTool("text")} />
        <div style={{ width: 1, height: 24, background: "#ccc", margin: "0 4px" }} />
        <IconButton title="Rectangle (r)" icon="rect.png" active={tool === "rect"} onClick={() => setTool("rect")} />
        <IconButton title="Circle (c)" icon="circle.png" active={tool === "circle"} onClick={() => setTool("circle")} />
      </div>

      <div style={styles.group}>
        <button title="Undo (Ctrl+Z)" style={styles.actionBtn} onClick={undo}>Undo</button>
        <button title="Redo (Ctrl+Y)" style={styles.actionBtn} onClick={redo}>Redo</button>
        <button title="Clear Canvas" style={styles.actionBtn} onClick={clearCanvas}>Clear</button>
        <button title="Save Image" style={styles.actionBtn} onClick={saveImage}>Save</button>
      </div>
    </div>
  );
}

function IconButton({ icon, onClick, active, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        ...styles.iconBtn,
        ...(active ? styles.activeIcon : {}),
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = "#f0f0f0";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = "none";
      }}
    >
      <img src={icon} alt={title || ""} style={styles.iconImg} />
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
    padding: 8,
    borderRadius: 8,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  activeIcon: {
    border: "1px solid #4f46e5",
    background: "#eef2ff",
    boxShadow: "0 2px 4px rgba(79, 70, 229, 0.2)",
  },
  iconImg: {
    width: 26,
    height: 26,
  },
  actionBtn: {
    padding: "8px 16px",
    borderRadius: 8,
    border: "1px solid #ddd",
    background: "#fdfdfd",
    cursor: "pointer",
    fontWeight: "500",
    color: "#333",
    transition: "all 0.2s ease",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  },
  fontSelect: {
    padding: "4px 8px",
    borderRadius: 6,
    border: "1px solid #ccc",
    outline: "none",
    cursor: "pointer",
  }
};
