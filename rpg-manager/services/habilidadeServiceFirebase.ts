import {
collection,
addDoc,
getDocs,
updateDoc,
deleteDoc,
doc
}
from "firebase/firestore";

import {db}
from "../firebase/config";

const colecao=

collection(
db,
"habilidades");

export async function listarHabilidades(){

const snapshot=

await getDocs(
colecao
);

return snapshot.docs.map(
(item)=>({

id:item.id,

...item.data()

})
);

}

export async function salvarHabilidade(
dados:any
){

return await addDoc(
colecao,
dados
);

}

export async function editarHabilidade(
id:string,
dados:any
){

return await updateDoc(

doc(
db,
"habilidades",
id
),

dados

);

}

export async function excluirHabilidade(
id:string
){

return await deleteDoc(

doc(
db,
"habilidades",
id
)

);

}