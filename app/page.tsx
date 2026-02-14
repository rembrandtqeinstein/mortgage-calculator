"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import CalculatorForm from "@/components/calculator-form"
import ResultsSummary from "@/components/results-summary"
import AmortizationChart from "@/components/amortization-chart"
import InvestmentChart from "@/components/investment-chart"
import AmortizationTable from "@/components/amortization-table"
import DecorativeBorder from "@/components/decorative-border"
import { calcularHipoteca } from "@/lib/mortgage-calc"
import { DEFAULT_INPUTS, type MortgageInputs } from "@/lib/mortgage-types"

function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 60" fill="none" aria-hidden="true">
      <circle cx="30" cy="30" r="10" fill="currentColor" opacity="0.2" />
      <circle cx="30" cy="30" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180
        const x1 = 30 + Math.cos(angle) * 13
        const y1 = 30 + Math.sin(angle) * 13
        const x2 = 30 + Math.cos(angle) * 18
        const y2 = 30 + Math.sin(angle) * 18
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      })}
    </svg>
  )
}

function DiamondDivider() {
  return (
    <div className="flex items-center gap-3 py-2" aria-hidden="true">
      <div className="flex-1 h-px bg-border" />
      <div className="w-2 h-2 rotate-45 bg-accent" />
      <div className="w-1.5 h-1.5 rotate-45 bg-accent/50" />
      <div className="w-2 h-2 rotate-45 bg-accent" />
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}

export default function Page() {
  const [inputs, setInputs] = useState<MortgageInputs>(DEFAULT_INPUTS)

  const results = useMemo(() => calcularHipoteca(inputs), [inputs])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="relative border-b border-border bg-card overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <SunIcon className="absolute -top-4 -right-4 w-28 h-28 text-accent opacity-20" />
          <SunIcon className="absolute -bottom-6 -left-6 w-20 h-20 text-accent opacity-15" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="flex items-center gap-3">
              <SunIcon className="w-10 h-10 text-accent" />
              <h1 className="font-serif text-3xl sm:text-4xl text-foreground text-balance">
                Calculadora Hipotecaria
              </h1>
              <SunIcon className="w-10 h-10 text-accent" />
            </div>
            <p className="text-sm sm:text-base text-muted-foreground max-w-lg text-pretty">
              Calcula y desglosa todos los costos de la compra de tu vivienda en Madrid
            </p>
            <DiamondDivider />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form panel */}
          <div className="lg:col-span-5">
            <Card className="relative border-border bg-card shadow-sm overflow-hidden">
              <DecorativeBorder />
              <CardHeader className="relative pb-4">
                <CardTitle className="font-serif text-xl text-foreground">
                  Datos de la operacion
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Completa los campos para simular tu hipoteca
                </p>
              </CardHeader>
              <CardContent className="relative">
                <CalculatorForm inputs={inputs} onChange={setInputs} />
              </CardContent>
            </Card>
          </div>

          {/* Results panel */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <Card className="relative border-border bg-card shadow-sm overflow-hidden">
              <DecorativeBorder />
              <CardHeader className="relative pb-4">
                <CardTitle className="font-serif text-xl text-foreground">
                  Resumen financiero
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <ResultsSummary results={results} />
              </CardContent>
            </Card>

            {/* Charts & Tables */}
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="font-serif text-xl text-foreground">
                  Amortizacion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="charts" className="w-full">
                  <TabsList className="w-full bg-muted">
                    <TabsTrigger value="charts" className="flex-1 text-xs data-[state=active]:bg-card data-[state=active]:text-foreground">
                      Graficos
                    </TabsTrigger>
                    <TabsTrigger value="table" className="flex-1 text-xs data-[state=active]:bg-card data-[state=active]:text-foreground">
                      Tabla
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="charts" className="mt-6 flex flex-col gap-8">
                    <AmortizationChart
                      tabla={results.tablaHipoteca}
                      title="Hipoteca principal"
                    />
                    {results.capitalObra > 0 && (
                      <AmortizationChart
                        tabla={results.tablaObra}
                        title="Prestamo obra"
                      />
                    )}
                    {results.montoInvertido > 0 && (
                      <InvestmentChart
                        montoInvertido={results.montoInvertido}
                        tasaNetaInversion={results.tasaNetaInversion}
                        plazoAnios={inputs.aniosObra}
                        cuotaAnualObra={results.cuotaMensualObra * 12}
                      />
                    )}
                  </TabsContent>

                  <TabsContent value="table" className="mt-6 flex flex-col gap-8">
                    <AmortizationTable
                      tabla={results.tablaHipoteca}
                      title="Tabla de amortizacion - Hipoteca"
                    />
                    {results.capitalObra > 0 && (
                      <AmortizationTable
                        tabla={results.tablaObra}
                        title="Tabla de amortizacion - Obra"
                      />
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <SunIcon className="w-5 h-5 text-accent" />
              <span className="text-xs text-muted-foreground">Calculadora Hipotecaria Madrid</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Simulacion orientativa. Consulta con tu entidad bancaria para valores exactos.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
