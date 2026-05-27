"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

// ─── Tipos ───────────────────────────────────────────────────────────────────
type TipoToast = "sucesso" | "erro" | "info";

interface ItemToast {
  id: string;
  tipo: TipoToast;
  mensagem: string;
}

interface ToastContextData {
  adicionarToast: (tipo: TipoToast, mensagem: string) => void;
  removerToast: (id: string) => void;
}

// ─── Contexto ────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextData | undefined>(undefined);

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast deve ser usado dentro de um ToastProvider");
  }
  return context;
}

// ─── Componente Interno Toast ────────────────────────────────────────────────
function ComponenteToast({ id, tipo, mensagem, onRemover }: ItemToast & { onRemover: (id: string) => void }) {
  React.useEffect(() => {
    const timer = setTimeout(() => onRemover(id), 3000);
    return () => clearTimeout(timer);
  }, [id, onRemover]);

  const estilos = {
    sucesso: "bg-emerald-600 text-white border-emerald-500",
    erro:    "bg-rose-600 text-white border-rose-500",
    info:    "bg-sky-600 text-white border-sky-500",
  };

  const icones = {
    sucesso: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    erro: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    ),
    info: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
      </svg>
    ),
  };

  return (
    <div
      className={`flex min-w-[300px] transform items-center gap-3 rounded-lg border p-4 shadow-xl transition-all duration-300 animate-in slide-in-from-right-full ${estilos[tipo]}`}
    >
      <div className="flex-shrink-0">{icones[tipo]}</div>
      <p className="flex-1 text-sm font-semibold">{mensagem}</p>
      <button
        onClick={() => onRemover(id)}
        className="ml-2 rounded-full p-1 transition-colors hover:bg-black/20"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ─── Provider ────────────────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ItemToast[]>([]);

  const removerToast = useCallback((id: string) => {
    setToasts((anterior) => anterior.filter((t) => t.id !== id));
  }, []);

  const adicionarToast = useCallback((tipo: TipoToast, mensagem: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((anterior) => [...anterior, { id, tipo, mensagem }]);
  }, []);

  return (
    <ToastContext.Provider value={{ adicionarToast, removerToast }}>
      {children}
      
      {/* Container de Toasts */}
      <div className="fixed bottom-6 right-6 z-[10000] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ComponenteToast
              {...toast}
              onRemover={removerToast}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
