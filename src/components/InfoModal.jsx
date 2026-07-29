import React, { useState } from "react";
import { HelpCircle, ExternalLink, ShieldAlert, X, UserCheck, Database } from "lucide-react";

export default function InfoModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="absolute top-4 left-4 z-20 font-montserrat">
        <button
          onClick={() => setIsOpen(!isOpen)}
          title="Información y Créditos"
          className="flex items-center justify-center w-10 h-10 bg-slate-900/90 text-cyan-400 hover:text-white backdrop-blur-md rounded-2xl shadow-xl border border-slate-700/80 hover:border-cyan-500/50 hover:bg-slate-800 transition-all cursor-pointer active:scale-95"
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute font-montserrat top-16 left-4 z-30 w-[90%] max-w-sm bg-slate-900/95 text-white backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-slate-700/80 animate-in fade-in slide-in-from-top-2 duration-200">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-xs sm:text-sm text-slate-100">
                Información del Estudio
              </h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            
            <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/40">
              <span className="font-semibold text-slate-200 block mb-1">
                🌐 Fuentes y Metodología:
              </span>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Basado en datos geográficos públicos del **INEGI (DENUE)** y red caminable mediante **OpenStreetMap**. Incluye áreas de proximidad peatonal (isocronas / buffer de 500m).
              </p>
            </div>

            <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/40 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                <UserCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Desarrollado por: <strong className="text-white">Elias J. Méndez</strong></span>
              </div>
              <div className="flex flex-col gap-1 pt-1 pl-5">
                <a
                  href="https://eliasgeodev.sinekasur.site/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:underline hover:text-cyan-300"
                >
                  <span>Portafolio GeoDev</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://www.linkedin.com/in/eliasgeodev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:underline hover:text-cyan-300"
                >
                  <span>LinkedIn Profile</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl text-amber-200/90 text-[10px] leading-snug">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p>
                <strong>Aviso Legal:</strong> Este visor es una herramienta de exploración espacial exploratoria de carácter básico. Las rutas, tiempos de caminata y coberturas son aproximaciones algorítmicas y no constituyen asesoría comercial o técnica formal.
              </p>
            </div>

          </div>
        </div>
      )}
    </>
  );
}