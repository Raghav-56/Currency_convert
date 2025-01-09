import CONFIG from './config.js';
import CurrencyManager from './currencies.js';
import ExchangeRateAPI from './api.js';
import ChartManager from './chart.js';

class CurrencyConverter {
    constructor() {
        this.api = new ExchangeRateAPI();
        this.initializeElements();
        this.setupEventListeners();
        this.loadThemePreference();
        this.loadHistory();
        this.previousRates = new Map();
    }

    initializeElements() {
        // Form elements
        this.form = document.getElementById('converterForm');
        this.amount = document.getElementById('amount');
        this.fromCurrency = document.getElementById('fromCurrency');
        this.toCurrency = document.getElementById('toCurrency');
        
        // Buttons
        this.swapBtn = document.getElementById('swapBtn');
        this.clearBtn = document.getElementById('clearAmount');
        this.copyBtn = document.getElementById('copyResult');
        this.themeToggle = document.getElementById('themeToggle');
        this.clearHistoryBtn = document.getElementById('clearHistory');
        
        // Display areas
        this.result = document.getElementById('result');
        this.error = document.getElementById('error');
        this.historyList = document.getElementById('historyList');
        this.conversionText = document.getElementById('conversionText');
        this.rateText = document.getElementById('rateText');
        this.timestamp = document.getElementById('timestamp');
    }

    setupEventListeners() {
        // Form events
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.amount.addEventListener('input', () => this.validateAmount());
        
        // Button events
        this.swapBtn.addEventListener('click', () => this.swapCurrencies());
        this.clearBtn.addEventListener('click', () => this.clearAmount());
        this.copyBtn.addEventListener('click', () => this.copyToClipboard());
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // Currency selection events
        this.fromCurrency.addEventListener('change', () => this.handleCurrencyChange('from'));
        this.toCurrency.addEventListener('change', () => this.handleCurrencyChange('to'));

        // Initialize currency dropdowns
        this.populateCurrencyDropdowns();
    }

    async handleSubmit(e) {
        e.preventDefault();
        this.hideError();
        this.showLoading();

        try {
            const amount = parseFloat(this.amount.value);
            const fromCurrency = this.fromCurrency.value;
            const toCurrency = this.toCurrency.value;

            // Validate amount
            CurrencyManager.validateAmount(amount, fromCurrency);

            const rate = await this.api.getRate(fromCurrency, toCurrency);
            this.checkRateAlert(fromCurrency, toCurrency, rate);
            
            const convertedAmount = amount * rate;
            this.displayResult(amount, convertedAmount, fromCurrency, toCurrency, rate);
            this.addToHistory(amount, convertedAmount, fromCurrency, toCurrency);
            
            this.previousRates.set(`${fromCurrency}-${toCurrency}`, rate);
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.hideLoading();
        }
    }

    checkRateAlert(fromCurrency, toCurrency, newRate) {
        const key = `${fromCurrency}-${toCurrency}`;
        const previousRate = this.previousRates.get(key);
        
        if (previousRate) {
            const changePercent = Math.abs((newRate - previousRate) / previousRate * 100);
            if (changePercent >= CONFIG.RATE_ALERT_THRESHOLD) {
                this.showRateAlert(fromCurrency, toCurrency, changePercent, newRate > previousRate);
            }
        }
    }

