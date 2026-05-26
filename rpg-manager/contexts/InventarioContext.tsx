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
]=useState<any[]>([]);


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


function carregarInventario(

novoInventario:any[],

novosEquipados:any

){

setInventario(
novoInventario
);

setEquipados(
novosEquipados
);

}


return(

<InventarioContext.Provider

value={{

inventario,
setInventario,

equipados,
setEquipados,

carregarInventario

}}

>

{children}

<<<<<<< HEAD
</InventarioContext.Provider>

);

=======
          if (itemInfo.requisitos) {
            for (const [attr, req] of Object.entries(itemInfo.requisitos)) {
              if (attr in atributos && (atributos[attr as keyof Atributos] || 0) < Number(req || 0)) {
                alert(`${attr.toUpperCase()} insuficiente! Requer ${req}.`);
                return prev;
              }
            }
          }
        }

        // Desequipar itens do mesmo slot
        return prev.map((i) => {
          if (String(i.itemId) === String(itemId)) return { ...i, equipado: true };
          
          const otherItem = buscarItem(i.itemId);
          if (otherItem && otherItem.slot === itemInfo.slot && itemInfo.slot !== "acessorio" && itemInfo.slot !== "") {
            return { ...i, equipado: false };
          }
          return i;
        });
      }

      return prev.map((i) =>
        String(i.itemId) === String(itemId) ? { ...i, equipado: false } : i
      );
    });
  }, []);

  async function salvarMudancas(
    personagemId: number,
    currentInventario: InventarioItem[]
  ) {
    await atualizarPersonagem(personagemId, {
      inventario: currentInventario,
    });
  }

  return (
    <InventarioContext.Provider
      value={{
        inventario,
        setInventario,
        adicionarItem,
        removerItem,
        alterarQuantidade,
        alternarEquipamento,
        carregarInventario,
        salvarMudancas
      }}
    >
      {children}
    </InventarioContext.Provider>
  );
>>>>>>> cd62a35 (De novo)
}


export function useInventario(){

return useContext(
InventarioContext
);

}