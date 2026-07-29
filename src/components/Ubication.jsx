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
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-4 w-4 bg-cyan-500 border-2 border-white shadow-lg"></span>
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

  // 🚀 Función de Geolocalización Optimizada para Mobile / Samsung
  const obtenerUbicacionGPS = () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización.");
      return;
    }

    // Comprobación de seguridad para entorno seguro (HTTPS)
    if (
      window.location.protocol !== "https:" &&
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1"
    ) {
      alert(
        "La geolocalización requiere una conexión segura (HTTPS) para funcionar en teléfonos móviles."
      );
      return;
    }

    setCargando(true);

    const intentarObtener = (altaPrecision = true) => {
      const opciones = {
        enableHighAccuracy: altaPrecision,
        timeout: altaPrecision ? 10000 : 15000,
        maximumAge: 5000,
      };

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.longitude, pos.coords.latitude];
          fijarUbicacion(coords, "Ubicación detectada");
          setCargando(false);
        },
        (error) => {
          // Reintento con precisión estándar si el GPS satelital no responde a tiempo
          if (altaPrecision && error.code === error.TIMEOUT) {
            intentarObtener(false);
            return;
          }

          console.error("Error al obtener GPS:", error);
          setCargando(false);

          if (error.code === error.PERMISSION_DENIED) {
            alert(
              "Permiso de ubicación denegado en tu navegador/móvil. Habilita los permisos de ubicación e inténtalo de nuevo."
            );
          } else {
            alert(
              "No se pudo obtener la ubicación con precisión. Por favor, selecciona tu punto con 'Marcar en mapa'."
            );
          }
        },
        opciones
      );
    };

    intentarObtener(true);
  };

  // 🎯 Marcación manual compatible con pantallas táctiles (Touch Events)
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

    const alTocarOMapear = (e) => {
      const coords = [e.lngLat.lng, e.lngLat.lat];
      fijarUbicacion(coords, "Mi Ubicación Exacta");

      map.off("click", alTocarOMapear);
      map.getCanvas().style.cursor = "";
      setModoSeleccion(false);
    };

    map.once("click", alTocarOMapear);
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

      {/* Barra de control flotante adaptable a pantallas de móvil */}
      <div className="font-montserrat absolute bottom-6 w-[90%] max-w-xs h-14 left-1/2 -translate-x-1/2 z-10 flex items-center justify-between gap-1 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl shadow-2xl border border-slate-700/80">
        <button
          onClick={activarPunteroManual}
          className={`flex-1 flex items-center justify-center gap-1.5 h-11 px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            modoSeleccion
              ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20 animate-pulse font-bold"
              : "text-slate-300 hover:text-white hover:bg-slate-800/80 active:bg-slate-800"
          }`}
        >
          <MousePointerClick className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="truncate">
            {modoSeleccion ? "Toca el mapa..." : "Marcar en mapa"}
          </span>
        </button>

        <div className="w-[1px] h-6 bg-slate-700/80 shrink-0"></div>

        <button
          onClick={obtenerUbicacionGPS}
          disabled={cargando}
          title="Obtener mi ubicación"
          className="flex-1 flex items-center justify-center gap-1.5 h-11 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3 rounded-xl shadow-lg shadow-cyan-500/20 transition-all active:scale-95 text-xs cursor-pointer disabled:opacity-50"
        >
          {cargando ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950 shrink-0" />
              <span className="truncate">Buscando...</span>
            </>
          ) : (
            <>
              <Locate className="w-4 h-4 text-slate-950 shrink-0" />
              <span className="truncate">Mi Ubicación</span>
            </>
          )}
        </button>
      </div>
    </>
  );
}