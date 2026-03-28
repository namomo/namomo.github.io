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
    // 1 Gallon = 3.78541 Liters
    convertUsToKr: (usVal, rate) => (usVal * rate) / 3.78541,
    convertKrToUs: (krVal, rate) => (krVal * 3.78541) / rate,
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
    // 1 Pound = 453.592 Grams = 4.53592 * 100g
    convertUsToKr: (usVal, rate) => (usVal * rate) / 4.53592,
    convertKrToUs: (krVal, rate) => (krVal * 4.53592) / rate,
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
    // 1 lb = 0.453592 kg
    convertUsToKr: (usVal) => usVal * 0.453592,
    convertKrToUs: (krVal) => krVal / 0.453592,
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
    // 1 ft = 0.3048 m
    convertUsToKr: (usVal) => usVal * 0.3048,
    convertKrToUs: (krVal) => krVal / 0.3048,
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

