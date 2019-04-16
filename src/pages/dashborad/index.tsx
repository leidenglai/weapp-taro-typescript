import Taro, { Component, Config } from '@tarojs/taro'
import { observer, inject } from '@tarojs/mobx'
import { View, Navigator, Text } from '@tarojs/components'
import './index.scss'
import wrapUserAuth from '@/components/HOC/wrapUserAuth'
import { AtTabs, AtTabsPane } from 'taro-ui'
import { IDashboardStore } from '@/stores/dashboradStore'
import { ISalesType } from '@/interfaces/dashborad'

interface InjectStoreProps {
  dashboradStore: IDashboardStore
}

interface IState {
  currentTab: ISalesType
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

  readonly state: IState = { currentTab: 1 }

  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = { navigationBarTitleText: '统计' }

  handleChangeTab () {}

  render () {
    return (
      <View className='dashboardPage'>
        <AtTabs current={this.state.currentTab} tabList={[]} onClick={this.handleChangeTab.bind(this)}>
          <AtTabsPane current={this.state.currentTab} index={1}>
            <View style='padding: 100px 50px;background-color: #FAFBFC;text-align: center;'>标签页一的内容</View>
          </AtTabsPane>
        </AtTabs>
      </View>
    )
  }
}

export default DashboardPage