    showRateAlert(fromCurrency, toCurrency, changePercent, isIncrease) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${isIncrease ? 'warning' : 'info'} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            <strong>Rate Alert!</strong> ${fromCurrency}/${toCurrency} rate has 
            ${isIncrease ? 'increased' : 'decreased'} by ${changePercent.toFixed(2)}%
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        this.form.insertAdjacentElement('beforebegin', alertDiv);
    }

    displayResult(amount, convertedAmount, fromCurrency, toCurrency, rate) {
        const fromInfo = CurrencyManager.getCurrencyInfo(fromCurrency);
        const toInfo = CurrencyManager.getCurrencyInfo(toCurrency);

        this.conversionText.textContent = `${fromInfo.symbol}${amount} ${fromCurrency} = ${toInfo.symbol}${convertedAmount.toFixed(2)} ${toCurrency}`;
        this.rateText.textContent = `Exchange rate: ${fromInfo.symbol}1 ${fromCurrency} = ${toInfo.symbol}${rate.toFixed(4)} ${toCurrency}`;
        this.timestamp.textContent = `Last updated: ${new Date().toLocaleString()}`;
        
        this.result.style.display = 'block';
    }

    async copyToClipboard() {
        try {
            await navigator.clipboard.writeText(this.conversionText.textContent);
            this.showTemporaryMessage('Copied to clipboard!', 'success');
        } catch (err) {
            this.showTemporaryMessage('Failed to copy to clipboard', 'danger');
        }
    }

    addToHistory(amount, convertedAmount, fromCurrency, toCurrency) {
        const historyItem = {
            amount,
            convertedAmount,
            fromCurrency,
            toCurrency,
            timestamp: new Date().toISOString(),
            rate: convertedAmount / amount
        };

        let history = this.getHistory();
        history.unshift(historyItem);
        history = history.slice(0, CONFIG.MAX_HISTORY_ITEMS);
        localStorage.setItem('conversionHistory', JSON.stringify(history));
        this.displayHistory();
    }

    displayHistory() {
        const history = this.getHistory();
        this.historyList.innerHTML = '';

        history.forEach(item => {
            const li = document.createElement('li');
            li.className = 'list-group-item history-item';
            
            const fromInfo = CurrencyManager.getCurrencyInfo(item.fromCurrency);
            const toInfo = CurrencyManager.getCurrencyInfo(item.toCurrency);

            li.innerHTML = `
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        ${fromInfo.symbol}${item.amount} ${item.fromCurrency} = 
                        ${toInfo.symbol}${item.convertedAmount.toFixed(2)} ${item.toCurrency}
                        <small class="text-muted d-block">
                            ${new Date(item.timestamp).toLocaleString()}
                        </small>
                    </div>
                    <button class="btn btn-sm btn-outline-primary repeat-conversion">
                        <i class="fas fa-redo"></i>
                    </button>
                </div>
            `;

            li.querySelector('.repeat-conversion').addEventListener('click', (e) => {
                e.stopPropagation();
                this.repeatConversion(item);
            });

            this.historyList.appendChild(li);
        });
    }

    toggleTheme() {
        const currentTheme = document.body.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const icon = this.themeToggle.querySelector('i');
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        
        ChartManager.setDarkMode(newTheme === 'dark');
    }

    loadThemePreference() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', savedTheme);
        const icon = this.themeToggle.querySelector('i');
        icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    showError(message) {
        this.error.style.display = 'block';
        this.error.textContent = message;
        this.result.style.display = 'none';
    }

    hideError() {
        this.error.style.display = 'none';
    }

    showLoading() {
        const spinner = this.form.querySelector('.spinner-border');
        spinner.classList.remove('d-none');
    }

    hideLoading() {
        const spinner = this.form.querySelector('.spinner-border');
        spinner.classList.add('d-none');
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + Enter to convert
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            this.form.dispatchEvent(new Event('submit'));
        }
        // Ctrl/Cmd + S to swap currencies
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            this.swapCurrencies();
        }
    }

    // Helper methods
    getHistory() {
        return JSON.parse(localStorage.getItem('conversionHistory') || '[]');
    }

    clearHistory() {
        localStorage.removeItem('conversionHistory');
        this.displayHistory();
    }

    repeatConversion(historyItem) {
        this.amount.value = historyItem.amount;
        this.fromCurrency.value = historyItem.fromCurrency;
        this.toCurrency.value = historyItem.toCurrency;
        this.form.dispatchEvent(new Event('submit'));
    }

    showTemporaryMessage(message, type) {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} position-fixed top-0 start-50 translate-middle-x mt-3`;
        alert.style.zIndex = '1050';
        alert.textContent = message;
        
        document.body.appendChild(alert);
        setTimeout(() => alert.remove(), 2000);
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new CurrencyConverter();
});
