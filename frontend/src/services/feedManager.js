/**
 * feedManager.js  (Production-hardened)
 * ──────────────────────────────────────
 * Manages the recommendation feed lifecycle for the Flash/Home pages.
 *
 * Production features:
 *  ✓ Request timeout (AbortController) — never hangs on slow networks
 *  ✓ Graceful fallback chain: recommend/feed → /videos/ → localStorage cache
 *  ✓ localStorage stale cache — instant cold load while real data fetches
 *  ✓ Slow-network adaptation — smaller page size on 2G/3G
 *  ✓ Retry on fallback failure (2 attempts with 1 s delay)
 *  ✓ Background prefetch at 7-video lookahead threshold
 *  ✓ Prefetch guard — prevents duplicate in-flight requests
 *  ✓ Cache freshness check — ignores stale cache > 10 minutes old
 */

import { API_BASE_URL } from '../api';

// ── Constants ────────────────────────────────────────────────────────────────
const PREFETCH_TRIGGER    = 7;         // prefetch when this many clips remain
const PAGE_SIZE_FAST      = 15;        // clips per request on fast networks
const PAGE_SIZE_SLOW      = 8;         // clips per request on slow networks
const FETCH_TIMEOUT_MS    = 10_000;    // abort fetch after 10 s
const RETRY_DELAY_MS      = 1_000;     // pause before fallback retry
const MAX_FALLBACK_RETRIES = 2;
const LS_CACHE_KEY        = 'monteeq_feed_cache';
const LS_CACHE_TTL_MS     = 10 * 60 * 1000; // 10 minutes

class FeedManager {
    constructor() {
        /** @type {string|null} */
        this._token = null;

        /** 'flash' | 'home' */
        this._videoType = 'flash';

        /** mood/category string */
        this._mood = '';

        /** 'foryou' | 'trending' | 'following' */
        this._feedType = 'foryou';

        /** Prefetch in-flight guard */
        this._fetching = false;

        /** Registered callbacks for when prefetched data arrives */
        this._prefetchCallbacks = [];
    }

    // ── Configuration ─────────────────────────────────────────────────────────

    configure({ token, videoType = 'flash', mood = '', feedType = 'foryou' }) {
        this._token = token;
        this._videoType = videoType;
        this._mood = mood;
        this._feedType = feedType;
    }

    /** Subscribe to background-prefetch events. Returns an unsubscribe fn. */
    onPrefetch(callback) {
        this._prefetchCallbacks.push(callback);
        return () => {
            this._prefetchCallbacks = this._prefetchCallbacks.filter(cb => cb !== callback);
        };
    }

    // ── Network helpers ───────────────────────────────────────────────────────

    _isSlowNetwork() {
        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (!conn) return false;
        return ['slow-2g', '2g', '3g'].includes(conn.effectiveType);
    }

    _pageSize() {
        return this._isSlowNetwork() ? PAGE_SIZE_SLOW : PAGE_SIZE_FAST;
    }

