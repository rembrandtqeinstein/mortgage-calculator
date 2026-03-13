"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { InputField } from "@/components/input-field"
import ResultsSummary from "@/components/results-summary"
import DecorativeBorder from "@/components/decorative-border"
import { calcularHipoteca, formatCurrency } from "@/lib/mortgage-calc"
import type { MortgageInputs, MortgageResults } from "@/lib/mortgage-types"
import { DEFAULT_INPUTS } from "@/lib/mortgage-types"
import { Trophy, Plus, X, Home, Landmark, Hammer, Check, RotateCcw } from "lucide-react"

interface Casa {
  id: string
  nombre: string
  inputs: MortgageInputs
}

interface CasaResultado {
  casa: Casa
  results: MortgageResults
}

interface HipotecaConfig {
  aniosHipoteca: number
  tasaHipoteca: number
}

const DEFAULT_CASA: Omit<Casa, "id"> = {
  nombre: "",
  inputs: { ...DEFAULT_INPUTS },
}

const DEFAULT_HIPOTECA: HipotecaConfig = {
  aniosHipoteca: 30,
  tasaHipoteca: 2,
}

const STORAGE_KEY = "comparador-casas"

export default function ComparadorCasas() {
  const [casas, setCasas] = useState<Casa[]>([{ id: "1", ...DEFAULT_CASA }])
  const [hipotecaConfig, setHipotecaConfig] = useState<HipotecaConfig>(DEFAULT_HIPOTECA)
  const [resultados, setResultados] = useState<CasaResultado[] | null>(null)
  const [isSaved, setIsSaved] = useState(false)

  // Load saved casas from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.casas && Array.isArray(parsed.casas) && parsed.casas.length > 0) {
          setCasas(parsed.casas)
        }
        if (parsed.hipotecaConfig) {
          setHipotecaConfig(parsed.hipotecaConfig)
        }
      }
    } catch {}
  }, [])

  const guardar = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ casas, hipotecaConfig }))
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 2000)
    } catch {}
  }

  const reiniciar = () => {
    setCasas([{ id: Date.now().toString(), ...DEFAULT_CASA }])
    setHipotecaConfig(DEFAULT_HIPOTECA)
    setResultados(null)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {}
  }

  const addCasa = () => {
    if (casas.length < 3) {
      setCasas((prev) => [...prev, { id: Date.now().toString(), ...DEFAULT_CASA }])
    }
  }

  const removeCasa = (id: string) => {
    if (casas.length > 1) {
      setCasas((prev) => prev.filter((c) => c.id !== id))
      setResultados(null)
    }
  }

  const updateCasaNombre = (id: string, nombre: string) => {
    setCasas((prev) => prev.map((c) => (c.id === id ? { ...c, nombre } : c)))
  }

  const updateCasaInputs = (id: string, inputs: MortgageInputs) => {
    setCasas((prev) => prev.map((c) => (c.id === id ? { ...c, inputs } : c)))
    setResultados(null)
  }

  const comparar = () => {
    const nuevosResultados: CasaResultado[] = casas.map((casa) => ({
      casa,
      results: calcularHipoteca({
        ...casa.inputs,
        aniosHipoteca: hipotecaConfig.aniosHipoteca,
        tasaHipoteca: hipotecaConfig.tasaHipoteca,
      }),
    }))
    setResultados(nuevosResultados)
  }

  // Find best options and calculate differences
  const mejorTotalPagado = resultados
    ? resultados.reduce((best, curr) => (curr.results.totalPagado < best.results.totalPagado ? curr : best))
    : null

  const segundoTotalPagado = resultados && mejorTotalPagado && resultados.length > 1
    ? resultados
        .filter((r) => r.casa.id !== mejorTotalPagado.casa.id)
        .reduce((best, curr) => (curr.results.totalPagado < best.results.totalPagado ? curr : best))
    : null

  const diferenciaTotalPagado = mejorTotalPagado && segundoTotalPagado
    ? segundoTotalPagado.results.totalPagado - mejorTotalPagado.results.totalPagado
    : 0

  const mejorInversionInicial = resultados
    ? resultados.reduce((best, curr) =>
        curr.results.inversionInicial < best.results.inversionInicial ? curr : best
      )
    : null

  const segundoInversionInicial = resultados && mejorInversionInicial && resultados.length > 1
    ? resultados
        .filter((r) => r.casa.id !== mejorInversionInicial.casa.id)
        .reduce((best, curr) => (curr.results.inversionInicial < best.results.inversionInicial ? curr : best))
    : null

  const diferenciaInversionInicial = mejorInversionInicial && segundoInversionInicial
    ? segundoInversionInicial.results.inversionInicial - mejorInversionInicial.results.inversionInicial
    : 0

  const mejorCuotaMensual = resultados
    ? resultados.reduce((best, curr) =>
        curr.results.cuotaTotalMensual < best.results.cuotaTotalMensual ? curr : best
      )
    : null

  const segundoCuotaMensual = resultados && mejorCuotaMensual && resultados.length > 1
    ? resultados
        .filter((r) => r.casa.id !== mejorCuotaMensual.casa.id)
        .reduce((best, curr) => (curr.results.cuotaTotalMensual < best.results.cuotaTotalMensual ? curr : best))
    : null

  const diferenciaCuotaMensual = mejorCuotaMensual && segundoCuotaMensual
    ? segundoCuotaMensual.results.cuotaTotalMensual - mejorCuotaMensual.results.cuotaTotalMensual
    : 0

  return (
    <div className="flex flex-col gap-8">
      {/* Hipoteca Configuration */}
      <Card className="relative border-border bg-card shadow-sm overflow-hidden">
        <DecorativeBorder />
        <CardHeader className="relative pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent">
              <Landmark className="w-4 h-4 text-accent-foreground" />
            </div>
            <CardTitle className="font-serif text-xl text-foreground">Configuración de Hipoteca</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Esta configuración se aplicará a todas las casas
          </p>
        </CardHeader>
        <CardContent className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
            <InputField
              id="hipoteca-anios"
              label="Plazo"
              value={hipotecaConfig.aniosHipoteca}
              onChange={(v) => setHipotecaConfig({ ...hipotecaConfig, aniosHipoteca: v })}
              suffix="años"
            />
            <InputField
              id="hipoteca-tasa"
              label="TIN (tasa anual)"
              value={hipotecaConfig.tasaHipoteca}
              onChange={(v) => setHipotecaConfig({ ...hipotecaConfig, tasaHipoteca: v })}
              suffix="%"
            />
          </div>
        </CardContent>
      </Card>

      {/* Casas */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-xl text-foreground">Casas a comparar</h3>
          {casas.length < 3 && (
            <Button onClick={addCasa} variant="outline" size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Agregar casa
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {casas.map((casa) => (
            <Card key={casa.id} className="relative border-border bg-card shadow-sm overflow-hidden">
              <DecorativeBorder />
              {casas.length > 1 && (
                <button
                  onClick={() => removeCasa(casa.id)}
                  className="absolute top-3 right-3 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-muted hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Eliminar casa"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <CardHeader className="relative pb-4">
                <div className="flex flex-col gap-2 pr-8">
                  <Label htmlFor={`casa-nombre-${casa.id}`} className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Nombre de la propiedad
                  </Label>
                  <Input
                    id={`casa-nombre-${casa.id}`}
                    type="text"
                    value={casa.nombre}
                    onChange={(e) => updateCasaNombre(casa.id, e.target.value)}
                    placeholder="Ej: Casa Chamberí"
                    className="bg-background border-border h-11 text-foreground font-medium focus-visible:ring-accent"
                  />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <CasaForm casaId={casa.id} inputs={casa.inputs} onChange={(inputs) => updateCasaInputs(casa.id, inputs)} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-center items-center gap-4">
        <Button
          onClick={guardar}
          size="lg"
          variant="outline"
          className="px-8 font-semibold border-border gap-2"
        >
          {isSaved ? (
            <>
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-green-600">Guardado</span>
            </>
          ) : (
            "Guardar"
          )}
        </Button>
        <Button
          onClick={comparar}
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 font-semibold"
        >
          Comparar casas
        </Button>
        <Button
          onClick={reiniciar}
          size="lg"
          variant="outline"
          className="px-8 font-semibold border-border gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Reiniciar
        </Button>
      </div>

      {/* Results */}
      {resultados && (
        <div className="flex flex-col gap-6">
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Costo Total */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-base text-foreground">Costo Total</CardTitle>
                {diferenciaTotalPagado > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Diferencia: {formatCurrency(diferenciaTotalPagado)}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-border bg-background p-4">
                  {resultados.map(({ casa, results }, index) => {
                    const isBest = mejorTotalPagado?.casa.id === casa.id
                    return (
                      <div key={casa.id}>
                        {index > 0 && <Separator className="bg-border my-2" />}
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-muted-foreground flex items-center gap-2">
                            {isBest && <Trophy className="w-4 h-4 text-primary flex-shrink-0" />}
                            {casa.nombre || "Sin nombre"}
                          </span>
                          <span className={`text-sm font-semibold tabular-nums ${isBest ? "text-primary" : "text-foreground"}`}>
                            {formatCurrency(results.totalPagado)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Inversión Inicial */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-base text-foreground">Inversión Inicial</CardTitle>
                {diferenciaInversionInicial > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Diferencia: {formatCurrency(diferenciaInversionInicial)}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-border bg-background p-4">
                  {resultados.map(({ casa, results }, index) => {
                    const isBest = mejorInversionInicial?.casa.id === casa.id
                    return (
                      <div key={casa.id}>
                        {index > 0 && <Separator className="bg-border my-2" />}
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-muted-foreground flex items-center gap-2">
                            {isBest && <Trophy className="w-4 h-4 text-primary flex-shrink-0" />}
                            {casa.nombre || "Sin nombre"}
                          </span>
                          <span className={`text-sm font-semibold tabular-nums ${isBest ? "text-primary" : "text-foreground"}`}>
                            {formatCurrency(results.inversionInicial)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Cuota Mensual */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-base text-foreground">Cuota Mensual</CardTitle>
                {diferenciaCuotaMensual > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Diferencia: {formatCurrency(diferenciaCuotaMensual)}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-border bg-background p-4">
                  {resultados.map(({ casa, results }, index) => {
                    const isBest = mejorCuotaMensual?.casa.id === casa.id
                    return (
                      <div key={casa.id}>
                        {index > 0 && <Separator className="bg-border my-2" />}
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-muted-foreground flex items-center gap-2">
                            {isBest && <Trophy className="w-4 h-4 text-primary flex-shrink-0" />}
                            {casa.nombre || "Sin nombre"}
                          </span>
                          <span className={`text-sm font-semibold tabular-nums ${isBest ? "text-primary" : "text-foreground"}`}>
                            {formatCurrency(results.cuotaTotalMensual)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Individual results */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {resultados.map(({ casa, results }) => {
              const isBestTotal = mejorTotalPagado?.casa.id === casa.id
              const isBestInicial = mejorInversionInicial?.casa.id === casa.id
              const isBestCuota = mejorCuotaMensual?.casa.id === casa.id
              const hasTrophy = isBestTotal || isBestInicial || isBestCuota

              return (
                <Card
                  key={casa.id}
                  className={`relative border-border bg-card shadow-sm overflow-hidden ${
                    hasTrophy ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <DecorativeBorder />
                  <CardHeader className="relative pb-4">
                    <div className="flex items-center gap-2">
                      {hasTrophy && <Trophy className="w-5 h-5 text-primary flex-shrink-0" />}
                      <CardTitle className="font-serif text-xl text-foreground">
                        {casa.nombre || "Casa sin nombre"}
                      </CardTitle>
                    </div>
                    {hasTrophy && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {isBestTotal && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            Mejor costo total
                          </span>
                        )}
                        {isBestInicial && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            Mejor inversión inicial
                          </span>
                        )}
                        {isBestCuota && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            Mejor cuota mensual
                          </span>
                        )}
                      </div>
                    )}
                  </CardHeader>
                  <Separator className="bg-border mx-6" />
                  <CardContent className="relative pt-6">
                    <ResultsSummary results={results} />
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// Simplified form for casa comparison
function CasaForm({ casaId, inputs, onChange }: { casaId: string; inputs: MortgageInputs; onChange: (inputs: MortgageInputs) => void }) {
  const update = (field: keyof MortgageInputs, value: number) => {
    onChange({ ...inputs, [field]: value })
  }

  const round3 = (num: number) => Math.round(num * 1000) / 1000

  const updateComisionAgencia = (percentage: number) => {
    const costoAgencia = Math.round(inputs.precioInmueble * (percentage / 100))
    onChange({ ...inputs, comisionAgencia: round3(percentage), costoAgencia })
  }

  const updateCostoAgencia = (cost: number) => {
    const comisionAgencia = inputs.precioInmueble > 100
      ? round3((cost / inputs.precioInmueble) * 100)
      : 0
    onChange({ ...inputs, costoAgencia: Math.round(cost), comisionAgencia })
  }

  const updateGastosEscritura = (percentage: number) => {
    const costosCompra = Math.round(inputs.precioInmueble * (percentage / 100))
    onChange({ ...inputs, gastosEscritura: round3(percentage), costosCompra })
  }

  const updateCostosCompra = (cost: number) => {
    const gastosEscritura = inputs.precioInmueble > 100
      ? round3((cost / inputs.precioInmueble) * 100)
      : 0
    onChange({ ...inputs, costosCompra: Math.round(cost), gastosEscritura })
  }

  const updatePrecioInmueble = (precio: number) => {
    const costoAgencia = Math.round(precio * (inputs.comisionAgencia / 100))
    const costosCompra = Math.round(precio * (inputs.gastosEscritura / 100))
    onChange({ ...inputs, precioInmueble: Math.round(precio), costoAgencia, costosCompra })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Inmueble */}
      <section>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-primary">
            <Home className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <h4 className="font-serif text-base text-foreground">Inmueble</h4>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <InputField
            id={`precio-${casaId}`}
            label="Precio del inmueble"
            value={inputs.precioInmueble}
            onChange={updatePrecioInmueble}
            suffix="EUR"
          />
          <InputField
            id={`financiado-${casaId}`}
            label="% Financiado"
            value={inputs.porcentajeFinanciado}
            onChange={(v) => update("porcentajeFinanciado", v)}
            suffix="%"
          />
          <div className="grid grid-cols-2 gap-3">
            <InputField
              id={`costoAgencia-${casaId}`}
              label="Costo Agencia"
              value={inputs.costoAgencia}
              onChange={updateCostoAgencia}
              suffix="EUR"
            />
            <InputField
              id={`comision-${casaId}`}
              label="Comisión Agencia"
              value={inputs.comisionAgencia}
              onChange={updateComisionAgencia}
              suffix="%"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <InputField
              id={`costosCompra-${casaId}`}
              label="Costos de Compra ($)"
              value={inputs.costosCompra}
              onChange={updateCostosCompra}
              suffix="EUR"
            />
            <InputField
              id={`escritura-${casaId}`}
              label="Costos de Compra (%)"
              value={inputs.gastosEscritura}
              onChange={updateGastosEscritura}
              suffix="%"
            />
          </div>
          <InputField
            id={`adicionales-${casaId}`}
            label="Costos adicionales / mes"
            value={inputs.costosAdicionales}
            onChange={(v) => update("costosAdicionales", v)}
            suffix="EUR"
          />
        </div>
      </section>

      <Separator className="bg-border" />

      {/* Obra */}
      <section>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-secondary">
            <Hammer className="w-3.5 h-3.5 text-secondary-foreground" />
          </div>
          <h4 className="font-serif text-base text-foreground">Obra (opcional)</h4>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <InputField
            id={`costoObra-${casaId}`}
            label="Costo de obra"
            value={inputs.costoObra}
            onChange={(v) => update("costoObra", v)}
            suffix="EUR"
          />
          <InputField
            id={`financiadoObra-${casaId}`}
            label="% Financiado obra"
            value={inputs.porcentajeFinanciadoObra}
            onChange={(v) => update("porcentajeFinanciadoObra", v)}
            suffix="%"
          />
          <InputField
            id={`tasaObra-${casaId}`}
            label="TIN obra"
            value={inputs.tasaObra}
            onChange={(v) => update("tasaObra", v)}
            suffix="%"
          />
          <InputField
            id={`aniosObra-${casaId}`}
            label="Plazo obra"
            value={inputs.aniosObra}
            onChange={(v) => update("aniosObra", v)}
            suffix="años"
          />
        </div>
      </section>
    </div>
  )
}
