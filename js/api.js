import CONFIG from './config.js';

class ExchangeRateAPI {
    constructor() {
        this.cache = new Map();
    }

    async getRate(fromCurrency, toCurrency) {
        try {
            const rate = await this.fetchWithCache(fromCurrency, toCurrency);
            return rate;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    async fetchWithCache(fromCurrency, toCurrency) {
        const cacheKey = `${fromCurrency}-${toCurrency}`;
        const cachedData = this.cache.get(cacheKey);

        if (this.isValidCache(cachedData)) {
            return cachedData.rate;
        }

        const rate = await this.fetchFreshRate(fromCurrency, toCurrency);
        this.updateCache(cacheKey, rate);
        return rate;
    }

    async fetchFreshRate(fromCurrency, toCurrency) {
        const response = await this.makeAPIRequest(fromCurrency, toCurrency);
        return this.parseAPIResponse(response);
    }

    async makeAPIRequest(fromCurrency, toCurrency) {
        const url = `${CONFIG.API_BASE_URL}${CONFIG.API_KEY}/pair/${fromCurrency}/${toCurrency}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            throw new Error('Network error occurred');
        }
    }

    parseAPIResponse(data) {
        if (data.result === 'success') {
            return data.conversion_rate;
        }
        throw new Error(data.error || 'Invalid API response');
    }

    isValidCache(cachedData) {
        return cachedData && 
               Date.now() - cachedData.timestamp < CONFIG.CACHE_DURATION;
    }

    updateCache(key, rate) {
        this.cache.set(key, {
            rate,
            timestamp: Date.now()
        });
    }

    handleError(error) {
        if (error.message.includes('Network error')) {
            return new Error('Unable to connect to server. Please check your internet connection.');
        }
        if (error.message.includes('HTTP error')) {
            return new Error('Server error occurred. Please try again later.');
        }
        return error;
    }

    // New method for historical data
    async getHistoricalRates(fromCurrency, toCurrency, days = CONFIG.CHART_DAYS) {
        // Implement historical data fetching
        // Note: This requires a different API endpoint or service
        throw new Error('Historical data not implemented');
    }
}

export default ExchangeRateAPI;
