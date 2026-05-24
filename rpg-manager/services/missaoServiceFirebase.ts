import {
createDocument,
listDocuments,
updateDocument,
deleteDocument
}
from "../firebase/firestore";


const COLECAO="missao";


export async function listarMissoes(){

return await listDocuments(
COLECAO
);

}


export async function salvarMissao(
dados:any
){

return await createDocument(
COLECAO,
dados
);

}


export async function editarMissao(
id:string,
dados:any
){

return await updateDocument(
COLECAO,
id,
dados
);

}


export async function excluirMissao(
id:string
){

return await deleteDocument(
COLECAO,
id
);

}