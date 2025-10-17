//Operacion.js
const min = 0;
const max = 100;
const minSW = 1;
const maxSW = 6;
const maxP = 4 

class Operacion {
    constructor() {
        
        switch (Math.floor(Math.random() * (maxSW - minSW + 1)) + minSW) {
            case 1:
                this.numero1 = Math.floor(Math.random() * (max - min + 1)) + min;
                this.numero2 = Math.floor(Math.random() * (max - min + 1)) + min;
                this.operacionTexto = this.numero1 + "+" + this.numero2;
                this.resultado = this.numero1 + this.numero2;
                break;
            case 2:
                this.numero1 = Math.floor(Math.random() * (max - min + 1)) + min;
                this.numero2 = Math.floor(Math.random() * (max - min + 1)) + min;
                this.operacionTexto = this.numero1 + "-" + this.numero2;
                this.resultado = this.numero1 - this.numero2;
                break;
            case 3:
                this.numero1 = Math.floor(Math.random() * (max - min + 1)) + min;
                this.numero2 = Math.floor(Math.random() * (max - min + 1)) + min;
                this.operacionTexto = this.numero1 + "*" + this.numero2;
                this.resultado = this.numero1 * this.numero2;
                break;
            case 4:
                this.numero1 = Math.floor(Math.random() * (max - minSW + 1)) + minSW;
                this.numero2 = Math.floor(Math.random() * (max - minSW + 1)) + minSW;
                this.operacionTexto = this.numero1 + "÷" + this.numero2;
                this.resultado = this.numero1 / this.numero2;
                break;
            case 5:
                this.numero1 = Math.floor(Math.random() * (max - minSW + 1)) + minSW;
                this.numero2 = Math.floor(Math.random() * (max - minSW + 1)) + minSW;
                this.operacionTexto = this.numero1 + "%" + this.numero2;
                this.resultado = this.numero1 % this.numero2;
                break;
            case 6:
                this.numero1 = Math.floor(Math.random() * (max - min + 1)) + min;
                this.numero2 = Math.floor(Math.random() * (maxP - minSW + 1)) + minSW;
                this.operacionTexto = this.numero1 + "^" + this.numero2;
                this.resultado = this.numero1 ** this.numero2;
                break;
        }
    }
}

export default Operacion;
