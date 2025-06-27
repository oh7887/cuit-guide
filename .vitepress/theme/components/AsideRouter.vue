<template>
  <component :is="currentAsideComponent" v-if="currentAsideComponent" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vitepress'

// 导入所有右侧栏组件
import CustomAside from './CustomAside.vue'

const route = useRoute()

// 路径与组件的映射配置
const asideConfig = {
  // 精确匹配
  exact: {
    '/地图/校园地图/航空港校区': CustomAside,
  },
  
  // 包含匹配（支持通配符）
  includes: [
    {
      pattern: '/地图/校园地图/航空港校区',
      component: CustomAside
    },
  ],

}

// 计算当前应该显示的组件
const currentAsideComponent = computed(() => {
  const currentPath = route.path
  const decodedPath = decodeURIComponent(currentPath)
  
  console.log('原始路径:', currentPath)
  console.log('解码路径:', decodedPath)
  
  // 同时检查原始路径和解码路径
  const pathsToCheck = [currentPath, decodedPath]
  
  for (const path of pathsToCheck) {
    // 检查精确匹配
    if (asideConfig.exact[path]) {
      return asideConfig.exact[path]
    }
    
    // 检查包含匹配
    for (const config of asideConfig.includes) {
      if (path.includes(config.pattern)) {
        return config.component
      }
    }
  }
  
  return null
})
</script>
