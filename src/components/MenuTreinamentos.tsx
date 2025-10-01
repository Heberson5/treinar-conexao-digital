import React from "react";
import { useNavigate } from "react-router-dom";

export default function MenuTreinamentos() {
  const navigate = useNavigate();
  return (
    <div style={{ display: "flex", gap: 12 }}>
      <button
        id="btn-novo-treinamento"
        onClick={() => navigate("/gestao/treinamentos/novo")}
        style={{ padding: "10px 16px", borderRadius: 12, border: "1px solid #e5e7eb", background: "#111827", color: "white" }}
      >
        Novo Treinamento
      </button>
    </div>
  );
}
