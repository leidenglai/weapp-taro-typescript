import requestData from '@/utils/requestData'
import { ILiProductInfo, IProductDetail } from '@/interfaces/product'
import { IOrderDetail } from '@/interfaces/order'
import { ISalesData, ISalesType } from '@/interfaces/dashborad'

/**
 * 对应后端商家端相关 API
 */
class ShopService {
  /**
   * 获取产品列表
   */
  fetchProductList (params: { page: number; num: number }): Promise<{ count: number; lists: ILiProductInfo[] }> {
    return requestData({
      method: 'POST',
      api: 'storex/shop/product/lists',
      params
    })
  }

  /**
   * 获取产品详情
   */
  fetchProductDetail (params: { product_id: number }): Promise<IProductDetail> {
    return requestData({
      method: 'GET',
      api: 'storex/shop/product/item',
      params
    })
  }

  /**
   * 上下架产品
   */
  setProductStatus (params: { product_id: number; status: 1 | 2 }): Promise<void> {
    return requestData({
      method: 'POST',
      api: 'storex/shop/product/set_status',
      params
    })
  }

  /**
   * 获取实时订单列表
   */
  fetchOrderList (params: { page: number; num: number }): Promise<{ count: number; lists: IOrderDetail[] }> {
    return requestData({
      method: 'POST',
      api: 'storex/shop/order/my_lists',
      params
    })
  }

  /**
   * 获取历史订单列表
   */
  fetchHisOrderList (params: { page: number; num: number }): Promise<{ count: number; lists: IOrderDetail[] }> {
    return requestData({
      method: 'POST',
      api: 'storex/shop/order/history_lists',
      params
    })
  }

  /**
   * 取消订单
   */
  fetchCancelOrder (params: { order_number: string }): Promise<void> {
    return requestData({
      method: 'POST',
      api: 'storex/shop/order/cancel_payment_order',
      params
    })
  }

  /**
   * 接单
   */
  fetchConfirmOrder (params: { order_number: string }): Promise<void> {
    return requestData({
      method: 'POST',
      api: 'storex/shop/order/receipt_order',
      params
    })
  }

  /**
   * 打印订单回调
   */
  fetchPrintOrderCb (params: { order_number: string }): Promise<void> {
    return requestData({
      method: 'POST',
      api: 'storex/shop/order/complete_order',
      params
    })
  }

  /**
   * 获取销售统计
   * @param {Object} params
   * @param {1|2|3|4} params.type 类型 1:今天 2:昨天 3:前天 4:近七天
   */
  fetchSalesDataList (params: { type: ISalesType; page: number; num: number }): Promise<ISalesData> {
    return requestData({
      method: 'POST',
      api: 'storex/shop/order/statistics_lists',
      params
    })
  }
}

export default new ShopService()
