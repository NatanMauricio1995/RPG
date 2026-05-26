"use client";

import FormularioHabilidade from "../../../components/Habilidades/FormularioHabilidade";
import "../../../styles/habilidades.css";

export default function PaginaEditarHabilidade() {
  return (
    <main className="container">
      <FormularioHabilidade modoEdicao={true} />
    </main>
  );
}
