const CONFIG = {
    API_KEY: '5b526d0583004fa05f98a2a3', // Move to environment variable in production
    API_BASE_URL: 'https://v6.exchangerate-api.com/v6/',
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
    MAX_HISTORY_ITEMS: 5,
    CHART_DAYS: 30, // Days of historical data to show
    AMOUNT_LIMITS: {
        MIN: 0.01,
        MAX: 1000000
    },
    RATE_ALERT_THRESHOLD: 0.5, // 0.5% change triggers alert
    THEME: {
        LIGHT: 'light',
        DARK: 'dark'
    }
};

// Prevent modification of config
Object.freeze(CONFIG);

export default CONFIG;
