"use client";

import { useState } from "react";
import { useCalendario } from "../../contexts/CalendarioContext";
import dadosClima from "../../data/sistema/clima.json";

const climasPorEstacao = dadosClima.climasPorEstacao as Record<string, string[]>;

export default function Clima() {
  const { avancarDia } = useCalendario();

  const [estacao,     setEstacao]     = useState("☀️ Verão");
  const [clima,       setClima]       = useState("☀️ Sol");
  const [intensidade, setIntensidade] = useState("🟡 Moderado");

  function alterarEstacao(novaEstacao: string) {
    setEstacao(novaEstacao);
    setClima(climasPorEstacao[novaEstacao][0]);
  }

  function gerarClima() {
    const lista = climasPorEstacao[estacao];
    let novoClima = clima;
    while (novoClima === clima) {
      novoClima = lista[Math.floor(Math.random() * lista.length)];
    }
    const novaIntensidade =
      dadosClima.intensidades[Math.floor(Math.random() * dadosClima.intensidades.length)];
    setClima(novoClima);
    setIntensidade(novaIntensidade);
  }

  return (
    <>
      <div>
        Estação:
        <select value={estacao} onChange={(e) => alterarEstacao(e.target.value)}>
          {dadosClima.estacoes.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

      <div>
        Clima:
        <select value={clima} onChange={(e) => setClima(e.target.value)}>
          {climasPorEstacao[estacao].map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

      <div>
        Intensidade:
        <select value={intensidade} onChange={(e) => setIntensidade(e.target.value)}>
          {dadosClima.intensidades.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

      <button onClick={gerarClima}>🎲 Aleatório</button>
      <button onClick={avancarDia}>➡️ Próximo dia</button>
    </>
  );
}
