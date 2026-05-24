import {calcularBonusEquipados} from "../services/efeitosService";
import {resolverEquipados} from "../services/itemService";

export default function useEquipamento(
equipados:any
){

const equipamentosResolvidos=
resolverEquipados(equipados || {});

const bonusCalculado=
calcularBonusEquipados(equipamentosResolvidos);

function bonus(
atributo:string
){

return bonusCalculado[atributo] || 0;

}

return{

bonus,
bonusCalculado,
equipamentosResolvidos

};

}
