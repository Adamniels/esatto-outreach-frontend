export interface CompanyInfo {
  id: string
  name: string
  overview: string
  valueProposition: string
}

export interface CompanyInfoUpdateDto {
  name: string
  overview: string
  valueProposition: string
}

export interface ProjectCase {
  id: string
  clientName: string
  text: string
  isActive: boolean
}

export interface ProjectCaseUpdateDto {
  clientName: string
  text: string
  isActive: boolean
}

