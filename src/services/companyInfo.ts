import api from './api'
import type { CompanyInfo, CompanyInfoUpdateDto, ProjectCase, ProjectCaseUpdateDto } from '@/types/companyInfo'

export const companyInfoApi = {
  // --- COMPANY INFO ---
  getCompanyInfo: async (): Promise<CompanyInfo> => {
    const response = await api.get('/settings/company-info')
    return response.data
  },
  updateCompanyInfo: async (dto: CompanyInfoUpdateDto): Promise<CompanyInfo> => {
    const response = await api.put('/settings/company-info', dto)
    return response.data
  },

  // --- PROJECT CASES ---
  getProjectCases: async (): Promise<ProjectCase[]> => {
    const response = await api.get('/settings/company-info/cases')
    return response.data
  },
  getProjectCase: async (id: string): Promise<ProjectCase> => {
    const response = await api.get(`/settings/company-info/cases/${id}`)
    return response.data
  },
  createProjectCase: async (dto: ProjectCaseUpdateDto): Promise<ProjectCase> => {
    const response = await api.post('/settings/company-info/cases', dto)
    return response.data
  },
  updateProjectCase: async (id: string, dto: ProjectCaseUpdateDto): Promise<ProjectCase> => {
    const response = await api.put(`/settings/company-info/cases/${id}`, dto)
    return response.data
  },
  deleteProjectCase: async (id: string): Promise<void> => {
    await api.delete(`/settings/company-info/cases/${id}`)
  }
}

// Backward-compatible alias during migration
export const companyInfoAPI = companyInfoApi
