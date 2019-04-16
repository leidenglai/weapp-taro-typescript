/**
 * 将价格从分转换为元
 * @param {number} fPrice 单位分
 * @param {?boolean} cents 是否保留分
 */
export default function transformPrice (fPrice: number, isCents: boolean = true): string {
  const cents = isCents ? 2 : 0
  const yPrice = (fPrice / 100).toFixed(cents)

  return yPrice
}
