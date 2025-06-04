<template>
    <div class="selector-container" ref="container">
        <div class="selector-header" @click.stop="toggleDropdown">
            {{ selectedOption || placeholder }}
            <span class="arrow" :class="{ 'open': isOpen }">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
            </span>
        </div>
        <transition name="slide-fade">
            <ul v-show="isOpen" class="selector-dropdown">
                <!-- 新增取消筛选选项 -->
                <li v-if="allowClear && selectedValue !== null && isChanging" class="selector-clear-option"
                    @click.stop="clearSelection">
                    取消选择
                    <svg v-if="false" class="checkmark" width="16" height="16" viewBox="0 0 24 24">
                        <path
                            d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                </li>
                <li v-if="allowClear && selectedValue !== null && isChanging" class="divider" />
                <li v-for="option in options" :key="option.value"
                    :class="{ 'selected': option.value === selectedValue }" @click.stop="selectOption(option)">
                    {{ option.label }}
                    <svg v-if="option.value === selectedValue" class="checkmark" width="16" height="16"
                        viewBox="0 0 24 24">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                </li>
                <li v-if="!options.length" class="empty-option">暂无选项</li>
            </ul>
        </transition>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
    options: {
        type: Array,
        required: true
    },
    placeholder: {
        type: String,
        default: '请选择'
    },
    allowClear: {
        type: Boolean,
        default: true // 控制是否显示取消筛选选项
    }
})

const emit = defineEmits(['update:modelValue', 'clear'])

// 组件状态
const container = ref(null)
const isOpen = ref(false)
const selectedValue = ref(null)
const isChanging = ref(false)

// 计算属性
const selectedOption = computed(() => {
    if (selectedValue.value === null) return null
    return props.options.find(option => option.value === selectedValue.value)?.label
})

// 新增取消筛选方法
const clearSelection = () => {
    setTimeout(() => {
        isChanging.value = false
    }, 200)
    selectedValue.value = null
    emit('update:modelValue', null)
    emit('clear') // 触发自定义清除事件
    isOpen.value = false
}

// 方法
const toggleDropdown = () => {
    isOpen.value = !isOpen.value
}

const selectOption = (option) => {
    setTimeout(() => {
        isChanging.value = true
    }, 200)
    selectedValue.value = option.value
    emit('update:modelValue', option.value)
    isOpen.value = false
}

const handleClickOutside = (event) => {
    if (container.value && !container.value.contains(event.target)) {
        isOpen.value = false
    }
}

// 生命周期钩子
onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
})

// 监听 prop 变化
watch(() => props.modelValue, (newValue) => {
    selectedValue.value = newValue
})
</script>

<style scoped>
.selector-container {
    --selector-bg: var(--vp-c-bg);
    --selector-text: var(--vp-c-text-1);
    --selector-border: var(--vp-c-divider);
    --selector-hover: var(--vp-c-brand);
    --option-hover: var(--vp-c-default-soft);
    --option-selected-bg: var(--vp-c-brand-soft);
    --option-selected-text: var(--vp-c-brand);
    --checkmark-color: var(--vp-c-brand);

    position: relative;
    width: 200px;
    font-family: var(--vp-font-family-base);
}

.selector-header {
    padding: 6px 8px;
    border: 1px solid var(--selector-border);
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.2s ease;
    background: var(--selector-bg);
    color: var(--selector-text);
    box-shadow: var(--vp-shadow-1);
    font-size: 14px;
}

.selector-header:hover {
    border-color: var(--selector-hover);
    box-shadow: var(--vp-shadow-2);
}

.arrow {
    color: var(--vp-c-text-2);
    transition: transform 0.2s ease;
}

.arrow.open {
    transform: rotate(180deg);
}

.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all 0.2s ease-out;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

.selector-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    border: 1px solid var(--selector-border);
    border-radius: 8px;
    max-height: 240px;
    overflow-y: auto;
    background: var(--selector-bg);
    list-style-type: none;
    padding: 8px 0;
    margin: 0;
    z-index: 1000;
    box-shadow: var(--vp-shadow-3);
}

.selector-dropdown li {
    padding: 12px 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;
    color: var(--selector-text);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.selector-dropdown li:hover {
    background: var(--option-hover);
}

.selector-dropdown li.selected {
    background: var(--option-selected-bg);
    color: var(--option-selected-text);
}

.checkmark {
    color: var(--checkmark-color);
    margin-left: 8px;
    flex-shrink: 0;
}

.selector-clear-option {
    font-size: 12px;
    color: var(--vp-c-text-2);
    background-color: var(--selector-bg);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid var(--selector-border);
}

.selector-clear-option:hover {
    background: var(--option-hover);
}

.divider {
    height: 1px;
    padding: 0 !important;
    background: var(--selector-border);
}

.empty-option {
    padding: 12px 16px;
    color: var(--vp-c-text-2);
    text-align: center;
    cursor: default;
}
</style>
