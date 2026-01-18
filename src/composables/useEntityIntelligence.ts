import { ref } from 'vue';
import { prospectsAPI } from '@/services/prospects';
import type { EntityIntelligenceDto } from '@/types/prospect';

export function useEntityIntelligence() {
    const loading = ref(false);
    const error = ref<string | null>(null);

    /**
     * Enrich prospect data (Entity Intelligence)
     */
    const enrichProspect = async (prospectId: string): Promise<EntityIntelligenceDto | null> => {
        loading.value = true;
        error.value = null;

        try {
            const data = await prospectsAPI.enrichProspect(prospectId);
            return data;
        } catch (err: any) {
            error.value = err.response?.data?.error || err.response?.data?.detail || err.message || 'Failed to enrich prospect data';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    /**
     * Check if intelligence data is stale (older than X days)
     */
    const isDataStale = (dto: EntityIntelligenceDto | null, maxAgeDays: number = 7): boolean => {
        if (!dto) return true;

        const researchDate = new Date(dto.researchedAt);
        const now = new Date();
        const daysDiff = (now.getTime() - researchDate.getTime()) / (1000 * 60 * 60 * 24);

        return daysDiff > maxAgeDays;
    };

    /**
     * Format research date for display
     */
    const formatResearchDate = (dto: EntityIntelligenceDto | null): string => {
        if (!dto) return '';

        const date = new Date(dto.researchedAt);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return {
        loading,
        error,
        enrichProspect,
        isDataStale,
        formatResearchDate
    };
}
