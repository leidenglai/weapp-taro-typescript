import Taro, { Component, Config, getBLEDeviceServices, getBluetoothDevices } from '@tarojs/taro'
import { observer, inject } from '@tarojs/mobx'
import _ from 'lodash'
import { View } from '@tarojs/components'
import './index.scss'
import wrapUserAuth from '@/components/HOC/wrapUserAuth'
import { AtButton } from 'taro-ui'
import { ICommonStore } from '@/stores/commonStore'
import { action, runInAction } from 'mobx'

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

  @action
  componentDidMount () {
    const { BLEInformation, sysinfo } = this.inject.commonStore

    Object.assign(sysinfo, Taro.getSystemInfoSync())
    BLEInformation.platform = sysinfo.platform

    console.log(sysinfo)
  }

  onPullDownRefresh () {
    this.handleStartSearch()
  }

  componentWillUnmount () {
    Taro.closeBluetoothAdapter()
  }

  /**
   * 开始搜索蓝牙设备
   */
  handleStartSearch = () => {
    // console.log('lichao', 'closeBluetoothAdapter')
    console.log('开始搜索')
    Taro.closeBluetoothAdapter()
    Taro.openBluetoothAdapter()
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
    const {
      BLEInformation: { platform },
      sysinfo: { system }
    } = this.inject.commonStore

    if (platform == 'ios') {
      this.getBluetoothDevices()
    } else if (platform == 'android') {
      // console.log(system.substring(system.length - (system.length - 8), system.length - (system.length - 8) + 1))
      const systemVersion = /([0-9]+)/.exec(system)

      console.log('android系统版本:', systemVersion)
      if (systemVersion && parseInt(systemVersion[1]) > 5) {
        Taro.getSetting({
          success (res) {
            console.log('当前用户设置：', res)
            if (!res.authSetting['scope.userLocation']) {
              Taro.authorize({ scope: 'scope.userLocation' }).then(() => {
                this.getBluetoothDevices()
              })
            } else {
              this.getBluetoothDevices()
            }
          }
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
  @action
  handleConnect (device: getBluetoothDevices.PromisedPropDevicesItem) {
    const { commonStore } = this.inject

    console.log('开始连接：', device)

    // 停止搜寻附近的蓝牙外围设备
    Taro.stopBluetoothDevicesDiscovery()
    Taro.showLoading({ title: '正在连接' })
    // 连接低功耗蓝牙设备
    Taro.createBLEConnection({ deviceId: device.deviceId }).then(
      () => {
        console.log('连接成功：', device.deviceId)
        // 连接成功 获取服务
        this.getSeviceId(device.deviceId)

        runInAction(() => {
          commonStore.BLEInformation.deviceId = device.deviceId
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

  /**
   * 获取蓝牙设备所有服务(service)
   */
  getSeviceId = deviceId => {
    // const platform = this.BLEInformation.platform

    Taro.getBLEDeviceServices({ deviceId }).then(res => {
      console.log('获取蓝牙设备所有 service:', res)
      // var realId = ''
      // if (platform == 'android') {
      //   // for(var i=0;i<res.services.length;++i){
      //   // var item = res.services[i].uuid
      //   // if (item == "0000FEE7-0000-1000-8000-00805F9B34FB"){
      //   realId = "0000FEE7-0000-1000-8000-00805F9B34FB"
      //   //       break;
      //   //     }
      //   // }
      // } else if (platform == 'ios') {
      //   // for(var i=0;i<res.services.length;++i){
      //   // var item = res.services[i].uuid
      //   // if (item == "49535343-FE7D-4AE5-8FA9-9FAFD205E455"){
      //   realId = "49535343-FE7D-4AE5-8FA9-9FAFD205E455"
      //   // break
      //   // }
      //   // }
      // }
      // app.BLEInformation.serviceId = realId
      this.getCharacteristics(res.services)
    })
  }

  /**
   * 获取蓝牙设备notify、read、write特征值(characteristic)
   * @param services 蓝牙的设备服务列表
   */
  @action
  async getCharacteristics (services: getBLEDeviceServices.PromisedPropServices) {
    const { BLEInformation } = this.inject.commonStore
    const findChar = { read: false, write: false, notify: false } // 特征值的寻找状态

    // 串行迭代 获取特征值
    for (const service of services) {
      const { characteristics } = await Taro.getBLEDeviceCharacteristics({
        deviceId: BLEInformation.deviceId,
        serviceId: service.uuid
      })

      console.log(`获取蓝牙设备服务(${service.uuid})中的所有特征值: `, characteristics)

      characteristics.forEach(item => {
        if (!findChar.notify && item.properties.notify) {
          findChar.notify = true
          runInAction(() => {
            BLEInformation.notifyCharaterId = item.uuid
            BLEInformation.notifyServiceId = service.uuid
          })
        }
        if (!findChar.read && item.properties.read) {
          findChar.read = true
          runInAction(() => {
            BLEInformation.readCharaterId = item.uuid
            BLEInformation.readServiceId = service.uuid
          })
        }
        if (!findChar.write && item.properties.write) {
          findChar.write = true
          runInAction(() => {
            BLEInformation.writeCharaterId = item.uuid
            BLEInformation.writeServiceId = service.uuid
          })
        }
      })

      // notify、read、write 特征值都已找到 跳出循环
      if (_.every(findChar, v => v)) {
        // 跳出循环
        break
      }
    }

    console.log('连接成功，获得权限：', findChar)

    Taro.hideLoading()
    // notify、read、write 部分或者全部未找到完全
    if (!_.every(findChar, v => v)) {
      Taro.showModal({
        title: '提示',
        content: '找不到该蓝牙设备读写的特征值'
      })
    } else {
      Taro.showToast({ title: '连接成功' }).then(() => {
        setTimeout(() => {
          Taro.navigateBack()
        }, 2000)
      })
    }
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
