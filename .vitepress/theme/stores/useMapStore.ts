import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface MapLocation {
  id: string              // 唯一标识
  name: string           // 地点名称
  type: string           // 地点类型（教学楼、食堂等）
  location: string       // 位置描述
  description: string    // 详细描述
  coordinates?: {        // GPS坐标（可选）
    latitude: number
    longitude: number
  }
  facilities?: string[]  // 设施列表
  openTime?: string      // 开放时间
  contact?: string       // 联系方式
  // 地图相关属性
  markerColor?: string   // 标记颜色
  isVisible?: boolean    // 是否可见
  zoomLevel?: number     // 缩放级别
}

export interface MapMarker {
  id: string             // 标记唯一ID
  location: MapLocation  // 关联的地点信息
  coordinates: {
    latitude: number
    longitude: number
  }
  color: string          // 标记颜色
  isActive: boolean      // 是否激活状态
  timestamp: number      // 创建/更新时间戳
}

export const useMapStore = defineStore('map', () => {
  // 状态
  const selectedLocation = ref<MapLocation | null>(null)
  const selectedMarkers = ref<MapMarker[]>([])
  const mapCenter = ref({
    latitude: 30.6586, // 成都纬度
    longitude: 104.0647 // 成都经度
  })
  const mapZoom = ref(15)
  const showAllMarkers = ref(true)
  const maxMarkers = ref(10) // 最多显示10个标记
  
  // 计算属性
  const activeMarkers = computed(() => {
    return selectedMarkers.value.filter(marker => 
      showAllMarkers.value || marker.isActive
    )
  })

  const hasSelectedLocation = computed(() => {
    return selectedLocation.value !== null
  })

  const markerCount = computed(() => {
    return selectedMarkers.value.length
  })

  // 根据地点类型生成标记颜色
  const getMarkerColor = (type: string): string => {
    const colorMap: Record<string, string> = {
      '教学楼': '#1890ff',
      '食堂': '#52c41a', 
      '图书馆': '#722ed1',
      '宿舍楼': '#fa8c16',
      '体育设施': '#f5222d',
      '行政楼': '#13c2c2',
      '实验楼': '#eb2f96',
      '停车场': '#666666',
      '其他': '#d9d9d9'
    }
    return colorMap[type] || colorMap['其他']
  }

  // 生成模拟坐标（基于成都区域）
  const generateCoordinates = (locationName: string): { latitude: number, longitude: number } => {
    // 基于地点名称生成相对固定的坐标
    const hash = locationName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const latOffset = (hash % 200 - 100) / 10000 // -0.01 to 0.01
    const lngOffset = (hash % 300 - 150) / 10000 // -0.015 to 0.015
    
    return {
      latitude: mapCenter.value.latitude + latOffset,
      longitude: mapCenter.value.longitude + lngOffset
    }
  }

  // 操作方法
  const selectLocation = (location: MapLocation) => {
    console.log('MapStore: 选中地点', location.name)
    
    // 首先将所有标记设为非激活状态
    selectedMarkers.value.forEach(marker => {
      marker.isActive = false
    })
    
    // 设置当前选中地点
    selectedLocation.value = location
    
    // 检查是否已存在该标记
    const existingMarkerIndex = selectedMarkers.value.findIndex(
      marker => marker.location.name === location.name
    )
    
    if (existingMarkerIndex !== -1) {
      // 如果已存在，激活该标记并更新时间戳
      selectedMarkers.value[existingMarkerIndex].isActive = true
      selectedMarkers.value[existingMarkerIndex].timestamp = Date.now()
      console.log('MapStore: 激活已存在标记', location.name)
    } else {
      // 生成坐标
      const coordinates = location.coordinates || generateCoordinates(location.name)
      
      // 创建新标记
      const newMarker: MapMarker = {
        id: `marker_${Date.now()}`,
        location: {
          ...location,
          coordinates
        },
        coordinates,
        color: getMarkerColor(location.type),
        isActive: true,
        timestamp: Date.now()
      }
      
      // 添加新标记
      selectedMarkers.value.push(newMarker)
      console.log('MapStore: 添加新标记', location.name)
      
      // 如果超过最大数量，移除最老的标记
      if (selectedMarkers.value.length > maxMarkers.value) {
        selectedMarkers.value.sort((a, b) => a.timestamp - b.timestamp)
        const removedMarker = selectedMarkers.value.shift()
        console.log('MapStore: 移除最老标记', removedMarker?.location.name)
      }
    }
    
    // 更新地图中心点
    if (selectedLocation.value.coordinates) {
      mapCenter.value = selectedLocation.value.coordinates
    }
    
    // 强制触发响应式更新
    selectedMarkers.value = [...selectedMarkers.value]
  }

  const clearSelection = () => {
    console.log('MapStore: 清除选择')
    selectedLocation.value = null
    selectedMarkers.value.forEach(marker => {
      marker.isActive = false
    })
  }

  const removeMarker = (markerId: string) => {
    const index = selectedMarkers.value.findIndex(marker => marker.id === markerId)
    if (index !== -1) {
      const removedMarker = selectedMarkers.value.splice(index, 1)[0]
      console.log('MapStore: 移除标记', removedMarker.location.name)
      
      // 如果移除的是当前选中的标记，清除选择
      if (selectedLocation.value?.name === removedMarker.location.name) {
        selectedLocation.value = null
      }
    }
  }

  const clearAllMarkers = () => {
    console.log('MapStore: 清除所有标记')
    selectedMarkers.value = []
    selectedLocation.value = null
  }

  const toggleMarkerVisibility = () => {
    showAllMarkers.value = !showAllMarkers.value
    console.log('MapStore: 切换标记显示', showAllMarkers.value ? '显示全部' : '仅显示激活')
  }

  const setMapCenter = (latitude: number, longitude: number) => {
    mapCenter.value = { latitude, longitude }
  }

  const setMapZoom = (zoom: number) => {
    mapZoom.value = Math.max(1, Math.min(20, zoom))
  }

  // 获取标记统计信息
  const getMarkerStats = () => {
    const stats = selectedMarkers.value.reduce((acc, marker) => {
      const type = marker.location.type
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(stats).map(([type, count]) => ({
      type,
      count,
      color: getMarkerColor(type)
    }))
  }

  return {
    // 状态
    selectedLocation,
    selectedMarkers,
    mapCenter,
    mapZoom,
    showAllMarkers,
    maxMarkers,
    
    // 计算属性
    activeMarkers,
    hasSelectedLocation,
    markerCount,
    
    // 方法
    selectLocation,
    clearSelection,
    removeMarker,
    clearAllMarkers,
    toggleMarkerVisibility,
    setMapCenter,
    setMapZoom,
    getMarkerColor,
    getMarkerStats
  }
})
