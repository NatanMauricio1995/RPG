"use client";

import{

createContext,
useContext,
useState

}

from "react";


const InventarioContext=

createContext<any>(
null
);


export function InventarioProvider({

children

}:{

children:React.ReactNode

}){

const[

inventario,
setInventario

]=useState(
[]
);


const[

equipados,
setEquipados

]=useState({

cabeca:null,

arma:null,

escudo:null,

armadura:null,

cintura:null,

acessorio:null,

bolsa:null

});


return(

<InventarioContext.Provider

value={{

inventario,
setInventario,

equipados,
setEquipados

}}

>

{children}

</InventarioContext.Provider>

);

}


export function useInventario(){

return useContext(
InventarioContext
);

}