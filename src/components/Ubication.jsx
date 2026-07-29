import React, { useState, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import { Locate, MousePointerClick, Loader2 } from "lucide-react";
import { useMapInstance } from "../context/MapContext";
import { useRoute } from "../hook/useRoute";
import RouteCaffe from "./RouteCaffe";

export default function Ubication() {
  const { mapRef } = useMapInstance();
  const [cargando, setCargando] = useState(false);
  const [modoSeleccion, setModoSeleccion] = useState(false);
  const userMarkerRef = useRef(null);

  // Hook para calcular la ruta
  const { calcularRuta, limpiarRuta, routeData, routeInfo, nearestCafe } =
    useRoute();

  const fijarUbicacion = (coords, mensaje = "Ubicación fijada") => {
    const map = mapRef.current;
    if (!map) return;

    if (!userMarkerRef.current) {
      const el = document.createElement("div");
      el.className =
        "relative flex items-center justify-center w-6 h-6 cursor-grab active:cursor-grabbing";
      el.innerHTML = `
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white shadow-lg"></span>
      `;

      const marker = new maplibregl.Marker({ element: el, draggable: true })
        .setLngLat(coords)
        .setPopup(
          new maplibregl.Popup({ offset: 10 }).setHTML(
            `<div style="color:#000; font-weight:bold; padding:4px;">📍 ${mensaje}<br/><span style="font-size:10px; color:#555;">(Puedes arrastrar este punto)</span></div>`
          )
        )
        .addTo(map);

      marker.on("dragend", () => {
        const lngLat = marker.getLngLat();
        const nuevasCoords = [lngLat.lng, lngLat.lat];
        calcularRuta(nuevasCoords);
      });

      userMarkerRef.current = marker;
    } else {
      userMarkerRef.current.setLngLat(coords);
    }

    map.flyTo({ center: coords, zoom: 15, pitch: 30 });
    calcularRuta(coords);
  };

  const obtenerUbicacionGPS = () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización.");
      return;
    }

    setCargando(true);

    const opcionesGeo = {
      enableHighAccuracy: true, // Cambiado a true para mayor precisión de GPS real
      timeout: 15000,
      maximumAge: 0, // Fuerza a tomar la ubicación en tiempo real
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.longitude, pos.coords.latitude];
        fijarUbicacion(coords, "Ubicación detectada");
        setCargando(false);
      },
      (error) => {
        console.error("Error al obtener GPS:", error);
        setCargando(false);

        if (error.code === error.PERMISSION_DENIED) {
          alert(
            "Permiso de ubicación denegado. Permite el acceso a la ubicación en tu navegador para continuar."
          );
        } else if (error.code === error.TIMEOUT) {
          alert(
            "Se agotó el tiempo de espera para obtener tu ubicación GPS. Inténtalo de nuevo o usa 'Marcar en mapa'."
          );
        } else {
          alert(
            "No se pudo obtener tu ubicación. Por favor usa la opción 'Marcar en mapa'."
          );
        }
      },
      opcionesGeo
    );
  };

  const activarPunteroManual = () => {
    const map = mapRef.current;
    if (!map) return;

    if (modoSeleccion) {
      setModoSeleccion(false);
      map.getCanvas().style.cursor = "";
      return;
    }

    setModoSeleccion(true);
    map.getCanvas().style.cursor = "crosshair";

    const alHacerClic = (e) => {
      const coords = [e.lngLat.lng, e.lngLat.lat];
      fijarUbicacion(coords, "Mi Ubicación Exacta");

      map.off("click", alHacerClic);
      map.getCanvas().style.cursor = "";
      setModoSeleccion(false);
    };

    map.once("click", alHacerClic);
  };

  return (
    <>
      {routeData && (
        <RouteCaffe
          routeData={routeData}
          routeInfo={routeInfo}
          nearestCafe={nearestCafe}
          onLimpiar={limpiarRuta}
        />
      )}

      <div className="font-montserrat absolute bottom-6 w-80 h-16 left-1/2 -translate-x-1/2 z-10 flex items-center justify-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl shadow-2xl border border-slate-700/80">
        <button
          onClick={activarPunteroManual}
          className={`flex items-center gap-2 h-12 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            modoSeleccion
              ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 animate-pulse font-bold"
              : "text-slate-300 hover:text-white hover:bg-slate-800/80"
          }`}
        >
          <MousePointerClick className="w-4 h-4 text-cyan-400" />
          <span>{modoSeleccion ? "Clic en el mapa..." : "Marcar en mapa"}</span>
        </button>

        <div className="w-[1px] h-6 bg-slate-700/80"></div>

        <button
          onClick={obtenerUbicacionGPS}
          disabled={cargando}
          title="Obtener mi ubicación"
          className="flex items-center gap-2 h-12 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-xl shadow-lg shadow-cyan-500/20 transition-all active:scale-95 text-xs cursor-pointer disabled:opacity-50"
        >
          {cargando ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              <span>Buscando...</span>
            </>
          ) : (
            <>
              <Locate className="w-4 h-4 text-slate-950" />
              <span>Mi Ubicación</span>
            </>
          )}
        </button>
      </div>
    </>
  );
}