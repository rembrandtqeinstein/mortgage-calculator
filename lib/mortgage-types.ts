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
  // Inversion
  tasaInversion: number
  tasaImpuesto: number
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

  // Inversion
  montoInvertido: number
  tasaNetaInversion: number
  valorFuturoInversion: number
  vpnEstrategia: number

  // Tablas amortizacion
  tablaHipoteca: AmortizacionRow[]
  tablaObra: AmortizacionRow[]
}

export const DEFAULT_INPUTS: MortgageInputs = {
  precioInmueble: 500000,
  porcentajeFinanciado: 80,
  aniosHipoteca: 30,
  tasaHipoteca: 2,
  comisionAgencia: 3,
  costoAgencia: 15000, // 3% of 500000
  gastosEscritura: 7,
  costosCompra: 35000, // 7% of 500000
  costoObra: 140000,
  porcentajeFinanciadoObra: 0,
  tasaObra: 4,
  aniosObra: 4,
  costosAdicionales: 150,
  tasaInversion: 7,
  tasaImpuesto: 19,
}
