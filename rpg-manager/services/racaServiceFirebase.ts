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
"racas"
);


export async function listarRacas(){

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


export async function salvarRaca(
dados:any
){

return await addDoc(
colecao,
dados
);

}


export async function editarRaca(
id:string,
dados:any
){

return await updateDoc(

doc(
db,
"racas",
id
),

dados

);

}


export async function excluirRaca(
id:string
){

return await deleteDoc(

doc(
db,
"racas",
id
)

);

}