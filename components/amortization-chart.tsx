"use client"

import type { AmortizacionRow } from "@/lib/mortgage-types"
import { formatCurrency } from "@/lib/mortgage-calc"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

interface AmortizationChartProps {
  tabla: AmortizacionRow[]
  title: string
}

export default function AmortizationChart({ tabla, title }: AmortizationChartProps) {
  if (tabla.length === 0) return null

  // Sample data for performance - show every Nth point
  const step = Math.max(1, Math.floor(tabla.length / 120))
  const chartData = tabla
    .filter((_, i) => i % step === 0 || i === tabla.length - 1)
    .map((row) => ({
      mes: row.mes,
      ano: (row.mes / 12).toFixed(1),
      interes: Number(row.interes.toFixed(2)),
      amortizacion: Number(row.amortizacion.toFixed(2)),
      saldo: Number(row.saldoRestante.toFixed(2)),
    }))

  return (
    <div className="flex flex-col gap-4">
      <h4 className="font-serif text-base text-foreground">{title}</h4>

      {/* Interest vs Principal chart */}
      <div className="rounded-lg border border-border bg-background p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
          Composicion de la cuota mensual
        </p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`gradInteres-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(213, 55%, 35%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(213, 55%, 35%)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id={`gradAmort-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(43, 85%, 52%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(43, 85%, 52%)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(38, 30%, 84%)" />
              <XAxis
                dataKey="mes"
                tick={{ fontSize: 11, fill: "hsl(213, 20%, 46%)" }}
                tickLine={false}
                axisLine={{ stroke: "hsl(38, 30%, 84%)" }}
                label={{ value: "Mes", position: "insideBottomRight", offset: -5, fontSize: 11, fill: "hsl(213, 20%, 46%)" }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(213, 20%, 46%)" }}
                tickLine={false}
                axisLine={{ stroke: "hsl(38, 30%, 84%)" }}
                tickFormatter={(v: number) => `${v.toFixed(0)}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(42, 60%, 97%)",
                  border: "1px solid hsl(38, 30%, 84%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "hsl(213, 45%, 20%)",
                }}
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === "interes" ? "Intereses" : "Amortizacion",
                ]}
                labelFormatter={(label: number) => `Mes ${label}`}
              />
              <Legend
                verticalAlign="top"
                height={36}
                formatter={(value: string) =>
                  value === "interes" ? "Intereses" : "Amortizacion"
                }
              />
              <Area
                type="monotone"
                dataKey="interes"
                stroke="hsl(213, 55%, 35%)"
                strokeWidth={2}
                fill={`url(#gradInteres-${title})`}
              />
              <Area
                type="monotone"
                dataKey="amortizacion"
                stroke="hsl(43, 85%, 52%)"
                strokeWidth={2}
                fill={`url(#gradAmort-${title})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Saldo restante chart */}
      <div className="rounded-lg border border-border bg-background p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
          Saldo restante
        </p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`gradSaldo-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(213, 55%, 22%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(213, 55%, 22%)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(38, 30%, 84%)" />
              <XAxis
                dataKey="mes"
                tick={{ fontSize: 11, fill: "hsl(213, 20%, 46%)" }}
                tickLine={false}
                axisLine={{ stroke: "hsl(38, 30%, 84%)" }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(213, 20%, 46%)" }}
                tickLine={false}
                axisLine={{ stroke: "hsl(38, 30%, 84%)" }}
                tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(42, 60%, 97%)",
                  border: "1px solid hsl(38, 30%, 84%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "hsl(213, 45%, 20%)",
                }}
                formatter={(value: number) => [formatCurrency(value), "Saldo"]}
                labelFormatter={(label: number) => `Mes ${label}`}
              />
              <Area
                type="monotone"
                dataKey="saldo"
                stroke="hsl(213, 55%, 22%)"
                strokeWidth={2}
                fill={`url(#gradSaldo-${title})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
