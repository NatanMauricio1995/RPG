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
"classes");

export async function listarClasses(){

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

export async function salvarClasse(
dados:any
){

return await addDoc(
colecao,
dados
);

}

export async function editarClasse(
id:string,
dados:any
){

return await updateDoc(

doc(
db,
"classes",
id
),

dados

);

}

export async function excluirClasse(
id:string
){

return await deleteDoc(

doc(
db,
"classes",
id
)

);

}