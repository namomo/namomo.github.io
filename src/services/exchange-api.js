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
    const response = await fetch('https://api.frankfurter.dev/v1/latest?from=USD&to=KRW');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const rate = data.rates.KRW;
    const date = data.date;
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
  // base와 중복되는 심볼은 제외하여 API 에러를 방지합니다.
  const filteredSymbols = symbols.filter(s => s !== base);
  const symbolsQuery = filteredSymbols.join(',');
  const cacheKey = `${MULTI_CACHE_KEY}_${base}`;
  const cached = localStorage.getItem(cacheKey);
  
  if (cached) {
    const { rates, timestamp, date } = JSON.parse(cached);
    const hasAllSymbols = filteredSymbols.every(s => rates[s] !== undefined);
    if (Date.now() - timestamp < CACHE_EXPIRY && hasAllSymbols) {
      console.log(`Using cached rates for base ${base}:`, rates);
      return { rates, date };
    }
  }

  try {
    if (filteredSymbols.length === 0) {
      return { rates: {}, date: '' };
    }
    const response = await fetch(`https://api.frankfurter.dev/v1/latest?from=${base}&to=${symbolsQuery}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const rates = data.rates;
    const date = data.date;
    localStorage.setItem(cacheKey, JSON.stringify({ rates, timestamp: Date.now(), date }));
    console.log(`Fetched fresh rates for base ${base}:`, rates);
    return { rates, date };
  } catch (error) {
    console.error(`Failed to fetch rates for ${base}:`, error);
    return cached ? { rates: JSON.parse(cached).rates, date: JSON.parse(cached).date } : { rates: {}, date: '' }; 
  }
};

const HISTORICAL_CACHE_KEY = 'unitbridge_historical';
const HISTORICAL_CACHE_EXPIRY = 1000 * 60 * 60 * 12; // 12 hours

// 3. Fetch historical rates for last 30 days
export const fetchHistoricalRates = async (base = 'KRW', symbols = ['USD', 'JPY', 'EUR', 'GBP']) => {
  const filteredSymbols = symbols.filter(s => s !== base);
  if (filteredSymbols.length === 0) {
    return { rates: {}, startDate: '', endDate: '' };
  }
  const symbolsQuery = filteredSymbols.join(',');
  const cacheKey = `${HISTORICAL_CACHE_KEY}_${base}_${symbolsQuery}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    const { rates, timestamp, startDate, endDate } = JSON.parse(cached);
    if (Date.now() - timestamp < HISTORICAL_CACHE_EXPIRY) {
      console.log(`Using cached historical rates for base ${base}:`, rates);
      return { rates, startDate, endDate };
    }
  }

  // Calculate date 30 days ago
  const d = new Date();
  d.setDate(d.getDate() - 30);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const startDateStr = `${yyyy}-${mm}-${dd}`;

  try {
    const response = await fetch(`https://api.frankfurter.dev/v1/${startDateStr}..?from=${base}&to=${symbolsQuery}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const rates = data.rates;
    const startDate = data.start_date;
    const endDate = data.end_date;
    localStorage.setItem(cacheKey, JSON.stringify({ rates, timestamp: Date.now(), startDate, endDate }));
    console.log(`Fetched fresh historical rates for base ${base}:`, rates);
    return { rates, startDate, endDate };
  } catch (error) {
    console.error(`Failed to fetch historical rates for ${base}:`, error);
    if (cached) {
      const parsed = JSON.parse(cached);
      return { rates: parsed.rates, startDate: parsed.startDate, endDate: parsed.endDate };
    }
    return { rates: {}, startDate: '', endDate: '' };
  }
};


// Backward compatibility (if needed)
export const fetchExchangeRate = fetchStandardRate;



