<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useIntervalFn } from '@vueuse/core';
import browser from 'webextension-polyfill';
import {
  Play,
  Pause,
  SkipForward,
  Search as SearchIcon,
  ExternalLink,
  Loader2,
} from 'lucide-vue-next';
import {
  MessageType,
  PlaybackAction,
  VideoState,
  YouTubeTab,
  GetYouTubeTabsResponse,
} from '@shared/types';
import { POPUP_STATE_POLL_INTERVAL } from '@shared/constants';

// State
const youtubeTabs = ref<YouTubeTab[]>([]);
const selectedTabId = ref<number | null>(null);
const videoState = ref<VideoState | null>(null);
const isLoading = ref(true);
const searchQuery = ref('');
const isSeeking = ref(false);

// Computed
const hasYouTubeTabs = computed(() => youtubeTabs.value.length > 0);
const isPlaying = computed(() => videoState.value?.isPlaying || false);

// Format time helper
function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Get YouTube tabs
async function fetchYouTubeTabs() {
  try {
    const response: GetYouTubeTabsResponse = await browser.runtime.sendMessage({
      type: MessageType.GET_YOUTUBE_TABS,
    });
    
    youtubeTabs.value = response.tabs;
    
    if (response.activeTab && response.activeTab.id) {
      selectedTabId.value = response.activeTab.id;
    } else if (response.tabs.length > 0) {
      selectedTabId.value = response.tabs[0].id;
    } else {
      selectedTabId.value = null;
    }
  } catch (error) {
    console.error('Error fetching YouTube tabs:', error);
  }
}

// Get video state from selected tab
async function fetchVideoState() {
  if (!selectedTabId.value) {
    videoState.value = null;
    return;
  }

  try {
    const state = await browser.runtime.sendMessage({
      type: MessageType.GET_VIDEO_STATE,
      tabId: selectedTabId.value,
    });
    
    if (state) {
      videoState.value = state;
    }
  } catch (error) {
    console.error('Error fetching video state:', error);
  }
}

// Control playback
async function controlPlayback(action: PlaybackAction) {
  if (!selectedTabId.value) return;

  try {
    const state = await browser.runtime.sendMessage({
      type: MessageType.CONTROL_PLAYBACK,
      tabId: selectedTabId.value,
      payload: { action },
    });
    
    if (state) {
      videoState.value = state;
    }
  } catch (error) {
    console.error('Error controlling playback:', error);
  }
}

// Seek to position
async function seekTo(time: number) {
  if (!selectedTabId.value || isSeeking.value) return;

  isSeeking.value = true;
  try {
    const state = await browser.runtime.sendMessage({
      type: MessageType.SEEK_TO,
      tabId: selectedTabId.value,
      payload: { time },
    });
    
    if (state) {
      videoState.value = state;
    }
  } catch (error) {
    console.error('Error seeking:', error);
  } finally {
    isSeeking.value = false;
  }
}

// Handle progress bar change
function onProgressChange(value: number[]) {
  if (value[0] !== undefined) {
    seekTo(value[0]);
  }
}

// Open YouTube
async function openYouTube() {
  try {
    await browser.runtime.sendMessage({
      type: MessageType.OPEN_YOUTUBE,
    });
    
    // Refresh tabs after a short delay
    setTimeout(fetchYouTubeTabs, 500);
  } catch (error) {
    console.error('Error opening YouTube:', error);
  }
}

// Search YouTube
async function searchYouTube() {
  if (!searchQuery.value.trim()) return;

  try {
    await browser.runtime.sendMessage({
      type: MessageType.SEARCH_YOUTUBE,
      payload: { query: searchQuery.value },
    });
    
    searchQuery.value = '';
    // Refresh tabs after a short delay
    setTimeout(fetchYouTubeTabs, 500);
  } catch (error) {
    console.error('Error searching YouTube:', error);
  }
}

// Handle search form submit
function handleSearchSubmit(e: Event) {
  e.preventDefault();
  searchYouTube();
}

// Initialize
async function initialize() {
  isLoading.value = true;
  await fetchYouTubeTabs();
  await fetchVideoState();
  isLoading.value = false;
}

// Auto-update state
const { pause: pauseUpdates, resume: resumeUpdates } = useIntervalFn(
  async () => {
    await fetchVideoState();
  },
  POPUP_STATE_POLL_INTERVAL,
  { immediate: false }
);

onMounted(async () => {
  await initialize();
  resumeUpdates();
});

onUnmounted(() => {
  pauseUpdates();
});
</script>

