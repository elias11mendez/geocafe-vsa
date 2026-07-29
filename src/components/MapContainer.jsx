import { useEffect, useRef } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import { useMapInstance } from "../context/MapContext";
import { useMapContainer } from "../hook/useMapContainer";
import IsocromasCaffe from "./IsocromasCaffe";
import Ubication from "./Ubication";
import InfoModal from "./InfoModal";
import { Legend } from "./Legend";

export default function MapContainer() {
  const mapContainer = useRef(null);
  const { mapRef, setMapReady } = useMapInstance();

  const isReady = useMapContainer(mapContainer, mapRef);

  useEffect(() => {
    if (isReady && setMapReady) {
      setMapReady(true);
    }
  }, [isReady, setMapReady]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
      <Legend />
      <InfoModal />

      {isReady && <IsocromasCaffe />}
      {isReady && <Ubication />}
    </div>
  );
}
