import Taro, { getBLEDeviceServices } from '@tarojs/taro'
import _ from 'lodash'
import { IBLEServices } from '@/interfaces/common'

/**
 * 获取蓝牙设备所有服务(service)
 */
export default function getBELSeviceId (deviceId: string): Promise<IBLEServices> {
  // const platform = this.BLEInformation.platform

  return Taro.getBLEDeviceServices({ deviceId }).then(res => {
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
    // this.BLEInformation.serviceId = realId
    return getCharacteristics(deviceId, res.services)
  })
}

/**
 * 获取蓝牙设备notify、read、write特征值(characteristic)
 * @param services 蓝牙的设备服务列表
 */
async function getCharacteristics (deviceId, services: getBLEDeviceServices.PromisedPropServices) {
  const findChar = { read: false, write: false, notify: false } // 特征值的寻找状态
  const BLEServices: IBLEServices = {
    writeCharaterId: '',
    writeServiceId: '',
    notifyCharaterId: '',
    notifyServiceId: '',
    readCharaterId: '',
    readServiceId: ''
  }

  // 串行迭代 获取特征值
  for (const service of services) {
    const { characteristics } = await Taro.getBLEDeviceCharacteristics({
      deviceId,
      serviceId: service.uuid
    })

    console.log(`获取蓝牙设备服务(${service.uuid})中的所有特征值: `, characteristics)

    characteristics.forEach(item => {
      if (!findChar.notify && item.properties.notify) {
        findChar.notify = true
        BLEServices.notifyCharaterId = item.uuid
        BLEServices.notifyServiceId = service.uuid
      }
      if (!findChar.read && item.properties.read) {
        findChar.read = true
        BLEServices.readCharaterId = item.uuid
        BLEServices.readServiceId = service.uuid
      }
      if (!findChar.write && item.properties.write) {
        findChar.write = true
        BLEServices.writeCharaterId = item.uuid
        BLEServices.writeServiceId = service.uuid
      }
    })

    // notify、read、write 特征值都已找到 跳出循环
    if (_.every(findChar, v => v)) {
      // 跳出循环
      break
    }
  }

  console.log('获得蓝牙权限：', findChar)
  console.log('服务ID', BLEServices)

  // notify、read、write 部分或者全部未找到完全
  if (!_.every(findChar, v => v)) {
    return Promise.reject('找不到该蓝牙设备读写的特征值')
  } else {
    return Promise.resolve(BLEServices)
  }
}
