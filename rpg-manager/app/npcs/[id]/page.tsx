"use client";

import {useParams} from "next/navigation";
import {useEffect, useState} from "react";
import FichaNPC from "../../../components/NPCs/FichaNPC";
import {buscarNPC, NPC} from "../../../services/npcService";

export default function FichaNPCPage(){

const params=useParams();
const id = params?.id ? String(params.id) : "";
const [npc, setNpc] = useState<NPC | null>(null);
const [carregando, setCarregando] = useState(true);

useEffect(() => {
  if (id) {
    buscarNPC(id).then(dados => {
      setNpc(dados || null);
      setCarregando(false);
    });
  }
}, [id]);

if (carregando) return <div>Carregando NPC...</div>;

if(!npc){
return(
<div>
<h1>NPC não encontrado</h1>
</div>
);
}

return(
<FichaNPC npc={npc}/>
);

}
