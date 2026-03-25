import axios from 'axios';

const CACHE_KEY = 'unitbridge_exchange_rate';
const CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour

export const fetchExchangeRate = async () => {
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const { rate, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_EXPIRY) {
      console.log('Using cached exchange rate:', rate);
      return rate;
    }
  }

  try {
    // Using Frankfurter API (free, no key required)
    const response = await axios.get('https://api.frankfurter.app/latest?from=USD&to=KRW');
    const rate = response.data.rates.KRW;
    
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      rate,
      timestamp: Date.now()
    }));
    
    console.log('Fetched fresh exchange rate:', rate);
    return rate;
  } catch (error) {
    console.error('Failed to fetch exchange rate:', error);
    // Fallback if API fails and no cache exists
    return cached ? JSON.parse(cached).rate : 1400; 
  }
};
