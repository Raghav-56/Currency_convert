class ExchangeRateAPI {
    constructor() {
        this.API_KEY = '5b526d0583004fa05f98a2a3'; // API key
        this.BASE_URL = 'https://v6.exchangerate-api.com/v6/';
        this.cache = new Map();
        this.cacheExpiration = 5 * 60 * 1000; // 5 minutes
    }

    async getRate(fromCurrency, toCurrency) {
        const cacheKey = `${fromCurrency}-${toCurrency}`;
        const cachedData = this.cache.get(cacheKey);

        if (cachedData && Date.now() - cachedData.timestamp < this.cacheExpiration) {
            return cachedData.rate;
        }

        try {
            const response = await fetch(`${this.BASE_URL}${this.API_KEY}/pair/${fromCurrency}/${toCurrency}`);
            const data = await response.json();

            if (data.result === 'success') {
                this.cache.set(cacheKey, {
                    rate: data.conversion_rate,
                    timestamp: Date.now()
                });
                return data.conversion_rate;
            } else {
                throw new Error('Failed to fetch exchange rate');
            }
        } catch (error) {
            throw new Error('Error fetching exchange rate');
        }
    }
}
