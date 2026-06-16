<template>
    <div class="learn-page">
        <div
            class="feed-masonry"
            :style="{ columnCount: columnCount }"
        >
            <div
                v-for="post in filteredPosts"
                :key="post.id"
                class="feed-card surface-card surface-card--interactive"
                @click="openPost(post)"
            >
                <div
                    class="feed-cover"
                    :style="{ height: post.coverHeight + 'px' }"
                >
                    <img
                        :src="post.cover"
                        :alt="post.title"
                        class="feed-cover-img"
                        loading="lazy"
                    />
                    <span
                        class="feed-level"
                        :class="`badge-${post.level}`"
                    >{{ post.level }}</span>
                    <div v-if="post.type === 'video'" class="feed-video-badge">
                        <n-icon :size="14" color="#fff">
                            <Play />
                        </n-icon>
                        <span>{{ post.duration }}</span>
                    </div>
                </div>
                <div class="feed-body">
                    <p class="feed-title">{{ post.title }}</p>
                    <div class="feed-meta">
                        <span class="feed-author">{{ post.author }}</span>
                        <span class="feed-likes">
                            <n-icon :size="13">
                                <HeartOutline />
                            </n-icon>
                            {{ formatLikes(post.likes) }}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- 图文详情 -->
        <Teleport to="body">
            <Transition name="detail-fade">
                <div
                    v-if="showArticle && currentArticle"
                    class="article-overlay"
                >
                    <header class="article-header">
                        <button
                            class="article-back"
                            @click="closeArticle"
                        >
                            <n-icon :size="22">
                                <ChevronBack />
                            </n-icon>
                        </button>
                        <span class="article-header-title">图文详情</span>
                    </header>

                    <div class="article-scroll">
                        <div class="article-content-wrap">
                            <h2 class="article-title">
                                {{ currentArticle.title }}
                            </h2>
                            <div class="article-author-row">
                                <span class="article-author">{{
                                    currentArticle.author
                                }}</span>
                                <span
                                    class="article-level"
                                    :class="`badge-${currentArticle.level}`"
                                >{{ currentArticle.level }}</span>
                            </div>
                            <div
                                ref="articleContentRef"
                                class="article-content"
                                v-html="currentArticle.content"
                            />
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>

        <!-- 视频播放 -->
        <n-modal
            v-model:show="showVideo"
            preset="card"
            :title="currentVideo?.title"
            class="video-modal"
            :style="{ width: videoModalWidth }"
            :bordered="false"
            @after-leave="onVideoClose"
        >
            <div v-if="currentVideo" class="video-player-wrap">
                <video
                    ref="videoRef"
                    class="video-player"
                    :src="currentVideo.videoUrl"
                    controls
                    playsinline
                    @click.stop
                />
                <p
                    v-if="currentVideo.description"
                    class="video-desc"
                >
                    {{ currentVideo.description }}
                </p>
            </div>
        </n-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { NIcon, NModal } from 'naive-ui'
import {
    Play,
    HeartOutline,
    ChevronBack,
} from '@vicons/ionicons5'
import type { LearnPost, LearnArticle, LearnVideo } from '../types'
import { learnPosts } from '../data/learnPosts'
import { useBreakpoint } from '../composables/useBreakpoint'
import { useLearnStore } from '../stores/learn'

const { isMobile, isTablet } = useBreakpoint()
const learnStore = useLearnStore()

const columnCount = computed(() => {
    if (isMobile.value) return 2
    if (isTablet.value) return 3
    return 4
})

const videoModalWidth = computed(() =>
    isMobile.value ? 'calc(100vw - 32px)' : '720px'
)

const showArticle = ref(false)
const showVideo = ref(false)
const currentArticle = ref<LearnArticle | null>(null)
const currentVideo = ref<LearnVideo | null>(null)
const articleContentRef = ref<HTMLElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)

const filteredPosts = computed(() => {
    const category = learnStore.category
    if (category === 'all') return learnPosts
    return learnPosts.filter((p) => p.category === category)
})

function formatLikes(n: number): string {
    if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
    return String(n)
}

function openPost(post: LearnPost): void {
    if (post.type === 'article') {
        currentArticle.value = post
        showArticle.value = true
        document.body.style.overflow = 'hidden'
    } else {
        currentVideo.value = post
        showVideo.value = true
    }
}

function pauseArticleMedia(): void {
    articleContentRef.value
        ?.querySelectorAll('video, audio')
        .forEach((el) => {
            const media = el as HTMLMediaElement
            media.pause()
            media.currentTime = 0
        })
}

