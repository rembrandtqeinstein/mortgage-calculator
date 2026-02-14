"use client"

import type { MortgageResults } from "@/lib/mortgage-types"
import { formatCurrency, formatPercent } from "@/lib/mortgage-calc"
import { Separator } from "@/components/ui/separator"

interface ResultsSummaryProps {
  results: MortgageResults
}

function StatCard({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div
      className={`flex flex-col gap-1 rounded-lg p-4 ${
        highlight
          ? "bg-primary text-primary-foreground"
          : "bg-muted"
      }`}
    >
      <span className={`text-xs font-medium uppercase tracking-wider ${highlight ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
        {label}
      </span>
      <span className={`text-lg font-semibold tabular-nums ${highlight ? "text-primary-foreground" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground tabular-nums">{value}</span>
    </div>
  )
}

export default function ResultsSummary({ results }: ResultsSummaryProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Key metrics */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Cuota mensual total"
          value={formatCurrency(results.cuotaTotalMensual)}
          highlight
        />
        <StatCard
          label="Inversion inicial"
          value={formatCurrency(results.inversionInicial)}
          highlight
        />
        <StatCard
          label="Intereses totales"
          value={formatCurrency(results.interesesTotales)}
        />
        <StatCard
          label="Total pagado"
          value={formatCurrency(results.totalPagado)}
        />
      </div>

      {/* Desglose inversion inicial */}
      <div>
        <h4 className="font-serif text-base text-foreground mb-2">Desglose inversion inicial</h4>
        <div className="rounded-lg border border-border bg-background p-4">
          <DetailRow label="Entrada (aporte propio)" value={formatCurrency(results.entrada)} />
          <Separator className="bg-border" />
          <DetailRow label="Comision agencia" value={formatCurrency(results.comision)} />
          <Separator className="bg-border" />
          <DetailRow label="Costos de Compra" value={formatCurrency(results.gastos)} />
          {results.capitalObra > 0 && (
            <>
              <Separator className="bg-border" />
              <DetailRow
                label="Aporte obra (no financiado)"
                value={formatCurrency(
                  results.capitalObra > 0
                    ? (results.totalPagadoObra > 0
                      ? results.inversionInicial - results.entrada - results.comision - results.gastos
                      : 0)
                    : 0
                )}
              />
            </>
          )}
        </div>
      </div>

      {/* Hipoteca */}
      <div>
        <h4 className="font-serif text-base text-foreground mb-2">Hipoteca</h4>
        <div className="rounded-lg border border-border bg-background p-4">
          <DetailRow label="Capital prestado" value={formatCurrency(results.capitalHipoteca)} />
          <Separator className="bg-border" />
          <DetailRow label="Cuota mensual" value={formatCurrency(results.cuotaMensualHipoteca)} />
          <Separator className="bg-border" />
          <DetailRow label="Intereses totales" value={formatCurrency(results.interesesTotalesHipoteca)} />
          <Separator className="bg-border" />
          <DetailRow label="Total pagado" value={formatCurrency(results.totalPagadoHipoteca)} />
          <Separator className="bg-border" />
          <DetailRow label="TAE" value={formatPercent(results.taeHipoteca)} />
        </div>
      </div>

      {/* Obra (solo si hay) */}
      {results.capitalObra > 0 && (
        <div>
          <h4 className="font-serif text-base text-foreground mb-2">Prestamo obra</h4>
          <div className="rounded-lg border border-border bg-background p-4">
            <DetailRow label="Capital prestado" value={formatCurrency(results.capitalObra)} />
            <Separator className="bg-border" />
            <DetailRow label="Cuota mensual" value={formatCurrency(results.cuotaMensualObra)} />
            <Separator className="bg-border" />
            <DetailRow label="Intereses totales" value={formatCurrency(results.interesesTotalesObra)} />
            <Separator className="bg-border" />
            <DetailRow label="Total pagado" value={formatCurrency(results.totalPagadoObra)} />
            <Separator className="bg-border" />
            <DetailRow label="TAE" value={formatPercent(results.taeObra)} />
          </div>
        </div>
      )}

      {/* Inversion (solo si hay monto invertido) */}
      {results.montoInvertido > 0 && (
        <div>
          <h4 className="font-serif text-base text-foreground mb-2">Analisis de inversion</h4>
          <div className="rounded-lg border border-border bg-background p-4">
            <DetailRow label="Monto invertido" value={formatCurrency(results.montoInvertido)} />
            <Separator className="bg-border" />
            <DetailRow label="Tasa neta inversion" value={formatPercent(results.tasaNetaInversion)} />
            <Separator className="bg-border" />
            <DetailRow label="Valor futuro inversion" value={formatCurrency(results.valorFuturoInversion)} />
            <Separator className="bg-border" />
            <DetailRow
              label="VPN estrategia financiar"
              value={formatCurrency(results.vpnEstrategia)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
