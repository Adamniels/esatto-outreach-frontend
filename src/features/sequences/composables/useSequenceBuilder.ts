import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { sequenceApi } from '@/features/sequences/api/sequenceApi';
import { useToast } from '@/composables/useToast';
import { 
  SequenceMode, 
  type SequenceDetailsDto, 
  type SequenceSettingsDto 
} from '@/types/sequence';

// Global singleton-like state for the builder session.
const currentStep = ref(0);
const isSaving = ref(false);
const selectedMode = ref<SequenceMode | null>(null);
const draftSequence = ref<SequenceDetailsDto | null>(null);

export function useSequenceBuilder() {
  const router = useRouter();
  const { notifyError, notifyInfo } = useToast();

  const resetBuilder = () => {
    currentStep.value = 0;
    isSaving.value = false;
    selectedMode.value = null;
    draftSequence.value = null;
  };

  const startSequence = async (mode: SequenceMode) => {
    try {
      isSaving.value = true;
      const result = await sequenceApi.create({
        title: `New ${mode} Sequence`,
        mode: mode
      });
      // Fetch full details to track nested steps/prospects
      draftSequence.value = await sequenceApi.getById(result.id);
      currentStep.value = 1;
    } catch (e: any) {
      notifyError(e.response?.data?.error || 'Failed to initialize sequence');
    } finally {
      isSaving.value = false;
    }
  };

  const goNext = async () => {
    if (currentStep.value === 0) {
      if (selectedMode.value) {
        await startSequence(selectedMode.value);
      } else {
         notifyError('Please select a sequence mode first.');
      }
      return;
    }
    
    if (currentStep.value === 3) {
      // Transition out of the wizard: Jump to Overview + trigger Generation
      await finishBuilderAndGenerate();
      return;
    }

    // Otherwise, validate and go next
    currentStep.value++;
  };

  const goBack = () => {
    if (currentStep.value > 0) {
      currentStep.value--;
    } else {
      router.push('/sequences');
    }
  };

  const finishBuilderAndGenerate = async () => {
    if (!draftSequence.value) return;
    
    try {
      isSaving.value = true;
      const sequenceId = draftSequence.value.id;
      
      // Navigate eagerly so the user sees the "Generating... " screen immediately
      router.push(`/sequences/${sequenceId}`);
      resetBuilder();

      // Trigger asynchronous generation across all steps
      // No await! We fire and forget this in the background
      triggerBackgroundGeneration(sequenceId);
    } catch (e: any) {
      notifyError('Failed to transition to overview.');
      isSaving.value = false;
    }
  };

  const triggerBackgroundGeneration = async (sequenceId: string) => {
    try {
      notifyInfo('Sequence generation started. This takes a few moments.');
      
      // Re-fetch to get steps just in case
      const sequence = await sequenceApi.getById(sequenceId);
      
      // Sequentially generate content for all steps
      for (const step of sequence.steps) {
        if (!step.generatedBody) {
          await sequenceApi.generateStepContent(sequenceId, step.id);
        }
      }
      
      notifyInfo('Generation complete! You can now review and activate your sequence.', {
        text: 'View Sequence',
        url: `/sequences/${sequenceId}`
      });
      
    } catch (e: any) {
      notifyError('Error generating sequence content in the background.');
    }
  };

  // Validations per step
  const canProceed = computed(() => {
    if (isSaving.value) return false;
    if (currentStep.value === 0) return selectedMode.value !== null;
    if (!draftSequence.value) return false;
    
    if (currentStep.value === 1) {
      // Must have at least one step
      return draftSequence.value.steps.length > 0;
    }
    
    if (currentStep.value === 2) {
      // Must have at least one prospect
      return draftSequence.value.prospects.length > 0;
    }

    if (currentStep.value === 3) {
      return true; // Settings always fine
    }

    return true;
  });

  return {
    currentStep,
    isSaving,
    selectedMode,
    draftSequence,
    canProceed,
    startSequence,
    goNext,
    goBack,
    resetBuilder
  };
}
