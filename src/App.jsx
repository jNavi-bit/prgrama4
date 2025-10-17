import { useState, useEffect, useRef } from "react";
import useContador from "./logica/Contador";
import Proceso from "./logica/Proceso";
import "./App.css";

function App() {
  const [numeroProcesos, setNumeroProcesos] = useState("");
  const [iniciado, setIniciado] = useState(false);
  const [pausado, setPausado] = useState(false);

  const [nuevos, setNuevos] = useState([]);
  const [enMemoria, setEnMemoria] = useState([]);
  const [listos, setListos] = useState([]);
  const [enEjecucion, setEnEjecucion] = useState(null);
  const [terminados, setTerminados] = useState([]);
  const [bloqueados, setBloqueados] = useState([]);
  const [mostrarTabla, setMostrarTabla] = useState(false);


  const segundos = useContador(iniciado, pausado);
  const numeroValido = Number(numeroProcesos) > 0;
  const primerRender = useRef(true);
  const teclaPresionada = useRef(false);

  useEffect(() => {
    if (iniciado && nuevos.length === 0 && enMemoria.length === 0 && enEjecucion === null) {
      setIniciado(false);
    }
  }, [iniciado, nuevos.length, enMemoria.length, enEjecucion]);

  useEffect(() => {
    const handleKeyPress = (event) => {
      const key = event.key.toLowerCase();

      if (key === "n") {
        const nuevosProcesos = [...nuevos];
        nuevosProcesos.push(new Proceso());
        setNuevos(nuevosProcesos);
      }

      if(key === "b") {
        setMostrarTabla(true);
        setPausado(true);
      }

      if(key === "c") {
        setMostrarTabla(false);
        setPausado(false);
      }
    }

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);

  }, [nuevos]);

  useEffect(() => {
    if (!iniciado) return;
    
    const handleKeyPress = (event) => {
      const key = event.key.toLowerCase();
      
      if (key === "p") {
        setPausado(true);
      }

      
      
      if (key === "c") {
        setMostrarTabla(false);
        setPausado(false);
      }
      
      if (key === "e") {
        if (pausado || teclaPresionada.current) return;
        
        setEnEjecucion((current) => {
          if (current && current.estado === "EN EJECUCIÓN") {
            teclaPresionada.current = true;
            
            const bloqueado = { 
              ...current, 
              estado: "BLOQUEADO",
              tiempoBloqueado: 0
            };
            
            setBloqueados((prev) => {
              const existe = prev.some(p => p.id === bloqueado.id);
              if (existe) return prev;
              return [...prev, bloqueado];
            });
            
            setTimeout(() => {
              teclaPresionada.current = false;
            }, 100);
            
            return null;
          }
          return current;
        });
      }
      
      if (key === "w") {
        if (pausado || teclaPresionada.current) return;
        
        setEnEjecucion((current) => {
          if (current && current.estado === "EN EJECUCIÓN") {
            teclaPresionada.current = true;
            
            const terminado = { ...current };
            terminado.result = "ERROR";
            terminado.tiempoFinalizacion = segundos;
            terminado.tiempoRetorno = terminado.tiempoFinalizacion - terminado.tiempoLlegada;
            terminado.tiempoEspera = terminado.tiempoRetorno - terminado.tiempoTranscurrido;
            terminado.estado = "TERMINADO";
            
            setTerminados((prev) => {
              const existe = prev.some(p => p.id === terminado.id);
              if (existe) return prev;
              return [...prev, terminado];
            });
            
            setEnMemoria((prev) => prev.filter((p) => p.id !== terminado.id));
            
            setTimeout(() => {
              teclaPresionada.current = false;
            }, 100);
            
            return null;
          }
          return current;
        });
      }
    };
    
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [segundos, iniciado, pausado]);

  const HandleAgregarNuevos = () => {
    const n = Number(numeroProcesos);
    if (!n) return;
    const nuevosProcesos = [...nuevos];
    for (let i = 0; i < n; i++) {
      nuevosProcesos.push(new Proceso());
    }
    setNuevos(nuevosProcesos);
    setNumeroProcesos("");
  };

  useEffect(() => {
    if (!iniciado || pausado || teclaPresionada.current) return;

    if (primerRender.current) {
      primerRender.current = false;
      
      if (nuevos.length > 0 && enMemoria.length === 0) {
        const procesosNuevos = [...nuevos];
        const procesosEnMemoria = [];
        const nuevosListos = [];

        while (procesosEnMemoria.length < 4 && procesosNuevos.length > 0) {
          const p = procesosNuevos.shift();
          p.tiempoLlegada = 0;
          p.estado = "LISTO";
          procesosEnMemoria.push(p);
          nuevosListos.push(p);
        }

        setNuevos(procesosNuevos);
        setEnMemoria(procesosEnMemoria);
        
        if (nuevosListos.length > 0) {
          const primerProceso = nuevosListos.shift();
          primerProceso.primeraEjecucion = 0;
          primerProceso.tiempoRespuesta = 0;
          primerProceso.estado = "EN EJECUCIÓN";
          
          setListos(nuevosListos);
          setEnEjecucion(primerProceso);
        }
      }
      return;
    }

    if (enEjecucion !== null) {
      const procesoActualizado = {
        ...enEjecucion,
        tiempoRestante: enEjecucion.tiempoRestante - 1,
        tiempoTranscurrido: enEjecucion.tiempoTranscurrido + 1,
      };

      if (procesoActualizado.tiempoRestante <= 0) {
        const terminado = { ...procesoActualizado };
        terminado.tiempoFinalizacion = segundos;
        terminado.tiempoRetorno = terminado.tiempoFinalizacion - terminado.tiempoLlegada;
        terminado.tiempoEspera = terminado.tiempoRetorno - terminado.tiempoMaximo;
        terminado.tiempoRestante = 0;
        terminado.result = terminado.operation.resultado;
        terminado.estado = "TERMINADO";

        setTerminados((prev) => {
          const existe = prev.some(p => p.id === terminado.id);
          if (existe) return prev;
          return [...prev, terminado];
        });
        setEnMemoria((prev) => prev.filter((p) => p.id !== terminado.id));
        setEnEjecucion(null);
      } else {
        setEnEjecucion(procesoActualizado);
      }
    }

    if (bloqueados.length > 0) {
      const nuevosBloqueados = [];
      const procesosDesbloqueados = [];

      bloqueados.forEach((p) => {
        const proceso = { 
          ...p, 
          tiempoBloqueado: (p.tiempoBloqueado || 0) + 1,
          tiempoEspera: p.tiempoEspera + 1
        };
        if (proceso.tiempoBloqueado >= 8) {
          proceso.estado = "LISTO";
          proceso.tiempoBloqueado = 0;
          procesosDesbloqueados.push(proceso);
        } else {
          nuevosBloqueados.push(proceso);
        }
      });

      setBloqueados(nuevosBloqueados);
      if (procesosDesbloqueados.length > 0) {
        setListos((prev) => [...prev, ...procesosDesbloqueados]);
      }
    }

    if (nuevos.length > 0 && enMemoria.length < 4) {
      const procesosNuevos = [...nuevos];
      const procesosEnMemoria = [...enMemoria];
      const nuevosListos = [];

      while (procesosEnMemoria.length < 4 && procesosNuevos.length > 0) {
        const p = procesosNuevos.shift();
        p.tiempoLlegada = segundos;
        p.estado = "LISTO";
        procesosEnMemoria.push(p);
        nuevosListos.push(p);
      }

      setNuevos(procesosNuevos);
      setEnMemoria(procesosEnMemoria);
      setListos((prev) => {
        const nuevosConEspera = nuevosListos.map(p => ({
          ...p,
          tiempoEspera: p.tiempoEspera + 1
        }));
        return [...prev, ...nuevosConEspera];
      });
    }

    // Incrementar tiempoEspera para procesos ya en LISTO (que no acaban de llegar)
    setListos((prev) =>
      prev.map((p) => ({
        ...p,
        tiempoEspera: p.tiempoEspera + 1,
      }))
    );

    if (enEjecucion === null && listos.length > 0) {
      setListos((prevListos) => {
        if (prevListos.length === 0) return prevListos;
        
        const procesosListos = [...prevListos];
        const proceso = procesosListos.shift();

        if (proceso.primeraEjecucion === null) {
          proceso.primeraEjecucion = segundos;
          proceso.tiempoRespuesta = proceso.primeraEjecucion - proceso.tiempoLlegada;
        }

        proceso.estado = "EN EJECUCIÓN";
        setEnEjecucion(proceso);
        
        return procesosListos;
      });
    }
  }, [segundos, iniciado, pausado]);

  return (
    <div className="app-container">
      <div className="control-panel">
        <div className="control-content">
          <div className="timer-display">
            Tiempo transcurrido total: <span>{segundos}s</span>
          </div>
          <div className="control-buttons">
            <input
              className="input-field"
              type="number"
              value={numeroProcesos}
              onChange={(e) => setNumeroProcesos(e.target.value)}
              placeholder="Número de procesos"
            />
            <button 
              className="btn btn-primary"
              disabled={!numeroValido} 
              onClick={HandleAgregarNuevos}
            >
              Agregar procesos
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => setIniciado(true)} 
              disabled={nuevos.length === 0 || iniciado}
            >
              Iniciar Ejecución
            </button>
          </div>
        </div>
        <div className="controls-info">
          Controles: P (Pausar) | C (Continuar) | E (Bloquear proceso) | W (Terminar con error) | N (Nuevo Proceso) | B (Tabla de procesos)
        </div>
      </div>


      {/* TABLA DE PROCESOS */}
      {mostrarTabla && (
        <div className="tabla-procesos-overlay">
          <div className="tabla-procesos">
            <h2>Tabla de todos los procesos</h2>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Operación</th>
                  <th>Resultado</th>
                  <th>Estado</th>
                  <th>T. Máximo</th>
                  <th>T. Restante</th>
                  <th>T. Servicio</th>
                  <th>Llegada</th>
                  <th>Finalización</th>
                  <th>Retorno</th>
                  <th>Respuesta</th>
                  <th>Espera</th>
                  <th>Bloqueado</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ...nuevos,
                  ...listos,
                  ...bloqueados,
                  ...(enEjecucion ? [enEjecucion] : []),
                  ...terminados,
                ].map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.operation.operacionTexto}</td>
                    <td>{p.result}</td>
                    <td>{p.estado}</td>
                    <td>{p.tiempoMaximo}</td>
                    <td>{p.tiempoRestante}</td>
                    <td>{p.tiempoTranscurrido}</td>
                    <td>{p.tiempoLlegada}</td>
                    <td>{p.tiempoFinalizacion}</td>
                    <td>{p.tiempoRetorno}</td>
                    <td>{p.tiempoRespuesta}</td>
                    <td>{p.tiempoEspera}</td>
                    <td>{p.tiempoBloqueado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="tabla-info">Presiona "C" para continuar la ejecución</p>
          </div>
        </div>
      )}

      <div className="processes-grid">
        <div className={`process-section nuevos ${nuevos.length === 0 ? 'empty' : ''}`}>
          <div className="section-header">
            Procesos Nuevos
            <span className="section-count">{nuevos.length}</span>
          </div>
          {nuevos.length === 0 ? (
            <div className="empty-state">No hay nuevos procesos.</div>
          ) : (
            <div className="process-list">
              {nuevos.map((p) => (
                <div key={p.id} className="process-item">
                  Proceso #{p.id} | TME: {p.tiempoMaximo}s | {p.operation.operacionTexto}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="memory-section">
          <div className="section-header">
            Procesos en Memoria
            <span className="section-count">{enMemoria.length}/4</span>
          </div>
          
          <div className="memory-subsections">
            <div className="memory-subsection blocked-section">
              <div className="subsection-title">
                Bloqueados
                <span className="section-count">{bloqueados.length}</span>
              </div>
              {bloqueados.length === 0 ? (
                <div className="empty-state">No hay procesos bloqueados.</div>
              ) : (
                bloqueados.map((b) => (
                  <div key={b.id} className="blocked-process">
                    Proceso #{b.id} | Tiempo bloqueado: {b.tiempoBloqueado}s | Espera: {b.tiempoEspera}s
                  </div>
                ))
              )}
            </div>

            <div className="memory-subsection executing-section">
              <div className="subsection-title">En Ejecución</div>
              {enEjecucion === null ? (
                <div className="empty-state">No hay ningún proceso en ejecución.</div>
              ) : (
                <div className="executing-process">
                  Proceso #{enEjecucion.id} | {enEjecucion.operation.operacionTexto} | 
                  TME: {enEjecucion.tiempoMaximo}s | 
                  Transcurrido: {enEjecucion.tiempoTranscurrido}s | 
                  Restante: {enEjecucion.tiempoRestante}s
                </div>
              )}
            </div>

            <div className="memory-subsection ready-section">
              <div className="subsection-title">
                Listos
                <span className="section-count">{listos.length}</span>
              </div>
              {listos.length === 0 ? (
                <div className="empty-state">No hay procesos listos.</div>
              ) : (
                listos.map((l) => (
                  <div key={l.id} className="ready-process">
                    Proceso #{l.id} | TME: {l.tiempoMaximo}s | Restante: {l.tiempoRestante}s | Espera: {l.tiempoEspera}s
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className={`process-section finalizados ${terminados.length === 0 ? 'empty' : ''}`}>
          <div className="section-header">
            Procesos Finalizados
            <span className="section-count">{terminados.length}</span>
          </div>
          {terminados.length === 0 ? (
            <div className="empty-state">No hay procesos finalizados.</div>
          ) : (
            <div className="process-list">
              {terminados.map((t) => (
                <div key={t.id} className="finished-process">
                  Proceso #{t.id} | {t.operation.operacionTexto} = {t.result} | 
                  TME: {t.tiempoMaximo}s | Transcurrido: {t.tiempoTranscurrido}s | 
                  Llegada: {t.tiempoLlegada}s | Finalización: {t.tiempoFinalizacion}s | 
                  Retorno: {t.tiempoRetorno}s | Respuesta: {t.tiempoRespuesta}s | 
                  Espera: {t.tiempoEspera}s
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;