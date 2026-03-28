import axios from 'axios';

const STANDARD_CACHE_KEY = 'unitbridge_standard_rate';
const MULTI_CACHE_KEY = 'unitbridge_multi_rates';
const CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour

// 1. Fetch fixed USD -> KRW for general unit categories
export const fetchStandardRate = async () => {
  const cached = localStorage.getItem(STANDARD_CACHE_KEY);
  if (cached) {
    const { rate, timestamp, date } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_EXPIRY) {
      console.log('Using cached standard USD->KRW rate:', rate);
      return { rate, date };
    }
  }

  try {
    const response = await axios.get('https://api.frankfurter.app/latest?from=USD&to=KRW');
    const rate = response.data.rates.KRW;
    const date = response.data.date;
    localStorage.setItem(STANDARD_CACHE_KEY, JSON.stringify({ rate, timestamp: Date.now(), date }));
    console.log('Fetched fresh standard USD->KRW rate:', rate);
    return { rate, date };
  } catch (error) {
    console.error('Failed to fetch standard rate:', error);
    return cached ? { rate: JSON.parse(cached).rate, date: JSON.parse(cached).date } : { rate: 1400, date: '' };
  }
};

// 2. Fetch multiple rates for a specific base (for currency converter)
export const fetchExchangeRates = async (base = 'KRW', symbols = ['USD', 'JPY', 'EUR', 'GBP']) => {
  const symbolsQuery = symbols.join(',');
  const cacheKey = `${MULTI_CACHE_KEY}_${base}`;
  const cached = localStorage.getItem(cacheKey);
  
  if (cached) {
    const { rates, timestamp, date } = JSON.parse(cached);
    const hasAllSymbols = symbols.every(s => rates[s] !== undefined || s === base);
    if (Date.now() - timestamp < CACHE_EXPIRY && hasAllSymbols) {
      console.log(`Using cached rates for base ${base}:`, rates);
      return { rates, date };
    }
  }

  try {
    const response = await axios.get(`https://api.frankfurter.app/latest?from=${base}&to=${symbolsQuery}`);
    const rates = response.data.rates;
    const date = response.data.date;
    localStorage.setItem(cacheKey, JSON.stringify({ rates, timestamp: Date.now(), date }));
    console.log(`Fetched fresh rates for base ${base}:`, rates);
    return { rates, date };
  } catch (error) {
    console.error(`Failed to fetch rates for ${base}:`, error);
    return cached ? { rates: JSON.parse(cached).rates, date: JSON.parse(cached).date } : { rates: {}, date: '' }; 
  }
};


// Backward compatibility (if needed)
export const fetchExchangeRate = fetchStandardRate;


