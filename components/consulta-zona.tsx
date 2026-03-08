"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin, AlertCircle } from "lucide-react"

interface Metric {
  value: number
  max: number | null
  description: string
  unit?: string
  source?: string
  available?: boolean
  category?: string
}

interface LocationData {
  address: string
  lat: number
  lng: number
  metrics: {
    [key: string]: Metric
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

      // Obtener datos reales de nuestra API
      const zonaResponse = await fetch(`/api/zona?lat=${lat}&lng=${lng}&address=${encodeURIComponent(displayName)}`)

      if (!zonaResponse.ok) {
        throw new Error('Error al obtener datos de la zona')
      }

      const zonaData = await zonaResponse.json()

      setResults({
        address: displayName,
        lat,
        lng,
        metrics: zonaData.metrics
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
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
      // Básicas
      criminalidad: 'Seguridad',
      renta: 'Renta Media',
      poblacion: 'Población',
      // Servicios
      educacion: 'Educación',
      transporte: 'Transporte',
      servicios: 'Servicios Generales',
      salud: 'Salud',
      // Calidad de vida
      espaciosVerdes: 'Espacios Verdes',
      ocio: 'Ocio y Restauración',
      cultura: 'Cultura',
      deporte: 'Deporte',
      // Infraestructura
      aparcamiento: 'Aparcamiento',
      supermercados: 'Supermercados',
      bancos: 'Bancos',
      cargaEV: 'Carga EV',
      distanciaCentro: 'Distancia al Centro'
    }
    return names[key] || key.charAt(0).toUpperCase() + key.slice(1)
  }

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'Básicas': '📊',
      'Servicios': '🏪',
      'Calidad de vida': '🌟',
      'Infraestructura': '🏗️'
    }
    return icons[category] || '📍'
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

          {/* Metrics by category */}
          {['Básicas', 'Servicios', 'Calidad de vida', 'Infraestructura'].map((category) => {
            const categoryMetrics = Object.entries(results.metrics).filter(
              ([_, metric]) => metric.category === category
            )

            if (categoryMetrics.length === 0) return null

            return (
              <div key={category} className="space-y-4">
                <div className="flex items-center gap-2 pt-4">
                  <span className="text-2xl">{getCategoryIcon(category)}</span>
                  <h3 className="font-serif text-xl font-semibold">{category}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryMetrics.map(([key, metric]) => (
                    <Card key={key} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-5 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium text-muted-foreground">
                            {getMetricName(key)}
                          </div>
                          {metric.available ? (
                            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded">
                              Real
                            </span>
                          ) : (
                            <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded">
                              Estimado
                            </span>
                          )}
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
                        {metric.source && (
                          <div className="text-xs text-muted-foreground/60">
                            Fuente: {metric.source}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Disclaimer */}
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="space-y-2 text-sm text-blue-900 dark:text-blue-200">
                  <p className="font-medium">ℹ️ Acerca de los datos</p>
                  <p>
                    Los datos se obtienen en tiempo real de fuentes públicas abiertas:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-xs">
                    <li><strong>Datos reales (OpenStreetMap):</strong> Educación, transporte, salud, servicios, supermercados, bancos, espacios verdes, ocio, cultura, deporte, aparcamiento y estaciones de carga EV</li>
                    <li><strong>Estimaciones calculadas:</strong> Población (basada en edificios residenciales), seguridad (basada en servicios de emergencia) y distancia al centro</li>
                    <li><strong>Pendiente:</strong> Renta media (requiere integración con INE)</li>
                  </ul>
                  <p className="text-xs mt-2 opacity-80">
                    Radio de búsqueda: 500 metros. Los datos son orientativos y se actualizan según la información disponible en las bases de datos públicas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
