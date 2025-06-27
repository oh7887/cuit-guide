<template>
  <div class="aside-location-list">
    <div class="aside-header">
      <h3 class="aside-title">校园地点</h3>
      <span class="location-count">{{ filteredLocations.length }}</span>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-status">
      <div class="loading-spinner">⏳</div>
      <div class="loading-text">加载中...</div>
    </div>

    <template v-else>
      <!-- 搜索框 -->
      <div class="compact-search">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="搜索地点..."
          class="search-input"
        >
      </div>

      <!-- 快速筛选 -->
      <div class="quick-filters">
        <button 
          v-for="type in quickTypes" 
          :key="type"
          :class="['quick-filter', { active: selectedType === type }]"
          @click="toggleFilter(type)"
        >
          {{ type }}
        </button>
      </div>

      <!-- 地点列表 -->
      <div class="location-items">
        <div 
          v-for="(location, index) in filteredLocations.slice(0, maxShow)" 
          :key="index" 
          class="location-item"
          :class="{ expanded: expandedItems[index] }"
          @click="toggleItem(index)"
        >
          <!-- 折叠状态 -->
          <div class="item-header">
            <div class="item-basic">
              <div class="item-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
              <div class="item-info">
                <div class="item-name">{{ location.name || '地点名称' }}</div>
                <div class="item-type">{{ location.type }}</div>
              </div>
            </div>
            <div class="expand-arrow" :class="{ rotated: expandedItems[index] }">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 10l5 5 5-5z"/>
              </svg>
            </div>
          </div>

          <!-- 展开内容 -->
          <Transition name="expand">
            <div v-if="expandedItems[index]" class="item-details">
              <div v-if="location.location" class="detail-row">
                <svg class="detail-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
                <span>{{ location.location || '位置待补充' }}</span>
              </div>

              <div v-if="location.openTime" class="detail-row">
                <svg class="detail-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
                <span>{{ location.openTime }}</span>
              </div>

              <div v-if="location.description" class="detail-description">
                {{ location.description.length > 60 ? location.description.slice(0, 60) + '...' : location.description }}
              </div>

              <div v-if="location.facilities && location.facilities.length > 0" class="detail-facilities">
                <div class="facility-chips">
                  <span 
                    v-for="facility in location.facilities.slice(0, 3)" 
                    :key="facility" 
                    class="facility-chip"
                  >
                    {{ facility }}
                  </span>
                  <span v-if="location.facilities.length > 3" class="more-facilities">
                    +{{ location.facilities.length - 3 }}
                  </span>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>

      <!-- 显示更多 -->
      <div v-if="filteredLocations.length > maxShow" class="show-more">
        <button @click="showMore" class="show-more-btn">
          显示更多 ({{ filteredLocations.length - maxShow }})
        </button>
      </div>

      <!-- 空状态 -->
      <div v-if="filteredLocations.length === 0" class="compact-empty">
        <div class="empty-icon">📍</div>
        <div class="empty-text">暂无匹配地点</div>
      </div>
    </template>

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="showToast" class="compact-toast">
        {{ toastMessage }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMapStore } from '../stores/useMapStore'
import type { MapLocation } from '../stores/useMapStore'
import { loadHangkonggangLocations, getLocationCoordinates, type Location } from '../utils/locationLoader'

// 使用 MapStore
const mapStore = useMapStore()

// 响应式数据
const locations = ref<Location[]>([])
const searchQuery = ref('')
const selectedType = ref('')
const showToast = ref(false)
const toastMessage = ref('')
const expandedItems = ref<Record<number, boolean>>({})
const maxShow = ref(5)
const isLoading = ref(false)

// 常用地点类型（精简版）
const quickTypes = ref(['教学楼', '食堂', '图书馆', '宿舍楼'])

// 计算属性 - 筛选后的地点
const filteredLocations = computed(() => {
  let filtered = locations.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(location => 
      location.name.toLowerCase().includes(query) ||
      location.type.toLowerCase().includes(query) ||
      location.description.toLowerCase().includes(query)
    )
  }

  if (selectedType.value) {
    filtered = filtered.filter(location => location.type === selectedType.value)
  }

  return filtered
})

// 方法
const toggleFilter = (type: string) => {
  selectedType.value = selectedType.value === type ? '' : type
}

const toggleItem = (index: number) => {
  const isCurrentlyExpanded = expandedItems.value[index]
  
  // 清空所有展开状态
  Object.keys(expandedItems.value).forEach(key => {
    expandedItems.value[parseInt(key)] = false
  })
  
  // 如果点击的不是当前展开的项目，则展开它
  if (!isCurrentlyExpanded) {
    expandedItems.value[index] = true
    
    // 在地图上标记该地点
    const location = filteredLocations.value[index]
    selectLocationOnMap(location)
  }
  
  console.log('当前展开状态:', expandedItems.value)
}

