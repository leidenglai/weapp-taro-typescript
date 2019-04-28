import { observable } from 'mobx'
import { IBLEServices } from '@/interfaces/common'

export interface ICommonStore {
  /** 系统信息 */
  sysinfo: {
    model: string
    version: string
    system: string
    platform: string
    SDKVersion: string
  }

  /** 是否已连接低功耗蓝牙 */
  isBELconnect: boolean

  /** 是否已获取低功耗蓝牙服务 */
  isBELservices: boolean

  /** 蓝牙服务 */
  BLEServices: IBLEServices
}

/**
 * 公共数据
 **/
class CommonStore implements ICommonStore {
  @observable
  sysinfo = {
    model: '',
    version: '',
    system: '',
    platform: '',
    SDKVersion: ''
  }

  @observable
  isBELconnect = false

  @observable
  isBELservices = false

  // 不用转换为observable
  BLEServices = {
    writeCharaterId: '',
    writeServiceId: '',
    notifyCharaterId: '',
    notifyServiceId: '',
    readCharaterId: '',
    readServiceId: ''
  }
}

export default CommonStore
