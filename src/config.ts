/** 服务器协议 production 必须是https  */
export let SERVER_PROTOCOL = 'http://'

/** 后端 API 地址 */
export const SERVER_API_ROOT_API = 'api.xxxxx.com'

/** 请求默认参数 */
export const DEF_REQUEST_CONFIG = { access_token: '' // 用户登录获取，未登录状态不用传。本地存储 key为 access_token
}
