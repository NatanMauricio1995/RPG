import {ref,uploadBytes,getDownloadURL} from "firebase/storage";
import {storage} from "../firebase/config";

export async function enviarImagem(
arquivo:File,
pasta:string
){

if(!arquivo)
return "";

const nome=

`${Date.now()}-${arquivo.name}`;

const referencia=

ref(
storage,
`${pasta}/${nome}`
);

await uploadBytes(
referencia,
arquivo);

const url=

await getDownloadURL(
referencia
);

return url;

}