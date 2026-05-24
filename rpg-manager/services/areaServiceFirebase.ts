import {
createDocument,
listDocuments,
updateDocument,
deleteDocument
}
from "../firebase/firestore";


const COLECAO="areas";


export async function listarAreas(){

return await listDocuments(
COLECAO
);

}


export async function salvarArea(
dados:any
){

return await createDocument(
COLECAO,
dados
);

}


export async function editarArea(
id:string,
dados:any
){

return await updateDocument(
COLECAO,
id,
dados
);

}


export async function excluirArea(
id:string
){

return await deleteDocument(
COLECAO,
id
);

}