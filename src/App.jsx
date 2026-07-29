import "./App.css";

import MapContainer from "./components/MapContainer";
import { MapProvider } from "./context/MapContext";

function App() {
  return (
    <MapProvider>
      <MapContainer />
    </MapProvider>
  );
}

export default App;