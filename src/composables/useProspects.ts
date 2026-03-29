import { ref, onMounted } from 'vue';
import { prospectsApi } from '@/features/prospects/api/prospectsApi';
import type { Prospect, CreateProspectRequest, UpdateProspectRequest, PendingProspectDto } from '@/types/prospect';
import { getApiErrorMessage } from '@/shared/utils/apiError';

export function useProspects() {
  const prospects = ref<Prospect[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchProspects = async () => {
    loading.value = true;
    error.value = null;
    try {
      prospects.value = await prospectsApi.getAll();
    } catch (err: unknown) {
      error.value = getApiErrorMessage(err, 'Ett fel uppstod');
    } finally {
      loading.value = false;
    }
  };

  const createProspect = async (data: CreateProspectRequest): Promise<Prospect | null> => {
    error.value = null;
    try {
      const newProspect = await prospectsApi.create(data);
      prospects.value.push(newProspect);
      return newProspect;
    } catch (err: unknown) {
      error.value = getApiErrorMessage(err, 'Kunde inte skapa prospect');
      throw err;
    }
  };

  const updateProspect = async (id: string, data: UpdateProspectRequest): Promise<Prospect | null> => {
    error.value = null;
    try {
      const updatedProspect = await prospectsApi.update(id, data);
      const index = prospects.value.findIndex(p => p.id === id);
      if (index !== -1) {
        prospects.value[index] = updatedProspect;
      }
      return updatedProspect;
    } catch (err: unknown) {
      error.value = getApiErrorMessage(err, 'Kunde inte uppdatera prospect');
      throw err;
    }
  };

  const deleteProspect = async (id: string): Promise<void> => {
    error.value = null;
    try {
      await prospectsApi.delete(id);
      prospects.value = prospects.value.filter(p => p.id !== id);
    } catch (err: unknown) {
      error.value = getApiErrorMessage(err, 'Kunde inte ta bort prospect');
      throw err;
    }
  };

  // ============ CAPSULE CRM METHODS ============

  const fetchPendingProspects = async (): Promise<PendingProspectDto[]> => {
    error.value = null;
    try {
      return await prospectsApi.getPending();
    } catch (err: unknown) {
      error.value = getApiErrorMessage(err, 'Kunde inte hämta pending prospects');
      throw err;
    }
  };

  const claimProspect = async (id: string): Promise<Prospect | null> => {
    error.value = null;
    try {
      const claimed = await prospectsApi.claimPending(id);
      prospects.value.push(claimed);
      return claimed;
    } catch (err: unknown) {
      error.value = getApiErrorMessage(err, 'Kunde inte claima prospect');
      throw err;
    }
  };

  const rejectProspect = async (id: string): Promise<void> => {
    error.value = null;
    try {
      await prospectsApi.rejectPending(id);
    } catch (err: unknown) {
      error.value = getApiErrorMessage(err, 'Kunde inte avvisa prospect');
      throw err;
    }
  };

  onMounted(fetchProspects);

  return {
    prospects,
    loading,
    error,
    fetchProspects,
    createProspect,
    updateProspect,
    deleteProspect,
    fetchPendingProspects,
    claimProspect,
    rejectProspect
  };
}