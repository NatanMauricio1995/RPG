import { db } from "../firebase/config";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

import classes from "../data/sistema/classes.json";
import racas from "../data/sistema/racas.json";
import niveis from "../data/sistema/niveis.json";
import itens from "../data/sistema/itens.json";
import armas from "../data/sistema/armas.json";
import armaduras from "../data/sistema/armaduras.json";
import acessorios from "../data/sistema/acessorios.json";
import consumiveis from "../data/sistema/consumiveis.json";
import monstros from "../data/sistema/monstros.json";
import tiposMonstros from "../data/sistema/tiposMonstros.json";

export async function seedDatabase() {
  const seedIfEmpty = async (collectionName: string, data: any[]) => {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      console.log(`Seeding ${collectionName}...`);
      for (const item of data) {
        await addDoc(colRef, {
          ...item,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }
  };

  await seedIfEmpty("classes", classes);
  await seedIfEmpty("racas", racas);
  await seedIfEmpty("niveis", niveis);
  
  const allItens = [
    ...itens,
    ...armas,
    ...armaduras,
    ...acessorios,
    ...consumiveis
  ];
  await seedIfEmpty("itens", allItens);
  
  await seedIfEmpty("monstros", monstros);
  await seedIfEmpty("tiposMonstros", tiposMonstros);
  
  console.log("Database seeded successfully!");
}
