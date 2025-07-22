<template>
    <div class="loading-overlay" v-show="loadingState">
        <div class="loading-container">
            <div v-if="!isTimeout" class="spinner" :style="{ backgroundColor: spinnerColor }">
                <img src="../../../../实验室/计算机学院/回声开发实验室/logo.png" alt="">
            </div>
            <div v-else class="timeout-icon">
                🥲
            </div>
            <p class="loading-text" :style="{ color: textColor }">
                {{ isTimeout ? timeoutText : text }}
            </p>
            <button v-if="isTimeout" @click="resetLoading" class="retry-button">
                {{ retryText }}
            </button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'

const props = defineProps({
    text: { type: String, default: '加载中...' },
    spinnerColor: { type: String, default: '' },
    textColor: { type: String, default: '' },
    backgroundColor: { type: String, default: 'rgba(255, 255, 255, 0.8)' },
    timeout: { type: Number, default: 5000 }, // 超时时间，默认5000ms
    timeoutText: { type: String, default: '加载超时，请重试' }, // 超时提示文字
    retryText: { type: String, default: '重试' } // 重试按钮文字
})

// 双向绑定
const modelValue = defineModel<boolean>()
const isTimeout = ref(false)
let timeoutTimer: ReturnType<typeof setTimeout> | null = null

// 计算属性：合并 modelValue 和 isTimeout 状态
const loadingState = computed(() => modelValue.value || isTimeout.value)

// 开始计时器
const startTimeoutTimer = () => {
    if (timeoutTimer) clearTimeout(timeoutTimer)

    timeoutTimer = setTimeout(() => {
        isTimeout.value = true
        emit('timeout')
    }, props.timeout)
}

// 重置加载状态
const resetLoading = () => {
    isTimeout.value = false
    modelValue.value = false
    emit('retry')
}

// 监听加载状态变化
watch(modelValue, (newVal) => {
    if (newVal) {
        isTimeout.value = false
        startTimeoutTimer()
    } else if (timeoutTimer) {
        clearTimeout(timeoutTimer)
        timeoutTimer = null
    }
})

// 组件挂载时初始化
onMounted(() => {
    if (modelValue.value) {
        startTimeoutTimer()
    }
})

// 组件卸载时清理
onUnmounted(() => {
    if (timeoutTimer) {
        clearTimeout(timeoutTimer)
        timeoutTimer = null
    }
})

// 自定义事件
const emit = defineEmits<{
    (e: 'timeout'): void
    (e: 'retry'): void
}>()
</script>

<style scoped>
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px 72px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.spinner {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
}

.timeout-icon {
    font-size: 40px;
    margin-bottom: 16px;
}

.loading-text {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 16px;
}

.retry-button {
    padding: 4px 16px;
    background-color: #2563eb;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.retry-button:hover {
    background-color: #2572eb;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>
