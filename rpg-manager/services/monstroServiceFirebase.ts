import {
createDocument,
listDocuments,
updateDocument,
deleteDocument
}
from "../firebase/firestore";
import { limit } from "firebase/firestore";


const COLECAO="monstros";


export async function listarMonstros(){

return await listDocuments(COLECAO, [limit(50)]);

}


export async function salvarMonstro(
dados:any
){

return await createDocument(
COLECAO,
dados
);

}


export async function editarMonstro(
id:string,
dados:any
){

return await updateDocument(
COLECAO,
id,
dados
);

}


export async function excluirMonstro(
id:string
){

return await deleteDocument(
COLECAO,
id
);

}