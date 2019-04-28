import Taro, { Component, Config, getBluetoothDevices } from '@tarojs/taro'
import { observer, inject } from '@tarojs/mobx'
import _ from 'lodash'
import { View } from '@tarojs/components'
import './index.scss'
import wrapUserAuth from '@/components/HOC/wrapUserAuth'
import { AtButton } from 'taro-ui'
import { ICommonStore } from '@/stores/commonStore'
import { IBLEInformation } from '@/interfaces/common'
import getBELSeviceId from '@/utils/getBELSeviceId'
import { runInAction } from 'mobx'

interface IState {
  /** 已知的蓝牙设备列表 */
  deviceList: getBluetoothDevices.PromisedPropDevices
  isScanning: boolean
}

interface InjectStoreProps {
  commonStore: ICommonStore
}

/**
 * 蓝牙连接管理
 */
@wrapUserAuth
@inject('commonStore')
@observer
class BluetoothPage extends Component<{}, IState> {
  get inject () {
    // 兼容注入store
    return this.props as InjectStoreProps
  }

  private BLEInformation: IBLEInformation = {
    platform: '',
    deviceId: ''
  }

  /**
   * 指定config的类型声明为: Taro.Config
   *
   * 由于 typescript 对于 object 类型推导只能推出 Key 的基本类型
   * 对于像 navigationBarTextStyle: 'black' 这样的推导出的类型是 string
   * 提示和声明 navigationBarTextStyle: 'black' | 'white' 类型冲突, 需要显示声明类型
   */
  config: Config = {
    navigationBarTitleText: '搜索设备',
    enablePullDownRefresh: true
  }

  readonly state: IState = {
    deviceList: [],
    isScanning: false
  }

  componentDidMount () {
    const { sysinfo } = this.inject.commonStore

    Object.assign(sysinfo, Taro.getSystemInfoSync())
    this.BLEInformation.platform = sysinfo.platform

    console.log('系统信息:', sysinfo)
  }

  onPullDownRefresh () {
    this.handleStartSearch().then(() => {
      Taro.stopPullDownRefresh()
    })
  }

  /**
   * 开始搜索蓝牙设备
   */
  handleStartSearch = () => {
    // console.log('lichao', 'closeBluetoothAdapter')
    console.log('开始搜索')
    Taro.closeBluetoothAdapter()

    return Taro.openBluetoothAdapter()
      .then(() =>
        // 初始化蓝牙模块
        Taro.getBluetoothAdapterState())
      .then((res: any) => {
        console.log('本机蓝牙适配器状态：', res)
        // 获取本机蓝牙适配器状态成功
        if (res.available) {
          if (res.discovering) {
            Taro.stopBluetoothDevicesDiscovery({
              success (res) {
                console.log('停止搜寻附近蓝牙：', res)
              }
            })
          }
          this.checkPemission()
        } else {
          Taro.showModal({
            title: '提示',
            content: '本机蓝牙不可用'
          })
        }
      })
      .catch(err => {
        console.log(err)
        Taro.showModal({
          title: '提示',
          content: '蓝牙初始化失败，请打开蓝牙'
        })
      })
  }

  checkPemission = () => {
    const { sysinfo: { system, platform }} = this.inject.commonStore

    if (platform == 'ios') {
      this.getBluetoothDevices()
    } else if (platform == 'android') {
      // console.log(system.substring(system.length - (system.length - 8), system.length - (system.length - 8) + 1))
      const systemVersion = /([0-9]+)/.exec(system)

      console.log('android系统版本:', systemVersion)
      if (systemVersion && parseInt(systemVersion[1]) > 5) {
        Taro.getSetting()
          .then(res => {
            console.log('当前用户设置：', res)
            if (!res.authSetting['scope.userLocation']) {
              // 获取位置授权
              return Taro.authorize({ scope: 'scope.userLocation' })
            } else {
              return Promise.resolve({})
            }
          })
          .then(() => {
            this.getBluetoothDevices()
          })
          .catch(err => {
            console.log('位置授权获取失败：', err)
            console.log('请在设置界面重新授权后搜索蓝牙')

            Taro.openSetting().then(res => {
              if (res.authSetting['scope.userLocation'] === true) {
                Taro.showToast({ title: '授权成功，请重新搜索' })
              }
            })
          })
      }
    }
  }

  /**
   * 获取蓝牙设备信息
   */
  getBluetoothDevices = () => {
    Taro.showLoading({ title: '正在加载' })

    this.setState({ isScanning: true })

    Taro.startBluetoothDevicesDiscovery().then(res => {
      console.log('获取附近的蓝牙外围设备:', res.errMsg)

      setTimeout(() => {
        // 3s内发现的设备
        Taro.getBluetoothDevices().then(res => {
          console.log('所有已发现的蓝牙设备:', res)
          const devices = res.devices.filter(item => item.name !== '未知设备')

          console.log('所有已知的蓝牙设备:', devices)
          this.setState({
            deviceList: devices,
            isScanning: false
          })
          Taro.hideLoading()
          Taro.stopPullDownRefresh()
        })
      }, 3000)
    })
  }

  /**
   * 处理连接蓝牙
   * @param device 蓝牙设备数据
   */
  handleConnect (device: getBluetoothDevices.PromisedPropDevicesItem) {
    console.log('开始连接：', device)

    // 停止搜寻附近的蓝牙外围设备
    Taro.stopBluetoothDevicesDiscovery()
    Taro.showLoading({ title: '正在连接' })
    // 连接低功耗蓝牙设备
    Taro.createBLEConnection({ deviceId: device.deviceId }).then(
      () => {
        console.log('连接成功：', device.deviceId)
        this.BLEInformation.deviceId = device.deviceId
        // 连接成功 获取服务
        // this.getSeviceId(device.deviceId)
        getBELSeviceId(this.BLEInformation.deviceId)
          .then(newBLEInformation => {
            Taro.hideLoading()
            // 保存本地下次，用于下次快速连接
            Taro.setStorageSync('BLEInformation', this.BLEInformation)
            Taro.navigateBack().then(() => Taro.showToast({ title: '连接成功' }))

            runInAction(() => {
              this.inject.commonStore.isBELconnect = true
              this.inject.commonStore.isBELservices = true
              this.inject.commonStore.BLEServices = newBLEInformation
            })
          })
          .catch(err => {
            console.log(err)

            typeof err === 'string' &&
              Taro.showModal({
                title: '提示',
                content: '找不到该蓝牙设备读写的特征值'
              })
          })
      },
      err => {
        console.log('连接失败: ', err)
        Taro.showModal({
          title: '提示',
          content: '连接失败'
        })
        Taro.hideLoading()
      }
    )
  }

  render () {
    const { deviceList, isScanning } = this.state

    return (
      <View className='bluetoothPage'>
        <AtButton onClick={this.handleStartSearch} type='primary' loading={isScanning}>
          开始搜索
        </AtButton>

        <View className='deviceList'>
          {deviceList.map(device =>
            <View key={device.deviceId} className='item' onClick={this.handleConnect.bind(this, device)}>
              <View className='name'>{device.name}</View>
              <View className='deviceId'>{device.deviceId}</View>
            </View>)}
        </View>
      </View>
    )
  }
}

export default BluetoothPage
