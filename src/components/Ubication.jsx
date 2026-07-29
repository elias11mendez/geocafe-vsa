import React, { useState, useRef, useEffect } from "react";
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
  const seleccionActivaRef = useRef(false);

  const { calcularRuta, limpiarRuta, routeData, routeInfo, nearestCafe } =
    useRoute();

  // ============================================================
  // FIJAR UBICACIÓN
  // ============================================================
  const fijarUbicacion = (coords, mensaje = "Ubicación fijada") => {
    const map = mapRef.current;
    if (!map) return;

    // Validar coordenadas
    if (
      !Array.isArray(coords) ||
      coords.length !== 2 ||
      !Number.isFinite(coords[0]) ||
      !Number.isFinite(coords[1])
    ) {
      console.error("Coordenadas inválidas:", coords);
      return;
    }


    // Crear o actualizar marcador
    if (!userMarkerRef.current) {
      const el = document.createElement("div");
      el.className =
        "relative flex items-center justify-center w-6 h-6 cursor-grab active:cursor-grabbing";
      el.innerHTML = `
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white shadow-lg"></span>
      `;

      const marker = new maplibregl.Marker({
        element: el,
        draggable: true,
      })
        .setLngLat(coords)
        .setPopup(
          new maplibregl.Popup({ offset: 10 }).setHTML(`
            <div style="color:#000; font-weight:bold; padding:4px;">
               ${mensaje}<br/>
              <span style="font-size:10px; color:#555;">(Puedes arrastrar este punto)</span>
            </div>
          `)
        )
        .addTo(map);

      // Listener para arrastre
      marker.on("dragend", () => {
        const lngLat = marker.getLngLat();
        const nuevasCoords = [lngLat.lng, lngLat.lat];
        calcularRuta(nuevasCoords);
      });

      userMarkerRef.current = marker;
    } else {
      userMarkerRef.current.setLngLat(coords);
    }

    map.flyTo({
      center: coords,
      zoom: 15,
      pitch: 30,
      essential: true,
    });

    calcularRuta(coords);
  };

  // ============================================================
  // GPS
  // ============================================================
  const obtenerUbicacionGPS = () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización.");
      return;
    }

    const esLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    const esHTTPS = window.location.protocol === "https:";

    if (!esHTTPS && !esLocalhost) {
      alert(
        "La geolocalización requiere una conexión segura (HTTPS) para funcionar en teléfonos móviles."
      );
      return;
    }

    if (cargando) return;
    setCargando(true);

    const intentarObtener = (altaPrecision) => {
      const opciones = {
        enableHighAccuracy: altaPrecision,
        timeout: altaPrecision ? 15000 : 20000,
        maximumAge: altaPrecision ? 10000 : 60000,
      };

      console.log(" Solicitando ubicación:", opciones);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          console.log(" GPS obtenido:", { latitude, longitude, accuracy });

          const coords = [longitude, latitude];
          fijarUbicacion(
            coords,
            `Ubicación detectada ±${Math.round(accuracy || 0)}m`
          );
          setCargando(false);
        },
        (error) => {
          console.error("Error GPS:", {
            code: error.code,
            message: error.message,
            altaPrecision,
          });

          if (
            altaPrecision &&
            (error.code === error.TIMEOUT ||
              error.code === error.POSITION_UNAVAILABLE)
          ) {
            intentarObtener(false);
            return;
          }

          setCargando(false);

          if (error.code === error.PERMISSION_DENIED) {
            alert(
              "Permiso de ubicación denegado. Actívalo en los ajustes del navegador en Android/Samsung."
            );
            return;
          }

          if (error.code === error.POSITION_UNAVAILABLE) {
            alert(
              "Samsung no pudo determinar tu ubicación. Activa la ubicación/GPS e inténtalo nuevamente."
            );
            return;
          }

          if (error.code === error.TIMEOUT) {
            alert(
              "La ubicación tardó demasiado en responder. Activa el GPS y vuelve a intentarlo."
            );
            return;
          }

          alert(
            "No se pudo obtener el GPS en este momento. Usa el botón 'Marcar en mapa'."
          );
        },
        opciones
      );
    };

    intentarObtener(true);
  };

  // ============================================================
  // SELECCIÓN MANUAL
  // ============================================================
  const activarPunteroManual = () => {
    const map = mapRef.current;
    if (!map) return;

    // Cancelar selección si ya estaba activa
    if (modoSeleccion) {
      seleccionActivaRef.current = false;
      setModoSeleccion(false);
      map.getCanvas().style.cursor = "";
      return;
    }

    // Activar modo selección
    seleccionActivaRef.current = true;
    setModoSeleccion(true);
    map.getCanvas().style.cursor = "crosshair";

    const alInteractuarConMapa = (e) => {
      if (!seleccionActivaRef.current) return;

      seleccionActivaRef.current = false;
      const coords = [e.lngLat.lng, e.lngLat.lat];

      fijarUbicacion(coords, "Mi Ubicación Exacta");

      setModoSeleccion(false);
      map.getCanvas().style.cursor = "";
    };

    map.once("click", alInteractuarConMapa);
  };

  // ============================================================
  // LIMPIEZA
  // ============================================================
  useEffect(() => {
    return () => {
      seleccionActivaRef.current = false;
      const map = mapRef.current;
      if (map) {
        map.getCanvas().style.cursor = "";
      }
    };
  }, [mapRef]);

  // ============================================================
  // RENDER
  // ============================================================
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

      <div className="font-montserrat absolute bottom-6 w-[90%] max-w-xs h-14 left-1/2 -translate-x-1/2 z-10 flex items-center justify-between gap-1 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl shadow-2xl border border-slate-700/80">
        <button
          type="button"
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

        <div className="w-[1px] h-6 bg-slate-700/80 shrink-0" />

        <button
          type="button"
          onClick={obtenerUbicacionGPS}
          disabled={cargando}
          title="Obtener mi ubicación"
          className="flex-1 flex items-center justify-center gap-1.5 h-11 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3 rounded-xl shadow-lg shadow-cyan-500/20 transition-all active:scale-95 text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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