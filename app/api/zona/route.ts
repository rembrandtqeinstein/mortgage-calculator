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
    const [overpassData, catastroData] = await Promise.allSettled([
      fetchOverpassData(lat, lng),
      fetchCatastroData(lat, lng)
    ])

    // Agregar datos
    const metrics = {
      // Básicas
      criminalidad: {
        value: 0,
        max: 100,
        description: 'Índice de seguridad de la zona',
        source: 'Calculado',
        available: false,
        category: 'Básicas'
      },
      renta: {
        value: 0,
        max: null,
        description: 'Renta media anual',
        unit: '€/año',
        source: 'INE',
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
        max: 100,
        description: 'Centros educativos cercanos',
        source: 'OpenStreetMap',
        available: false,
        category: 'Servicios'
      },
      transporte: {
        value: 0,
        max: 100,
        description: 'Estaciones de transporte público',
        source: 'OpenStreetMap',
        available: false,
        category: 'Servicios'
      },
      servicios: {
        value: 0,
        max: 100,
        description: 'Comercios y servicios cercanos',
        source: 'OpenStreetMap',
        available: false,
        category: 'Servicios'
      },
      salud: {
        value: 0,
        max: 100,
        description: 'Centros médicos y farmacias',
        source: 'OpenStreetMap',
        available: false,
        category: 'Servicios'
      },

      // Calidad de vida
      espaciosVerdes: {
        value: 0,
        max: 100,
        description: 'Parques y áreas verdes',
        source: 'OpenStreetMap',
        available: false,
        category: 'Calidad de vida'
      },
      ocio: {
        value: 0,
        max: 100,
        description: 'Restaurantes, bares y cafés',
        source: 'OpenStreetMap',
        available: false,
        category: 'Calidad de vida'
      },
      cultura: {
        value: 0,
        max: 100,
        description: 'Museos, teatros y bibliotecas',
        source: 'OpenStreetMap',
        available: false,
        category: 'Calidad de vida'
      },
      deporte: {
        value: 0,
        max: 100,
        description: 'Instalaciones deportivas',
        source: 'OpenStreetMap',
        available: false,
        category: 'Calidad de vida'
      },

      // Infraestructura
      aparcamiento: {
        value: 0,
        max: 100,
        description: 'Parkings y estacionamientos',
        source: 'OpenStreetMap',
        available: false,
        category: 'Infraestructura'
      },
      supermercados: {
        value: 0,
        max: 100,
        description: 'Supermercados y tiendas',
        source: 'OpenStreetMap',
        available: false,
        category: 'Infraestructura'
      },
      bancos: {
        value: 0,
        max: 100,
        description: 'Bancos y cajeros',
        source: 'OpenStreetMap',
        available: false,
        category: 'Infraestructura'
      },
      cargaEV: {
        value: 0,
        max: 100,
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
      }
    }

    // Procesar datos de Overpass (OpenStreetMap)
    if (overpassData.status === 'fulfilled' && overpassData.value) {
      const overpass = overpassData.value

      // Educación: contar escuelas cercanas
      const schools = overpass.elements.filter((el: any) =>
        el.tags?.amenity === 'school' || el.tags?.amenity === 'university' || el.tags?.amenity === 'kindergarten'
      ).length
      metrics.educacion.value = Math.min(100, schools * 15)
      metrics.educacion.available = true

      // Transporte: contar estaciones de metro, bus, tren
      const transport = overpass.elements.filter((el: any) =>
        el.tags?.public_transport === 'station' ||
        el.tags?.railway === 'station' ||
        el.tags?.amenity === 'bus_station' ||
        el.tags?.public_transport === 'stop_position'
      ).length
      metrics.transporte.value = Math.min(100, transport * 20)
      metrics.transporte.available = true

      // Servicios generales: contar tiendas y servicios
      const services = overpass.elements.filter((el: any) =>
        el.tags?.shop && !el.tags?.shop.includes('supermarket')
      ).length
      metrics.servicios.value = Math.min(100, services * 5)
      metrics.servicios.available = true

      // Salud: hospitales, clínicas, farmacias
      const health = overpass.elements.filter((el: any) =>
        el.tags?.amenity === 'hospital' ||
        el.tags?.amenity === 'clinic' ||
        el.tags?.amenity === 'pharmacy' ||
        el.tags?.amenity === 'doctors' ||
        el.tags?.amenity === 'dentist'
      ).length
      metrics.salud.value = Math.min(100, health * 12)
      metrics.salud.available = true

      // Espacios verdes: parques, jardines
      const greenSpaces = overpass.elements.filter((el: any) =>
        el.tags?.leisure === 'park' ||
        el.tags?.leisure === 'garden' ||
        el.tags?.leisure === 'nature_reserve' ||
        el.tags?.landuse === 'forest' ||
        el.tags?.landuse === 'grass'
      ).length
      metrics.espaciosVerdes.value = Math.min(100, greenSpaces * 10)
      metrics.espaciosVerdes.available = true

      // Ocio: restaurantes, bares, cafés
      const leisure = overpass.elements.filter((el: any) =>
        el.tags?.amenity === 'restaurant' ||
        el.tags?.amenity === 'bar' ||
        el.tags?.amenity === 'cafe' ||
        el.tags?.amenity === 'pub' ||
        el.tags?.amenity === 'fast_food'
      ).length
      metrics.ocio.value = Math.min(100, leisure * 5)
      metrics.ocio.available = true

      // Cultura: museos, teatros, bibliotecas, cines
      const culture = overpass.elements.filter((el: any) =>
        el.tags?.amenity === 'theatre' ||
        el.tags?.amenity === 'cinema' ||
        el.tags?.amenity === 'library' ||
        el.tags?.tourism === 'museum' ||
        el.tags?.tourism === 'gallery' ||
        el.tags?.amenity === 'arts_centre'
      ).length
      metrics.cultura.value = Math.min(100, culture * 20)
      metrics.cultura.available = true

      // Deporte: gimnasios, canchas, piscinas
      const sports = overpass.elements.filter((el: any) =>
        el.tags?.leisure === 'sports_centre' ||
        el.tags?.leisure === 'fitness_centre' ||
        el.tags?.leisure === 'pitch' ||
        el.tags?.leisure === 'swimming_pool' ||
        el.tags?.leisure === 'stadium'
      ).length
      metrics.deporte.value = Math.min(100, sports * 15)
      metrics.deporte.available = true

      // Aparcamiento: parkings públicos y privados
      const parking = overpass.elements.filter((el: any) =>
        el.tags?.amenity === 'parking' ||
        el.tags?.amenity === 'parking_space'
      ).length
      metrics.aparcamiento.value = Math.min(100, parking * 8)
      metrics.aparcamiento.available = true

      // Supermercados
      const supermarkets = overpass.elements.filter((el: any) =>
        el.tags?.shop === 'supermarket' ||
        el.tags?.shop === 'convenience'
      ).length
      metrics.supermercados.value = Math.min(100, supermarkets * 25)
      metrics.supermercados.available = true

      // Bancos y cajeros
      const banks = overpass.elements.filter((el: any) =>
        el.tags?.amenity === 'bank' ||
        el.tags?.amenity === 'atm'
      ).length
      metrics.bancos.value = Math.min(100, banks * 10)
      metrics.bancos.available = true

      // Estaciones de carga EV
      const evCharging = overpass.elements.filter((el: any) =>
        el.tags?.amenity === 'charging_station'
      ).length
      metrics.cargaEV.value = Math.min(100, evCharging * 25)
      metrics.cargaEV.available = true
    }

    // Procesar datos de Catastro
    if (catastroData.status === 'fulfilled' && catastroData.value) {
      // Si tenemos datos de catastro, podríamos estimar renta por tipo de construcción
      metrics.renta.available = false // Catastro no da renta directamente
    }

    // Estimar población basado en densidad de edificios residenciales
    if (overpassData.status === 'fulfilled' && overpassData.value) {
      const buildings = overpassData.value.elements.filter((el: any) =>
        el.tags?.building === 'residential' || el.tags?.building === 'apartments' || el.tags?.building === 'house'
      ).length
      metrics.poblacion.value = Math.round(buildings * 25) // Estimación: 25 personas por edificio
      metrics.poblacion.available = true
    }

    // Calcular seguridad basado en servicios de emergencia y vigilancia
    if (overpassData.status === 'fulfilled' && overpassData.value) {
      const police = overpassData.value.elements.filter((el: any) =>
        el.tags?.amenity === 'police'
      ).length
      const hospitals = overpassData.value.elements.filter((el: any) =>
        el.tags?.amenity === 'hospital'
      ).length
      const fireStations = overpassData.value.elements.filter((el: any) =>
        el.tags?.amenity === 'fire_station'
      ).length

      const safetyScore = Math.min(100, (police * 25 + hospitals * 15 + fireStations * 20 + 30))
      metrics.criminalidad.value = safetyScore
      metrics.criminalidad.available = true
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
    return NextResponse.json(
      { error: 'Error al obtener datos de la zona' },
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
      way["building"="residential"](around:${radius},${lat},${lng});
      way["building"="apartments"](around:${radius},${lat},${lng});
      way["building"="house"](around:${radius},${lat},${lng});
      way["leisure"="park"](around:${radius},${lat},${lng});
      way["landuse"="grass"](around:${radius},${lat},${lng});
    );
    out body;
  `

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `data=${encodeURIComponent(query)}`
    })

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching Overpass data:', error)
    return null
  }
}

// Consultar Catastro (API pública española)
async function fetchCatastroData(lat: number, lng: number) {
  try {
    // La API de Catastro permite consultas por coordenadas
    // Documentación: http://www.catastro.minhap.es/webinspire/documentos/Cartociudad.pdf
    const url = `http://ovc.catastro.meh.es/OVCServWeb/OVCWcfLibres/OVCCoordenadas.svc/Consulta_RCCOOR?` +
      `SRS=EPSG:4326&Coordenada_X=${lng}&Coordenada_Y=${lat}`

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      return null
    }

    const text = await response.text()
    // La API de Catastro devuelve XML, habría que parsearlo
    // Por ahora retornamos null y usamos solo OpenStreetMap
    return null
  } catch (error) {
    console.error('Error fetching Catastro data:', error)
    return null
  }
}
