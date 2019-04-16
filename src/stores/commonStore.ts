import { observable } from 'mobx'

export interface ICommonStore {
  /** 蓝牙数据 */
  BLEInformation: {
    platform: string
    /** 设备的 id */
    deviceId: string
    /** 蓝牙设备此特征值的 uuid */
    writeCharaterId: string
    /** 蓝牙设备此服务的 uuid */
    writeServiceId: string
    /** 蓝牙设备此特征值的 uuid */
    notifyCharaterId: string
    /** 蓝牙设备此服务的 uuid */
    notifyServiceId: string
    /** 蓝牙设备此特征值的 uuid */
    readCharaterId: string
    /** 蓝牙设备此服务的 uuid */
    readServiceId: string
  }

  /** 系统信息 */
  sysinfo: {
    model: string
    version: string
    system: string
    platform: string
    SDKVersion: string
  }
}

/**
 * 公共数据
 **/
class CommonStore implements ICommonStore {
  @observable
  BLEInformation = {
    platform: '',
    deviceId: '',
    writeCharaterId: '',
    writeServiceId: '',
    notifyCharaterId: '',
    notifyServiceId: '',
    readCharaterId: '',
    readServiceId: ''
  }

  @observable
  sysinfo = {
    model: '',
    version: '',
    system: '',
    platform: '',
    SDKVersion: ''
  }
}

export default CommonStore
