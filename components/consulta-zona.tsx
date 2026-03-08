"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin, AlertCircle } from "lucide-react"

interface LocationData {
  address: string
  lat: number
  lng: number
  metrics: {
    [key: string]: {
      value: number
      max: number | null
      description: string
      unit?: string
    }
  }
}

export default function ConsultaZona() {
  const [address, setAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<LocationData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const exampleAddresses = [
    "Gran Vía 32, Madrid",
    "Paseo de Gracia 100, Barcelona",
    "Avenida del Manzanares 64, Madrid"
  ]

  const fillAddress = (addr: string) => {
    setAddress(addr)
  }

  const searchAddress = async () => {
    if (!address.trim()) {
      setError("Por favor ingresa una dirección")
      return
    }

    setLoading(true)
    setError(null)
    setResults(null)

    try {
      // Geocodificar usando Nominatim (OpenStreetMap)
      const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', España')}&limit=1`

      const geocodeResponse = await fetch(geocodeUrl, {
        headers: {
          'User-Agent': 'ConsultaZonaApp/1.0'
        }
      })

      const geocodeData = await geocodeResponse.json()

      if (!geocodeData || geocodeData.length === 0) {
        throw new Error('No se pudo encontrar la dirección')
      }

      const lat = parseFloat(geocodeData[0].lat)
      const lng = parseFloat(geocodeData[0].lon)
      const displayName = geocodeData[0].display_name

      // Generar métricas simuladas
      const metrics = generateMockMetrics(lat, lng)

      setResults({
        address: displayName,
        lat,
        lng,
        metrics
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const generateMockMetrics = (lat: number, lng: number) => {
    const seed = Math.abs(lat * lng * 1000) % 100

    return {
      criminalidad: {
        value: Math.round(30 + seed * 0.5),
        max: 100,
        description: 'Índice de seguridad de la zona'
      },
      renta: {
        value: Math.round(25000 + seed * 300),
        max: null,
        description: 'Renta media anual',
        unit: '€/año'
      },
      poblacion: {
        value: Math.round(5000 + seed * 100),
        max: null,
        description: 'Habitantes en la sección censal',
        unit: 'hab.'
      },
      educacion: {
        value: Math.round(60 + seed * 0.3),
        max: 100,
        description: 'Calidad educativa de la zona'
      },
      transporte: {
        value: Math.round(50 + seed * 0.4),
        max: 100,
        description: 'Accesibilidad y transporte público'
      },
      servicios: {
        value: Math.round(45 + seed * 0.45),
        max: 100,
        description: 'Comercios y servicios cercanos'
      }
    }
  }

  const getScoreClass = (value: number, max: number | null) => {
    if (!max) return ""
    const percentage = (value / max) * 100
    if (percentage >= 70) return "text-green-600 dark:text-green-400"
    if (percentage >= 40) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getMetricName = (key: string) => {
    const names: { [key: string]: string } = {
      criminalidad: 'Seguridad',
      renta: 'Renta Media',
      poblacion: 'Población',
      educacion: 'Educación',
      transporte: 'Transporte',
      servicios: 'Servicios'
    }
    return names[key] || key.charAt(0).toUpperCase() + key.slice(1)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <MapPin className="w-8 h-8 text-accent" />
          <h2 className="font-serif text-3xl text-foreground">
            Consulta de Zona
          </h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Ingresa una dirección en España para obtener información detallada sobre la zona
        </p>
      </div>

      {/* Search Section */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Buscar dirección</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Example addresses */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              📍 Direcciones de ejemplo:
            </p>
            <div className="flex flex-wrap gap-2">
              {exampleAddresses.map((addr) => (
                <Button
                  key={addr}
                  variant="outline"
                  size="sm"
                  onClick={() => fillAddress(addr)}
                  className="text-xs"
                >
                  {addr}
                </Button>
              ))}
            </div>
          </div>

          {/* Search input */}
          <div className="flex gap-3">
            <Input
              type="text"
              placeholder="Ej: Calle Alcalá 52, Madrid"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchAddress()}
              className="flex-1"
            />
            <Button
              onClick={searchAddress}
              disabled={loading}
              className="gap-2"
            >
              <Search className="w-4 h-4" />
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground mt-4">
                Consultando datos de la zona...
              </p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Error</p>
                  <p className="text-sm text-destructive/90">{error}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
          {/* Location header */}
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <MapPin className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-xl font-semibold mb-1">
                    {results.address.split(',')[0]}
                  </h3>
                  <p className="text-sm text-muted-foreground break-words">
                    {results.address}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-2">
                    Coordenadas: {results.lat.toFixed(6)}, {results.lng.toFixed(6)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metrics grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(results.metrics).map(([key, metric]) => (
              <Card key={key} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-5 space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    {getMetricName(key)}
                  </div>
                  <div className={`text-3xl font-bold ${getScoreClass(metric.value, metric.max)}`}>
                    {metric.unit
                      ? `${metric.value.toLocaleString()} ${metric.unit}`
                      : `${metric.value}${metric.max ? '/' + metric.max : ''}`
                    }
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {metric.description}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Disclaimer */}
          <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm text-amber-900 dark:text-amber-200">
                  <p className="font-medium">⚠️ Nota importante</p>
                  <p>
                    Estos son datos simulados para demostración. Para obtener datos reales de miratuzona.com, se necesitaría:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Un servidor backend que actúe como proxy</li>
                    <li>O acceso directo a las APIs de datos públicos españoles (INE, Ministerio Interior, etc.)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
