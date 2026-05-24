import {
createDocument,
listDocuments,
updateDocument,
deleteDocument
}
from "../firebase/firestore";


const COLECAO="personagens";


export async function listarPersonagens(){

return await listDocuments(
COLECAO
);

}


export async function salvarPersonagem(
dados:any
){

return await createDocument(
COLECAO,
dados
);

}


export async function editarPersonagem(
id:string,
dados:any
){

return await updateDocument(
COLECAO,
id,
dados
);

}


export async function excluirPersonagem(
id:string
){

return await deleteDocument(
COLECAO,
id
);

}