// 选中地点并在地图上标记
const selectLocationOnMap = (location: Location) => {
  console.log('CustomAside: 准备选择地点', location.name);
  
  // 转换为MapLocation格式
  const mapLocation: MapLocation = {
    id: `loc_${Date.now()}`,
    name: location.name,
    type: location.type,
    location: location.location,
    description: location.description,
    facilities: location.facilities,
    openTime: location.openTime,
    contact: location.contact,
    // 优先使用数据中的坐标，否则使用工具函数计算
    coordinates: location.coordinates || getLocationCoordinates(location.name, locations.value)
  }
  
  // 添加到地图store
  mapStore.selectLocation(mapLocation)
  
  console.log('CustomAside: 已调用 mapStore.selectLocation');
  console.log('当前选中地点:', mapStore.selectedLocation?.name);
  console.log('所有标记状态:', mapStore.selectedMarkers.map(m => ({
    name: m.location.name,
    isActive: m.isActive
  })));
  
  // 显示提示
  showToastMessage(`📍 已在地图上标记: ${location.name}`)
}

const showMore = () => {
  maxShow.value += 5
}

const showToastMessage = (message: string, duration = 2000) => {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, duration)
}

// 加载地点数据
const loadLocations = async () => {
  try {
    isLoading.value = true
    console.log('开始加载航空港校区地点数据...')
    
    // 使用统一的数据加载器
    const hangkongganLocations = await loadHangkonggangLocations()
    locations.value = hangkongganLocations
    
    console.log('成功加载地点数据:', locations.value.length, '个地点')
  } catch (error) {
    console.error('加载地点数据失败:', error)
    showToastMessage('❌ 加载地点数据失败')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadLocations()
})
</script>

<style scoped>
.aside-location-list {
  font-size: 13px;
  line-height: 1.4;
}

.aside-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--vp-c-divider-light);
}

.aside-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0;
}

.location-count {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand);
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
}

.loading-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  color: var(--vp-c-text-2);
}

.loading-spinner {
  font-size: 18px;
  margin-bottom: 8px;
}

.loading-text {
  font-size: 12px;
}

.compact-search {
  margin-bottom: 12px;
}

.search-input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 12px;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--vp-c-brand);
}

.quick-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 12px;
}

.quick-filter {
  padding: 3px 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 11px;
}

.quick-filter:hover {
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
}

.quick-filter.active {
  background: var(--vp-c-brand);
  border-color: var(--vp-c-brand);
  color: white;
}

.location-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.location-item {
  border: 1px solid var(--vp-c-divider-light);
  border-radius: 8px;
  background: var(--vp-c-bg);
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
}

.location-item:hover {
  border-color: var(--vp-c-brand-light);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
}

.item-basic {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.item-icon {
  width: 16px;
  height: 16px;
  color: var(--vp-c-brand);
  margin-right: 6px;
  flex-shrink: 0;
}

.item-icon svg {
  width: 100%;
  height: 100%;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-weight: 500;
  color: var(--vp-c-text-1);
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-type {
  font-size: 10px;
  color: var(--vp-c-text-3);
  margin-top: 1px;
}

.expand-arrow {
  width: 16px;
  height: 16px;
  color: var(--vp-c-text-3);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.expand-arrow.rotated {
  transform: rotate(180deg);
}

.item-details {
  padding: 0 8px 8px 8px;
  border-top: 1px solid var(--vp-c-divider-light);
  background: var(--vp-c-bg-soft);
}

.detail-row {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  font-size: 11px;
  color: var(--vp-c-text-2);
}

.detail-icon {
  width: 12px;
  height: 12px;
  margin-right: 4px;
  fill: currentColor;
  flex-shrink: 0;
}

.detail-description {
  font-size: 11px;
  color: var(--vp-c-text-2);
  line-height: 1.3;
  margin: 6px 0;
}

.detail-facilities {
  margin-top: 6px;
}

.facility-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
}

.facility-chip {
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 10px;
  border: 1px solid var(--vp-c-divider-light);
}

.more-facilities {
  color: var(--vp-c-brand);
  font-size: 10px;
  font-weight: 500;
}

.show-more {
  margin-top: 8px;
  text-align: center;
}

.show-more-btn {
  background: none;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 11px;
  transition: all 0.2s;
}

.show-more-btn:hover {
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
}

.compact-empty {
  text-align: center;
  padding: 20px;
  color: var(--vp-c-text-3);
}

.empty-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.empty-text {
  font-size: 11px;
}

.compact-toast {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  padding: 8px 12px;
  border-radius: 6px;
  box-shadow: var(--vp-shadow-2);
  font-size: 12px;
  z-index: 1000;
  border: 1px solid var(--vp-c-divider);
}

/* 展开动画 */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  padding: 0 8px;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 200px;
  opacity: 1;
}

/* Toast 动画 */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
