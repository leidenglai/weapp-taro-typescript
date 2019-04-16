import requestData from '@/utils/requestData'

/**
 * 对应后端商家用户端相关 API
 */
class UserService {
  /**
   * 获取首页滑动分类
   */
  fetchUserLogin (params: { username: string; password: string; os_type?: 1 }): Promise<{ access_token: string }> {
    return requestData({
      method: 'POST',
      api: 'passport/user/user/login',
      params
    })
  }
}

export default new UserService()
