export default function Toolbar({
  tool,
  setTool,
  color,
  setColor,
  size,
  setSize,
  undo,
  redo,
  clearCanvas,
  saveImage,
}) {
  return (
    <div style={styles.toolbar}>
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

      <IconButton icon="paint.png" onClick={() => setTool("paint")} />
      <IconButton icon="brush.png" onClick={() => setTool("brush")} />
      <IconButton icon="pencil.png" onClick={() => setTool("pencil")} />
      <IconButton icon="eraser.png" onClick={() => setTool("eraser")} />
      <IconButton icon="text.png" onClick={() => setTool("text")}/>

      <button onClick={undo}>Undo</button>
      <button onClick={redo}>Redo</button>
      <button onClick={clearCanvas}>Clear</button>
      <button onClick={saveImage}>Save</button>
    </div>
  );
}

/* ✅ MISSING COMPONENT — NOW ADDED */
function IconButton({ icon, onClick }) {
  return (
    <button onClick={onClick} style={styles.iconBtn}>
      <img
        src={icon}
        alt=""
        style={{ width: 30, display: "block" }}
      />
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
    gap: 14,
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
    border: "none",
    padding: 4,
    cursor: "pointer",
  },
  iconImg: {
    width: 28,
    height: 28,
  },
  actionBtn: {
    padding: "6px 10px",
    borderRadius: 8,
    border: "1px solid #ddd",
    background: "#f9f9f9",
    cursor: "pointer",
  },
  textBtn: {
    padding: "6px 10px",
    borderRadius: 8,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
  },
};