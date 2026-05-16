export default function useEquipamento(
equipados:any
){

function bonus(
atributo:string
){

let total=0;

Object.values(
equipados
).forEach(
(item:any)=>{

if(
item?.bonus?.[
atributo
]
){

total+=
item.bonus[
atributo
];

}

}
);

return total;

}

return{

bonus

};

}