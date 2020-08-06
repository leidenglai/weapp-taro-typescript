import requestData from "@/utils/requestData";

/**
 * 对应后端用户相关 API
 */
class UserService {
  /**
   * 用户登录
   */
  fetchUserLogin(params: { username: string; password: string; os_type?: 1 }) {
    return requestData<{ access_token: string }>({
      method: "GET",
      api: "user/login",
      params
    });
  }
}

export default new UserService();
