export interface IOrderDetail {
  /** 订单号 */
  order_number: string
  /** 订单序号 */
  take_number: number
  /** 商品金额 */
  sum_money: number
  /** 买家电话 */
  buy_phone: string
  /** 打印信息 */
  print_data: (number | string)[][]
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
