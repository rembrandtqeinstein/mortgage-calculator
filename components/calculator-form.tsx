"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import type { MortgageInputs } from "@/lib/mortgage-types"
import { Home, Landmark, Hammer, TrendingUp } from "lucide-react"

interface CalculatorFormProps {
  inputs: MortgageInputs
  onChange: (inputs: MortgageInputs) => void
}

function InputField({
  label,
  value,
  onChange,
  suffix,
  id,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  suffix?: string
  id: string
}) {
  const formatDisplayValue = (val: number): string => {
    if (!val && val !== 0) return ""

    // For percentages, show up to 3 decimal places
    if (suffix === "%") {
      return val.toLocaleString("es-ES", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3,
      })
    }

    // For currency/numbers, show with thousand separators
    return val.toLocaleString("es-ES", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
  }

  const [displayValue, setDisplayValue] = React.useState(formatDisplayValue(value))
  const [isFocused, setIsFocused] = React.useState(false)
  const lastValueRef = React.useRef(value)

  React.useEffect(() => {
    // Only update display if not focused AND the value prop actually changed
    if (!isFocused && Math.abs(value - lastValueRef.current) > 0.001) {
      setDisplayValue(formatDisplayValue(value))
      lastValueRef.current = value
    }
  }, [value, isFocused])

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    // Show raw number when focused for easier editing
    // Store the current value as the last known good value
    lastValueRef.current = value
    setDisplayValue(value ? value.toString() : "")
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)

    // Clean the input: remove thousand separators (.) and replace decimal comma with dot
    let cleanValue = e.target.value.trim()

    // If the display value is exactly the same as when we focused, don't do anything
    const expectedDisplayOnFocus = value ? value.toString() : ""
    if (cleanValue === expectedDisplayOnFocus) {
      // User didn't change anything, just restore formatted display
      setDisplayValue(formatDisplayValue(value))
      return
    }

    // If empty, set to 0
    if (cleanValue === "") {
      if (value !== 0) {
        onChange(0)
        lastValueRef.current = 0
      }
      setDisplayValue(formatDisplayValue(0))
      return
    }

    // Remove all dots (thousand separators)
    cleanValue = cleanValue.replace(/\./g, "")

    // Replace comma with dot for decimal separator
    cleanValue = cleanValue.replace(",", ".")

    // Remove any spaces
    cleanValue = cleanValue.replace(/\s/g, "")

    // Parse as float, default to current value if invalid
    const numValue = parseFloat(cleanValue)
    if (isNaN(numValue)) {
      // Invalid input, keep current value
      setDisplayValue(formatDisplayValue(value))
      return
    }

    // Only trigger onChange if the value actually changed (with tolerance for floating point)
    if (Math.abs(numValue - value) > 0.001) {
      onChange(numValue)
      lastValueRef.current = numValue
      setDisplayValue(formatDisplayValue(numValue))
    } else {
      // Value is essentially the same, just update display
      setDisplayValue(formatDisplayValue(value))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    // Only allow numbers, dots, commas, and spaces while typing
    if (newValue === "" || /^[\d.,\s]*$/.test(newValue)) {
      setDisplayValue(newValue)
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type="text"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="bg-background border-border pr-12 h-11 text-foreground font-medium tabular-nums focus-visible:ring-accent"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}

export default function CalculatorForm({ inputs, onChange }: CalculatorFormProps) {
  const update = (field: keyof MortgageInputs, value: number) => {
    onChange({ ...inputs, [field]: value })
  }

  // Helper to round to 3 decimal places to avoid floating point issues
  const round3 = (num: number) => Math.round(num * 1000) / 1000

  // Bidirectional calculation handlers
  const updateComisionAgencia = (percentage: number) => {
    const costoAgencia = Math.round(inputs.precioInmueble * (percentage / 100))
    onChange({ ...inputs, comisionAgencia: round3(percentage), costoAgencia })
  }

  const updateCostoAgencia = (cost: number) => {
    // Safeguard: only calculate percentage if precio inmueble is reasonable
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
    // Safeguard: only calculate percentage if precio inmueble is reasonable
    const gastosEscritura = inputs.precioInmueble > 100
      ? round3((cost / inputs.precioInmueble) * 100)
      : 0
    onChange({ ...inputs, costosCompra: Math.round(cost), gastosEscritura })
  }

  // Update absolute values when precio inmueble changes
  const updatePrecioInmueble = (precio: number) => {
    const costoAgencia = Math.round(precio * (inputs.comisionAgencia / 100))
    const costosCompra = Math.round(precio * (inputs.gastosEscritura / 100))
    onChange({ ...inputs, precioInmueble: Math.round(precio), costoAgencia, costosCompra })
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Inmueble */}
      <section>
        <div className="flex items-center gap-2.5 mb-5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
            <Home className="w-4 h-4 text-primary-foreground" />
          </div>
          <h3 className="font-serif text-lg text-foreground">Inmueble</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <InputField
              id="precio"
              label="Precio del inmueble"
              value={inputs.precioInmueble}
              onChange={updatePrecioInmueble}
              suffix="EUR"
            />
          </div>
          <InputField
            id="financiado"
            label="% Financiado"
            value={inputs.porcentajeFinanciado}
            onChange={(v) => update("porcentajeFinanciado", v)}
            suffix="%"
          />
          <InputField
            id="adicionales"
            label="Costos adicionales / mes"
            value={inputs.costosAdicionales}
            onChange={(v) => update("costosAdicionales", v)}
            suffix="EUR"
          />
          <InputField
            id="costoAgencia"
            label="Costo Agencia"
            value={inputs.costoAgencia}
            onChange={updateCostoAgencia}
            suffix="EUR"
          />
          <InputField
            id="comision"
            label="Comision Agencia"
            value={inputs.comisionAgencia}
            onChange={updateComisionAgencia}
            suffix="%"
          />
          <InputField
            id="costosCompra"
            label="Costos de Compra ($)"
            value={inputs.costosCompra}
            onChange={updateCostosCompra}
            suffix="EUR"
          />
          <InputField
            id="escritura"
            label="Costos de Compra (%)"
            value={inputs.gastosEscritura}
            onChange={updateGastosEscritura}
            suffix="%"
          />
        </div>
      </section>

      <Separator className="bg-border" />

      {/* Hipoteca */}
      <section>
        <div className="flex items-center gap-2.5 mb-5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent">
            <Landmark className="w-4 h-4 text-accent-foreground" />
          </div>
          <h3 className="font-serif text-lg text-foreground">Hipoteca</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            id="anios"
            label="Plazo"
            value={inputs.aniosHipoteca}
            onChange={(v) => update("aniosHipoteca", v)}
            suffix="anos"
          />
          <InputField
            id="tasa"
            label="TIN (tasa anual)"
            value={inputs.tasaHipoteca}
            onChange={(v) => update("tasaHipoteca", v)}
            suffix="%"
          />
        </div>
      </section>

      <Separator className="bg-border" />

      {/* Obra */}
      <section>
        <div className="flex items-center gap-2.5 mb-5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary">
            <Hammer className="w-4 h-4 text-secondary-foreground" />
          </div>
          <h3 className="font-serif text-lg text-foreground">Obra (opcional)</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <InputField
              id="costoObra"
              label="Costo de obra"
              value={inputs.costoObra}
              onChange={(v) => update("costoObra", v)}
              suffix="EUR"
            />
          </div>
          <InputField
            id="financiadoObra"
            label="% Financiado obra"
            value={inputs.porcentajeFinanciadoObra}
            onChange={(v) => update("porcentajeFinanciadoObra", v)}
            suffix="%"
          />
          <InputField
            id="tasaObra"
            label="TIN obra"
            value={inputs.tasaObra}
            onChange={(v) => update("tasaObra", v)}
            suffix="%"
          />
          <InputField
            id="aniosObra"
            label="Plazo obra"
            value={inputs.aniosObra}
            onChange={(v) => update("aniosObra", v)}
            suffix="anos"
          />
        </div>
      </section>

      <Separator className="bg-border" />

      {/* Inversion */}
      <section>
        <div className="flex items-center gap-2.5 mb-5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-chart-4">
            <TrendingUp className="w-4 h-4 text-primary-foreground" />
          </div>
          <h3 className="font-serif text-lg text-foreground">Inversion (opcional)</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField
            id="tasaInversion"
            label="Tasa de inversion anual"
            value={inputs.tasaInversion}
            onChange={(v) => update("tasaInversion", v)}
            suffix="%"
          />
          <InputField
            id="tasaImpuesto"
            label="Tasa de impuesto"
            value={inputs.tasaImpuesto}
            onChange={(v) => update("tasaImpuesto", v)}
            suffix="%"
          />
        </div>
      </section>
    </div>
  )
}