function closeArticle(): void {
    pauseArticleMedia()
    showArticle.value = false
    document.body.style.overflow = ''
}

function onVideoClose(): void {
    if (videoRef.value) {
        videoRef.value.pause()
        videoRef.value.currentTime = 0
    }
    currentVideo.value = null
}

watch(showVideo, async (open) => {
    if (open) {
        await nextTick()
        videoRef.value?.play().catch(() => {})
    }
})
</script>

<style scoped>
.learn-page {
    max-width: 100%;
    width: 100%;
    min-width: 0;
}

.feed-masonry {
    column-gap: 10px;
}

.feed-card {
    break-inside: avoid;
    margin-bottom: 10px;
    overflow: hidden;
    border-radius: var(--radius-md);
}

.feed-cover {
    position: relative;
    overflow: hidden;
    background: var(--surface-muted);
}

.feed-cover-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.feed-level {
    position: absolute;
    top: 8px;
    left: 8px;
    font-size: 10px;
    font-weight: 500;
    padding: 2px 7px;
    border-radius: 100px;
    backdrop-filter: blur(4px);
}

.feed-video-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    border-radius: 100px;
    background: rgba(0, 0, 0, 0.55);
    color: #fff;
    font-size: 11px;
    font-weight: 500;
}

.feed-body {
    padding: 10px 10px 12px;
}

.feed-title {
    font-size: 13px;
    font-weight: 500;
    color: var(--text-primary);
    line-height: 1.45;
    margin: 0 0 8px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.feed-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
}

.feed-author {
    font-size: 11px;
    color: var(--text-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
}

.feed-likes {
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 11px;
    color: var(--text-muted);
    flex-shrink: 0;
}

.badge-初级 {
    color: var(--color-down);
    background: var(--color-down-bg);
}

.badge-中级 {
    color: var(--gold-primary);
    background: rgba(212, 168, 67, 0.12);
}

.badge-高级 {
    color: var(--color-up);
    background: var(--color-up-bg);
}

/* ── 图文详情全屏层 ── */
.article-overlay {
    position: fixed;
    inset: 0;
    z-index: 2000;
    background: var(--bg-primary);
    display: flex;
    flex-direction: column;
}

.article-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border-subtle);
    flex-shrink: 0;
}

.article-back {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 50%;
    background: var(--surface-muted);
    color: var(--text-primary);
    cursor: pointer;
    transition: background var(--transition-fast);
}

.article-back:hover {
    background: var(--bg-card-hover);
}

.article-header-title {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
}

.article-scroll {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
}

.article-content-wrap {
    padding: 20px 16px 40px;
    max-width: 720px;
    margin: 0 auto;
}

.article-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.4;
    margin-bottom: 12px;
}

.article-author-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
}

.article-author {
    font-size: 13px;
    color: var(--text-muted);
}

.article-level {
    font-size: 11px;
    font-weight: 500;
    padding: 2px 8px;
    border-radius: 100px;
}

.article-content {
    color: var(--text-secondary);
    line-height: 1.8;
    font-size: 14px;
}

.article-content :deep(h3) {
    color: var(--gold-primary);
    margin: 18px 0 8px;
    font-size: 16px;
}

.article-content :deep(h4) {
    color: var(--gold-light);
    margin: 14px 0 6px;
    font-size: 14px;
}

.article-content :deep(ul) {
    padding-left: 18px;
    margin: 8px 0;
}

.article-content :deep(li) {
    margin: 4px 0;
}

.article-content :deep(b) {
    color: var(--text-primary);
}

.article-content :deep(p) {
    margin: 8px 0;
}

.article-content :deep(img) {
    width: 100%;
    border-radius: var(--radius-md);
    margin: 16px 0;
    display: block;
}

.article-content :deep(video) {
    width: 100%;
    border-radius: var(--radius-md);
    margin: 16px 0;
    background: #000;
    display: block;
}

.article-content :deep(audio) {
    width: 100%;
    margin: 12px 0;
    display: block;
}

/* ── 视频播放 ── */
.video-player-wrap {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.video-player {
    width: 100%;
    border-radius: var(--radius-md);
    background: #000;
    aspect-ratio: 16 / 9;
}

.video-desc {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.6;
    margin: 0;
}

/* ── 过渡动画 ── */
.detail-fade-enter-active,
.detail-fade-leave-active {
    transition: opacity 0.25s ease;
}

.detail-fade-enter-from,
.detail-fade-leave-to {
    opacity: 0;
}
</style>