    async _fetchWithTimeout(url, options = {}) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
        try {
            const res = await fetch(url, { ...options, signal: controller.signal });
            return res;
        } finally {
            clearTimeout(timeout);
        }
    }

    // ── localStorage cache ────────────────────────────────────────────────────

    _cacheKey() {
        return `${LS_CACHE_KEY}_${this._videoType}_${this._feedType}_${this._mood}`;
    }

    _saveCache(videos) {
        try {
            localStorage.setItem(this._cacheKey(), JSON.stringify({
                ts: Date.now(),
                videos,
            }));
        } catch {
            // Quota exceeded — silently skip
        }
    }

    _loadCache() {
        try {
            const raw = localStorage.getItem(this._cacheKey());
            if (!raw) return null;
            const { ts, videos } = JSON.parse(raw);
            if (Date.now() - ts > LS_CACHE_TTL_MS) return null; // stale
            return Array.isArray(videos) && videos.length > 0 ? videos : null;
        } catch {
            return null;
        }
    }

    // ── Feed Fetching ─────────────────────────────────────────────────────────

    /**
     * Fetch a fresh ranked feed.
     *
     * Strategy:
     *   1. Try GET /recommend/feed (personalised, authenticated)
     *   2. On failure → try GET /videos/ (standard, with retry)
     *   3. On total failure → return localStorage stale cache (if available)
     *   4. Otherwise throw
     *
     * @param {number} [limit]
     * @param {string|null} [mood]
     * @returns {Promise<Video[]>}
     */
    async fetchFeed(limit = this._pageSize(), mood = null) {
        const effectiveMood = mood ?? this._mood;
        const moodQ = effectiveMood ? `&mood=${encodeURIComponent(effectiveMood)}` : '';
        const headers = this._token ? { Authorization: `Bearer ${this._token}` } : {};

        // ── 1. Recommendation engine (authenticated users) ────────────────────
        if (this._token) {
            try {
                const moodQ = effectiveMood ? `&mood=${encodeURIComponent(effectiveMood)}` : '';
                const res = await this._fetchWithTimeout(
                    `${API_BASE_URL}/recommend/feed?video_type=${this._videoType}&feed_type=${this._feedType}&limit=${limit}${moodQ}`,
                    { headers }
                );
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data) && data.length > 0) {
                        this._saveCache(data);
                        return data;
                    }
                }
            } catch (err) {
                console.warn('[FeedManager] recommend/feed failed:', err.message);
            }
        }

        // ── 2. Standard /videos/ endpoint with retry ──────────────────────────
        for (let attempt = 0; attempt < MAX_FALLBACK_RETRIES; attempt++) {
            try {
                const res = await this._fetchWithTimeout(
                    `${API_BASE_URL}/videos/?video_type=${this._videoType}&limit=${limit}${moodQ}`,
                    { headers }
                );
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        this._saveCache(data);
                        return data;
                    }
                }
                throw new Error(`HTTP ${res.status}`);
            } catch (err) {
                const isLastAttempt = attempt === MAX_FALLBACK_RETRIES - 1;
                if (!isLastAttempt) {
                    console.warn('[FeedManager] Fallback failed, retrying in 1 s…', err.message);
                    await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
                }
            }
        }

        // ── 3. Stale cache as last resort ─────────────────────────────────────
        const cached = this._loadCache();
        if (cached) {
            console.warn('[FeedManager] Serving stale cache — network unavailable');
            return cached;
        }

        throw new Error('Feed unavailable: network error and no cached data');
    }

    /**
     * Returns the stale cache immediately for an instant cold-load experience,
     * then fetches a fresh feed in the background and calls `onFresh` with it.
     *
     * @param {(videos: Video[]) => void} onFresh  Called when fresh data arrives
     * @returns {Video[]|null}                     Stale cache (may be null)
     */
    fetchWithStaleWhileRevalidate(onFresh) {
        const stale = this._loadCache();

        // Fire fresh fetch in parallel — never awaited here
        this.fetchFeed()
            .then(fresh => {
                if (fresh && fresh.length > 0) onFresh(fresh);
            })
            .catch(err => console.warn('[FeedManager] Revalidation failed:', err.message));

        return stale;
    }

    // ── Consumption tracking ───────────────────────────────────────────────────

    /**
     * Call when a user advances to a new video.
     * Triggers a silent background prefetch when few clips remain.
     * @param {number} remainingCount
     */
    recordConsumption(remainingCount) {
        if (remainingCount <= PREFETCH_TRIGGER && !this._fetching) {
            this._backgroundPrefetch();
        }
    }

    async _backgroundPrefetch() {
        if (this._fetching) return;
        this._fetching = true;
        try {
            const newVideos = await this.fetchFeed(this._pageSize());
            if (newVideos.length > 0) {
                this._prefetchCallbacks.forEach(cb => cb(newVideos));
            }
        } catch (err) {
            console.warn('[FeedManager] Background prefetch failed:', err.message);
        } finally {
            this._fetching = false;
        }
    }

    resetConsumption() {
        this._fetching = false;
    }
}

export const feedManager = new FeedManager();
