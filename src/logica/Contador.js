//Contador.js
import { useState, useEffect } from "react";

export default function useContador(iniciado, pausado) {
  const [segundos, setSegundos] = useState(0);

  useEffect(() => {
    if (!iniciado || pausado) return; // si no ha iniciado o está pausado -> no hacer nada

    const timer = setInterval(() => {
      setSegundos(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer); 
  }, [iniciado, pausado]); // dependencias importantes

  return segundos;
}