"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export function InputField({
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

    if (suffix === "%") {
      return val.toLocaleString("es-ES", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3,
      })
    }

    return val.toLocaleString("es-ES", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })
  }

  const formatInputValue = (inputStr: string): string => {
    let clean = inputStr.replace(/\./g, "").replace(/\s/g, "")
    const parts = clean.split(",")
    const integerPart = parts[0]
    const decimalPart = parts[1]
    const formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    return decimalPart !== undefined ? `${formatted},${decimalPart}` : formatted
  }

  const [displayValue, setDisplayValue] = React.useState(formatDisplayValue(value))
  const [isFocused, setIsFocused] = React.useState(false)
  const lastValueRef = React.useRef(value)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (!isFocused && Math.abs(value - lastValueRef.current) > 0.001) {
      setDisplayValue(formatDisplayValue(value))
      lastValueRef.current = value
    }
  }, [value, isFocused])

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true)
    lastValueRef.current = value
    const rawValue = value ? value.toString().replace(".", ",") : ""
    setDisplayValue(rawValue ? formatInputValue(rawValue) : "")
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)

    let cleanValue = e.target.value.trim()

    const rawValue = value ? value.toString().replace(".", ",") : ""
    const expectedDisplayOnFocus = rawValue ? formatInputValue(rawValue) : ""
    if (cleanValue === expectedDisplayOnFocus) {
      setDisplayValue(formatDisplayValue(value))
      return
    }

    if (cleanValue === "") {
      if (value !== 0) {
        onChange(0)
        lastValueRef.current = 0
      }
      setDisplayValue(formatDisplayValue(0))
      return
    }

    cleanValue = cleanValue.replace(/\./g, "")
    cleanValue = cleanValue.replace(",", ".")
    cleanValue = cleanValue.replace(/\s/g, "")

    const numValue = parseFloat(cleanValue)
    if (isNaN(numValue)) {
      setDisplayValue(formatDisplayValue(value))
      return
    }

    if (Math.abs(numValue - value) > 0.001) {
      onChange(numValue)
      lastValueRef.current = numValue
      setDisplayValue(formatDisplayValue(numValue))
    } else {
      setDisplayValue(formatDisplayValue(value))
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    const cursorPosition = e.target.selectionStart || 0

    if (newValue === "" || /^[\d.,\s]*$/.test(newValue)) {
      const formatted = newValue === "" ? "" : formatInputValue(newValue)

      const beforeCursor = newValue.slice(0, cursorPosition)
      const dotsBeforeCursor = (beforeCursor.match(/\./g) || []).length
      const formattedBeforeCursor = beforeCursor === "" ? "" : formatInputValue(beforeCursor)
      const dotsInFormattedBeforeCursor = (formattedBeforeCursor.match(/\./g) || []).length
      const newCursorPosition = cursorPosition + (dotsInFormattedBeforeCursor - dotsBeforeCursor)

      setDisplayValue(formatted)

      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.setSelectionRange(newCursorPosition, newCursorPosition)
        }
      })
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </Label>
      <div className="relative">
        <Input
          ref={inputRef}
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
