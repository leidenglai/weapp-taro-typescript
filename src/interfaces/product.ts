/**
 * 产品基础数据
 */
interface ISimpleProduct {
  /** 单价 */
  price: number
  /** vip价格 */
  vip_price: number
  /** 销量 */
  sale_num: number
  /** 子标题 */
  sub_title: string
  /** 产品图 */
  thumb: string
  /** 产品名 */
  title: string
  /** 商品ID*/
  product_id: number
  /** 上架状态 1:上架 2:下架 */
  status: 1 | 2
}

/**
 * 列表产品字段
 */
export interface ILiProductInfo extends ISimpleProduct {
  /** 1有库存 2无库存 */
  no_stock: 1 | 2
  /** 最大够买数量 */
  max_buy_num: number
}

/**
 * 产品详情
 */
export interface IProductDetail extends ISimpleProduct {
  /** 备注 显示在小标题下面的sku文字 */
  shop_comment: string
  /** 图片列表 */
  images: string[]
  /** 长描述 */
  context?: string
  /** 上架数量 */
  on_stock_num: number
}

export interface ISkuSelected {
  [standard_name: string]: string | null
}
