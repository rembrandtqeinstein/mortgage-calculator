export interface MortgageInputs {
  precioInmueble: number
  porcentajeFinanciado: number
  aniosHipoteca: number
  tasaHipoteca: number
  comisionAgencia: number
  costoAgencia: number
  gastosEscritura: number
  costosCompra: number
  costoObra: number
  porcentajeFinanciadoObra: number
  tasaObra: number
  aniosObra: number
  costosAdicionales: number
}

export interface AmortizacionRow {
  mes: number
  cuota: number
  interes: number
  amortizacion: number
  saldoRestante: number
  porcentajeInteres: number
  porcentajeAmortizacion: number
}

export interface MortgageResults {
  // Hipoteca
  capitalHipoteca: number
  cuotaMensualHipoteca: number
  interesesTotalesHipoteca: number
  totalPagadoHipoteca: number

  // Obra
  capitalObra: number
  cuotaMensualObra: number
  interesesTotalesObra: number
  totalPagadoObra: number

  // Totales
  cuotaTotalMensual: number
  interesesTotales: number
  totalPagado: number

  // Inversion inicial
  entrada: number
  comision: number
  gastos: number
  inversionInicial: number

  // TAE
  taeHipoteca: number
  taeObra: number

  // Tablas amortizacion
  tablaHipoteca: AmortizacionRow[]
  tablaObra: AmortizacionRow[]
}

export const DEFAULT_INPUTS: MortgageInputs = {
  precioInmueble: 300000,
  porcentajeFinanciado: 80,
  aniosHipoteca: 30,
  tasaHipoteca: 2.5,
  comisionAgencia: 3,
  costoAgencia: 9000, // 3% of 300000
  gastosEscritura: 2,
  costosCompra: 6000, // 2% of 300000
  costoObra: 0,
  porcentajeFinanciadoObra: 100,
  tasaObra: 4,
  aniosObra: 10,
  costosAdicionales: 150,
}
