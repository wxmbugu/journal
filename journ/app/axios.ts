import axios from 'axios'
import { router } from 'expo-router'

const createAxiosInstance = (session: any) => {
  const axiosInstance = axios.create({
    baseURL: 'http://192.168.100.101:5000/', // Replace with your API base URL
  })

  axiosInstance.interceptors.request.use(
    async (config) => {
      if (session) {
        config.headers.Authorization = `Bearer ${session.access_token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    },
  )
  axiosInstance.interceptors.response.use(
    (response) => {
      return response
    },
    async (error) => {
      if (error.response && error.response.status === 401) {
        // Handle 401 Unauthorized error, e.g., redirect to login page
        // Replace '/login' with your actual login route
        router.replace('/login')
      }
      return Promise.reject(error)
    },
  )
  return axiosInstance
}

export default createAxiosInstance
