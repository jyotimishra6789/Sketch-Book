import React, { Suspense, useState, useEffect } from "react";

const MainApp = React.lazy(() => import("./components/SketchApp"));

export default function App() {
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => clearTimeout(timer); // ✅ cleanup
  }, []);

  
  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "#ffffff",
        }}
      >
        <img
          src="/loader.gif"
          alt="loading animation"
          style={{ width: "120px", marginBottom: "15px" }}
        />
        <p style={{ fontSize: "20px", fontWeight: "600" }}>Loading...</p>
      </div>
    );
  }

  return (
    <Suspense fallback={<h2>Loading components...</h2>}>
      <MainApp />
    </Suspense>
  );
}
