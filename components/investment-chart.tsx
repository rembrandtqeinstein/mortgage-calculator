"use client"

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
  ReferenceLine,
} from "recharts"

interface InvestmentChartProps {
  montoInvertido: number
  tasaNetaInversion: number
  plazoAnios: number
  cuotaAnualObra: number
}

export default function InvestmentChart({
  montoInvertido,
  tasaNetaInversion,
  plazoAnios,
  cuotaAnualObra,
}: InvestmentChartProps) {
  if (montoInvertido <= 0 || plazoAnios <= 0) return null

  const rNeto = tasaNetaInversion / 100

  // Generate year-by-year data
  const chartData = []
  let acumuladoInversion = montoInvertido
  let acumuladoCuotas = 0

  for (let anio = 0; anio <= plazoAnios; anio++) {
    const valorInversion = montoInvertido * Math.pow(1 + rNeto, anio)
    acumuladoCuotas = anio > 0 ? acumuladoCuotas + cuotaAnualObra : 0
    const gananciaInversion = valorInversion - montoInvertido
    const retornoNeto = valorInversion - acumuladoCuotas

    chartData.push({
      anio,
      valorInversion: Number(valorInversion.toFixed(2)),
      costoAcumulado: Number(acumuladoCuotas.toFixed(2)),
      ganancia: Number(gananciaInversion.toFixed(2)),
      retornoNeto: Number(retornoNeto.toFixed(2)),
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <h4 className="font-serif text-base text-foreground">Retorno de inversion</h4>

      {/* Investment growth vs accumulated loan cost */}
      <div className="rounded-lg border border-border bg-background p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
          Valor de inversion vs costo acumulado del prestamo
        </p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradInversion" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(152, 55%, 35%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(152, 55%, 35%)" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gradCosto" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0, 60%, 45%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(0, 60%, 45%)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(38, 30%, 84%)" />
              <XAxis
                dataKey="anio"
                tick={{ fontSize: 11, fill: "hsl(213, 20%, 46%)" }}
                tickLine={false}
                axisLine={{ stroke: "hsl(38, 30%, 84%)" }}
                label={{
                  value: "Ano",
                  position: "insideBottomRight",
                  offset: -5,
                  fontSize: 11,
                  fill: "hsl(213, 20%, 46%)",
                }}
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
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    valorInversion: "Valor inversion",
                    costoAcumulado: "Cuotas acumuladas",
                  }
                  return [formatCurrency(value), labels[name] || name]
                }}
                labelFormatter={(label: number) => `Ano ${label}`}
              />
              <Legend
                verticalAlign="top"
                height={36}
                formatter={(value: string) => {
                  const labels: Record<string, string> = {
                    valorInversion: "Valor inversion",
                    costoAcumulado: "Cuotas acumuladas",
                  }
                  return labels[value] || value
                }}
              />
              <ReferenceLine
                y={montoInvertido}
                stroke="hsl(213, 20%, 46%)"
                strokeDasharray="6 4"
                strokeWidth={1}
                label={{
                  value: "Monto inicial",
                  position: "insideTopRight",
                  fontSize: 10,
                  fill: "hsl(213, 20%, 46%)",
                }}
              />
              <Area
                type="monotone"
                dataKey="valorInversion"
                stroke="hsl(152, 55%, 35%)"
                strokeWidth={2}
                fill="url(#gradInversion)"
              />
              <Area
                type="monotone"
                dataKey="costoAcumulado"
                stroke="hsl(0, 60%, 45%)"
                strokeWidth={2}
                fill="url(#gradCosto)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Net return chart */}
      <div className="rounded-lg border border-border bg-background p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
          Retorno neto (inversion - cuotas acumuladas)
        </p>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradRetorno" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(213, 55%, 35%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(213, 55%, 35%)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(38, 30%, 84%)" />
              <XAxis
                dataKey="anio"
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
                formatter={(value: number) => [formatCurrency(value), "Retorno neto"]}
                labelFormatter={(label: number) => `Ano ${label}`}
              />
              <ReferenceLine y={0} stroke="hsl(0, 60%, 45%)" strokeDasharray="4 4" strokeWidth={1} />
              <Area
                type="monotone"
                dataKey="retornoNeto"
                stroke="hsl(213, 55%, 35%)"
                strokeWidth={2}
                fill="url(#gradRetorno)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
