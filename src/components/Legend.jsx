import React, { useState } from "react";
import { Layers, X } from "lucide-react";

export const Legend = () => {
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpenMobile(!isOpenMobile)}
        className="md:hidden absolute top-16 left-4 z-20 flex items-center gap-2 bg-slate-900/90 text-cyan-400 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-slate-700/80 active:scale-95 transition-all text-xs font-semibold cursor-pointer"
        aria-label="Ver leyenda"
      >
        <Layers className="w-4 h-4 text-cyan-400" />
        <span>Leyenda</span>
      </button>

      <div
        className={`
          absolute z-20 w-60 bg-slate-900/95 md:bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl shadow-2xl border border-slate-700/80 text-white font-montserrat transition-all duration-300
          /* Posición en Desktop (PC) */
          md:bottom-6 md:left-6 md:top-auto md:block md:opacity-100 md:scale-100
          /* Posición y visibilidad en Mobile */
          top-28 left-4
          ${isOpenMobile 
            ? "block opacity-100 scale-100 animate-in fade-in zoom-in-95" 
            : "hidden md:block"
          }
        `}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-200">
              Simbología
            </h4>
          </div>

          <button
            onClick={() => setIsOpenMobile(false)}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5 text-xs">
          
          {/* 1. Cafetería */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
              <span className="w-3.5 h-3.5 rounded-full bg-[#f59e0b] border-2 border-white shadow-md"></span>
            </div>
            <span className="text-slate-300 text-[11px] font-medium leading-tight">
              Ubicación de Cafetería
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-5 h-5 shrink-0">
              <span className="w-4 h-4 rounded-full bg-[#00f3ff]/30 border border-[#00f3ff]"></span>
            </div>
            <span className="text-slate-300 text-[11px] font-medium leading-tight">
              Proximidad (500m / 5 min)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-5 h-5 shrink-0">
              <span className="w-5 h-1 bg-[#44f814] rounded-full shadow-sm"></span>
            </div>
            <span className="text-slate-300 text-[11px] font-medium leading-tight">
              Ruta más rápida
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-5 h-5 shrink-0">
              <span className="animate-ping absolute inline-flex h-3.5 w-3.5 rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-white"></span>
            </div>
            <span className="text-slate-300 text-[11px] font-medium leading-tight">
              Mi Ubicación
            </span>
          </div>

        </div>
      </div>
    </>
  );
};