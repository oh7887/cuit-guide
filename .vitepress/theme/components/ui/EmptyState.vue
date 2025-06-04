<template>
    <div class="empty-state">
        <div class="icon-container">
            <svg class="empty-icon" viewBox="0 0 1024 1024" width="200" height="200">
                <path
                    d="M512 0C229.2 0 0 229.2 0 512s229.2 512 512 512 512-229.2 512-512S794.8 0 512 0z m50.9 517.7l145.1 145c12.5 12.5 12.5 32.8 0 45.3-6.3 6.3-14.4 9.4-22.6 9.4s-16.4-3.1-22.6-9.4L517.7 562.9c-3.1-3.1-8.2-3.1-11.3 0L361.3 708c-12.5 12.5-32.8 12.5-45.3 0-6.3-6.3-9.4-14.4-9.4-22.6s3.1-16.4 9.4-22.6l145.1-145.1c3.1-3.1 3.1-8.2 0-11.3L316 361.3c-12.5-12.5-12.5-32.8 0-45.3 6.3-6.3 14.4-9.4 22.6-9.4s16.4 3.1 22.6 9.4l145.1 145.1c3.1 3.1 8.2 3.1 11.3 0L662.7 316c12.5-12.5 32.8-12.5 45.3 0 6.3 6.3 9.4 14.4 9.4 22.6s-3.1 16.4-9.4 22.6L562.9 506.3a8.15 8.15 0 0 0 0 11.4z"
                    fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
            </svg>
        </div>
        <h3 class="title">{{ title }}</h3>
        <p class="description">{{ description }}</p>
        <slot name="action"></slot>
    </div>
</template>

<script setup lang="ts">
defineProps({
    title: {
        type: String,
        default: "没有找到内容"
    },
    description: {
        type: String,
        default: "尝试调整筛选条件或检查输入内容"
    }
})
</script>

<style scoped>
.empty-state {
    --empty-bg: var(--vp-c-bg-soft);
    --empty-border: var(--vp-c-divider);
    --empty-text: var(--vp-c-text-2);
    --empty-icon: var(--vp-c-text-3);

    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    width: 500px;
    padding: 48px 24px;
    background: var(--empty-bg);
    border: 1px solid var(--empty-border);
    border-radius: 12px;
    margin: 32px auto;
    transition: all 0.3s ease;
}

.icon-container {
    width: 80px;
    height: 80px;
    margin-bottom: 24px;
    color: var(--vp-c-text-3);
}

.empty-icon {
    width: 100%;
    height: 100%;
    opacity: 0.8;
}

.title {
    font-size: 20px;
    font-weight: 600;
    color: var(--vp-c-text-1);
    margin-bottom: 12px;
    line-height: 1.4;
}

.description {
    font-size: 14px;
    color: var(--empty-text);
    max-width: 480px;
    line-height: 1.6;
    margin: 0 auto 20px;
}

@media (prefers-color-scheme: dark) {
    .icon-container {
        color: var(--vp-c-text-2);
    }
}

/* 移动端适配 */
@media (max-width: 768px) {
    .empty-state {
        width: 60%;
        padding: 32px 16px;
        margin: 24px 20%;
        border-radius: 8px;
    }

    .icon-container {
        width: 64px;
        height: 64px;
        margin-bottom: 16px;
    }

    .title {
        font-size: 18px;
        margin-bottom: 8px;
    }

    .description {
        font-size: 13px;
        padding: 0 8px;
    }
}

@media (max-width: 480px) {
    .empty-state {
        padding: 24px 12px;
    }

    .icon-container {
        width: 56px;
        height: 56px;
    }

    .title {
        font-size: 16px;
    }

    .description {
        font-size: 12px;
    }
}
</style>
