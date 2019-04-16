import { observable } from 'mobx'

export interface IUserStore {
  /** 登录状态 */
  isLogin: boolean
}

class UserStore implements IUserStore {
  @observable
  isLogin = false
}

export default UserStore
