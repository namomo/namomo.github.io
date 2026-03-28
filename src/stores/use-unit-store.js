import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CATEGORIES } from '../constants/categories';
import { fetchStandardRate, fetchExchangeRates } from '../services/exchange-api';

const useUnitStore = create(
  persist(
    (set, get) => ({
      categories: CATEGORIES,
      selectedCategory: CATEGORIES[0],
      exchangeRate: 1400, // USD to KRW fallback
      rateDate: '', // Updated date string from API
      updateTime: '', // Actual fetch time for precision
      multiExchangeRates: {}, // Map of target currency rates relative to base
      isRateLoading: false,
      
      usValue: '',
      krValue: '',
      
      // Persisted Settings for Currency Category
      baseCurrency: 'KRW',
      targetCurrencies: ['USD', 'JPY', 'EUR', 'GBP'],
      baseAmount: '',
      
      initialize: async () => {
        set({ isRateLoading: true });
        try {
          const d = new Date();
          const now = `${d.getFullYear().toString().slice(-2)}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
          
          const standardInfo = await fetchStandardRate();
          const { baseCurrency, targetCurrencies } = get();
          const multiInfo = await fetchExchangeRates(baseCurrency, targetCurrencies);
          
          set({ 
            exchangeRate: standardInfo.rate,
            rateDate: multiInfo.date || standardInfo.date, 
            updateTime: now,
            multiExchangeRates: multiInfo.rates,
            isRateLoading: false 
          });
        } catch (error) {
          set({ isRateLoading: false });
        }
      },
      
      setSelectedCategory: (category) => {
        set({ selectedCategory: category, usValue: '', krValue: '', baseAmount: '' });
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
      },

      setBaseAmount: (val) => {
        set({ baseAmount: val });
      },

      setBaseCurrency: async (code) => {
        set({ baseCurrency: code, baseAmount: '', isRateLoading: true });
        const { targetCurrencies } = get();
        const multiInfo = await fetchExchangeRates(code, targetCurrencies);
        const d = new Date();
        const now = `${d.getFullYear().toString().slice(-2)}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        set({ 
          multiExchangeRates: multiInfo.rates, 
          rateDate: multiInfo.date,
          updateTime: now,
          isRateLoading: false 
        });
      },

      addTargetCurrency: async (code) => {
        const { targetCurrencies, baseCurrency } = get();
        if (targetCurrencies.includes(code)) return;
        
        const newTargets = [...targetCurrencies, code];
        set({ targetCurrencies: newTargets, isRateLoading: true });
        
        const multiInfo = await fetchExchangeRates(baseCurrency, newTargets);
        const d = new Date();
        const now = `${d.getFullYear().toString().slice(-2)}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        set({ 
          multiExchangeRates: multiInfo.rates, 
          rateDate: multiInfo.date,
          updateTime: now,
          isRateLoading: false 
        });
      },




      removeTargetCurrency: (code) => {
        const { targetCurrencies } = get();
        const newTargets = targetCurrencies.filter(c => c !== code);
        set({ targetCurrencies: newTargets });
      }
    }),
    {
      name: 'unit-bridge-settings',
      partialize: (state) => ({ 
        baseCurrency: state.baseCurrency, 
        targetCurrencies: state.targetCurrencies 
      }),
    }
  )
);


export default useUnitStore;

