"use client"

import { useState } from "react"
import type { AmortizacionRow } from "@/lib/mortgage-types"
import { formatCurrency } from "@/lib/mortgage-calc"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"

interface AmortizationTableProps {
  tabla: AmortizacionRow[]
  title: string
}

export default function AmortizationTable({ tabla, title }: AmortizationTableProps) {
  const [expanded, setExpanded] = useState(false)
  const [showMonths, setShowMonths] = useState(false)

  if (tabla.length === 0) return null

  // Group by year
  const years: { year: number; rows: AmortizacionRow[] }[] = []
  for (const row of tabla) {
    const year = Math.ceil(row.mes / 12)
    const existing = years.find((y) => y.year === year)
    if (existing) {
      existing.rows.push(row)
    } else {
      years.push({ year, rows: [row] })
    }
  }

  // Annual summary
  const annualData = years.map(({ year, rows }) => {
    const interesAnual = rows.reduce((acc, r) => acc + r.interes, 0)
    const amortAnual = rows.reduce((acc, r) => acc + r.amortizacion, 0)
    const cuotaAnual = rows.reduce((acc, r) => acc + r.cuota, 0)
    const saldoFin = rows[rows.length - 1].saldoRestante
    return { year, interesAnual, amortAnual, cuotaAnual, saldoFin, rows }
  })

  const displayData = expanded ? annualData : annualData.slice(0, 5)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h4 className="font-serif text-base text-foreground">{title}</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowMonths(!showMonths)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          {showMonths ? "Ver anual" : "Ver mensual"}
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-background overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {showMonths ? "Mes" : "Ano"}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Cuota
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Intereses
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Amortizacion
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Saldo
                </th>
              </tr>
            </thead>
            <tbody>
              {showMonths
                ? (expanded ? tabla : tabla.slice(0, 24)).map((row) => (
                    <tr
                      key={row.mes}
                      className="border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-4 py-2.5 text-foreground tabular-nums">{row.mes}</td>
                      <td className="px-4 py-2.5 text-right text-foreground tabular-nums">
                        {formatCurrency(row.cuota)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums" style={{ color: "hsl(213, 55%, 35%)" }}>
                        {formatCurrency(row.interes)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums" style={{ color: "hsl(43, 75%, 40%)" }}>
                        {formatCurrency(row.amortizacion)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground tabular-nums">
                        {formatCurrency(row.saldoRestante)}
                      </td>
                    </tr>
                  ))
                : displayData.map((y) => (
                    <tr
                      key={y.year}
                      className="border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-4 py-2.5 text-foreground font-medium tabular-nums">
                        {y.year}
                      </td>
                      <td className="px-4 py-2.5 text-right text-foreground tabular-nums">
                        {formatCurrency(y.cuotaAnual)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums" style={{ color: "hsl(213, 55%, 35%)" }}>
                        {formatCurrency(y.interesAnual)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums" style={{ color: "hsl(43, 75%, 40%)" }}>
                        {formatCurrency(y.amortAnual)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-muted-foreground tabular-nums">
                        {formatCurrency(y.saldoFin)}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {((showMonths && tabla.length > 24) || (!showMonths && annualData.length > 5)) && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-center gap-1.5 w-full py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted transition-colors border-t border-border"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                Mostrar menos
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                Mostrar todo
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
