import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";

function App() {
  return (
    <main className="min-h-screen bg-background text-primary p-6">
      <h1 className="text-2xl font-semibold">HalqaPay</h1>
      <p className="mt-2">Project scaffold is ready.</p>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
