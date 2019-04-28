import getBELSeviceId from '@/utils/getBELSeviceId'
import shopService from '@/services/shopService'
import Taro, { Component, Config } from '@tarojs/taro'
import transformPrice from '@/utils/transformPrice'
import wrapUserAuth from '@/components/HOC/wrapUserAuth'
import { AtButton } from 'taro-ui'
import { IBLEInformation } from '@/interfaces/common'
import { ICommonStore } from '@/stores/commonStore'
import { inject, observer } from '@tarojs/mobx'
import { IOrderDetail } from '@/interfaces/order'
import { IOrderStore } from '@/stores/orderStore'
import { runInAction } from 'mobx'
import { Text, View } from '@tarojs/components'
import './index.scss'

// ArrayBuffer转16进制字符串示例
function ab2hex (buffer: ArrayBuffer): string {
  const hexArr = Array.prototype.map.call(new Uint8Array(buffer), bit => ('00' + bit.toString(16)).slice(-2))

  return hexArr.join('')
}

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

  private printerData = {
    buffSize: [] as number[],
    oneTimeData: 0,
    printNum: [] as number[],
    printerNum: 0,
    looptime: 0,
    lastData: 0,
    currentTime: 0,
    currentPrint: 1
  }

  readonly state: IState

  private BLEInformation: IBLEInformation

  constructor (props) {
    super(props)

    this.state = { isLabelSend: false }

    const list: number[] = []
    const numList: number[] = []
    let j = 0

    for (var i = 20; i < 200; i += 10) {
      list[j] = i
      j++
    }
    for (var i = 1; i < 10; i++) {
      numList[i - 1] = i
    }

    this.printerData.buffSize = list
    this.printerData.oneTimeData = list[0]
    this.printerData.printNum = numList
    this.printerData.printerNum = numList[0]
  }

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
    this.pageType = this.$router.params.order_type || 'current'
    this.BLEInformation = Taro.getStorageSync('BLEInformation')

    if (this.pageType === 'current') {
      Taro.setNavigationBarTitle({ title: '接单' })
    } else {
      Taro.setNavigationBarTitle({ title: '历史订单' })
    }

    this.checkConnectionBLE().then(
      () => {
        console.log('connectionBLE init')
      },
      () => {
        console.log('尝试直接初始连接失败')
      }
    )

    Taro.onBLEConnectionStateChange(res => {
      // 该方法回调中可以用于处理连接意外断开等异常情况
      console.log(`device ${res.deviceId} state has changed, connected: ${res.connected}`)

      if (res.deviceId === (this.BLEInformation && this.BLEInformation.deviceId)) {
        runInAction(() => {
          // 需要重新连接和获取服务
          this.inject.commonStore.isBELconnect = false
          this.inject.commonStore.isBELservices = false
        })
      }
    })
  }

  componentDidMount () {
    const type = this.pageType === 'current' ? 1 : 2

    this.inject.orderStore.fetchOrderData({ type })
  }

  componentDidShow () {
    this.BLEInformation = Taro.getStorageSync('BLEInformation')
  }

  /**
   * 下拉刷新处理
   */
  onPullDownRefresh () {
    const type = this.pageType === 'current' ? 1 : 2

    this.inject.orderStore.fetchOrderData({ type }).then(() => {
      Taro.stopPullDownRefresh()
    })
  }

  /**
   * 监听用户上拉触底事件
   * 触底加载新数据
   */
  onReachBottom () {
    const { orderStore: { orderListData, listIsEnd, hisListIsEnd, hisOrderListData }} = this.inject

    // 区分历史订单和接单页面
    const type = this.pageType === 'current' ? 1 : 2
    const isEnd = this.pageType === 'current' ? listIsEnd : hisListIsEnd
    const page = this.pageType === 'current' ? orderListData.page : hisOrderListData.page

    if (!isEnd) {
      // 加载下一页内容
      this.inject.orderStore.fetchOrderData({ type, page: page + 1 })
    }
  }

  /**
   * 检查蓝牙连接以及服务
   * 尝试连接低功耗蓝牙 启用notify功能，订阅特征值
   */
  async checkConnectionBLE () {
    const { commonStore } = this.inject

    if (this.BLEInformation && this.BLEInformation.deviceId) {
      if (!commonStore.isBELconnect) {
        try {
          // 如果之前已连接过，直接尝试连接设备
          await Taro.createBLEConnection({ deviceId: this.BLEInformation.deviceId })

          console.log('连接成功：', this.BLEInformation.deviceId)
        } catch (err) {
          if (err.errCode === -1) {
            // 安卓如果已连接会报错 -1， 所以也不catch -1
          } else {
            console.log('低功耗蓝牙设备连接错误：', err)
            console.log('错误码请查看官方文档：https://developers.weixin.qq.com/miniprogram/dev/api/wx.createBLEConnection.html')

            return Promise.reject(err)
          }
        }

        // 状态修改为已连接
        runInAction(() => {
          commonStore.isBELconnect = true
        })
      }

      if (!commonStore.isBELservices) {
        try {
          // 获取服务
          const newBLEInformation = await getBELSeviceId(this.BLEInformation.deviceId)

          // 启用低功耗蓝牙notify 功能，订阅特征值
          await Taro.notifyBLECharacteristicValueChange({
            deviceId: this.BLEInformation.deviceId,
            serviceId: newBLEInformation.notifyServiceId,
            characteristicId: newBLEInformation.notifyCharaterId,
            state: true
          })

          console.log('启用低功耗蓝牙notify 功能，订阅特征值')
          Taro.onBLECharacteristicValueChange(r => {
            console.log(`characteristic ${r.characteristicId} has changed, now is ${r}`)
            console.log(ab2hex(r.value))
          })

          runInAction(() => {
            commonStore.isBELservices = true
            commonStore.BLEServices = newBLEInformation
          })
        } catch (err) {
          if (err.errCode === 10006) {
            // 当前连接已断开
            runInAction(() => {
              this.inject.commonStore.isBELconnect = false
              this.inject.commonStore.isBELservices = false
            })
          }

          if (err.errCode) {
            console.log('获取服务，启用低功耗蓝牙notify功能，订阅特征值错误：', err)
          } else {
            console.log('连接失败:', err)
          }

          return Promise.reject(err)
        }
      }
    } else {
      console.log('未初始化蓝牙适配器')

      return Promise.reject({ errCode: 10000, errMsg: '未初始化蓝牙适配器' })
    }
  }

  /**
   * 请求打印log 接口请求后再打印
   */
  async handlePrintMsg (orderData: IOrderDetail) {
    try {
      await this.checkConnectionBLE()
      await shopService.fetchPrintOrderCb({ order_number: orderData.order_number })

      this.handlePrintOrder(orderData)
    } catch (err) {
      if (err && err.errCode === 10000) {
        Taro.navigateTo({ url: '/pages/bluetooth/index' }).then(() => {
          Taro.showToast({ title: '请连接打印机', icon: 'none' })
        })
      }

      return console.log(err)
    }
  }

  /**
   * 创建打印消息
   */
  async handlePrintOrder (orderData: IOrderDetail) {
    try {
      await this.checkConnectionBLE()
    } catch (err) {
      if (err && err.errCode === 10000) {
        Taro.navigateTo({ url: '/pages/bluetooth/index' }).then(() => {
          Taro.showToast({ title: '请连接打印机', icon: 'none' })
        })
      }

      return console.log(err)
    }

    // 调用打印标记
    console.log('打印订单，order_number:', orderData.order_number)

    this.setState({ isLabelSend: true })
    this.prepareSend()
  }

  /**
   * 调用打印机
   */
  prepareSend = () => {
    // TODO
  }

  /**
   * 取消订单
   */
  handleCancelOrder (orderId: string) {
    Taro.showModal({
      title: '取消订单',
      content: '你确定要取消本订单吗？',
      success: res => {
        if (res.confirm) {
          console.log('用户点击确定取消订单')
          this.inject.orderStore.cancelOrder(orderId)
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  }

  /**
   * 开始制作
   */
  handleMaking (orderId: string) {
    console.log(orderId)
    this.inject.orderStore.confirmOrder(orderId)
  }

  /**
   * 拨打电话
   */
  handkeCallPhone (phoneNumber: string) {
    Taro.makePhoneCall({ phoneNumber })
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
          const { order_number, sum_money, insert_date, buy_phone, take_number, product_lists, events } = data

          return (
            <View key={id} className='orderCard'>
              <View className='cardTop'>
                <View className='orderItemNo'>{take_number}号</View>
                <View className='orderDate'>{insert_date}</View>
                <View className='orderPhone' onClick={this.handkeCallPhone.bind(this, buy_phone)}>
                  {buy_phone}
                </View>
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
                  {!!~events.indexOf('reprint') &&
                    <AtButton size='small' onClick={this.handlePrintOrder.bind(this, data)} className='button'>
                      再次打印
                    </AtButton>
                  }
                  {!!~events.indexOf('print') &&
                    <AtButton size='small' onClick={this.handlePrintMsg.bind(this, data)} className='button green'>
                      打印
                    </AtButton>
                  }
                  {!!~events.indexOf('cancel_payment_order') &&
                    <AtButton size='small' onClick={this.handleCancelOrder.bind(this, order_number)} className='button'>
                      取消
                    </AtButton>
                  }
                  {!!~events.indexOf('receipt_order') &&
                    <AtButton size='small' onClick={this.handleMaking.bind(this, order_number)} type='primary' className='button'>
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
