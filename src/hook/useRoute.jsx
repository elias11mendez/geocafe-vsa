import { useState } from "react";
import * as turf from "@turf/turf";
import datosCafes from "../isocromascafevillahermosa.json";
const apiKey = import.meta.env.VITE_ORS_API_KEY;
const ORS_API_KEY = apiKey;

export function useRoute() {
  const [loading, setLoading] = useState(false);
  const [routeData, setRouteData] = useState(null); 
  const [routeInfo, setRouteInfo] = useState(null); 
  const [nearestCafe, setNearestCafe] = useState(null); 
  const [instrucciones, setInstrucciones] = useState([]); 

  const calcularRuta = async (userCoords) => {
    if (!userCoords || userCoords.length < 2) return;

    setLoading(true);

    try {
      const userPoint = turf.point(userCoords);
      let cafeMasCercana = null;
      let menorDistancia = Infinity;

      datosCafes.features.forEach((feature) => {
        const distancia = turf.distance(userPoint, feature, { units: "kilometers" });
        if (distancia < menorDistancia) {
          menorDistancia = distancia;
          cafeMasCercana = feature;
        }
      });

      if (!cafeMasCercana) {
        setLoading(false);
        return;
      }

      setNearestCafe(cafeMasCercana);
      const destCoords = cafeMasCercana.geometry.coordinates;

   
      const url = `https://api.openrouteservice.org/v2/directions/foot-walking?api_key=${ORS_API_KEY}&start=${userCoords[0]},${userCoords[1]}&end=${destCoords[0]},${destCoords[1]}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const routeFeature = data.features[0];
        const summary = routeFeature.properties.summary;
        const segments = routeFeature.properties.segments[0];

        setRouteData(routeFeature);

        setRouteInfo({
          durationMin: Math.round(summary.duration / 60),
          distanceKm: (summary.distance / 1000).toFixed(2), 
        });

        if (segments && segments.steps) {
          const pasosPeatonales = segments.steps.map((step) => ({
            instruccion: step.instruction,
            distancia: Math.round(step.distance),
            nombreCalle: step.name || "Camino/Andador peatonal",
          }));
          setInstrucciones(pasosPeatonales);
        }
      } else {
        console.warn("No se encontró una ruta peatonal con OpenRouteService.", data);
      }
    } catch (error) {
      console.error("Error al calcular la ruta peatonal con OpenRouteService:", error);
    } finally {
      setLoading(false);
    }
  };

  const limpiarRuta = () => {
    setRouteData(null);
    setRouteInfo(null);
    setNearestCafe(null);
    setInstrucciones([]);
  };

  return {
    calcularRuta,
    limpiarRuta,
    loading,
    routeData,
    routeInfo,
    nearestCafe,
    instrucciones,
  };
}