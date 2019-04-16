import Taro, { Component, Config } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtForm, AtInput, AtButton } from 'taro-ui'
import './index.scss'
import userService from '@/services/userService'

/** 当前页面路由参数 */
interface IRouter {
  redirect?: string
}

interface IState {
  username: string
  password: string
}

/**
 * 登录页
 **/
class AccountLoginPage extends Component<{}, IState> {
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = { navigationBarTitleText: '登录' }

  readonly state: IState = { username: '', password: '' }

  /**
   * 登录
   */
  handleSubmitLogin () {
    const { password, username } = this.state
    const { redirect } = this.$router.params as IRouter

    userService.fetchUserLogin({ username, password, os_type: 1 }).then(
      res => {
        // 登陆成功
        // 将access_token存在本地
        Taro.setStorageSync('access_token', res.access_token)

        if (redirect) {
          // 回到来源页
          Taro.redirectTo({ url: redirect })
        } else {
          // 跳转到首页
          Taro.redirectTo({ url: '/pages/index/index' })
        }
      },
      err => {
        // 登陆失败
        Taro.showToast({ title: err.message, icon: 'none' })
      }
    )
  }

  handleChangeUsername = (value: string) => {
    this.setState({ username: value })
  }
  handleChangePassword = (value: string) => {
    this.setState({ password: value })
  }

  render () {
    return (
      <View className='account-login__page'>
        <AtForm onSubmit={this.handleSubmitLogin.bind(this)}>
          <View className='account-login__input-group'>
            <View className='account-login__title'>登录</View>
            <AtInput name='username' type='phone' placeholder='手机号' value={this.state.username} onChange={this.handleChangeUsername} />
            <AtInput name='password' type='password' placeholder='密码' value={this.state.password} onChange={this.handleChangePassword} />
          </View>

          <View className='account-login__action'>
            <AtButton type='primary' formType='submit'>
              登录
            </AtButton>
          </View>
        </AtForm>
      </View>
    )
  }
}

export default AccountLoginPage
