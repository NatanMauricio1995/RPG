"use client";

import { useState } from "react";
import itens from "../data/itens.json";

export default function useInventario(){

const [inventario,setInventario]=
useState(itens);

const [equipados,setEquipados]=
useState({

arma:null,
armadura:null,
acessorio:null,
municao:null

});

return{

inventario,
setInventario,

equipados,
setEquipados

};

}