"use client";
import { useEffect, useState } from "react";
import useCalendario from "../../hooks/useCalendario";
import { buscarDadosClima } from "../../services/climaService";

export default function Clima() {
  const [config, setConfig] = useState<any>(null);
  const [estacao, setEstacao] = useState("");
  const [clima, setClima] = useState("");
  const [intensidade, setIntensidade] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      const dados = await buscarDadosClima();
      if (dados) {
        setConfig(dados);
        setEstacao(dados.estacoes[0]);
        setClima(dados.climasPorEstacao[dados.estacoes[0]][0]);
        setIntensidade(dados.intensidades[0]);
      }
      setCarregando(false);
    }
    carregar();
  }, []);

  function alterarEstacao(novaEstacao: string) {
    setEstacao(novaEstacao);
    if (config?.climasPorEstacao[novaEstacao]) {
      setClima(config.climasPorEstacao[novaEstacao][0]);
    }
  }

  function gerarClima() {
    if (!config) return;
    const lista = config.climasPorEstacao[estacao];
    let novoClima = clima;
    while (novoClima === clima && lista.length > 1) {
      novoClima = lista[Math.floor(Math.random() * lista.length)];
    }
    const novaIntensidade = config.intensidades[Math.floor(Math.random() * config.intensidades.length)];
    setClima(novoClima);
    setIntensidade(novaIntensidade);
  }

  const { dados: dadosCalendario, avancarDia } = useCalendario();

  if (carregando) return <div>Observando os céus...</div>;
  if (!config) return <div>Configure o clima no painel do mestre.</div>;

return(

<>

<div>

Estação:

<select value={estacao} onChange={(e)=> alterarEstacao(e.target.value) }>

{config.estacoes.map((item: any)=>(

<option
key={item}
value={item}
>

{item}

</option>

))}

</select>

</div>


<div>

Clima:

<select
value={clima}
onChange={(e)=>
setClima(e.target.value)
}
>

{config.climasPorEstacao[estacao].map((item: any)=>(

<option
key={item}
value={item}
>

{item}

</option>

))}

</select>

</div>


<div>

Intensidade:

<select
value={intensidade}
onChange={(e)=>
setIntensidade(e.target.value)
}
>

{config.intensidades.map((item: any)=>(

<option
key={item}
value={item}
>

{item}

</option>

))}

</select>

</div>



<button onClick={gerarClima}>
🎲 Aleatório
</button>

<button

onClick={
avancarDia
}

>

➡️ Próximo dia

</button>
</>

);

}