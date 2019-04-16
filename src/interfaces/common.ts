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
