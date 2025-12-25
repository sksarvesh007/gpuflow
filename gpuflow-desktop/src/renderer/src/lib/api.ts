import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export interface LoginResponse {
  access_token: string
  token_type: string
}

export interface UserResponse {
  id: string
  email: string
  credits: number
  is_active: boolean
}

export interface RegisterData {
  email: string
  password: string
}

export interface HealthCheckResponse {
  status: string
  db_status: string
  project: string
  version: string
}

export const healthCheck = async (): Promise<HealthCheckResponse> => {
  const response = await axios.get<HealthCheckResponse>('http://localhost:8000/', {
    timeout: 5000,
    headers: {
      'Accept': 'application/json'
    }
  })
  return response.data
}

export interface MachineResponse {
  id: string
  name: string
  description?: string
  auth_token: string
  is_online: boolean
  status: string
  device_id?: string
  gpu_name?: string
  vram_gb?: number
}

export interface MachineCreate {
  name: string
  description?: string
  device_id: string
  gpu_name?: string
  vram_gb?: number
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const formData = new FormData()
    formData.append('username', email)
    formData.append('password', password)

    const response = await api.post<LoginResponse>('/login/access-token', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  register: async (data: RegisterData): Promise<UserResponse> => {
    const response = await api.post<UserResponse>('/users/', data)
    return response.data
  },

  getCurrentUser: async (): Promise<UserResponse> => {
    const response = await api.get<UserResponse>('/users/me')
    return response.data
  }
}

export const machineApi = {
  getMachines: async (): Promise<MachineResponse[]> => {
    const response = await api.get<MachineResponse[]>('/machines/')
    return response.data
  },

  registerMachine: async (data: MachineCreate): Promise<MachineResponse> => {
    const response = await api.post<MachineResponse>('/machines/', data)
    return response.data
  }
}

export default api
