import React, { useEffect } from "react";
import * as turf from "@turf/turf";
import { Coffee, Footprints, Navigation, MapPin, X } from "lucide-react";
import { useMapInstance } from "../context/MapContext";

export default function RouteCaffe({ routeData, routeInfo, nearestCafe, onLimpiar }) {
  const { mapRef } = useMapInstance();

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !routeData) return;

    const renderizarLineaRuta = () => {
      if (!map.getStyle()) return;

      if (map.getSource("osrm-route-source")) {
        map.getSource("osrm-route-source").setData(routeData);
      } else {
        map.addSource("osrm-route-source", {
          type: "geojson",
          data: routeData,
        });

        map.addLayer({
          id: "osrm-route-layer",
          type: "line",
          source: "osrm-route-source",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "#44f814", // Cyan-500
            "line-width": 5,
            "line-opacity": 0.9,
          },
        });
      }

      const bbox = turf.bbox(routeData);
      map.fitBounds(
        [
          [bbox[0], bbox[1]],
          [bbox[2], bbox[3]],
        ],
        { padding: { top: 120, bottom: 90, left: 40, right: 40 }, maxZoom: 16 }
      );
    };

    renderizarLineaRuta();

    return () => {
      if (map && map.getStyle()) {
        if (map.getLayer("osrm-route-layer")) map.removeLayer("osrm-route-layer");
        if (map.getSource("osrm-route-source")) map.removeSource("osrm-route-source");
      }
    };
  }, [mapRef, routeData]);

  if (!routeInfo || !nearestCafe) return null;

  const props = nearestCafe.properties || {};
  const nombreCafe =
    props["Nombre de la Unidad Económica"] ||
    props["nombre"] ||
    props["NOM_ESTAB"] ||
    "Cafetería Cercana";

  const direccion =
    props["Vialidad"] ||
    props["direccion"] ||
    props["DOMICILIO"] ||
    "Villahermosa, Tabasco";

  return (
    <div className="absolute font-montserrat top-4 left-1/2 -translate-x-1/2 z-20 w-[92%] max-w-sm bg-slate-900/90 text-white backdrop-blur-md p-3.5 rounded-2xl shadow-2xl border border-slate-700/80 transition-all animate-in fade-in slide-in-from-top-4 duration-300">
      
      <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-2.5 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400 shrink-0">
            <Coffee className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-xs sm:text-sm text-slate-100 truncate">
              {nombreCafe}
            </h3>
            <p className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5 truncate">
              <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
              <span className="truncate">{direccion}</span>
            </p>
          </div>
        </div>

        <button
          onClick={onLimpiar}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer shrink-0"
          title="Cerrar tarjeta"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2.5 bg-slate-800/60 p-2 rounded-xl border border-slate-700/50">
          <Footprints className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="min-w-0">
            <span className="text-[9px] font-medium text-slate-400 block uppercase tracking-wider">
              A PIE
            </span>
            <span className="font-bold text-emerald-400 text-xs sm:text-sm truncate block">
              ~{routeInfo.durationMin} min
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-slate-800/60 p-2 rounded-xl border border-slate-700/50">
          <Navigation className="w-4 h-4 text-cyan-400 shrink-0" />
          <div className="min-w-0">
            <span className="text-[9px] font-medium text-slate-400 block uppercase tracking-wider">
              DISTANCIA
            </span>
            <span className="font-bold text-cyan-400 text-xs sm:text-sm truncate block">
              {routeInfo.distanceKm} km
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}