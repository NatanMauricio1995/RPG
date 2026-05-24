"use client";

import Clima from "../Clima/Clima";
import { useAuth } from "../../contexts/AuthContext";
import Link from "next/link";

export default function Topo(){
  const { user, logout } = useAuth();

  return(

    <header className="topo">

      <Clima/>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '15px' }}>
        {user ? (
          <>
            <span style={{ color: 'var(--ouro-claro)', fontFamily: 'Cinzel, serif' }}>{user.email}</span>
            <button onClick={() => logout()} style={{ padding: '5px 10px', background: 'var(--sangue)', color: 'white', border: '1px solid var(--sangue-vivo)', borderRadius: '4px', cursor: 'pointer' }}>Sair</button>
          </>
        ) : (
          <Link href="/login">
            <button className="botaoAcao" style={{ padding: '8px 15px' }}>Entrar</button>
          </Link>
        )}
      </div>

    </header>

  );

}