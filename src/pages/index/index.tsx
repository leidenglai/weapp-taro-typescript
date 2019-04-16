import Taro, { Component, Config } from '@tarojs/taro'
import { View, Navigator, Text } from '@tarojs/components'
import './index.scss'
import wrapUserAuth from '@/components/HOC/wrapUserAuth'

@wrapUserAuth
class IndexPage extends Component {
  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = { navigationBarTitleText: '首页' }

  render () {
    return (
      <View className='index__page'>
        <View className='index__nav-wrap'>
          <View className='index__item-card'>
            <Navigator url='/pages/product/index' className='index__card-box'>
              <Text className='icon iconNavProduct' />
              <View className='title'>我的商品</View>
            </Navigator>
          </View>
          <View className='index__item-card'>
            <Navigator url='/pages/order/index' className='index__card-box'>
              <Text className='icon iconNavOrder' />
              <View className='title'>接单</View>
            </Navigator>
          </View>
          <View className='index__item-card'>
            <Navigator url='/pages/order/history/index' className='index__card-box'>
              <Text className='icon iconNavOrderHis' />
              <View className='title'>历史订单</View>
            </Navigator>
          </View>
          <View className='index__item-card'>
            <Navigator url='/pages/dashboard/index' className='index__card-box'>
              <Text className='icon iconNavDashboard' />
              <View className='title'>统计</View>
            </Navigator>
          </View>
          <View className='index__item-card'>
            <Navigator url='/pages/bluetooth/index' className='index__card-box'>
              <Text className='icon iconNavBlurt' />
              <View className='title'>蓝牙连接</View>
            </Navigator>
          </View>
        </View>
      </View>
    )
  }
}

export default IndexPage
