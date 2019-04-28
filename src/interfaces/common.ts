import { ValidationMap } from 'prop-types'
import { Component } from '@tarojs/taro'

export interface IPager {
  page: number
  num: number
  count: number
}

/** 请求参数 */
export interface IReqData {
  /** 后端API */
  api: string

  /** 请求参数*/
  params?: { [key: string]: any }
  method?: 'POST' | 'GET'
}

/** 错误返回 */
export interface IResError {
  code: number
  message?: string
  data?: any
}

/** page类组件 */
interface PageComponent<P, S> extends Component<P, S> {
  // $componentType 应该必选是'PAGE' 但是框架的类型系统不完善
  $componentType: 'PAGE' | 'COMPONENT'

  $router: {
    params: any
    preload: any
    path?: string
  }
}

/**
 * 组件类类型
 */
export interface ComponentClass<P = {}> {
  new (...args: any[]): PageComponent<P, {}>
  propTypes?: ValidationMap<P>
  defaultProps?: Partial<P>
  displayName?: string
}

/** 蓝牙数据 */
export interface IBLEInformation {
  platform?: string
  /** 设备的 id */
  deviceId: string
}

/** 蓝牙服务 */
export interface IBLEServices {
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
