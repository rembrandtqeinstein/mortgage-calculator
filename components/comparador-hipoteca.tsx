"use client"

import { useState } from "react"
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
import { Trophy, Plus, X } from "lucide-react"

interface Oferta {
  id: string
  nombreBanco: string
  porcentajeFinanciado: number
  aniosHipoteca: number
  tasaHipoteca: number
}

interface ComparadorResultado {
  oferta: Oferta
  results: MortgageResults
}

interface ComparadorHipotecaProps {
  inputs: MortgageInputs
  onChange: (inputs: MortgageInputs) => void
}

const DEFAULT_OFERTA: Omit<Oferta, "id"> = {
  nombreBanco: "",
  porcentajeFinanciado: 80,
  aniosHipoteca: 30,
  tasaHipoteca: 2,
}

export default function ComparadorHipoteca({ inputs, onChange }: ComparadorHipotecaProps) {
  const [ofertas, setOfertas] = useState<Oferta[]>([
    { id: "1", ...DEFAULT_OFERTA },
  ])
  const [resultados, setResultados] = useState<ComparadorResultado[] | null>(null)

  const updatePrecioInmueble = (precio: number) => {
    const costoAgencia = Math.round(precio * (inputs.comisionAgencia / 100))
    const costosCompra = Math.round(precio * (inputs.gastosEscritura / 100))
    onChange({ ...inputs, precioInmueble: Math.round(precio), costoAgencia, costosCompra })
  }

  const addOferta = () => {
    setOfertas((prev) => [...prev, { id: Date.now().toString(), ...DEFAULT_OFERTA }])
  }

  const removeOferta = (id: string) => {
    if (ofertas.length > 1) {
      setOfertas((prev) => prev.filter((o) => o.id !== id))
      setResultados(null)
    }
  }

  const updateOfertaNumeric = (id: string, field: keyof Omit<Oferta, "id" | "nombreBanco">, value: number) => {
    setOfertas((prev) => prev.map((o) => (o.id === id ? { ...o, [field]: value } : o)))
    setResultados(null)
  }

  const updateOfertaBanco = (id: string, value: string) => {
    setOfertas((prev) => prev.map((o) => (o.id === id ? { ...o, nombreBanco: value } : o)))
  }

  const comparar = () => {
    const nuevosResultados: ComparadorResultado[] = ofertas.map((oferta) => ({
      oferta,
      results: calcularHipoteca({
        ...inputs,
        porcentajeFinanciado: oferta.porcentajeFinanciado,
        aniosHipoteca: oferta.aniosHipoteca,
        tasaHipoteca: oferta.tasaHipoteca,
      }),
    }))
    setResultados(nuevosResultados)
  }

  const mejorOferta = resultados
    ? resultados.reduce((best, curr) =>
        curr.results.cuotaTotalMensual < best.results.cuotaTotalMensual ? curr : best
      )
    : null

  return (
    <div className="flex flex-col gap-8">
      {/* Precio inmueble */}
      <Card className="relative border-border bg-card shadow-sm overflow-hidden">
        <DecorativeBorder />
        <CardContent className="relative pt-6 max-w-sm">
          <InputField
            id="comp-precio"
            label="Precio del inmueble"
            value={inputs.precioInmueble}
            onChange={updatePrecioInmueble}
            suffix="EUR"
          />
        </CardContent>
      </Card>

      {/* Ofertas */}
      <div>
        <h3 className="font-serif text-xl text-foreground mb-4">Ofertas</h3>
        <div className="flex flex-row gap-4 items-start overflow-x-auto pb-2">
          {ofertas.map((oferta) => (
            <Card
              key={oferta.id}
              className="relative border-border bg-card shadow-sm overflow-hidden flex-shrink-0 w-72"
            >
              <DecorativeBorder />
              {ofertas.length > 1 && (
                <button
                  onClick={() => removeOferta(oferta.id)}
                  className="absolute top-3 right-3 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-muted hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Eliminar oferta"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <CardContent className="relative pt-6 flex flex-col gap-4">
                {/* Nombre del banco */}
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor={`banco-${oferta.id}`}
                    className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    Nombre del banco
                  </Label>
                  <Input
                    id={`banco-${oferta.id}`}
                    type="text"
                    value={oferta.nombreBanco}
                    onChange={(e) => updateOfertaBanco(oferta.id, e.target.value)}
                    placeholder="Ej: Santander"
                    className="bg-background border-border h-11 text-foreground font-medium focus-visible:ring-accent"
                  />
                </div>
                <InputField
                  id={`comp-financiado-${oferta.id}`}
                  label="% Financiado"
                  value={oferta.porcentajeFinanciado}
                  onChange={(v) => updateOfertaNumeric(oferta.id, "porcentajeFinanciado", v)}
                  suffix="%"
                />
                <InputField
                  id={`comp-plazo-${oferta.id}`}
                  label="Hipoteca Plazo"
                  value={oferta.aniosHipoteca}
                  onChange={(v) => updateOfertaNumeric(oferta.id, "aniosHipoteca", v)}
                  suffix="anos"
                />
                <InputField
                  id={`comp-tin-${oferta.id}`}
                  label="Hipoteca TIN"
                  value={oferta.tasaHipoteca}
                  onChange={(v) => updateOfertaNumeric(oferta.id, "tasaHipoteca", v)}
                  suffix="%"
                />
              </CardContent>
            </Card>
          ))}

          {/* Add offer button */}
          <button
            onClick={addOferta}
            className="flex-shrink-0 self-center mt-2 w-12 h-12 rounded-full border-2 border-dashed border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-center"
            aria-label="Agregar oferta"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Comparar button */}
      <div className="flex justify-center">
        <Button
          onClick={comparar}
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-10 font-semibold"
        >
          Comparar
        </Button>
      </div>

      {/* Results */}
      {resultados && (
        <div className="flex flex-col gap-6">
          {/* Recommendation */}
          {mejorOferta && (
            <div className="flex items-center gap-3 rounded-lg bg-primary/10 border border-primary/30 p-4">
              <Trophy className="w-6 h-6 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Mejor oferta:{" "}
                  <span className="text-primary">
                    {mejorOferta.oferta.nombreBanco || "Oferta sin nombre"}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Cuota mensual total:{" "}
                  <span className="font-semibold text-foreground">
                    {formatCurrency(mejorOferta.results.cuotaTotalMensual)}
                  </span>
                  {" · "}
                  {mejorOferta.oferta.tasaHipoteca}% TIN · {mejorOferta.oferta.aniosHipoteca} años · {mejorOferta.oferta.porcentajeFinanciado}% financiado
                </p>
              </div>
            </div>
          )}

          {/* Individual results side by side */}
          <div className="flex flex-row gap-6 overflow-x-auto pb-2">
            {resultados.map(({ oferta, results }) => (
              <Card
                key={oferta.id}
                className={`relative border-border bg-card shadow-sm overflow-hidden flex-shrink-0 w-96 ${
                  mejorOferta?.oferta.id === oferta.id
                    ? "ring-2 ring-primary"
                    : ""
                }`}
              >
                <DecorativeBorder />
                <CardHeader className="relative pb-2">
                  <div className="flex items-center gap-2">
                    {mejorOferta?.oferta.id === oferta.id && (
                      <Trophy className="w-4 h-4 text-primary flex-shrink-0" />
                    )}
                    <CardTitle className="font-serif text-xl text-foreground">
                      {oferta.nombreBanco || "Oferta sin nombre"}
                    </CardTitle>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {oferta.tasaHipoteca}% TIN · {oferta.aniosHipoteca} años · {oferta.porcentajeFinanciado}% financiado
                  </p>
                </CardHeader>
                <Separator className="bg-border mx-6" />
                <CardContent className="relative pt-4">
                  <ResultsSummary results={results} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
