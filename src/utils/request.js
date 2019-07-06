import axios from "axios"
import { message } from 'antd'

const service = axios.create({
    baseURL: 'http://localhost:9100',
    timeout: 5000
})

// 请求拦截器 
service.interceptors.request.use(
    config => {
        // 发送请求前做些什么
        return config
    },
    error => {
        // 请求错误做些什么
        console.log(error)
        Promise.reject(error)
    }
)

// 响应拦截器
service.interceptors.response.use(
    response => response,
    error => {
        console.log('err' + error)
        message.error(error.message, 5 * 1000)
        return Promise.reject(error)
    }
)

export default service