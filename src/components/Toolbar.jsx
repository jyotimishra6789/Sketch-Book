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
      {/* Color & Size */}
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
      </div>

      {/* Tools */}
      <div style={styles.group}>
        <IconButton icon="paint-bucket.png" active={tool === "paint"} onClick={() => setTool("paint")} />
        <IconButton icon="brush.png" active={tool === "brush"} onClick={() => setTool("brush")} />
        <IconButton icon="pencil.png" active={tool === "pencil"} onClick={() => setTool("pencil")} />
        <IconButton icon="eraser.png" active={tool === "eraser"} onClick={() => setTool("eraser")} />
        <IconButton icon="text.png" active={tool === "text"} onClick={() => setTool("text")} />
      </div>

      {/* Actions */}
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
    display: "block",
  },

  actionBtn: {
    padding: "6px 12px",
    borderRadius: 8,
    border: "1px solid #ddd",
    background: "#f9f9f9",
    cursor: "pointer",
  },
};
