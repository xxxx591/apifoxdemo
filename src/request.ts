/*eslint-disable*/
import axios from 'axios'
// import { axiosAddToken, nodeAddToken } from './addToken'
// import { API_BASE_URL } from '@/consts/env';
import { getTokenKey } from '@/localStorage';
import { message } from 'antd';

axios.defaults.withCredentials = true
axios.defaults.timeout = 50000
axios.defaults.headers.common['Content-Type'] = 'application/json'
// axios.defaults.baseURL = baseUrl;

// 中间件 拦截请求-
axios.interceptors.request.use(
    config => {
        // @ts-ignore
        config.metadata = {
            startTime: new Date().getTime(),
        }

        let token = getTokenKey()
        // 规避 调用openai接口
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        if (!(config?.headers && config?.headers?.Authorization)) {
            // const newConfig = axiosAddToken(config)
            return config
        }
        return config
    },
    err => {
        return Promise.reject(err)
    }
)

axios.interceptors.response.use(
    response => {
        if (response.status === 200) {
            if (response.data.code !== 200) {
              message.error('操作失败:' + response.data.message)
              return Promise.reject()
            }
            return response.data
          } else {
            // 如果接口请求失败
            if (response.data.code !== 0) {
              let errMsg = response.data.message || '系统错误'
      
              message.error(errMsg)
              return Promise.reject(errMsg)
            }
            return response.data
          }
    },
    err => {
        if (!err.response) {
            return
        }
        const res = err.response
        const newRes = {
            ...res,
        }

        // console.error('err', newRes)
        // try {
        //   apiErrReport(newRes)
        // } catch (error) {
        //   console.error(error)
        // }
        if ([500, 502, 503].indexOf(res.status) > -1) {
            console.error('500服务端错误，请稍后重试！')
        } else if (res.status === 401) {
            console.error('需要登陆授权')
        } else if (res.status === 403) {
            console.error('抱歉！你暂无权限操作此功能')
        } else if ([400, 404].indexOf(res.status) > -1) {
            console.error('400/404 接口请求失败，请重试！如有疑问，联系管理员。')
        }
        return Promise.reject(err);
    }
)

/**
 * get
 * @param url
 * @param data
 * @returns {Promise}
 */
const get = <T>(
    url = '',
    params = {}
): Promise<{
    code: number
    data: T
}> => {
    // params.withCredentials = true
    return new Promise((resolve, reject) => {
        axios
            .get(url, {
                params,
            })
            .then(response => {
                if (response && response.data) {
                    resolve(response?.data)
                } else {
                    // @ts-ignore
                    resolve({ data: [] })
                }
            })
            .catch(error => {
                reject(error)
            })
    })
}

/**
 * post
 * @param url
 * @param data
 * @param config
 * @returns {Promise}
 */
const post = <T>(
    url = '',
    data = {}
): Promise<{
    id: PromiseLike<never>;
    code: number
    data: T
}> => {
    return new Promise((resolve, reject) => {
        // console.log('data', data);
        axios.post(url, data).then(
            response => {
                if (response && response.data) {
                    resolve(response?.data)
                } else {
                    reject(response)
                }
            },
            error => {
                reject(error)
            }
        )
    })
}

/**
 * put
 * @param url
 * @param data
 * @returns {Promise}
 */

const put = (url = '', params = {}) => {
    return new Promise((resolve, reject) => {
        axios.put(url, params).then(
            response => {
                resolve(response?.data)
            },
            err => {
                reject(err)
            }
        )
    })
}

/**
 * delete
 * @param url
 * @param data
 * @returns {Promise}
 */
const rDelete = (url = '', params = {}) => {
  return new Promise((resolve, reject) => {
    axios.delete(url, params).then(
      response => {
        resolve(response?.data)
      },
      err => {
        reject(err)
      }
    )
  })
}

export default {
    get,
    put,
    post,
    rDelete
}
