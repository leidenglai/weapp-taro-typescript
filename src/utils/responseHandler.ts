import Taro from '@tarojs/taro'
import { IResError } from 'src/interfaces/common'
import { request } from '@tarojs/taro'

/**
 * 处理返回值
 * @param {Response} response 后端返回的response对象，微信小程序的数据结构
 * @returns {Promise} 直接返回data或者错误对象
 */
export default function responseHandler (response: request.Promised<any>) {
  return new Promise((resolve: (data: any) => void, reject: (data: IResError) => void) => {
    // 服务器返回状态
    if (response.statusCode !== 200) {
      return reject({ code: response.statusCode, data: response.data })
    }

    // 业务报错
    if (response.data.error_code === 401) {
      // 清除过期的登录状态
      Taro.removeStorageSync('access_token')
      // 跳转到登录页
      Taro.navigateTo({ url: '/pages/account/login/index' })

      // 需要重新登录
      return reject({ code: response.data.error_code, message: response.data.error_msg })
    } else if (response.data.error_code) {
      // 业务报错
      return reject({ code: response.data.error_code, message: response.data.error_msg })
    }

    // 正常
    resolve(response.data.response_data)
  })
}
