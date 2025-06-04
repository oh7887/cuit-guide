<template>
    <div class="divider-container" :class="{ 'with-content': $slots.default }">
        <div class="divider-line" :style="lineStyle"></div>
        <div v-if="$slots.default" class="divider-content">
            <h2 style="font-size: 35px; font-weight: 600; cursor: default;">
                <slot></slot>
            </h2>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, useCssModule } from 'vue'

interface Props {
    colors?: string[]
    animated?: boolean
    size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
    colors: () => [],
    animated: true,
    size: 'medium'
})

// 使用 Vitepress 主题变量作为默认值
const themeColors = useCssModule()
const lineStyle = computed(() => {
    const baseColor = themeColors['--vp-c-divider'] || '#dddddd'
    const gradientColors = props.colors.length >= 2
        ? props.colors
        : [baseColor, baseColor]

    return {
        '--gradient-colors': gradientColors.join(', '),
        '--animation-state': props.animated ? 'running' : 'paused',
        height: sizeMap[props.size]
    }
})

const sizeMap = {
    small: '1px',
    medium: '2px',
    large: '3px'
}
</script>

<style module>
:root {
    --divider-primary: var(--vp-c-brand);
    --divider-secondary: var(--vp-c-brand-light);
    --divider-bg: var(--vp-c-bg);
}
</style>

<style scoped>
.divider-container {
    position: relative;
    width: 100%;
    margin: 1.5rem 0;
}

.divider-line {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
    background: linear-gradient(90deg,
            transparent 0%,
            var(--vp-c-brand) 30%,
            var(--vp-c-brand-light) 70%,
            transparent 100%);
    background-size: 200% 100%;
    animation:
        colorFlow 12s linear infinite var(--animation-state),
        glowPulse 16s ease-in-out infinite var(--animation-state);
}

.with-content .divider-line {
    background: linear-gradient(90deg,
            transparent 0%,
            var(--gradient-colors, var(--divider-primary), var(--divider-secondary)) 50%,
            transparent 100%);
    background-size: 150% 100%;
}

.divider-line::after {
    content: '';
    position: absolute;
    top: -2px;
    left: 0;
    width: 100%;
    height: calc(100% + 4px);
    background: linear-gradient(90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent);
    opacity: 0.6;
    animation: secondaryFlow 8s linear infinite var(--animation-state);
}

.divider-content {
    position: relative;
    z-index: 1;
    display: inline-block;
    padding: 0 1rem;
    background: var(--divider-bg);
    color: var(--vp-c-brand);
    font-size: 0.9em;
    font-weight: 500;
    transform: translateX(-50%);
    left: 50%;
    transition: color 0.3s ease;
}

.divider-content:hover {
    color: var(--vp-c-brand-dark);
    transform: translateX(-50%) scale(1.05);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes colorFlow {
    0% {
        background-position: 200% 0;
    }

    50% {
        background-position: -200% 0;
    }

    100% {
        background-position: 200% 0;
    }
}

@keyframes glowPulse {

    0%,
    100% {
        opacity: 0.8;
        filter: hue-rotate(0deg);
    }

    50% {
        opacity: 1;
        filter: hue-rotate(15deg);
    }
}

@media (max-width: 768px) {
    .divider-content {
        font-size: 0.8em;
        padding: 0 0.5rem;
    }

    .divider-line {
        background: linear-gradient(90deg,
                transparent 0%,
                var(--vp-c-brand) 20%,
                var(--vp-c-brand-light) 80%,
                transparent 100%);
    }
}
</style>
