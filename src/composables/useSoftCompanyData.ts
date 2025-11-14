import { ref } from 'vue';
import { prospectsAPI } from '@/services/prospects';
import type { 
  SoftCompanyDataDto, 
  ParsedSoftCompanyData, 
  PersonalizationHook, 
  CompanyEvent, 
  NewsItem, 
  SocialActivity 
} from '@/types/prospect';

export function useSoftCompanyData() {
  const loading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Parse JSON strings from DTO to structured data
   */
  const parseSoftData = (dto: SoftCompanyDataDto | null): ParsedSoftCompanyData | null => {
    if (!dto) return null;

    const safeJsonParse = (jsonString: string | null | undefined): any[] => {
      if (!jsonString || jsonString === 'null' || jsonString === 'undefined') {
        return [];
      }
      try {
        const parsed = JSON.parse(jsonString);
        return Array.isArray(parsed) ? parsed : [];
      } catch (err) {
        console.warn('Failed to parse JSON string:', jsonString, err);
        return [];
      }
    };

    try {
      return {
        hooks: safeJsonParse(dto.hooksJson),
        events: safeJsonParse(dto.recentEventsJson),
        news: safeJsonParse(dto.newsItemsJson),
        socialActivity: safeJsonParse(dto.socialActivityJson),
        sources: safeJsonParse(dto.sourcesJson),
        researchedAt: new Date(dto.researchedAt)
      };
    } catch (err) {
      console.error('Failed to parse soft company data:', err);
      return null;
    }
  };

  /**
   * Generate soft company data for a prospect
   */
  const generateSoftData = async (prospectId: string): Promise<SoftCompanyDataDto | null> => {
    loading.value = true;
    error.value = null;

    try {
      const data = await prospectsAPI.generateSoftCompanyData(prospectId);
      return data;
    } catch (err: any) {
      error.value = err.response?.data?.error || err.message || 'Kunde inte generera mjuk företagsdata';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Check if soft data is stale (older than X days)
   */
  const isDataStale = (dto: SoftCompanyDataDto | null, maxAgeDays: number = 7): boolean => {
    if (!dto) return true;
    
    const researchDate = new Date(dto.researchedAt);
    const now = new Date();
    const daysDiff = (now.getTime() - researchDate.getTime()) / (1000 * 60 * 60 * 24);
    
    return daysDiff > maxAgeDays;
  };

  /**
   * Format research date for display
   */
  const formatResearchDate = (dto: SoftCompanyDataDto | null): string => {
    if (!dto) return '';
    
    const date = new Date(dto.researchedAt);
    return date.toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Get age of research data in days
   */
  const getDataAgeDays = (dto: SoftCompanyDataDto | null): number => {
    if (!dto) return 0;
    
    const researchDate = new Date(dto.researchedAt);
    const now = new Date();
    return Math.floor((now.getTime() - researchDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  return {
    loading,
    error,
    parseSoftData,
    generateSoftData,
    isDataStale,
    formatResearchDate,
    getDataAgeDays
  };
}
