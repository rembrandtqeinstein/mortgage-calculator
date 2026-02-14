import type { MortgageInputs, MortgageResults, AmortizacionRow } from "./mortgage-types"

function calcularCuotaMensual(principal: number, tasaAnual: number, anios: number): number {
  if (principal <= 0 || anios <= 0) return 0
  const r = tasaAnual / 100 / 12
  const n = anios * 12
  if (r === 0) return principal / n
  return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

function calcularTablaAmortizacion(principal: number, tasaAnual: number, anios: number): AmortizacionRow[] {
  if (principal <= 0 || anios <= 0) return []
  const r = tasaAnual / 100 / 12
  const n = anios * 12
  const cuota = calcularCuotaMensual(principal, tasaAnual, anios)
  let saldo = principal
  const tabla: AmortizacionRow[] = []

  for (let mes = 1; mes <= n; mes++) {
    const interes = saldo * r
    const amortizacion = cuota - interes
    saldo = saldo - amortizacion

    tabla.push({
      mes,
      cuota,
      interes,
      amortizacion,
      saldoRestante: Math.max(saldo, 0),
      porcentajeInteres: cuota > 0 ? interes / cuota : 0,
      porcentajeAmortizacion: cuota > 0 ? amortizacion / cuota : 0,
    })
  }

  return tabla
}

function calcularTAE(tin: number): number {
  const f = 12
  const tae = Math.pow(1 + tin / 100 / f, f) - 1
  return tae * 100
}

export function calcularHipoteca(inputs: MortgageInputs): MortgageResults {
  const {
    precioInmueble,
    porcentajeFinanciado,
    aniosHipoteca,
    tasaHipoteca,
    comisionAgencia,
    gastosEscritura,
    costoObra,
    porcentajeFinanciadoObra,
    tasaObra,
    aniosObra,
    costosAdicionales,
  } = inputs

  // Hipoteca principal
  const capitalHipoteca = precioInmueble * (porcentajeFinanciado / 100)
  const cuotaMensualHipoteca = calcularCuotaMensual(capitalHipoteca, tasaHipoteca, aniosHipoteca)
  const nHipoteca = aniosHipoteca * 12
  const totalPagadoHipoteca = cuotaMensualHipoteca * nHipoteca
  const interesesTotalesHipoteca = totalPagadoHipoteca - capitalHipoteca

  // Obra
  const capitalObra = costoObra * (porcentajeFinanciadoObra / 100)
  const cuotaMensualObra = calcularCuotaMensual(capitalObra, tasaObra, aniosObra)
  const nObra = aniosObra * 12
  const totalPagadoObra = cuotaMensualObra * nObra
  const interesesTotalesObra = totalPagadoObra - capitalObra

  // Totales
  const cuotaTotalMensual = cuotaMensualHipoteca + cuotaMensualObra + costosAdicionales
  const interesesTotales = interesesTotalesHipoteca + interesesTotalesObra
  const totalPagado = totalPagadoHipoteca + totalPagadoObra

  // Inversion inicial
  const entrada = precioInmueble - capitalHipoteca
  const comision = precioInmueble * (comisionAgencia / 100)
  const gastos = precioInmueble * (gastosEscritura / 100)
  const inversionInicial = entrada + comision + gastos + (costoObra - capitalObra)

  // TAE
  const taeHipoteca = calcularTAE(tasaHipoteca)
  const taeObra = costoObra > 0 ? calcularTAE(tasaObra) : 0

  // Tablas
  const tablaHipoteca = calcularTablaAmortizacion(capitalHipoteca, tasaHipoteca, aniosHipoteca)
  const tablaObra = calcularTablaAmortizacion(capitalObra, tasaObra, aniosObra)

  return {
    capitalHipoteca,
    cuotaMensualHipoteca,
    interesesTotalesHipoteca,
    totalPagadoHipoteca,
    capitalObra,
    cuotaMensualObra,
    interesesTotalesObra,
    totalPagadoObra,
    cuotaTotalMensual,
    interesesTotales,
    totalPagado,
    entrada,
    comision,
    gastos,
    inversionInicial,
    taeHipoteca,
    taeObra,
    tablaHipoteca,
    tablaObra,
  }
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100)
}
