import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const lat = parseFloat(searchParams.get('lat') || '')
    const lng = parseFloat(searchParams.get('lng') || '')
    const address = searchParams.get('address') || ''

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { error: 'Coordenadas inválidas' },
        { status: 400 }
      )
    }

    // Consultar datos de diferentes fuentes públicas
    const [overpassData, weatherData, sunData, elevationData] = await Promise.allSettled([
      fetchOverpassData(lat, lng),
      fetchWeatherData(lat, lng),
      fetchSunData(lat, lng),
      fetchElevationData(lat, lng)
    ])

    // Agregar datos
    const metrics = {
      // Básicas
      criminalidad: {
        value: 0,
        max: 10,
        description: 'Índice de seguridad de la zona',
        source: 'Calculado',
        available: false,
        category: 'Básicas'
      },
      poblacion: {
        value: 0,
        max: null,
        description: 'Habitantes en la zona',
        unit: 'hab.',
        source: 'Estimado',
        available: false,
        category: 'Básicas'
      },

      // Servicios esenciales
      educacion: {
        value: 0,
        max: 10,
        description: 'Centros educativos cercanos',
        source: 'OpenStreetMap',
        available: false,
        category: 'Servicios'
      },
      transporte: {
        value: 0,
        max: 10,
        description: 'Estaciones de transporte público',
        source: 'OpenStreetMap',
        available: false,
        category: 'Servicios'
      },
      servicios: {
        value: 0,
        max: 10,
        description: 'Comercios y servicios cercanos',
        source: 'OpenStreetMap',
        available: false,
        category: 'Servicios'
      },
      salud: {
        value: 0,
        max: 10,
        description: 'Centros médicos y farmacias',
        source: 'OpenStreetMap',
        available: false,
        category: 'Servicios'
      },

      // Calidad de vida
      espaciosVerdes: {
        value: 0,
        max: 10,
        description: 'Parques y áreas verdes',
        source: 'OpenStreetMap',
        available: false,
        category: 'Calidad de vida'
      },
      ocio: {
        value: 0,
        max: 10,
        description: 'Restaurantes, bares y cafés',
        source: 'OpenStreetMap',
        available: false,
        category: 'Calidad de vida'
      },
      cultura: {
        value: 0,
        max: 10,
        description: 'Museos, teatros y bibliotecas',
        source: 'OpenStreetMap',
        available: false,
        category: 'Calidad de vida'
      },
      deporte: {
        value: 0,
        max: 10,
        description: 'Instalaciones deportivas',
        source: 'OpenStreetMap',
        available: false,
        category: 'Calidad de vida'
      },

      // Infraestructura
      aparcamiento: {
        value: 0,
        max: 10,
        description: 'Parkings y estacionamientos',
        source: 'OpenStreetMap',
        available: false,
        category: 'Infraestructura'
      },
      supermercados: {
        value: 0,
        max: 10,
        description: 'Supermercados y tiendas',
        source: 'OpenStreetMap',
        available: false,
        category: 'Infraestructura'
      },
      bancos: {
        value: 0,
        max: 10,
        description: 'Bancos y cajeros',
        source: 'OpenStreetMap',
        available: false,
        category: 'Infraestructura'
      },
      cargaEV: {
        value: 0,
        max: 10,
        description: 'Estaciones de carga eléctrica',
        source: 'OpenStreetMap',
        available: false,
        category: 'Infraestructura'
      },
      distanciaCentro: {
        value: 0,
        max: null,
        description: 'Distancia al centro de la ciudad',
        unit: 'km',
        source: 'Calculado',
        available: false,
        category: 'Infraestructura'
      },

      // Movilidad y accesibilidad
      bicicleta: {
        value: 0,
        max: 10,
        description: 'Infraestructura ciclista',
        source: 'OpenStreetMap',
        available: false,
        category: 'Movilidad'
      },
      trafico: {
        value: 0,
        max: 10,
        description: 'Nivel de tráfico (inverso)',
        source: 'OpenStreetMap',
        available: false,
        category: 'Movilidad'
      },
      accesibilidad: {
        value: 0,
        max: 10,
        description: 'Infraestructura accesible',
        source: 'OpenStreetMap',
        available: false,
        category: 'Movilidad'
      },

      // Familia y mascotas
      familias: {
        value: 0,
        max: 10,
        description: 'Servicios para familias',
        source: 'OpenStreetMap',
        available: false,
        category: 'Familia'
      },
      petFriendly: {
        value: 0,
        max: 10,
        description: 'Servicios para mascotas',
        source: 'OpenStreetMap',
        available: false,
        category: 'Familia'
      },

      // Características de la zona
      vidaNocturna: {
        value: 0,
        max: 10,
        description: 'Vida nocturna y entretenimiento',
        source: 'OpenStreetMap',
        available: false,
        category: 'Zona'
      },
      turismo: {
        value: 0,
        max: 10,
        description: 'Nivel turístico de la zona',
        source: 'OpenStreetMap',
        available: false,
        category: 'Zona'
      },
      patrimonio: {
        value: 0,
        max: 10,
        description: 'Patrimonio histórico',
        source: 'OpenStreetMap',
        available: false,
        category: 'Zona'
      },
      coworking: {
        value: 0,
        max: 10,
        description: 'Espacios de trabajo',
        source: 'OpenStreetMap',
        available: false,
        category: 'Zona'
      },

      // Ambiente y clima
      temperatura: {
        value: 0,
        max: null,
        description: 'Temperatura actual',
        unit: '°C',
        source: 'Open-Meteo',
        available: false,
        category: 'Ambiente'
      },
      horasSol: {
        value: 0,
        max: null,
        description: 'Horas de luz solar hoy',
        unit: 'h',
        source: 'Sunrise-Sunset',
        available: false,
        category: 'Ambiente'
      },
      altitud: {
        value: 0,
        max: null,
        description: 'Altitud sobre nivel del mar',
        unit: 'm',
        source: 'Open-Elevation',
        available: false,
        category: 'Ambiente'
      }
    }

    // Procesar datos de Overpass (OpenStreetMap)
    if (overpassData.status === 'fulfilled' && overpassData.value && overpassData.value.elements) {
      try {
        const overpass = overpassData.value

        // Educación: contar escuelas cercanas (5+ = 10/10)
        const schools = overpass.elements.filter((el: any) =>
        el.tags?.amenity === 'school' || el.tags?.amenity === 'university' || el.tags?.amenity === 'kindergarten'
      ).length
      metrics.educacion.value = Math.min(10, schools * 2)
      metrics.educacion.available = true

      // Transporte: contar estaciones de metro, bus, tren (5+ = 10/10)
      const transport = overpass.elements.filter((el: any) =>
        el.tags?.public_transport === 'station' ||
        el.tags?.railway === 'station' ||
        el.tags?.amenity === 'bus_station' ||
        el.tags?.public_transport === 'stop_position'
      ).length
      metrics.transporte.value = Math.min(10, transport * 2)
      metrics.transporte.available = true

      // Servicios generales: contar tiendas y servicios (20+ = 10/10)
      const services = overpass.elements.filter((el: any) =>
        el.tags?.shop && !el.tags?.shop.includes('supermarket')
      ).length
      metrics.servicios.value = Math.min(10, services * 0.5)
      metrics.servicios.available = true

      // Salud: hospitales, clínicas, farmacias (8+ = 10/10)
      const health = overpass.elements.filter((el: any) =>
        el.tags?.amenity === 'hospital' ||
        el.tags?.amenity === 'clinic' ||
        el.tags?.amenity === 'pharmacy' ||
        el.tags?.amenity === 'doctors' ||
        el.tags?.amenity === 'dentist'
      ).length
      metrics.salud.value = Math.min(10, health * 1.25)
      metrics.salud.available = true

      // Espacios verdes: parques, jardines (10+ = 10/10)
      const greenSpaces = overpass.elements.filter((el: any) =>
        el.tags?.leisure === 'park' ||
        el.tags?.leisure === 'garden' ||
        el.tags?.leisure === 'nature_reserve' ||
        el.tags?.landuse === 'forest' ||
        el.tags?.landuse === 'grass'
      ).length
      metrics.espaciosVerdes.value = Math.min(10, greenSpaces * 1)
      metrics.espaciosVerdes.available = true

      // Ocio: restaurantes, bares, cafés (20+ = 10/10)
      const leisure = overpass.elements.filter((el: any) =>
        el.tags?.amenity === 'restaurant' ||
        el.tags?.amenity === 'bar' ||
        el.tags?.amenity === 'cafe' ||
        el.tags?.amenity === 'pub' ||
        el.tags?.amenity === 'fast_food'
      ).length
      metrics.ocio.value = Math.min(10, leisure * 0.5)
      metrics.ocio.available = true

      // Cultura: museos, teatros, bibliotecas, cines (5+ = 10/10)
      const culture = overpass.elements.filter((el: any) =>
        el.tags?.amenity === 'theatre' ||
        el.tags?.amenity === 'cinema' ||
        el.tags?.amenity === 'library' ||
        el.tags?.tourism === 'museum' ||
        el.tags?.tourism === 'gallery' ||
        el.tags?.amenity === 'arts_centre'
      ).length
      metrics.cultura.value = Math.min(10, culture * 2)
      metrics.cultura.available = true

      // Deporte: gimnasios, canchas, piscinas (7+ = 10/10)
      const sports = overpass.elements.filter((el: any) =>
        el.tags?.leisure === 'sports_centre' ||
        el.tags?.leisure === 'fitness_centre' ||
        el.tags?.leisure === 'pitch' ||
        el.tags?.leisure === 'swimming_pool' ||
        el.tags?.leisure === 'stadium'
      ).length
      metrics.deporte.value = Math.min(10, sports * 1.5)
      metrics.deporte.available = true

      // Aparcamiento: parkings públicos y privados (12+ = 10/10)
      const parking = overpass.elements.filter((el: any) =>
        el.tags?.amenity === 'parking' ||
        el.tags?.amenity === 'parking_space'
      ).length
      metrics.aparcamiento.value = Math.min(10, parking * 0.8)
      metrics.aparcamiento.available = true

      // Supermercados (4+ = 10/10)
      const supermarkets = overpass.elements.filter((el: any) =>
        el.tags?.shop === 'supermarket' ||
        el.tags?.shop === 'convenience'
      ).length
      metrics.supermercados.value = Math.min(10, supermarkets * 2.5)
      metrics.supermercados.available = true

      // Bancos y cajeros (10+ = 10/10)
      const banks = overpass.elements.filter((el: any) =>
        el.tags?.amenity === 'bank' ||
        el.tags?.amenity === 'atm'
      ).length
      metrics.bancos.value = Math.min(10, banks * 1)
      metrics.bancos.available = true

      // Estaciones de carga EV (4+ = 10/10)
      const evCharging = overpass.elements.filter((el: any) =>
        el.tags?.amenity === 'charging_station'
      ).length
      metrics.cargaEV.value = Math.min(10, evCharging * 2.5)
      metrics.cargaEV.available = true

      // Infraestructura ciclista (10+ = 10/10)
      const bikeInfra = overpass.elements.filter((el: any) =>
        el.tags?.amenity === 'bicycle_rental' ||
        el.tags?.amenity === 'bicycle_parking' ||
        el.tags?.cycleway ||
        el.tags?.highway === 'cycleway'
      ).length
      metrics.bicicleta.value = Math.min(10, bikeInfra * 1)
      metrics.bicicleta.available = true

      // Nivel de tráfico: menos carreteras = mejor (5+ carreteras = 0/10)
      const majorRoads = overpass.elements.filter((el: any) =>
        el.tags?.highway === 'motorway' ||
        el.tags?.highway === 'trunk' ||
        el.tags?.highway === 'primary'
      ).length
      metrics.trafico.value = Math.max(0, 10 - (majorRoads * 2))
      metrics.trafico.available = true

      // Accesibilidad (12+ elementos = 10/10)
      const accessibility = overpass.elements.filter((el: any) =>
        el.tags?.wheelchair === 'yes' ||
        el.tags?.wheelchair === 'designated' ||
        el.tags?.highway === 'elevator'
      ).length
      metrics.accesibilidad.value = Math.min(10, accessibility * 0.8)
      metrics.accesibilidad.available = true

      // Servicios para familias (7+ = 10/10)
      const familyServices = overpass.elements.filter((el: any) =>
        el.tags?.amenity === 'kindergarten' ||
        el.tags?.amenity === 'childcare' ||
        el.tags?.leisure === 'playground' ||
        el.tags?.amenity === 'toy_library'
      ).length
      metrics.familias.value = Math.min(10, familyServices * 1.5)
      metrics.familias.available = true

      // Pet-friendly (5+ = 10/10)
      const petServices = overpass.elements.filter((el: any) =>
        el.tags?.amenity === 'veterinary' ||
        el.tags?.shop === 'pet' ||
        el.tags?.leisure === 'dog_park'
      ).length
      metrics.petFriendly.value = Math.min(10, petServices * 2)
      metrics.petFriendly.available = true

      // Vida nocturna (12+ = 10/10)
      const nightlife = overpass.elements.filter((el: any) =>
        el.tags?.amenity === 'nightclub' ||
        el.tags?.amenity === 'pub' ||
        el.tags?.amenity === 'bar'
      ).length
      metrics.vidaNocturna.value = Math.min(10, nightlife * 0.8)
      metrics.vidaNocturna.available = true

      // Índice turístico (10+ = 10/10)
      const tourism = overpass.elements.filter((el: any) =>
        el.tags?.tourism === 'hotel' ||
        el.tags?.tourism === 'hostel' ||
        el.tags?.tourism === 'guest_house' ||
        el.tags?.tourism === 'attraction' ||
        el.tags?.tourism === 'viewpoint'
      ).length
      metrics.turismo.value = Math.min(10, tourism * 1)
      metrics.turismo.available = true

      // Patrimonio histórico (8+ = 10/10)
      const heritage = overpass.elements.filter((el: any) =>
        el.tags?.historic ||
        el.tags?.tourism === 'monument' ||
        el.tags?.building === 'historic'
      ).length
      metrics.patrimonio.value = Math.min(10, heritage * 1.25)
      metrics.patrimonio.available = true

      // Espacios de coworking (7+ = 10/10)
      const coworking = overpass.elements.filter((el: any) =>
        el.tags?.amenity === 'coworking_space' ||
        (el.tags?.amenity === 'cafe' && el.tags?.internet_access === 'wlan')
      ).length
      metrics.coworking.value = Math.min(10, coworking * 1.5)
      metrics.coworking.available = true
      } catch (error) {
        console.warn('Error processing Overpass data:', error instanceof Error ? error.message : 'Unknown error')
      }
    }

    // Estimar población basado en densidad de edificios residenciales
    if (overpassData.status === 'fulfilled' && overpassData.value && overpassData.value.elements) {
      try {
      const buildings = overpassData.value.elements.filter((el: any) =>
        el.tags?.building === 'residential' || el.tags?.building === 'apartments' || el.tags?.building === 'house'
      ).length
      metrics.poblacion.value = Math.round(buildings * 25) // Estimación: 25 personas por edificio
      metrics.poblacion.available = true
      } catch (error) {
        console.warn('Error calculating population:', error instanceof Error ? error.message : 'Unknown error')
      }
    }

    // Calcular seguridad basado en servicios de emergencia y vigilancia
    if (overpassData.status === 'fulfilled' && overpassData.value && overpassData.value.elements) {
      try {
      const police = overpassData.value.elements.filter((el: any) =>
        el.tags?.amenity === 'police'
      ).length
      const hospitals = overpassData.value.elements.filter((el: any) =>
        el.tags?.amenity === 'hospital'
      ).length
      const fireStations = overpassData.value.elements.filter((el: any) =>
        el.tags?.amenity === 'fire_station'
      ).length

      const safetyScore = Math.min(10, (police * 2.5 + hospitals * 1.5 + fireStations * 2 + 3))
      metrics.criminalidad.value = safetyScore
      metrics.criminalidad.available = true
      } catch (error) {
        console.warn('Error calculating safety score:', error instanceof Error ? error.message : 'Unknown error')
      }
    }

    // Calcular distancia al centro (Madrid: Puerta del Sol, Barcelona: Plaza Catalunya)
    const cityCenters: { [key: string]: { lat: number; lng: number } } = {
      'Madrid': { lat: 40.4168, lng: -3.7038 },
      'Barcelona': { lat: 41.3874, lng: 2.1686 },
      'Valencia': { lat: 39.4699, lng: -0.3763 },
      'Sevilla': { lat: 37.3886, lng: -5.9823 },
      'Zaragoza': { lat: 41.6488, lng: -0.8891 }
    }

    // Detectar la ciudad más cercana
    let minDistance = Infinity
    for (const [city, center] of Object.entries(cityCenters)) {
      const distance = calculateDistance(lat, lng, center.lat, center.lng)
      if (distance < minDistance) {
        minDistance = distance
      }
    }

    if (minDistance < 50) { // Solo si está dentro de 50km de algún centro
      metrics.distanciaCentro.value = Math.round(minDistance * 10) / 10
      metrics.distanciaCentro.available = true
    }

    // Procesar datos del clima (Open-Meteo)
    if (weatherData.status === 'fulfilled' && weatherData.value) {
      try {
        const weather = weatherData.value
        if (weather.current_weather) {
          metrics.temperatura.value = Math.round(weather.current_weather.temperature * 10) / 10
          metrics.temperatura.available = true
        }
      } catch (error) {
        console.warn('Error processing weather data:', error instanceof Error ? error.message : 'Unknown error')
      }
    }

    // Procesar datos de sol (Sunrise-Sunset)
    if (sunData.status === 'fulfilled' && sunData.value) {
      try {
        const sun = sunData.value
        if (sun.results) {
          const sunrise = new Date(sun.results.sunrise)
          const sunset = new Date(sun.results.sunset)
          const hours = (sunset.getTime() - sunrise.getTime()) / (1000 * 60 * 60)
          metrics.horasSol.value = Math.round(hours * 10) / 10
          metrics.horasSol.available = true
        }
      } catch (error) {
        console.warn('Error processing sun data:', error instanceof Error ? error.message : 'Unknown error')
      }
    }

    // Procesar datos de elevación
    if (elevationData.status === 'fulfilled' && elevationData.value) {
      try {
        const elevation = elevationData.value
        if (elevation.results && elevation.results.length > 0) {
          metrics.altitud.value = Math.round(elevation.results[0].elevation)
          metrics.altitud.available = true
        }
      } catch (error) {
        console.warn('Error processing elevation data:', error instanceof Error ? error.message : 'Unknown error')
      }
    }

    return NextResponse.json({
      success: true,
      address,
      lat,
      lng,
      metrics,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error en API zona:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      {
        error: 'Error al obtener datos de la zona',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Función para calcular distancia entre dos puntos (Haversine)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Consultar OpenStreetMap Overpass API para POIs cercanos
async function fetchOverpassData(lat: number, lng: number) {
  const radius = 500 // 500 metros de radio

  const query = `
    [out:json][timeout:25];
    (
      node["amenity"](around:${radius},${lat},${lng});
      node["shop"](around:${radius},${lat},${lng});
      node["public_transport"](around:${radius},${lat},${lng});
      node["railway"](around:${radius},${lat},${lng});
      node["leisure"](around:${radius},${lat},${lng});
      node["tourism"](around:${radius},${lat},${lng});
      node["historic"](around:${radius},${lat},${lng});
      node["cycleway"](around:${radius},${lat},${lng});
      node["wheelchair"](around:${radius},${lat},${lng});
      way["building"="residential"](around:${radius},${lat},${lng});
      way["building"="apartments"](around:${radius},${lat},${lng});
      way["building"="house"](around:${radius},${lat},${lng});
      way["building"="historic"](around:${radius},${lat},${lng});
      way["leisure"="park"](around:${radius},${lat},${lng});
      way["landuse"="grass"](around:${radius},${lat},${lng});
      way["highway"](around:${radius},${lat},${lng});
      way["cycleway"](around:${radius},${lat},${lng});
    );
    out body;
  `

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(10000) // 10 second timeout for Overpass
    })

    if (!response.ok) {
      console.warn(`Overpass API returned ${response.status}`)
      return null
    }

    return await response.json()
  } catch (error) {
    console.warn('Overpass API unavailable:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Consultar Open-Meteo para datos del clima (sin API key)
async function fetchWeatherData(lat: number, lng: number) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    })

    if (!response.ok) {
      console.warn(`Weather API returned ${response.status}`)
      return null
    }

    return await response.json()
  } catch (error) {
    console.warn('Weather API unavailable:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Consultar Sunrise-Sunset API para horas de sol (sin API key)
async function fetchSunData(lat: number, lng: number) {
  try {
    const url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0`

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(5000)
    })

    if (!response.ok) {
      console.warn(`Sun API returned ${response.status}`)
      return null
    }

    return await response.json()
  } catch (error) {
    console.warn('Sun API unavailable:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

// Consultar Open-Elevation para datos de altitud (sin API key)
async function fetchElevationData(lat: number, lng: number) {
  try {
    const url = `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lng}`

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(5000)
    })

    if (!response.ok) {
      console.warn(`Elevation API returned ${response.status}`)
      return null
    }

    return await response.json()
  } catch (error) {
    console.warn('Elevation API unavailable:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}
