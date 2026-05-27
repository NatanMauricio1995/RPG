"use client";

import React from "react";

interface PropsLoading {
  mensagem?: string;
}

export default function Loading({ mensagem = "Carregando..." }: PropsLoading) {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative h-20 w-20">
        {/* Spinner animado */}
        <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-t-amber-500 border-r-transparent border-b-transparent border-l-transparent"></div>
      </div>
      
      {mensagem && (
        <p className="mt-4 text-lg font-medium text-white animate-pulse">
          {mensagem}
        </p>
      )}
    </div>
  );
}
