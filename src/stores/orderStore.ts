import { observable, ObservableMap, action, runInAction } from 'mobx'
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
    count: number
  }

  /** 历史订单页面数据 */
  hisOrderListData: {
    ids: string[]
    page: number
    num: number
    count: number
  }

  /** 获取订单数据, 默认请求第一页20条数据  type 1:待接订单 2:已处理订单 */
  fetchOrderData: (params: { type: 1 | 2; page?: number; num?: number }) => Promise<any>
  /** 取消订单 */
  cancelOrder: (orderId: string) => Promise<any>
  /** 确认订单 */
  confirmOrder: (orderId: string) => Promise<any>
}

class OrderStore implements IOrderStore {
  orderData: ObservableMap<string, IOrderDetail> = observable.map()

  @observable
  orderListData = {
    ids: [] as string[],
    page: 1,
    num: 0,
    count: 0
  }
  @observable
  hisOrderListData = {
    ids: [] as string[],
    page: 1,
    num: 0,
    count: 0
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
        this.orderData.merge(resData.lists.map(item => [item.order_number, item]))
        this.orderListData.page = reqParams.page
        this.orderListData.num = reqParams.num
        this.orderListData.count = resData.count

        if (reqParams.page === 1) {
          // 加载第一页
          this.orderListData.ids = idList
        } else {
          // 翻页
          this.orderListData.ids.concat(idList)
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
        this.hisOrderListData.count = resData.count

        if (reqParams.page === 1) {
          // 加载第一页
          this.hisOrderListData.ids = idList
        } else {
          // 翻页
          this.hisOrderListData.ids.concat(idList)
        }
      })
    }
  }

  @action
  async cancelOrder (orderId: string) {
    try {
      await shopService.fetchCancelOrder({ order_number: orderId })
    } catch (err) {
      console.log(err)
    }
  }

  @action
  async confirmOrder (orderId: string) {
    try {
      await shopService.fetchConfirmOrder({ order_number: orderId })
    } catch (err) {
      console.log(err)
    }
  }
}

export default OrderStore
