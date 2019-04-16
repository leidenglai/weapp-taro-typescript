import '@tarojs/async-await'
import Taro, { Component, Config } from '@tarojs/taro'
import { Provider } from '@tarojs/mobx'
import CommonStore from './stores/commonStore'
import UserStore from './stores/userStore'
import ProductStore from './stores/productStore'
import DashboradStore from './stores/dashboradStore'
import OrderStore from './stores/orderStore'

import './app.scss'

const store = {
  commonStore: new CommonStore(),
  userStore: new UserStore(),
  productStore: new ProductStore(),
  dashboradStore: new DashboradStore(),
  orderStore: new OrderStore()
}

class App extends Component {
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    pages: [
      'pages/index/index',
      'pages/account/login/index',
      'pages/bluetooth/index',
      'pages/dashborad/index',
      'pages/order/index',
      'pages/product/index',
      'pages/product/detail/index'
    ],
    window: {
      navigationBarBackgroundColor: '#fff',
      navigationBarTextStyle: 'black',
      navigationBarTitleText: '首页',
      backgroundTextStyle: 'light',
      backgroundColor: '#ffffff'
    }
  }

  componentDidMount () {}

  componentDidShow () {}

  componentDidHide () {}

  componentDidCatchError () {}

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render () {
    return <Provider store={store} />
  }
}

Taro.render(<App />, document.getElementById('app'))
