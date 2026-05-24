import {
createDocument,
listDocuments,
updateDocument,
deleteDocument
}
from "../firebase/firestore";


const COLECAO="itens";


export async function listarItens(){

return await listDocuments(
COLECAO
);

}


export async function salvarItem(
dados:any
){

return await createDocument(
COLECAO,
dados
);

}


export async function editarItem(
id:string,
dados:any
){

return await updateDocument(
COLECAO,
id,
dados
);

}


export async function excluirItem(
id:string
){

return await deleteDocument(
COLECAO,
id
);

}