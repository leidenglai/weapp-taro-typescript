import { observable, ObservableMap, action, runInAction } from 'mobx'
import { ILiProductInfo, IProductDetail } from '@/interfaces/product'
import shopService from '@/services/shopService'
import mockPromise from '@/utils/mockPromise'

/**
 * 产品数据
 **/
export interface IProductStore {
  /** 产品数据源 */
  productData: Map<number, ILiProductInfo | IProductDetail>

  /** 列表页面数据 */
  productListData: {
    ids: number[]
    page: number
    num: number
    count: number
  }

  /** 获取产品数据, 默认请求第一页20条数据 */
  fetchProductData: (params?: { page: number; num?: number }) => Promise<any>
  /** 获取产品详情 */
  fetchProductDetail: (product_id: number) => Promise<void>
  /** 设置商品上下架 */
  setProductStatus: (productId: number, status: 1 | 2) => Promise<any>
}

class ProductStore implements IProductStore {
  productData: ObservableMap<number, ILiProductInfo | IProductDetail> = observable.map()

  @observable
  productListData = {
    ids: [] as number[],
    page: 1,
    num: 0,
    count: 0
  }

  @action
  async fetchProductData (params: { page: number; num?: number } = { page: 1 }) {
    // 加入默认参数
    const reqParams = Object.assign({ num: 20 }, params)

    // 获取后端数据
    // const resData = await shopService.fetchProductList(reqParams)
    // 模拟fetchProductList异步返回
    const resData = await mockPromise({
      lists: [
        {
          price: 2500, // 商口单价，单位分
          status: 1, // 状态， 1：已上架 2：已下架
          sub_title: 'Milk Tea Series: Green Milk Tea', // 子标题
          thumb: 'https://www.leidenglai.com/image/weapp/server/product.jpg',
          title: '小山绿奶茶', // 标题
          product_id: 1 // 商品ID
        },
        {
          price: 28000, // 商口单价，单位分
          vip_price: 20000, // 商口单价，单位分
          status: 2, // 状态， 1：已上架 2：已下架
          sub_title: 'Mellow Latte: Royal No.9 Latte', // 子标题
          thumb: 'https://www.leidenglai.com/image/weapp/server/product.jpg',
          title: '皇家九号拿铁', // 标题
          product_id: 2 // 商品ID
        }
      ]
    })
    const idList = resData.lists.map(item => item.product_id)

    runInAction(() => {
      // 填入产品map对象
      this.productData.merge(resData.lists.map(item => [item.product_id, item]))
      this.productListData.page = reqParams.page
      this.productListData.num = reqParams.num

      if (reqParams.page === 1) {
        // 加载第一页
        this.productListData.ids = idList
      } else {
        // 翻页
        this.productListData.ids.concat(idList)
      }
    })
  }

  @action
  async fetchProductDetail (productId) {
    // 获取后端数据
    const resData = await shopService.fetchProductDetail({ product_id: productId })

    runInAction(() => {
      if (this.productData.get(productId)) {
        Object.assign(this.productData.get(productId), resData)
      } else {
        this.productData.set(productId, resData)
      }
    })
  }

  @action
  async setProductStatus (productId: number, status: 1 | 2) {
    try {
      await shopService.setProductStatus({ product_id: productId, status })

      runInAction(() => {
        this.productData.get(productId)!.status = status
      })
    } catch (err) {
      console.log('修改失败：', err)
    }
  }
}

export default ProductStore
