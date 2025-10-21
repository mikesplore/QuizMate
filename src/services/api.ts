import axios from 'axios'
import { DocumentProcessingRequest, ProcessedContent, DocumentPreview } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const previewDocument = async (file: File): Promise<DocumentPreview> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post<DocumentPreview>('/api/preview-document', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}

export const uploadDocument = async (
  file: File,
  config: DocumentProcessingRequest
): Promise<ProcessedContent> => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('config', JSON.stringify(config))

  const response = await api.post<ProcessedContent>('/api/process-document', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}

export const healthCheck = async (): Promise<{ status: string; gemini_configured: boolean }> => {
  const response = await api.get('/api/health')
  return response.data
}

export const getSupportedFormats = async (): Promise<{ formats: string[]; max_size_mb: number }> => {
  const response = await api.get('/api/supported-formats')
  return response.data
}

export default api
