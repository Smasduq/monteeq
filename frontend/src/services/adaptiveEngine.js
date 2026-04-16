/**
 * adaptiveEngine.js
 * Hardware detection and real-time FPS monitoring for UI Tier management.
 */

const TIERS = {
    HIGH: 'HIGH',
    MID: 'MID',
    LOW: 'LOW'
};

class AdaptiveEngine {
    constructor() {
        this.tier = this.detectInitialTier();
        this.fpsThreshold = 40;
        this.sampleWindow = 2000; // 2 seconds
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.isMonitoring = false;
        this.onTierChange = null;
    }

    detectInitialTier() {
        // High-end: 8+ cores AND 8GB+ RAM
        const cores = navigator.hardwareConcurrency || 4;
        const memory = navigator.deviceMemory || 4; // in GB

        console.log(`[AdaptiveEngine] Detected: ${cores} cores, ${memory}GB memory`);

        if (cores >= 8 && memory >= 8) return TIERS.HIGH;
        if (cores >= 4 && memory >= 4) return TIERS.MID;
        return TIERS.LOW;
    }

    getPreloadConfig() {
        switch (this.tier) {
            case TIERS.HIGH:
                return { preloadCount: 5, renderBuffer: 3 };
            case TIERS.MID:
                return { preloadCount: 3, renderBuffer: 2 };
            case TIERS.LOW:
            default:
                return { preloadCount: 1, renderBuffer: 1 };
        }
    }

    startMonitoring(callback) {
        if (this.isMonitoring) return;
        this.isMonitoring = true;
        this.onTierChange = callback;
        this.frameCount = 0;
        this.monitorStartTime = performance.now();
        this.requestNextFrame();
    }

    requestNextFrame() {
        if (!this.isMonitoring) return;
        requestAnimationFrame((time) => {
            this.frameCount++;
            const delta = time - this.monitorStartTime;

            if (delta >= this.sampleWindow) {
                const fps = (this.frameCount * 1000) / delta;
                this.evaluateFPS(fps);
                this.frameCount = 0;
                this.monitorStartTime = time;
            }
            this.requestNextFrame();
        });
    }

    evaluateFPS(fps) {
        if (fps < this.fpsThreshold) {
            if (this.tier === TIERS.HIGH) {
                this.updateTier(TIERS.MID);
            } else if (this.tier === TIERS.MID) {
                this.updateTier(TIERS.LOW);
            }
        }
    }

    updateTier(newTier) {
        if (this.tier !== newTier) {
            this.tier = newTier;
            if (this.onTierChange) this.onTierChange(this.tier);
            console.warn(`[AdaptiveEngine] Tier adjusted to ${newTier} due to runtime performance.`);
        }
    }

    getTier() {
        return this.tier;
    }

    stopMonitoring() {
        this.isMonitoring = false;
    }
}

export const adaptiveEngine = new AdaptiveEngine();
export { TIERS };
