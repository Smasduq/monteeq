/**
 * metricsManager.js
 * Smart batching for engagement events (watch time, skips).
 * Flushes every 8s, 10 events, or on page unload.
 */

import { API_BASE_URL } from '../api';

class MetricsManager {
    constructor() {
        this.buffer = [];
        this.batchInterval = 8000; // 8 seconds
        this.threshold = 10; // 10 events
        this.timer = null;
        this.setupUnloadListeners();
    }

    setupUnloadListeners() {
        // Use visibilitychange and pagehide for reliable flushing on mobile/desktop
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.flush();
            }
        });

        window.addEventListener('pagehide', () => this.flush());
    }

    track(type, videoId, data = {}) {
        const event = {
            type,
            video_id: videoId,
            timestamp: Date.now(),
            ...data
        };

        this.buffer.push(event);

        if (this.buffer.length >= this.threshold) {
            this.flush();
        } else if (!this.timer) {
            this.startTimer();
        }
    }

    startTimer() {
        this.timer = setTimeout(() => {
            this.flush();
        }, this.batchInterval);
    }

    async flush() {
        if (this.buffer.length === 0) return;

        const payload = [...this.buffer];
        this.buffer = [];
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }

        try {
            // Use fetch with keepalive: true for reliable delivery on navigation
            const response = await fetch(`${API_BASE_URL}/metrics/batch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ events: payload }),
                keepalive: true
            });
            
            if (!response.ok) {
                console.warn('[MetricsManager] Failed to flush batch, retrying later...');
                this.buffer = [...payload, ...this.buffer]; // Re-add for next successful flush
            }
        } catch (err) {
            console.error('[MetricsManager] Error flushing metrics:', err);
            this.buffer = [...payload, ...this.buffer];
        }
    }

    // Specific helpers
    trackWatchTime(videoId, durationMs) {
        this.track('watch_time', videoId, { duration_ms: durationMs });
    }

    trackSkip(videoId) {
        this.track('skip', videoId);
    }
}

export const metricsManager = new MetricsManager();
