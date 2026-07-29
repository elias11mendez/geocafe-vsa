import { useEffect, useState } from "react";
// Cambia la línea 2 de useMapContainer.jsx
import * as maplibregl from "maplibre-gl";
import { useMapInstance } from "../context/MapContext";

export function useMapContainer(mapContainer, mapRef) {
  const [isReady, setIsReady] = useState(false);
  const { setMapReady } = useMapInstance();

  // 1. Inicialización inicial del mapa
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          "smooth-dark-tiles": {
            type: "raster",
            // 💡 Tiles oscuras de alto contraste con red vial muy visible
            tiles: [
              "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}@2x.png",
            ],
            tileSize: 256,
            attribution:
              '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a>',
          },
        },
        layers: [
          {
            id: "smooth-dark-layer",
            type: "raster",
            source: "smooth-dark-tiles",
          },
        ],
      },

      center: [-92.929677,  17.983333],
      zoom: 12.8,
    });

    mapRef.current.popup = new maplibregl.Popup({
      closeButton: false,
      closeOnClick: false,
    });

    mapRef.current.on("load", () => setIsReady(true));

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        setIsReady(false);
      }
    };
  }, [mapContainer, mapRef]);

  // 2. Cambio directo de estilo de mapa base

  return isReady;
}
