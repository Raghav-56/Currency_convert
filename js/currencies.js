import CONFIG from './config.js';

class CurrencyManager {
    constructor() {
        this.currencies = {
            'USD': {
                name: 'US Dollar',
                symbol: '$',
                locale: 'en-US',
                decimal_digits: 2,
                popular: true,
                regions: ['Americas'],
                min_amount: 0.01,
                max_amount: 1000000
            },
            'EUR': {
                name: 'Euro',
                symbol: '€',
                locale: 'de-DE',
                decimal_digits: 2,
                popular: true,
                regions: ['Europe']
            },
            'GBP': {
                name: 'British Pound',
                symbol: '£',
                locale: 'en-GB',
                decimal_digits: 2,
                popular: true,
                regions: ['Europe']
            },
            // Add more currencies with detailed information
        };

        this.favorites = this.loadFavorites();
    }

    formatAmount(amount, currencyCode) {
        const currency = this.currencies[currencyCode];
        return new Intl.NumberFormat(currency.locale, {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: currency.decimal_digits
        }).format(amount);
    }

    validateAmount(amount, currencyCode) {
        const currency = this.currencies[currencyCode];
        const min = currency.min_amount || CONFIG.AMOUNT_LIMITS.MIN;
        const max = currency.max_amount || CONFIG.AMOUNT_LIMITS.MAX;

        if (amount < min) {
            throw new Error(`Minimum amount for ${currencyCode} is ${this.formatAmount(min, currencyCode)}`);
        }
        if (amount > max) {
            throw new Error(`Maximum amount for ${currencyCode} is ${this.formatAmount(max, currencyCode)}`);
        }
        return true;
    }

    getPopularCurrencies() {
        return Object.entries(this.currencies)
            .filter(([_, details]) => details.popular)
            .map(([code]) => code);
    }

    getCurrenciesByRegion(region) {
        return Object.entries(this.currencies)
            .filter(([_, details]) => details.regions.includes(region))
            .map(([code]) => code);
    }

    toggleFavorite(currencyCode) {
        const index = this.favorites.indexOf(currencyCode);
        if (index === -1) {
            this.favorites.push(currencyCode);
        } else {
            this.favorites.splice(index, 1);
        }
        this.saveFavorites();
        return this.favorites;
    }

    isFavorite(currencyCode) {
        return this.favorites.includes(currencyCode);
    }

    loadFavorites() {
        const saved = localStorage.getItem('favoriteCurrencies');
        return saved ? JSON.parse(saved) : [];
    }

    saveFavorites() {
        localStorage.setItem('favoriteCurrencies', JSON.stringify(this.favorites));
    }

    getCurrencyInfo(currencyCode) {
        return this.currencies[currencyCode];
    }

    getAllCurrencies() {
        return Object.keys(this.currencies);
    }
}

export default new CurrencyManager();
