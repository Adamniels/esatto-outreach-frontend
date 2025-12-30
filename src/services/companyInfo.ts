import api from './api'

export interface CaseDetail {
  name: string
  industry: string
  challenge: string
  solution: string
  result: string
}

export interface CaseItem {
  pageTitle: string
  pageType: string
  case: CaseDetail
  services: string[]
  industries: string[]
  methodsOrTech: string[]
  valuesOrTone: string[]
}

export interface CompanyInfo {
  overview: string
  cases: CaseItem[]
}

export const companyInfoAPI = {
  /**
   * Get company information from JSON file
   */
  get: async (): Promise<CompanyInfo> => {
    const response = await api.get('/settings/company-info')
    return response.data
  }
}
