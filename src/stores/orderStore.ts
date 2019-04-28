import { observable, ObservableMap, action, runInAction, computed, decorate } from 'mobx'
import shopService from '@/services/shopService'
import { IOrderDetail } from '@/interfaces/order'

/**
 * 订单数据
 **/
export interface IOrderStore {
  /** 实时订单数据源 */
  orderData: Map<string, IOrderDetail>

  /** 列表页面数据 */
  orderListData: {
    ids: string[]
    page: number
    num: number
  }

  /** 列表数据是否已经请求完 */
  listIsEnd: boolean

  /** 历史订单页面数据 */
  hisOrderListData: {
    ids: string[]
    page: number
    num: number
  }
  /** 历史列表数据是否已经请求完 */
  hisListIsEnd: boolean

  /** 获取订单数据, 默认请求第一页20条数据  type 1:待接订单 2:已处理订单 */
  fetchOrderData: (params: { type: 1 | 2; page?: number; num?: number }) => Promise<any>
  /** 取消订单 */
  cancelOrder: (orderId: string) => Promise<any>

  /** 确认打印 */
  confirmOrder: (orderId: string) => Promise<any>
}

class OrderStore implements IOrderStore {
  orderData: ObservableMap<string, IOrderDetail> = observable.map({}, { deep: false })

  @observable
  orderListData = {
    ids: [] as string[],
    page: 1,
    num: 0
  }
  @computed
  get listIsEnd () {
    if (this.orderListData.ids.length <= 0) {
      return false
    }

    return this.orderListData.ids.length < this.orderListData.page * 20
  }

  @observable
  hisOrderListData = {
    ids: [] as string[],
    page: 1,
    num: 0
  }
  @computed
  get hisListIsEnd () {
    if (this.hisOrderListData.ids.length <= 0) {
      return false
    }

    return this.hisOrderListData.ids.length < this.hisOrderListData.page * 20
  }

  @action
  async fetchOrderData (params) {
    // 加入默认参数
    const reqParams = Object.assign({ num: 20, page: 1 }, params)

    // 获取后端数据
    if (params.type === 1) {
      const resData = await shopService.fetchOrderList(reqParams)
      const idList = resData.lists.map(item => item.order_number)

      runInAction(() => {
        // 填入产品map对象
        this.orderData.merge(
          resData.lists.map(item => {
            decorate(item, { events: observable })

            return [item.order_number, item]
          })
        )
        this.orderListData.page = reqParams.page
        this.orderListData.num = reqParams.num

        if (reqParams.page === 1) {
          // 加载第一页
          this.orderListData.ids = idList
        } else {
          // 翻页
          this.orderListData.ids.push(...idList)
        }
      })
    } else {
      const resData = await shopService.fetchHisOrderList(reqParams)
      const idList = resData.lists.map(item => item.order_number)

      runInAction(() => {
        // 填入产品map对象
        this.orderData.merge(resData.lists.map(item => [item.order_number, item]))
        this.hisOrderListData.page = reqParams.page
        this.hisOrderListData.num = reqParams.num

        if (reqParams.page === 1) {
          // 加载第一页
          this.hisOrderListData.ids = idList
        } else {
          // 翻页
          this.hisOrderListData.ids.push(...idList)
        }
      })
    }
  }

  @action
  async cancelOrder (orderId: string) {
    try {
      await shopService.fetchCancelOrder({ order_number: orderId })

      const idList = this.orderListData.ids

      // 待接单中的取消
      runInAction(() => {
        this.orderListData.ids = idList.filter(id => id !== orderId)
      })
    } catch (err) {
      console.log(err)
    }
  }

  @action
  async confirmOrder (orderId: string) {
    try {
      const resData = await shopService.fetchConfirmOrder({ order_number: orderId })

      // 状态扭转
      runInAction(() => {
        this.orderData.get(orderId)!.events = resData.events
      })
    } catch (err) {
      console.log(err)
    }
  }
}

export default OrderStore
