# 🎨 React Sketch App

A simple and smooth drawing/sketching application built using **React**, **Canvas API**, and modern hooks like `useRef`, `useState`, and `useEffect`.

This project helps understand:
- Canvas drawing in React  
- Managing drawing state  
- Eraser logic  
- Undo & Redo implementation  
- Brush controls  
- Clean UI with dynamic cursor  

---

## 🚀 Features

### ✔ 1. Draw on Canvas
Use your mouse to draw freely.  
Brush is smooth with `lineCap = round`.

---

### ✔ 2. Brush Controls  
- **Color Picker** – Choose any color  
- **Brush Size Slider** – From 1px to 40px  
- Live updates using React state  

---

### ✔ 3. Eraser Tool  
Toggle between Brush and Eraser.

Eraser works by:
- Setting stroke color to **white**  
- Cursor changes to **cell** icon automatically  

---

### ✔ 4. Undo / Redo  
Each drawing stroke is stored as a **path object**.

- **Undo** removes last stroke  
- **Redo** restores the removed stroke  
- Canvas is completely redrawn from path history on every undo/redo 