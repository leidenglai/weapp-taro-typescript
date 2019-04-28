import Taro, { Component, Config } from '@tarojs/taro'
import wrapUserAuth from '@/components/HOC/wrapUserAuth'
import { AtInput } from 'taro-ui'
import { Image, RichText, Swiper, SwiperItem, View } from '@tarojs/components'
import { inject, observer } from '@tarojs/mobx'
import { IProductDetail } from '@/interfaces/product'
import { IProductStore } from '@/stores/productStore'
import './index.scss'

interface InjectStoreProps {
  productStore: IProductStore
}

interface IState {
  stockData: { [sku: string]: number }
}

/**
 * 商品详情页
 */
@wrapUserAuth
@inject('productStore')
@observer
class ProductDetailPage extends Component<{}, IState> {
  get inject () {
    // 兼容注入store
    return this.props as InjectStoreProps
  }

  productId: number

  readonly state: IState = { stockData: {}}

  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = { navigationBarTitleText: '商品详情' }

  componentDidMount () {
    this.productId = this.$router.params.product_id

    if (!this.inject.productStore.productData.get(this.productId)) {
      this.inject.productStore.fetchProductDetail(this.productId)
    }
  }

  /**
   * 修改库存
   */
  handleStockSubmit (sku: string, oldStock, value) {
    if (oldStock === value) {
      return false
    }

    this.inject.productStore.setProductStock(this.productId, sku, value).then(() => {
      Taro.showToast({ title: '库存修改成功', icon: 'none' })
    })
  }

  render () {
    const detail = this.inject.productStore.productDatailData

    if (detail.product_id === 0) {
      return null
    }

    const { images, thumb, title, sub_title, shop_comment, content, stock_lists } = detail as IProductDetail

    return (
      <View>
        <View className='productPage'>
          <View className='productSwiperWrap'>
            <Swiper className='productSwiper' indicatorActiveColor='#FFFFFF' indicatorDots autoplay>
              {images ?
                images.map((img, index) =>
                  <SwiperItem key={index}>
                    <View className='productImage'>
                      <Image mode='aspectFill' className='image' src={img} />
                    </View>
                  </SwiperItem>)
                :
                <SwiperItem>
                  <View className='productImage'>
                    <Image mode='aspectFill' className='image' src={thumb} />
                  </View>
                </SwiperItem>
              }
            </Swiper>
          </View>
          <View className='productInfoWrap'>
            <View className='infoName'>{title}</View>
            <View className='infoDesc'>{sub_title}</View>
            <View className='infoComment'>{shop_comment}</View>
          </View>
          <View className='stockWrap'>
            {stock_lists.map(item =>
              <View key={item.product_sku} className='skuItem'>
                <View className='name'>{item.name}</View>
                <View className='stockNum'>
                  <AtInput
                    name='stockNum'
                    title='库存'
                    type='number'
                    cursor={item.number.toString().length}
                    value={item.number}
                    onChange={val => val}
                    onConfirm={this.handleStockSubmit.bind(this, item.product_sku, item.number)}
                    onBlur={this.handleStockSubmit.bind(this, item.product_sku, item.number)}
                  />
                </View>
              </View>)}
          </View>
          <View className='productDetailWrap'>
            <View className='text'>—— 详情 ——</View>
            <View className='content'>
              <RichText nodes={content} />
            </View>
          </View>
        </View>
      </View>
    )
  }
}

export default ProductDetailPage
