import { create } from 'zustand';
import { CATEGORIES } from '../constants/categories';
import { fetchExchangeRate } from '../services/exchange-api';

const useUnitStore = create((set, get) => ({
  categories: CATEGORIES,
  selectedCategory: CATEGORIES[0],
  exchangeRate: 0,
  isRateLoading: false,
  
  usValue: '',
  krValue: '',
  
  initialize: async () => {
    set({ isRateLoading: true });
    const rate = await fetchExchangeRate();
    set({ exchangeRate: rate, isRateLoading: false });
  },
  
  setSelectedCategory: (category) => {
    set({ selectedCategory: category, usValue: '', krValue: '' });
  },
  
  setUsValue: (val) => {
    const { selectedCategory, exchangeRate } = get();
    if (val === '') {
      set({ usValue: '', krValue: '' });
      return;
    }
    const num = parseFloat(val);
    if (isNaN(num)) return;
    
    const result = selectedCategory.convertUsToKr(num, exchangeRate);
    set({ usValue: val, krValue: result.toFixed(2) });
  },
  
  setKrValue: (val) => {
    const { selectedCategory, exchangeRate } = get();
    if (val === '') {
      set({ usValue: '', krValue: '' });
      return;
    }
    const num = parseFloat(val);
    if (isNaN(num)) return;
    
    const result = selectedCategory.convertKrToUs(num, exchangeRate);
    set({ krValue: val, usValue: result.toFixed(2) });
  }
}));

export default useUnitStore;
