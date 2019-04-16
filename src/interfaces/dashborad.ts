interface IProduct {
  /** 总数 */
  total_num: number
  /** 单价 ，单位分*/
  price: number
  /** 总金额 ，单位分*/
  total_money: number
  /**  标题 */
  title: string
  /** 规格 */
  standard_text: string
}

/** 销售数据统计类型 */
export type ISalesType = 1 | 2 | 3 | 4

/** 销售数据 */
export interface ISalesData {
  /** 销售总数 */
  total_num: number
  /** 总金额，单位分 */
  total_money: number
  lists: IProduct[]
  /** 列表条数数 */
  count: number
}
