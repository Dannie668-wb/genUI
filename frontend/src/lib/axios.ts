import axios from 'axios'

const http = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 10000,
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (res) => res.data,
  (err) => {
    console.error('[HTTP Error]', err.response?.status, err.message)
    return Promise.reject(err)
  }
)

export default http
