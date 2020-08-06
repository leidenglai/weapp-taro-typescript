import requestData from "@/utils/requestData";
import { ILiProductInfo, IProductDetail } from "@/interfaces/product";
import { IOrderDetail } from "@/interfaces/order";
import { ISalesData, ISalesType } from "@/interfaces/dashborad";

/**
 * 对应后端商家端相关 API
 */
class ShopService {
  /**
   * 获取产品列表
   */
  fetchProductList(params: { page: number; num: number }) {
    return requestData<{ count: number; lists: ILiProductInfo[] }>({
      method: "GET",
      api: "product/lists",
      params
    });
  }

  /**
   * 获取产品详情
   */
  fetchProductDetail(params: { product_id: number }) {
    return requestData<IProductDetail>({
      method: "GET",
      api: "product/item",
      params
    });
  }

  /**
   * 获取商品富文本描述
   * @param params
   */
  fetchProductDesc(params: { product_id: number }) {
    return requestData<{
      product_id: number;
      /** 富文本描诉 HTML */
      content: string;
    }>({
      method: "GET",
      api: "product/get_content_detail",
      params
    });
  }

  /**
   * 上下架产品
   */
  setProductStatus(params: { product_id: number; status: 1 | 2 }) {
    return requestData({
      method: "POST",
      api: "product/set_status",
      params
    });
  }

  /**
   * 获取实时订单列表
   */
  fetchOrderList(params: { page: number; num: number }) {
    return requestData<{ count: number; lists: IOrderDetail[] }>({
      method: "GET",
      api: "order/my_lists",
      params
    });
  }

  /**
   * 获取历史订单列表
   */
  fetchHisOrderList(params: { page: number; num: number }) {
    return requestData<{ count: number; lists: IOrderDetail[] }>({
      method: "GET",
      api: "order/history_lists",
      params
    });
  }

  /**
   * 取消订单
   */
  fetchCancelOrder(params: { order_number: string }) {
    return requestData({
      method: "POST",
      api: "order/cancel_payment_order",
      params
    });
  }

  /**
   * 接单
   */
  fetchConfirmOrder(params: { order_number: string }) {
    return requestData({
      method: "POST",
      api: "order/receipt_order",
      params
    });
  }

  /**
   * 打印订单回调
   */
  fetchPrintOrderCb(params: { order_number: string }) {
    return requestData({
      method: "POST",
      api: "order/complete_order",
      params
    });
  }

  /**
   * 获取销售统计
   * @param {Object} params
   * @param {1|2|3|4} params.type 类型 1:今天 2:昨天 3:前天 4:近七天
   */
  fetchSalesDataList(params: { type: ISalesType; page: number; num: number }) {
    return requestData<ISalesData>({
      method: "GET",
      api: "order/statistics_lists",
      params
    });
  }

  /**
   * 修改库存
   */
  fetchUpdateSkuStock(params: {
    product_id: number;
    product_sku: string;
    number: number;
  }) {
    return requestData({
      method: "POST",
      api: "product/set_stock",
      params
    });
  }
}

export default new ShopService();
