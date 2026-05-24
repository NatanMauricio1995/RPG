"use client";

import { useState } from "react";
import { login, register } from "../../firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (isRegistering) {
        await register(email, password);
      } else {
        await login(email, password);
      }
      router.push("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container" style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', background: 'var(--pedra-media)', border: '1px solid var(--ouro-escuro)', borderRadius: '8px' }}>
      <h1 style={{ textAlign: 'center' }}>{isRegistering ? "✦ Criar Conta ✦" : "✦ Entrar ✦"}</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '10px', background: 'var(--pedra-clara)', border: '1px solid var(--pedra-borda)', color: 'var(--texto)', borderRadius: '4px' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label>Senha</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '10px', background: 'var(--pedra-clara)', border: '1px solid var(--pedra-borda)', color: 'var(--texto)', borderRadius: '4px' }} />
        </div>
        {error && <p style={{ color: 'var(--sangue-vivo)', fontSize: '14px' }}>{error}</p>}
        <button type="submit" className="botaoAcao" style={{ width: '100%' }}>
          {isRegistering ? "Cadastrar" : "Entrar"}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        {isRegistering ? "Já tem uma conta?" : "Não tem uma conta?"}{" "}
        <button onClick={() => setIsRegistering(!isRegistering)} style={{ background: 'none', border: 'none', color: 'var(--ouro)', cursor: 'pointer', textDecoration: 'underline' }}>
          {isRegistering ? "Entre aqui" : "Cadastre-se aqui"}
        </button>
      </p>
    </div>
  );
}
