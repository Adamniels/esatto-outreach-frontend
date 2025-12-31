import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export function useBackendStatus() {
  const isOnline = ref(false)
  const isChecking = ref(true)
  let intervalId: number | null = null

  const checkBackendHealth = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/prospects`, {
        timeout: 5000,
        validateStatus: (status) => status < 500 // Accept any non-server-error response
      })
      
      isOnline.value = response.status >= 200 && response.status < 500
      isChecking.value = false
    } catch (error) {
      isOnline.value = false
      isChecking.value = false
    }
  }

  const startHealthCheck = () => {
    // Initial check
    checkBackendHealth()
    
    // Check every 30 seconds
    intervalId = window.setInterval(() => {
      checkBackendHealth()
    }, 30000)
  }

  const stopHealthCheck = () => {
    if (intervalId !== null) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  onMounted(() => {
    startHealthCheck()
  })

  onUnmounted(() => {
    stopHealthCheck()
  })

  return {
    isOnline,
    isChecking,
    checkBackendHealth
  }
}
