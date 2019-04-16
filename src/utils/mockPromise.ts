/**
 * 模拟Promise返回
 * @param data 需要模拟返回的数据
 * @param timeout 延时
 */
export default function mockPromise<T extends any> (data: T, timeout: number = 300): Promise<T> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(data)
    }, timeout)
  })
}
