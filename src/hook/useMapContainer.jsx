import { useEffect, useState } from "react";
// Cambia la línea 2 de useMapContainer.jsx
import * as maplibregl from "maplibre-gl";
import { useMapInstance } from "../context/MapContext";

export function useMapContainer(mapContainer, mapRef) {
  const [isReady, setIsReady] = useState(false);
  const { setMapReady } = useMapInstance();

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          "carto-dark": {
            type: "raster",
            tiles: [
              "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
              "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
              "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
            ],
            tileSize: 256,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          },
        },
        layers: [
          {
            id: "carto-dark-layer",
            type: "raster",
            source: "carto-dark",
          },
        ],
      },

      center: [-92.929677, 17.983333],
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

  return isReady;
}