<template>
  <div class="youtube-controller">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <Loader2 class="animate-spin" :size="32" />
      <p>Loading...</p>
    </div>

    <!-- Main Content -->
    <div v-else class="controller-content">
      <!-- No YouTube Tab -->
      <div v-if="!hasYouTubeTabs" class="no-tab-container">
        <img src="/icon-with-shadow.svg" class="logo" alt="YouTube Controller" />
        <h2>No YouTube Tab Found</h2>
        <p>Open a YouTube video to start controlling playback</p>
        <button @click="openYouTube" class="open-youtube-btn">
          <ExternalLink :size="20" />
          Open YouTube
        </button>
      </div>

      <!-- Has YouTube Tab -->
      <div v-else class="has-tab-container">
        <!-- Header -->
        <div class="header">
          <img src="/icon-with-shadow.svg" class="header-logo" alt="YouTube Controller" />
          <h1>YouTube Controller</h1>
        </div>

        <!-- Tab Selector (if multiple tabs) -->
        <div v-if="youtubeTabs.length > 1" class="tab-selector">
          <label for="tab-select">Active Tab:</label>
          <select
            id="tab-select"
            v-model="selectedTabId"
            @change="fetchVideoState"
            class="tab-select"
          >
            <option v-for="tab in youtubeTabs" :key="tab.id" :value="tab.id">
              {{ tab.title }}
            </option>
          </select>
        </div>

        <!-- Video Info -->
        <div v-if="videoState" class="video-info">
          <!-- Thumbnail -->
          <div class="thumbnail-container">
            <img
              :src="videoState.thumbnail"
              :alt="videoState.title"
              class="thumbnail"
            />
          </div>

          <!-- Video Details -->
          <div class="video-details">
            <h2 class="video-title">{{ videoState.title }}</h2>
            <p class="channel-name">{{ videoState.channel }}</p>
          </div>

          <!-- Progress Bar -->
          <div class="progress-container">
            <input
              type="range"
              :min="0"
              :max="videoState.duration"
              :value="videoState.currentTime"
              @input="(e) => seekTo(Number((e.target as HTMLInputElement).value))"
              class="progress-bar"
              :disabled="isSeeking"
            />
            <div class="time-display">
              <span>{{ formatTime(videoState.currentTime) }}</span>
              <span>{{ formatTime(videoState.duration) }}</span>
            </div>
          </div>

          <!-- Playback Controls -->
          <div class="controls">
            <button
              @click="controlPlayback(PlaybackAction.TOGGLE)"
              class="control-btn play-pause-btn"
              :title="isPlaying ? 'Pause' : 'Play'"
            >
              <Pause v-if="isPlaying" :size="24" />
              <Play v-else :size="24" />
            </button>
            <button
              @click="controlPlayback(PlaybackAction.NEXT)"
              class="control-btn"
              title="Next Video"
            >
              <SkipForward :size="24" />
            </button>
          </div>
        </div>

        <!-- No Video Playing -->
        <div v-else class="no-video">
          <p>No video currently playing</p>
        </div>

        <!-- Search Section -->
        <div class="search-section">
          <div class="separator"></div>
          <form @submit="handleSearchSubmit" class="search-form">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search YouTube..."
              class="search-input"
            />
            <button type="submit" class="search-btn" :disabled="!searchQuery.trim()">
              <SearchIcon :size="20" />
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.youtube-controller {
  width: 400px;
  min-height: 500px;
  max-height: 600px;
  background: #0f0f0f;
  color: #ffffff;
  font-family: 'Roboto', 'Arial', sans-serif;
  overflow-y: auto;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  gap: 1rem;
}

.controller-content {
  display: flex;
  flex-direction: column;
}

/* No Tab Container */
.no-tab-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  gap: 1rem;
  min-height: 500px;
}

.logo {
  width: 80px;
  height: 80px;
  margin-bottom: 1rem;
}

.no-tab-container h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.no-tab-container p {
  color: #aaaaaa;
  margin: 0;
}

.open-youtube-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #cc0000;
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 1rem;
}

.open-youtube-btn:hover {
  background: #ff0000;
}

/* Has Tab Container */
.has-tab-container {
  display: flex;
  flex-direction: column;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-bottom: 1px solid #272727;
}

.header-logo {
  width: 32px;
  height: 32px;
}

.header h1 {
  font-size: 1.25rem;
  font-weight: 500;
  margin: 0;
}

/* Tab Selector */
.tab-selector {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #272727;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab-selector label {
  font-size: 0.875rem;
  color: #aaaaaa;
}

.tab-select {
  flex: 1;
  background: #272727;
  color: white;
  border: 1px solid #3f3f3f;
  border-radius: 4px;
  padding: 0.5rem;
  font-size: 0.875rem;
}

/* Video Info */
.video-info {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.thumbnail-container {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.video-title {
  font-size: 1rem;
  font-weight: 500;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.channel-name {
  font-size: 0.875rem;
  color: #aaaaaa;
  margin: 0;
}

/* Progress Container */
.progress-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-bar {
  width: 100%;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: #3f3f3f;
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.progress-bar::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  background: #cc0000;
  border-radius: 50%;
  cursor: pointer;
}

.progress-bar::-moz-range-thumb {
  width: 12px;
  height: 12px;
  background: #cc0000;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}

.progress-bar:hover::-webkit-slider-thumb {
  background: #ff0000;
}

.progress-bar:hover::-moz-range-thumb {
  background: #ff0000;
}

.time-display {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #aaaaaa;
}

/* Controls */
.controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #272727;
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.control-btn:hover {
  background: #3f3f3f;
  transform: scale(1.05);
}

.play-pause-btn {
  width: 56px;
  height: 56px;
  background: #cc0000;
}

.play-pause-btn:hover {
  background: #ff0000;
}

/* No Video */
.no-video {
  padding: 2rem;
  text-align: center;
  color: #aaaaaa;
}

/* Search Section */
.search-section {
  margin-top: auto;
}

.separator {
  height: 1px;
  background: #272727;
  margin: 1rem 0;
}

.search-form {
  display: flex;
  gap: 0.5rem;
  padding: 0 1rem 1rem;
}

.search-input {
  flex: 1;
  background: #272727;
  border: 1px solid #3f3f3f;
  border-radius: 20px;
  padding: 0.75rem 1rem;
  color: white;
  font-size: 0.875rem;
  outline: none;
}

.search-input:focus {
  border-color: #065fd4;
}

.search-input::placeholder {
  color: #717171;
}

.search-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: #065fd4;
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.search-btn:hover:not(:disabled) {
  background: #1c72e8;
}

.search-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
