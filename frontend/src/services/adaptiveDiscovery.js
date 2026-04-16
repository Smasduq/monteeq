/**
 * adaptiveDiscovery.js
 * 3-Layer Adaptation Logic:
 * L1: Reaction to skip streaks (short clips, high engagement).
 * L2: Genre diversification.
 * L3: Mood Hints.
 */

class AdaptiveDiscovery {
    constructor() {
        this.skipStreak = 0;
        this.lastActionTime = Date.now();
        this.interestVector = {}; // sessionId based vector
        this.adjacentMap = {
            'funny': ['vibes', 'memes'],
            'tech': ['future', 'ai', 'science'],
            'vibes': ['music', 'arts', 'nature'],
            'default': ['foryou', 'trending']
        };
    }

    recordSkip(videoId, currentMood) {
        const now = Date.now();
        const delta = now - this.lastActionTime;
        this.lastActionTime = now;

        if (delta < 2500) { // Considered a "fast skip" if under 2.5s
            this.skipStreak++;
        } else {
            this.skipStreak = 0;
        }

        return this.getLayerResponse(currentMood);
    }

    recordWatch(videoId, durationMs, totalDurationMs, mood) {
        this.skipStreak = 0;
        this.lastActionTime = Date.now();

        const watchRatio = durationMs / totalDurationMs;
        if (!this.interestVector[mood]) this.interestVector[mood] = 0;
        
        // Boost interest if watched more than 50%
        if (watchRatio > 0.5) {
            this.interestVector[mood] += 1;
        }
    }

    getLayerResponse(currentMood) {
        const response = {
            tier: 0,
            shouldDiversify: false,
            shouldSuggestMoodSwitch: false,
            suggestedMood: null
        };

        if (this.skipStreak >= 3) {
            response.tier = 1; // L1: Short clips, high hook
        }

        if (this.skipStreak >= 5) {
            response.tier = 2; // L2: Diversify content
            response.shouldDiversify = true;
            const neighbors = this.adjacentMap[currentMood] || this.adjacentMap['default'];
            response.suggestedMood = neighbors[Math.floor(Math.random() * neighbors.length)];
        }

        if (this.skipStreak >= 7) {
            response.tier = 3; // L3: Suggest direct mood switch
            response.shouldSuggestMoodSwitch = true;
        }

        return response;
    }

    reRankBatch(clips, layerResponse) {
        let sorted = [...clips];

        // Scoring for AI mock
        const getScore = (c) => {
            let score = (c.likes_count * 2) + (c.comment_count * 5);
            if (layerResponse.tier >= 1 && c.duration < 15) score += 1000; // Boost short videos in L1
            return score;
        };

        sorted.sort((a, b) => getScore(b) - getScore(a));

        if (layerResponse.shouldDiversify && layerResponse.suggestedMood) {
            // Logic to fetch or inject adjacent content would go here
            console.log(`[AdaptiveDiscovery] Diversifying feed towards ${layerResponse.suggestedMood}`);
        }

        return sorted;
    }

    reset() {
        this.skipStreak = 0;
    }
}

export const adaptiveDiscovery = new AdaptiveDiscovery();
