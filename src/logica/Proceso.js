//Proceso.js
import Operacion from './Operacion';

const min = 6;
const max = 20;

class Proceso {
  static ultimoId = 0;

  constructor() {
    this.id = ++Proceso.ultimoId;
    this.tiempoMaximo = Math.floor(Math.random() * (max - min + 1)) + min;
    this.tiempoRestante = this.tiempoMaximo;
    this.operation = new Operacion();
    this.tiempoTranscurrido = 0;
    this.tiempoLlegada = "NO APLICA";
    this.tiempoFinalizacion = "NO APLICA";
    this.tiempoRetorno = "NO APLICA";
    this.tiempoRespuesta = "NO APLICA";
    this.tiempoEspera = 0;
    this.tiempoBloqueado = 0;
    this.estado = "NUEVO";
    this.primeraEjecucion = null;
    this.result = "NO APLICA";
  }
}

export default Proceso;