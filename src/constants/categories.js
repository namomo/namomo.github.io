// 단위 변환을 위한 계수 정의 (매직 넘버 방지)
const LITERS_PER_GALLON = 3.78541;       // 1 Gallon = 3.78541 Liters
const HUNDRED_GRAMS_PER_POUND = 4.53592; // 1 Pound = 453.592 Grams = 4.53592 * 100g
const KG_PER_POUND = 0.453592;            // 1 Pound = 0.453592 kg
const METERS_PER_FOOT = 0.3048;           // 1 Foot = 0.3048 m

export const CATEGORIES = [
  {
    id: 'gas',
    name: '주유비 (Gas Price)',
    icon: 'Fuel',
    usUnit: '$/gal',
    krUnit: '원/L',
    usPrefix: '$',
    usSuffix: '/gal',
    krPrefix: '₩',
    krSuffix: '/L',
    convertUsToKr: (usVal, rate) => (usVal * rate) / LITERS_PER_GALLON,
    convertKrToUs: (krVal, rate) => (krVal * LITERS_PER_GALLON) / rate,
  },
  {
    id: 'meat',
    name: '육류 가격 (Meat/Weight)',
    icon: 'ShoppingBag',
    usUnit: '$/lb',
    krUnit: '원/100g',
    usPrefix: '$',
    usSuffix: '/lb',
    krPrefix: '₩',
    krSuffix: '/100g',
    convertUsToKr: (usVal, rate) => (usVal * rate) / HUNDRED_GRAMS_PER_POUND,
    convertKrToUs: (krVal, rate) => (krVal * HUNDRED_GRAMS_PER_POUND) / rate,
  },
  {
    id: 'weight',
    name: '무게 (Weight)',
    icon: 'Scale',
    usUnit: 'lb',
    krUnit: 'kg',
    usPrefix: '',
    usSuffix: 'lb',
    krPrefix: '',
    krSuffix: 'kg',
    convertUsToKr: (usVal) => usVal * KG_PER_POUND,
    convertKrToUs: (krVal) => krVal / KG_PER_POUND,
  },
  {
    id: 'length',
    name: '길이 (Length)',
    icon: 'Ruler',
    usUnit: 'ft',
    krUnit: 'm',
    usPrefix: '',
    usSuffix: 'ft',
    krPrefix: '',
    krSuffix: 'm',
    convertUsToKr: (usVal) => usVal * METERS_PER_FOOT,
    convertKrToUs: (krVal) => krVal / METERS_PER_FOOT,
  },
  {
    id: 'currency',
    name: '환율 변환 (Currency)',
    icon: 'Globe',
    isMulti: true,
    baseUnit: 'KRW',
    basePrefix: '₩',
  }
];


