import Taro, { Component, Config } from '@tarojs/taro'
import { observer, inject } from '@tarojs/mobx'
import { View, Text } from '@tarojs/components'
import './index.scss'
import { IOrderStore } from '@/stores/orderStore'
import { IOrderDetail } from '@/interfaces/order'
import transformPrice from '@/utils/transformPrice'
import { AtButton } from 'taro-ui'
import wrapUserAuth from '@/components/HOC/wrapUserAuth'
import { ICommonStore } from '@/stores/commonStore'

/**
 * 当前页面路由参数
 */
export interface IOrderRoute {
  order_type?: 'history'
}

interface IState {
  isLabelSend: boolean
}

interface InjectStoreProps {
  orderStore: IOrderStore
  commonStore: ICommonStore
}

/**
 * 待确认订单列表页
 */
@wrapUserAuth
@inject('orderStore', 'commonStore')
@observer
class OrderPage extends Component<{}, IState> {
  get inject () {
    // 兼容注入store
    return this.props as InjectStoreProps
  }

  /** 当前页面状态 默认 current， current:接单页面  history: 历史订单*/
  private pageType: 'current' | 'history' = 'current'

  readonly state: IState = { isLabelSend: false }

  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    navigationBarTitleText: '订单',
    enablePullDownRefresh: true
  }

  componentWillMount () {
    const { commonStore } = this.inject

    this.pageType = this.$router.params.order_type || 'current'

    if (this.pageType === 'current') {
      Taro.setNavigationBarTitle({ title: '接单' })
    } else {
      Taro.setNavigationBarTitle({ title: '历史订单' })
    }

    // 启用低功耗蓝牙notify 功能，订阅特征值
    Taro.notifyBLECharacteristicValueChange({
      deviceId: commonStore.BLEInformation.deviceId,
      serviceId: commonStore.BLEInformation.notifyServiceId,
      characteristicId: commonStore.BLEInformation.notifyCharaterId,
      state: true
    }).then(() => {
      Taro.onBLECharacteristicValueChange(r => {
        console.log(`characteristic ${r.characteristicId} has changed, now is ${r}`)
      })
    })
  }

  componentDidMount () {
    const type = this.pageType === 'current' ? 1 : 2

    this.inject.orderStore.fetchOrderData({ type })
  }

  /**
   * 下拉刷新处理
   */
  onPullDownRefresh () {
    const type = this.pageType === 'current' ? 1 : 2

    this.inject.orderStore.fetchOrderData({ type })
  }

  /**
   * 监听用户上拉触底事件
   * 触底加载新数据
   */
  onReachBottom () {
    const { orderStore: { orderListData, fetchOrderData }} = this.inject
    const type = this.pageType === 'current' ? 1 : 2

    if (orderListData.ids.length < orderListData.count) {
      // 加载下一页内容
      fetchOrderData({ type, page: orderListData.page + 1 })
    }
  }

  componentWillUnmount () {
    const { BLEInformation } = this.inject.commonStore

    Taro.closeBLEConnection({ deviceId: BLEInformation.deviceId }).then(() => {
      console.log('关闭蓝牙成功')
    })
  }

  /**
   * 调用蓝牙打印机
   */
  handlePrintOrder (data: IOrderDetail) {
    // TODO

    console.log(data)
  }

  /**
   * 取消订单
   */
  handleCancelOrder (orderId: string) {
    this.inject.orderStore.cancelOrder(orderId)
  }

  /**
   * 开始制作
   */
  handleMaking (orderId: string) {
    this.inject.orderStore.confirmOrder(orderId)
  }

  render () {
    const { orderStore: { orderData, orderListData, hisOrderListData }} = this.inject
    const listData = this.pageType === 'current' ? orderListData : hisOrderListData

    if (listData.ids.length <= 0) {
      return false
    }

    return (
      <View className='orderPage'>
        {listData.ids.map(id => {
          const data = (orderData.get(id) || {}) as IOrderDetail
          const { order_number, sum_money, insert_date, order_no, product_lists, events } = data

          return (
            <View key={id} className='orderCard'>
              <View className='cardTop'>
                <View className='orderItemNo'>{order_no}</View>
                <View>{insert_date}</View>
              </View>
              <View className='cardMain'>
                <View className='orderProduct'>
                  {product_lists.map((item, index) =>
                    <View key={index} className='orderProductItem'>
                      <Text className='name'>{item.title}</Text>
                      <Text className='num'>x{item.num}</Text>
                      <Text className='mark'>{item.standard_text}</Text>
                    </View>)}
                </View>
              </View>
              <View className='cardFooter'>
                <View className='orderBilling'>
                  <View className='orderPrice'>￥{transformPrice(sum_money)}</View>
                </View>
                <View className='orderAction'>
                  {(!!~events.indexOf('print') || !!~events.indexOf('reprint')) &&
                    <AtButton size='small' onClick={this.handlePrintOrder.bind(this, data)}>
                      打印
                    </AtButton>
                  }
                  {!!~events.indexOf('cancel_payment_order') &&
                    <AtButton size='small' onClick={this.handleCancelOrder.bind(this, order_number)}>
                      取消
                    </AtButton>
                  }
                  {!!~events.indexOf('receipt_order') &&
                    <AtButton size='small' onClick={this.handleMaking.bind(this, order_number)} type='primary'>
                      开始制作
                    </AtButton>
                  }
                </View>
              </View>
            </View>
          )
        })}
      </View>
    )
  }
}

export default OrderPage
