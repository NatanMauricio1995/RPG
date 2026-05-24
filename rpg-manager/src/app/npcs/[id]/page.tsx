"use client";

import {useParams} from "next/navigation";
import FichaNPC from "../../../components/NPCs/FichaNPC";
import {buscarNPC} from "../../../services/npcService";

export default function FichaNPCPage(){

const params=useParams();
const npc=buscarNPC(Number(params.id));

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
