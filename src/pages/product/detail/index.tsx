import Taro, { Component, Config } from '@tarojs/taro'
import { observer, inject } from '@tarojs/mobx'
import { View, Swiper, SwiperItem, Image, RichText } from '@tarojs/components'
import './index.scss'
import { IProductStore } from '@/stores/productStore'
import { IProductDetail } from '@/interfaces/product'
import wrapUserAuth from '@/components/HOC/wrapUserAuth'

interface InjectStoreProps {
  productStore: IProductStore
}

/**
 * 商品详情页
 */
@wrapUserAuth
@inject('productStore')
@observer
class ProductDetailPage extends Component {
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
  config: Config = { navigationBarTitleText: '商品详情' }

  componentDidMount () {
    const productId = this.$router.params.product_id

    if (!this.inject.productStore.productData.get(productId)) {
      this.inject.productStore.fetchProductDetail(productId)
    }
  }

  render () {
    const productId = this.$router.params.product_id
    const detail = this.inject.productStore.productData.get(productId) as IProductDetail

    return (
      <View>
        <View className='productPage'>
          <View className='productSwiperWrap'>
            {detail ?
              <Swiper className='productSwiper' indicatorActiveColor='#FFFFFF' indicatorDots autoplay>
                {detail.images ?
                  detail.images.map((img, index) =>
                    <SwiperItem key={index}>
                      <View className='productImage'>
                        <Image mode='aspectFill' className='image' src={img} />
                      </View>
                    </SwiperItem>)
                  :
                  <SwiperItem>
                    <View className='productImage'>
                      <Image mode='aspectFill' className='image' src={detail.thumb} />
                    </View>
                  </SwiperItem>
                }
              </Swiper>
              :
              <View className='productSwiperSkeleton' />
            }
          </View>
          <View className='productInfoWrap'>
            <View className='infoName'>{detail && detail.title}</View>
            <View className='infoDesc'>{detail && detail.sub_title}</View>
            <View className='infoComment'>{detail && detail.shop_comment}</View>
          </View>
          <View className='productDetailWrap'>
            <View className='title'>
              <View className='bgLine' />
              <View className='text'>详情</View>
            </View>
            <View className='content'>{detail && detail.context && <RichText nodes={detail.context} />}</View>
          </View>
        </View>
      </View>
    )
  }
}

export default ProductDetailPage
