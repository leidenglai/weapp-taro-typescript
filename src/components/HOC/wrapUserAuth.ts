import Taro from '@tarojs/taro'
import hoistStatics from 'hoist-non-react-statics'
import { ComponentClass } from '@/interfaces/common'

/**
 * 页面级登录校验装饰器 反向继承(Inherbitance Inversion HOC)
 * InheritedPage.$componentType='PAGE'
 * 校验不通过替换为登录页，登录成功回到原页面
 */
export default function wrapUserAuth<T extends ComponentClass> (InheritedPage: T): T {
  class UserAuthPage extends InheritedPage {
    static displayName = InheritedPage.displayName || InheritedPage.name
    static propTypes = InheritedPage.propTypes
    static defaultProps = InheritedPage.defaultProps

    /** 当前页面是否登录 */
    private __isLogin: boolean = false

    componentWillMount () {
      if (this.$componentType === 'PAGE') {
        // 获取当前路由
        const path: string = this.$router.path || ''
        const token: string = Taro.getStorageSync('access_token')

        if (!token) {
          this.__isLogin = false

          Taro.redirectTo({ url: '/pages/account/login/index?redirect=' + path })
        } else {
          this.__isLogin = true
        }
      }

      if (super.componentWillMount) {
        super.componentWillMount()
      }
    }

    render () {
      if (this.$componentType === 'PAGE' && !this.__isLogin) {
        return null
      } else {
        return super.render()
      }
    }
  }

  // 拷贝静态属性
  // 类修饰器不能让属性丢失
  hoistStatics(UserAuthPage, InheritedPage)

  return UserAuthPage
}
