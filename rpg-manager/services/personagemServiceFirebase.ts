import {
collection,
addDoc,
getDocs,
updateDoc,
deleteDoc,
doc
}
from "firebase/firestore";

import {db} from "../firebase/config";

const colecao=

collection(
db,
"personagens"
);


export async function listarPersonagens(){

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


export async function salvarPersonagem(
personagem:any
){

return await addDoc(
colecao,
personagem
);

}


export async function editarPersonagem(
id:string,
dados:any
){

return await updateDoc(

doc(
db,
"personagens",
id
),

dados

);

}


export async function excluirPersonagem(
id:string
){

return await deleteDoc(

doc(
db,
"personagens",
id
)

);

}