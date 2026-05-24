export function calcularAtributoFinal(

base:number,
bonus:number

){

return(

base+bonus

);

}

export function calcularModificador(
atributo:number
){

return Math.floor(
(atributo-10)/2
);

}


export function calcularVida(

vidaBase:number,

constituicao:number,

nivel:number

){

return(

vidaBase+

(

calcularModificador(
constituicao
)

*

nivel

)

);

}


export function calcularBonusProficiencia(
nivel:number
){

if(
nivel<=4
)return 2;

if(
nivel<=8
)return 3;

if(
nivel<=12
)return 4;

if(
nivel<=16
)return 5;

return 6;

}