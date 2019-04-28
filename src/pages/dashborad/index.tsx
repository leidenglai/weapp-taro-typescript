import Taro, { Component, Config } from '@tarojs/taro'
import transformPrice from '@/utils/transformPrice'
import wrapUserAuth from '@/components/HOC/wrapUserAuth'
import { AtTabs, AtTabsPane } from 'taro-ui'
import { IDashboardStore } from '@/stores/dashboradStore'
import { inject, observer } from '@tarojs/mobx'
import { ISalesData, ISalesType } from '@/interfaces/dashborad'
import { View } from '@tarojs/components'
import './index.scss'

interface InjectStoreProps {
  dashboradStore: IDashboardStore
}

interface IState {
  currentTab: number
}

/**
 * 数据统计页
 */
@wrapUserAuth
@inject('dashboradStore')
@observer
class DashboardPage extends Component<{}, IState> {
  get inject () {
    // 兼容注入store
    return this.props as InjectStoreProps
  }

  readonly state: IState = { currentTab: 0 }

  private tabList: { title: string; tabId: ISalesType }[] = [
    { title: '今天', tabId: 1 },
    { title: '昨天', tabId: 2 },
    { title: '前天', tabId: 3 },
    { title: '近七天', tabId: 4 }
  ]

  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = { navigationBarTitleText: '统计' }

  componentDidMount () {
    // 请求初始数据
    this.inject.dashboradStore.fetchSalesData(1)
  }

  /**
   * 监听用户上拉触底事件
   * 触底加载新数据
   */
  onReachBottom () {
    const { dashboradStore } = this.inject
    const { tabId } = this.tabList[this.state.currentTab]
    const tabData = dashboradStore.salesTabsData.get(tabId)
    const page = tabData && tabData.page || 1

    if (!dashboradStore.salesTabsListIsEnd) {
      // 加载下一页内容
      dashboradStore.fetchSalesData(tabId, page + 1)
    }
  }

  handleChangeTab (value) {
    const { tabId } = this.tabList[value]

    this.setState({ currentTab: value })

    this.inject.dashboradStore.fetchSalesData(tabId)
  }

  render () {
    const { salesTabsData } = this.inject.dashboradStore

    return (
      <View className='dashboardPage'>
        <AtTabs current={this.state.currentTab} swipeable={false} tabList={this.tabList} onClick={this.handleChangeTab.bind(this)}>
          {this.tabList.map((item, index) => {
            const tabData = salesTabsData.get(item.tabId) || {}
            const { total_num, total_money, lists } = tabData as ISalesData

            return (
              <AtTabsPane key={item.tabId} current={this.state.currentTab} index={index}>
                <View className='listWrap'>
                  <View className='topInfo'>
                    共销售{total_num}杯，收入￥{transformPrice(total_money)}
                  </View>
                  <View className='contentList'>
                    {lists &&
                      lists.map((order, index) => {
                        const { title, standard_text } = order
                        const orderTotalNum = order.total_num
                        const orderTotalPrice = transformPrice(order.total_money)
                        const price = transformPrice(order.price)

                        return (
                          <View key={index} className='orderItem'>
                            <View className='title'>{title}</View>
                            <View className='info'>
                              <View className='infoText'>{standard_text}</View>
                              <View className='infoNum'>X{orderTotalNum}</View>
                            </View>
                            <View className='price'>
                              <View className='left'>￥{price}</View>
                              <View className='right'>￥{orderTotalPrice}</View>
                            </View>
                          </View>
                        )
                      })}
                  </View>
                </View>
              </AtTabsPane>
            )
          })}
        </AtTabs>
      </View>
    )
  }
}

export default DashboardPage
