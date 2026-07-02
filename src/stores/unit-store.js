import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CATEGORIES } from '../constants/categories';
import { fetchStandardRate, fetchExchangeRates, fetchHistoricalRates } from '../services/exchange-api';

const useUnitStore = create(
  persist(
    (set, get) => ({
      categories: CATEGORIES,
      selectedCategory: CATEGORIES[0],
      exchangeRate: 1400, // USD to KRW fallback
      rateDate: '', // Updated date string from API
      updateTime: '', // Actual fetch time for precision
      multiExchangeRates: {}, // Map of target currency rates relative to base
      currentMode: 'converter', // 'converter' or 'unit-price'
      isRateLoading: false,
      hasInitialized: false,
      isInitializing: false,
      
      // Trend Chart States
      trendBaseCurrency: 'KRW',
      trendTargetCurrency: 'USD',
      historicalRates: {},
      historicalStartDate: '',
      historicalEndDate: '',
      isHistoricalLoading: false,
      
      setCurrentMode: (mode) => set({ currentMode: mode }),
      
      usValue: '',
      krValue: '',
      
      // Persisted Settings for Currency Category
      baseCurrency: 'KRW',
      targetCurrencies: ['USD', 'JPY', 'EUR', 'GBP'],
      baseAmount: '',
      
      initialize: async () => {
        const { hasInitialized, isInitializing } = get();
        if (hasInitialized || isInitializing) return;

        set({ isRateLoading: true, isInitializing: true });
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
            isRateLoading: false,
            hasInitialized: true,
            isInitializing: false
          });

          // Initialize trend settings to align with default baseCurrency
          const currentBase = get().baseCurrency;
          const initialTrendBase = ['KRW', 'USD', 'JPY', 'EUR'].includes(currentBase) ? currentBase : 'KRW';
          const initialTrendTarget = initialTrendBase === 'KRW' ? 'USD' : 'KRW';

          set({
            trendBaseCurrency: initialTrendBase,
            trendTargetCurrency: initialTrendTarget
          });

          await get().loadHistoricalRates();
        } catch (error) {
          console.error('Failed to initialize unit store:', error);
          set({ isRateLoading: false, isInitializing: false });
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
        const { baseCurrency, targetCurrencies } = get();
        if (code === baseCurrency) return;

        // 새 기준 통화가 타겟 통화 목록에 들어있다면 제거하고,
        // 기존 기준 통화는 타겟 통화 목록에 추가하여 자연스러운 뷰 스왑 유도
        let newTargets = [...targetCurrencies];
        if (newTargets.includes(code)) {
          newTargets = newTargets.filter(c => c !== code);
        }
        if (!newTargets.includes(baseCurrency)) {
          newTargets.push(baseCurrency);
        }

        // Synchronize trend base currency to the new baseCurrency
        const trendTarget = get().trendTargetCurrency;
        let newTrendTarget = trendTarget;
        if (code === trendTarget) {
          newTrendTarget = code === 'KRW' ? 'USD' : 'KRW';
        }

        set({ 
          baseCurrency: code, 
          targetCurrencies: newTargets, 
          baseAmount: '', 
          isRateLoading: true,
          trendBaseCurrency: code,
          trendTargetCurrency: newTrendTarget
        });
        
        try {
          const multiInfo = await fetchExchangeRates(code, newTargets);
          const d = new Date();
          const now = `${d.getFullYear().toString().slice(-2)}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
          set({ 
            multiExchangeRates: multiInfo.rates, 
            rateDate: multiInfo.date,
            updateTime: now,
            isRateLoading: false 
          });
          
          // Also fetch updated historical rates for trend chart
          await get().loadHistoricalRates();
        } catch (error) {
          console.error('Failed to change base currency:', error);
          set({ isRateLoading: false });
        }
      },

      addTargetCurrency: async (code) => {
        const { targetCurrencies, baseCurrency } = get();
        if (code === baseCurrency || targetCurrencies.includes(code)) return;
        
        const newTargets = [...targetCurrencies, code];
        set({ targetCurrencies: newTargets, isRateLoading: true });
        
        try {
          const multiInfo = await fetchExchangeRates(baseCurrency, newTargets);
          const d = new Date();
          const now = `${d.getFullYear().toString().slice(-2)}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
          set({ 
            multiExchangeRates: multiInfo.rates, 
            rateDate: multiInfo.date,
            updateTime: now,
            isRateLoading: false 
          });
        } catch (error) {
          console.error('Failed to add target currency:', error);
          set({ isRateLoading: false });
        }
      },

      removeTargetCurrency: (code) => {
        const { targetCurrencies } = get();
        const newTargets = targetCurrencies.filter(c => c !== code);
        set({ targetCurrencies: newTargets });
      },

      setTrendBaseCurrency: async (code) => {
        const { trendTargetCurrency } = get();
        let newTarget = trendTargetCurrency;
        if (code === trendTargetCurrency) {
          newTarget = code === 'KRW' ? 'USD' : 'KRW';
        }
        set({ trendBaseCurrency: code, trendTargetCurrency: newTarget });
        await get().loadHistoricalRates();
      },

      setTrendTargetCurrency: (code) => {
        set({ trendTargetCurrency: code });
      },

      loadHistoricalRates: async () => {
        const { trendBaseCurrency } = get();
        set({ isHistoricalLoading: true });
        try {
          const targets = ['USD', 'JPY', 'EUR', 'KRW'].filter(c => c !== trendBaseCurrency);
          const data = await fetchHistoricalRates(trendBaseCurrency, targets);
          set({
            historicalRates: data.rates || {},
            historicalStartDate: data.startDate || '',
            historicalEndDate: data.endDate || '',
            isHistoricalLoading: false
          });
        } catch (error) {
          console.error('Failed to load historical rates:', error);
          set({ isHistoricalLoading: false });
        }
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
