import React, {
  createContext,
  useContext,
  useRef,
  useState,
} from "react";

const MapContext = createContext(null);

export function MapProvider({ children }) {
  const mapRef = useRef(null);

  const [mapReady, setMapReady] = useState(false);

  return (
    <MapContext.Provider
      value={{
        mapRef,
        mapReady,
        setMapReady,
      }}
    >
      {children}
    </MapContext.Provider>
  );
}

export function useMapInstance() {
  const context = useContext(MapContext);

  if (!context) {
    throw new Error(
      "useMapInstance debe ser usado dentro de un MapProvider"
    );
  }

  return context;
}