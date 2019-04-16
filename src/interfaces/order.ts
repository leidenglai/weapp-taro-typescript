export interface IOrderDetail {
  /** 订单号 */
  order_number: string
  // TODO
  /** 订单序号 */
  order_no: number
  /** 商品金额 */
  sum_money: number
  product_lists: {
    /** 数量 */
    num: number
    /** 商品名称 */
    title: string
    /** 商品规格 */
    standard_text: string
  }[]
  /** 总数量 */
  total_num: number
  /** 事件 cancel_payment_order:退单 receipt_order:开始制作  print:打印 reprint:重新打印  */
  events: ('cancel_payment_order' | 'receipt_order' | 'print' | 'reprint')[]
  /** 订单时间 */
  insert_date: string
}
