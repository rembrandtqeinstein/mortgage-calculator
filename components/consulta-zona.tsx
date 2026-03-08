"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin, AlertCircle, Plus, X, Trophy } from "lucide-react"

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
  id: string
  address: string
  lat: number
  lng: number
  metrics: {
    [key: string]: Metric
  }
}

export default function ConsultaZona() {
  const [addresses, setAddresses] = useState<string[]>([""])
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<LocationData[]>([])
  const [error, setError] = useState<string | null>(null)

  const exampleAddresses = [
    "Gran Vía 32, Madrid",
    "Paseo de Gracia 100, Barcelona",
    "Avenida del Manzanares 64, Madrid"
  ]

  const addAddress = () => {
    if (addresses.length < 5) {
      setAddresses([...addresses, ""])
    }
  }

  const removeAddress = (index: number) => {
    if (addresses.length > 1) {
      setAddresses(addresses.filter((_, i) => i !== index))
    }
  }

  const updateAddress = (index: number, value: string) => {
    const newAddresses = [...addresses]
    newAddresses[index] = value
    setAddresses(newAddresses)
  }

  const searchAddresses = async () => {
    const validAddresses = addresses.filter(a => a.trim())

    if (validAddresses.length === 0) {
      setError("Por favor ingresa al menos una dirección")
      return
    }

    setLoading(true)
    setError(null)
    setResults([])

    try {
      const locationPromises = validAddresses.map(async (address, index) => {
        // Geocodificar usando Nominatim (OpenStreetMap)
        const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', España')}&limit=1`

        const geocodeResponse = await fetch(geocodeUrl, {
          headers: {
            'User-Agent': 'ConsultaZonaApp/1.0'
          }
        })

        const geocodeData = await geocodeResponse.json()

        if (!geocodeData || geocodeData.length === 0) {
          throw new Error(`No se pudo encontrar: ${address}`)
        }

        const lat = parseFloat(geocodeData[0].lat)
        const lng = parseFloat(geocodeData[0].lon)
        const displayName = geocodeData[0].display_name

        // Obtener datos reales de nuestra API
        const zonaResponse = await fetch(`/api/zona?lat=${lat}&lng=${lng}&address=${encodeURIComponent(displayName)}`)

        if (!zonaResponse.ok) {
          throw new Error(`Error al obtener datos para: ${address}`)
        }

        const zonaData = await zonaResponse.json()

        return {
          id: `location-${index}`,
          address: displayName,
          lat,
          lng,
          metrics: zonaData.metrics
        }
      })

      const locations = await Promise.all(locationPromises)
      setResults(locations)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const getScoreClass = (value: number, max: number | null) => {
    if (!max) return ""
    const percentage = (value / max) * 100
    if (percentage >= 70) return "text-green-600 dark:text-green-400 font-semibold"
    if (percentage >= 40) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  const getMetricName = (key: string) => {
    const names: { [key: string]: string } = {
      // Básicas
      criminalidad: 'Seguridad',
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
      distanciaCentro: 'Distancia al Centro',
      // Movilidad
      bicicleta: 'Infraestructura Ciclista',
      trafico: 'Nivel de Tráfico',
      accesibilidad: 'Accesibilidad',
      // Familia
      familias: 'Servicios Familiares',
      petFriendly: 'Pet-Friendly',
      // Zona
      vidaNocturna: 'Vida Nocturna',
      turismo: 'Nivel Turístico',
      patrimonio: 'Patrimonio Histórico',
      coworking: 'Espacios de Trabajo',
      // Ambiente
      temperatura: 'Temperatura',
      horasSol: 'Horas de Sol',
      altitud: 'Altitud'
    }
    return names[key] || key.charAt(0).toUpperCase() + key.slice(1)
  }

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'Básicas': '📊',
      'Servicios': '🏪',
      'Calidad de vida': '🌟',
      'Infraestructura': '🏗️',
      'Movilidad': '🚴',
      'Familia': '👨‍👩‍👧‍👦',
      'Zona': '🏘️',
      'Ambiente': '🌤️'
    }
    return icons[category] || '📍'
  }

  const getBestLocationForMetric = (metricKey: string) => {
    if (results.length === 0) return null

    let bestIndex = 0
    let bestValue = -Infinity

    results.forEach((location, index) => {
      const metric = location.metrics[metricKey]
      if (metric && metric.available !== false) {
        if (metric.value > bestValue) {
          bestValue = metric.value
          bestIndex = index
        }
      }
    })

    return bestIndex
  }

  const getShortAddress = (address: string) => {
    const parts = address.split(',')
    return parts[0] + (parts[1] ? ', ' + parts[1] : '')
  }

  const getCategoryScore = (location: LocationData, category: string) => {
    const metricsInCategory = Object.entries(location.metrics).filter(
      ([_, metric]) => metric.category === category && metric.available !== false
    )

    if (metricsInCategory.length === 0) return 0

    const totalScore = metricsInCategory.reduce((sum, [_, metric]) => {
      if (metric.max) {
        return sum + (metric.value / metric.max) * 100
      }
      return sum
    }, 0)

    return totalScore / metricsInCategory.length
  }

  const getBestLocationByCategory = () => {
    if (results.length === 0) return {}

    const categories = ['Básicas', 'Servicios', 'Calidad de vida', 'Infraestructura', 'Movilidad', 'Familia', 'Zona', 'Ambiente']
    const winners: { [key: string]: number } = {}

    categories.forEach(category => {
      let bestIndex = 0
      let bestScore = -Infinity

      results.forEach((location, index) => {
        const score = getCategoryScore(location, category)
        if (score > bestScore) {
          bestScore = score
          bestIndex = index
        }
      })

      winners[category] = bestIndex
    })

    return winners
  }

  const getOverallBest = () => {
    if (results.length === 0) return null

    const categories = ['Básicas', 'Servicios', 'Calidad de vida', 'Infraestructura', 'Movilidad', 'Familia', 'Zona', 'Ambiente']
    let bestIndex = 0
    let bestAvgScore = -Infinity

    results.forEach((location, index) => {
      const avgScore = categories.reduce((sum, cat) => sum + getCategoryScore(location, cat), 0) / categories.length
      if (avgScore > bestAvgScore) {
        bestAvgScore = avgScore
        bestIndex = index
      }
    })

    return bestIndex
  }

  // Group metrics by category
  const getMetricsByCategory = () => {
    if (results.length === 0) return {}

    const categories: { [key: string]: string[] } = {}
    const firstLocation = results[0]

    Object.keys(firstLocation.metrics).forEach(key => {
      const metric = firstLocation.metrics[key]
      const category = metric.category || 'Otros'

      if (!categories[category]) {
        categories[category] = []
      }
      categories[category].push(key)
    })

    return categories
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <MapPin className="w-8 h-8 text-accent" />
          <h2 className="font-serif text-3xl text-foreground">
            Comparador de Zonas
          </h2>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Compara hasta 5 direcciones en España para encontrar la mejor zona
        </p>
      </div>

      {/* Search Section */}
      <Card className="max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="font-serif text-xl">Direcciones a comparar</CardTitle>
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
                  onClick={() => updateAddress(0, addr)}
                  className="text-xs"
                >
                  {addr}
                </Button>
              ))}
            </div>
          </div>

          {/* Address inputs */}
          <div className="space-y-3">
            {addresses.map((address, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="text"
                  placeholder={`Dirección ${index + 1} (ej: Calle Gran Vía 32, Madrid)`}
                  value={address}
                  onChange={(e) => updateAddress(index, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      searchAddresses()
                    }
                  }}
                  className="flex-1"
                />
                {addresses.length > 1 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeAddress(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Add address button */}
          {addresses.length < 5 && (
            <Button
              variant="outline"
              onClick={addAddress}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar otra dirección
            </Button>
          )}

          {/* Search button */}
          <Button
            onClick={searchAddresses}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Buscando...
              </>
            ) : (
              <>
                <Search className="mr-2 w-4 h-4" />
                Comparar {addresses.filter(a => a.trim()).length} {addresses.filter(a => a.trim()).length === 1 ? 'dirección' : 'direcciones'}
              </>
            )}
          </Button>

          {/* Error message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">{error}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {results.length > 0 && (
        <>
          {/* Overall Winner */}
          {results.length > 1 && (
            <Card className="max-w-6xl mx-auto bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-200 dark:border-yellow-800">
              <CardHeader>
                <CardTitle className="font-serif text-xl flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-600" />
                  Ganador General
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <p className="text-2xl font-semibold text-yellow-900 dark:text-yellow-100">
                    {getShortAddress(results[getOverallBest() || 0].address)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Mejor puntuación promedio en todas las categorías
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Category Winners */}
          {results.length > 1 && (
            <Card className="max-w-6xl mx-auto">
              <CardHeader>
                <CardTitle className="font-serif text-xl">Ganadores por Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(getBestLocationByCategory()).map(([category, winnerIndex]) => (
                    <div key={category} className="bg-muted/50 p-4 rounded-lg text-center space-y-2">
                      <div className="text-2xl">{getCategoryIcon(category)}</div>
                      <div className="font-medium text-sm">{category}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {getShortAddress(results[winnerIndex].address)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comparison Table */}
          <Card className="max-w-6xl mx-auto">
            <CardHeader>
              <CardTitle className="font-serif text-xl">Comparación Detallada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                {Object.entries(getMetricsByCategory()).map(([category, metricKeys]) => (
                  <div key={category} className="mb-8 last:mb-0">
                    <h3 className="font-serif text-lg mb-4 flex items-center gap-2">
                      <span>{getCategoryIcon(category)}</span>
                      <span>{category}</span>
                    </h3>

                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left p-3 font-medium min-w-[150px]">Métrica</th>
                            {results.map((location, index) => (
                              <th key={location.id} className="text-center p-3 font-medium min-w-[120px]">
                                <div className="text-xs line-clamp-2">
                                  {getShortAddress(location.address)}
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {metricKeys.map((metricKey) => {
                            const bestIndex = getBestLocationForMetric(metricKey)
                            return (
                              <tr key={metricKey} className="border-t hover:bg-muted/30">
                                <td className="p-3 font-medium">
                                  {getMetricName(metricKey)}
                                </td>
                                {results.map((location, index) => {
                                  const metric = location.metrics[metricKey]
                                  const isBest = index === bestIndex && results.length > 1

                                  if (!metric || metric.available === false) {
                                    return (
                                      <td key={location.id} className="p-3 text-center text-muted-foreground">
                                        N/A
                                      </td>
                                    )
                                  }

                                  return (
                                    <td
                                      key={location.id}
                                      className={`p-3 text-center ${getScoreClass(metric.value, metric.max)} ${
                                        isBest ? 'bg-green-50 dark:bg-green-950/20' : ''
                                      }`}
                                    >
                                      <div className="flex items-center justify-center gap-1">
                                        {isBest && <Trophy className="w-3 h-3 text-yellow-600" />}
                                        <span>
                                          {metric.value.toFixed(1)}
                                          {metric.unit || ''}
                                          {metric.max && ` / ${metric.max}`}
                                        </span>
                                      </div>
                                    </td>
                                  )
                                })}
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
