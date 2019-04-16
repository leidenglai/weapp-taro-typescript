import { observable, ObservableMap, action, runInAction } from 'mobx'
import shopService from '@/services/shopService'
import { ISalesData, ISalesType } from '@/interfaces/dashborad'
import { IPager } from '@/interfaces/common'

const salesType: ISalesType[] = [1, 2, 3, 4]

// 页面Tabs类型数据
type ISalesTabsData = ObservableMap<ISalesType, ISalesData & Partial<IPager>>

/**
 * 统计数据页面
 **/

export interface IDashboardStore {
  /** 页面数据 */
  salesTabsData: ISalesTabsData

  /** 获取销售统计数据 type 类型 1:今天 2:昨天 3:前天 4:近七天 默认第一页20条 */
  fetchSalesData: (type: ISalesType, page?: number) => Promise<void>
}

class DashboardStore implements IDashboardStore {
  salesTabsData: ISalesTabsData = observable.map(
    salesType.map(key => [
      key,
      {
        total_num: 0,
        total_money: 0,
        lists: [] as any[],
        count: 0
      }
    ])
  )

  @action
  async fetchSalesData (type: ISalesType, page?: number) {
    // 加入默认参数
    const reqParams = Object.assign({ num: 20 }, { type, page: page || 1 })
    const resData = await shopService.fetchSalesDataList(reqParams)

    runInAction(() => {
      const data = this.salesTabsData.get(type)

      if (data) {
        data.count = resData.count
        data.total_num = resData.total_num
        data.total_money = resData.total_money

        if (reqParams.page === 1) {
          data.lists = resData.lists
        } else {
          data.lists.concat(resData.lists)
        }
      }
    })
  }
}

export default DashboardStore
