import React, { useEffect } from 'react';
import { Popup } from 'maplibre-gl';
import * as turf from '@turf/turf';
import { useMapInstance } from '../context/MapContext';

import datosCafes from '../isocromascafevillahermosa.json';
import InfoModal from './InfoModal';

export default function IsocromasCaffe() {
  const { mapRef } = useMapInstance();

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const agregarCapaCafes = () => {
      if (!map.getStyle()) return;

      if (map.getSource('cafes-source')) return;

 
      const bufferGeoJSON = turf.buffer(datosCafes, 0.4, { units: 'kilometers' });


      map.addSource('cafes-buffer-source', {
        type: 'geojson',
        data: bufferGeoJSON,
      });

      map.addLayer({
        id: 'cafes-buffer-fill-layer',
        type: 'fill',
        source: 'cafes-buffer-source',
        paint: {
          'fill-color': '#00f3ff', 
          'fill-opacity': 0.25,   
        },
      });

      map.addLayer({
        id: 'cafes-buffer-outline-layer',
        type: 'line',
        source: 'cafes-buffer-source',
        paint: {
          'line-color': '#00f3ff',
          'line-width': 1.5,
          'line-opacity': 0.8,
        },
      });

      map.addSource('cafes-source', {
        type: 'geojson',
        data: datosCafes,
      });

      map.addLayer({
        id: 'cafes-layer',
        type: 'circle',
        source: 'cafes-source',
        paint: {
          'circle-radius': 8,
          'circle-color': '#f59e0b',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });

      map.on('click', 'cafes-layer', (e) => {
        if (!e.features || e.features.length === 0) return;

        const feature = e.features[0];
        const coordinates = feature.geometry.coordinates.slice();
        const nombre = feature.properties['Nombre de la Unidad Económica'] || 'Sin nombre';

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new Popup()
          .setLngLat(coordinates)
          .setHTML(`<div style="color: #000; font-weight: bold; padding: 4px;">${nombre}</div>`)
          .addTo(map);
      });

      map.on('mouseenter', 'cafes-layer', () => {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', 'cafes-layer', () => {
        map.getCanvas().style.cursor = '';
      });
    };

    if (map.getStyle()) {
      agregarCapaCafes();
    }

    map.on('styledata', agregarCapaCafes);

    return () => {
      if (map && map.getStyle()) {
        map.off('styledata', agregarCapaCafes);

        if (map.getLayer('cafes-layer')) map.removeLayer('cafes-layer');
        if (map.getLayer('cafes-buffer-outline-layer')) map.removeLayer('cafes-buffer-outline-layer');
        if (map.getLayer('cafes-buffer-fill-layer')) map.removeLayer('cafes-buffer-fill-layer');

        if (map.getSource('cafes-source')) map.removeSource('cafes-source');
        if (map.getSource('cafes-buffer-source')) map.removeSource('cafes-buffer-source');
      }
    };
  }, [mapRef]);

  return (
   <></>
  );
}