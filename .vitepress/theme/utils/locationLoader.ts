export interface Location {
  name: string
  type: string
  location: string
  description: string
  facilities?: string[]
  openTime?: string
  contact?: string
  coordinates?: {
    latitude: number
    longitude: number
  }
}

export interface CampusData {
  campus: string
  campusName: string
  center: {
    latitude: number
    longitude: number
  }
  locations: Location[]
}

/**
 * 加载航空港校区地点数据
 */
export async function loadHangkonggangLocations(): Promise<Location[]> {
  try {
    // 使用别名路径，更清晰
    // @ts-ignore
    const module = await import('@data/locations/hangkonggang.json')
    const campusData: CampusData = module.default || module
    
    console.log(`成功加载 ${campusData.campusName} 数据:`, campusData.locations.length, '个地点')
    return campusData.locations
  } catch (error) {
    console.error('加载航空港校区地点数据失败:', error)
    return []
  }
}

/**
 * 根据地点名称获取坐标
 */
export function getLocationCoordinates(
  locationName: string,
  locations: Location[]
): { latitude: number, longitude: number } {
  // 从已加载的数据中查找坐标
  const location = locations.find(loc => loc.name === locationName)
  if (location && location.coordinates) {
    return location.coordinates
  }
  
  // 默认坐标（航空港校区中心）
  return { 
    latitude: 30.581158, 
    longitude: 103.988272 
  }
}
