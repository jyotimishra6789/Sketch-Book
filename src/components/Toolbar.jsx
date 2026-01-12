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

      <button onClick={() => setTool("paint")}>Paint</button>
      <button onClick={() => setTool("brush")}>Brush</button>
      <button onClick={() => setTool("pencil")}>Pencil</button>
      <button onClick={() => setTool("eraser")}>Eraser</button>
      <button onClick={() => setTool("text")}>Text</button>

      <button onClick={undo}>Undo</button>
      <button onClick={redo}>Redo</button>
      <button onClick={clearCanvas}>Clear</button>
      <button onClick={saveImage}>Save</button>
    </div>
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
    gap: 8,
    flexWrap: "wrap",
    boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
    zIndex: 10,
  },
};
