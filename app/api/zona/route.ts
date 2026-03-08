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
      criminalidad: {
        value: 0,
        max: 100,
        description: 'Índice de seguridad de la zona',
        source: 'Calculado',
        available: false
      },
      renta: {
        value: 0,
        max: null,
        description: 'Renta media anual',
        unit: '€/año',
        source: 'INE',
        available: false
      },
      poblacion: {
        value: 0,
        max: null,
        description: 'Habitantes en la zona',
        unit: 'hab.',
        source: 'Estimado',
        available: false
      },
      educacion: {
        value: 0,
        max: 100,
        description: 'Centros educativos cercanos',
        source: 'OpenStreetMap',
        available: false
      },
      transporte: {
        value: 0,
        max: 100,
        description: 'Estaciones de transporte público',
        source: 'OpenStreetMap',
        available: false
      },
      servicios: {
        value: 0,
        max: 100,
        description: 'Comercios y servicios cercanos',
        source: 'OpenStreetMap',
        available: false
      }
    }

    // Procesar datos de Overpass (OpenStreetMap)
    if (overpassData.status === 'fulfilled' && overpassData.value) {
      const overpass = overpassData.value

      // Educación: contar escuelas cercanas
      const schools = overpass.elements.filter((el: any) =>
        el.tags?.amenity === 'school' || el.tags?.amenity === 'university'
      ).length
      metrics.educacion.value = Math.min(100, schools * 15)
      metrics.educacion.available = true

      // Transporte: contar estaciones de metro, bus, tren
      const transport = overpass.elements.filter((el: any) =>
        el.tags?.public_transport === 'station' ||
        el.tags?.railway === 'station' ||
        el.tags?.amenity === 'bus_station'
      ).length
      metrics.transporte.value = Math.min(100, transport * 20)
      metrics.transporte.available = true

      // Servicios: contar supermercados, farmacias, restaurantes
      const services = overpass.elements.filter((el: any) =>
        el.tags?.shop || el.tags?.amenity === 'pharmacy' ||
        el.tags?.amenity === 'restaurant' || el.tags?.amenity === 'cafe'
      ).length
      metrics.servicios.value = Math.min(100, services * 5)
      metrics.servicios.available = true
    }

    // Procesar datos de Catastro
    if (catastroData.status === 'fulfilled' && catastroData.value) {
      // Si tenemos datos de catastro, podríamos estimar renta por tipo de construcción
      metrics.renta.available = false // Catastro no da renta directamente
    }

    // Estimar población basado en densidad de edificios residenciales
    if (overpassData.status === 'fulfilled' && overpassData.value) {
      const buildings = overpassData.value.elements.filter((el: any) =>
        el.tags?.building === 'residential' || el.tags?.building === 'apartments'
      ).length
      metrics.poblacion.value = Math.round(buildings * 25) // Estimación: 25 personas por edificio
      metrics.poblacion.available = true
    }

    // Calcular seguridad basado en iluminación y servicios de emergencia
    if (overpassData.status === 'fulfilled' && overpassData.value) {
      const police = overpassData.value.elements.filter((el: any) =>
        el.tags?.amenity === 'police'
      ).length
      const hospitals = overpassData.value.elements.filter((el: any) =>
        el.tags?.amenity === 'hospital'
      ).length

      const safetyScore = Math.min(100, (police * 30 + hospitals * 20 + 30))
      metrics.criminalidad.value = safetyScore
      metrics.criminalidad.available = true
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
      way["building"="residential"](around:${radius},${lat},${lng});
      way["building"="apartments"](around:${radius},${lat},${lng});
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
