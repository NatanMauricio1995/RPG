import {
createDocument,
listDocuments,
updateDocument,
deleteDocument
}
from "../firebase/firestore";


const COLECAO="npcs";


export async function listarNpcs(){

return await listDocuments(
COLECAO
);

}


export async function salvarNpc(
dados:any
){

return await createDocument(
COLECAO,
dados
);

}


export async function editarNpc(
id:string,
dados:any
){

return await updateDocument(
COLECAO,
id,
dados
);

}


export async function excluirNpc(
id:string
){

return await deleteDocument(
COLECAO,
id
);

}