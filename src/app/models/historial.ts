export class Historial {
    id!:number;
    tipoOperacion!:String;
    fecha!: String;
    saldoAnterior!:number;
    monto!:number;
    cuentaCorriente!:{
        id:number;
    }
    constructor(tipoOperacion:String,monto:number,saldoAnterior:number,idCuenta:number){
        this.tipoOperacion=tipoOperacion;
        this.monto=monto;
        this.saldoAnterior=saldoAnterior;
        this.cuentaCorriente={id:idCuenta};

    }
}
