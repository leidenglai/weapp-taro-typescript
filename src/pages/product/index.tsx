import Taro, { Component, Config } from '@tarojs/taro'
import { observer, inject } from '@tarojs/mobx'
import { View, Text, Image } from '@tarojs/components'
import './index.scss'
import { IProductStore } from '@/stores/productStore'
import { ILiProductInfo } from '@/interfaces/product'
import transformPrice from '@/utils/transformPrice'
import { AtButton } from 'taro-ui'
import wrapUserAuth from '@/components/HOC/wrapUserAuth'

interface InjectStoreProps {
  productStore: IProductStore
}

/**
 * 商品列表页
 */
@wrapUserAuth
@inject('productStore')
@observer
class ProductPage extends Component {
  get inject () {
    // 兼容注入store
    return this.props as InjectStoreProps
  }

  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    navigationBarTitleText: '我的商品',
    enablePullDownRefresh: true
  }

  /** 模块className前缀 */
  private prefixCls: string = 'app-product'

  componentWillMount () {
    // 检验登录
  }

  componentDidMount () {
    this.inject.productStore.fetchProductData()
  }

  /**
   * 下拉刷新处理
   */
  onPullDownRefresh () {
    this.inject.productStore.fetchProductData()
  }

  /**
   * 监听用户上拉触底事件
   * 触底加载新数据
   */
  onReachBottom () {
    const { productStore: { productListData, fetchProductData }} = this.inject

    if (productListData.ids.length < productListData.count) {
      // 加载下一页内容
      fetchProductData({ page: productListData.page + 1 })
    }
  }

  /**
   * 跳转详情页
   */
  handleNavToDetail (productId: number) {
    // 预加载数据
    this.inject.productStore.fetchProductDetail(productId)

    Taro.navigateTo({ url: `/pages/product/detail/index?product_id=${productId}` })
  }

  /**
   * 设置商品上下架
   */
  handleProductStatus (productId: number, type: 1 | 2) {
    this.inject.productStore.setProductStatus(productId, type)
  }

  render () {
    const { productStore: { productData, productListData }} = this.inject

    if (productListData.ids.length <= 0) {
      return false
    }

    return (
      <View className={`${this.prefixCls}__page`}>
        {productListData.ids.map(id => {
          const data = (productData.get(id) || {}) as ILiProductInfo
          const { thumb, title, sub_title, price, vip_price, status } = data

          return (
            <View key={id} className={`${this.prefixCls}__card`}>
              <View className={`${this.prefixCls}__img-wrap`} onClick={this.handleNavToDetail.bind(this, id)}>
                <Image mode='aspectFill' src={thumb} className={`${this.prefixCls}__img-cont`} />
              </View>
              <View>
                <View className={`${this.prefixCls}__info-wrap`} onClick={this.handleNavToDetail.bind(this, id)}>
                  <View className={`${this.prefixCls}__info-title`}>{title}</View>
                  <View className={`${this.prefixCls}__info-cont`}>{sub_title}</View>
                </View>
                <View className={`${this.prefixCls}__info-cont`}>
                  <View>
                    <View className='price'>￥{transformPrice(price, false)}</View>
                    <Text className='vip-price'>{vip_price > 0 ? `￥${transformPrice(vip_price, false)}` : ''}</Text>
                    {vip_price > 0 && <Text className='icon iconVip' />}
                  </View>
                  <View className={`${this.prefixCls}__action-wrap`}>
                    {status === 1 ?
                      <AtButton onClick={this.handleProductStatus.bind(this, id, 2)} className={`${this.prefixCls}__btn`}>
                        下架
                      </AtButton>
                      :
                      <AtButton type='primary' onClick={this.handleProductStatus.bind(this, id, 1)} className={`${this.prefixCls}__btn`}>
                        上架
                      </AtButton>
                    }
                  </View>
                </View>
              </View>
            </View>
          )
        })}
      </View>
    )
  }
}

export default ProductPage
