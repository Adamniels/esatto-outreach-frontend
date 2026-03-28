import { ProspectStatus, type ProspectStatus as ProspectStatusType } from '@/types/prospect'

export function getProspectStatusClass(status: ProspectStatusType): string {
  switch (status) {
    case ProspectStatus.New:
      return 'bg-blue-100 text-blue-800'
    case ProspectStatus.Researched:
      return 'bg-amber-100 text-amber-800'
    case ProspectStatus.Drafted:
      return 'bg-purple-100 text-purple-800'
    case ProspectStatus.Emailed:
      return 'bg-indigo-100 text-indigo-800'
    case ProspectStatus.Responded:
      return 'bg-emerald-100 text-emerald-800'
    case ProspectStatus.Archived:
      return 'bg-gray-100 text-gray-600'
    default:
      return 'bg-gray-100 text-gray-500'
  }
}

