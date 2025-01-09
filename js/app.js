class CurrencyConverter {
    constructor() {
        this.api = new ExchangeRateAPI();
        this.form = document.getElementById('converterForm');
        this.amount = document.getElementById('amount');
        this.fromCurrency = document.getElementById('fromCurrency');
        this.toCurrency = document.getElementById('toCurrency');
        this.result = document.getElementById('result');
        this.error = document.getElementById('error');
        this.historyList = document.getElementById('historyList');
        this.swapBtn = document.getElementById('swapBtn');
        this.clearBtn = document.getElementById('clearAmount');

        this.setupEventListeners();
        this.populateCurrencyDropdowns();
        this.loadHistory();
    }

    setupEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.swapBtn.addEventListener('click', () => this.swapCurrencies());
        this.clearBtn.addEventListener('click', () => this.clearAmount());
        this.amount.addEventListener('input', () => this.validateAmount());
    }

    populateCurrencyDropdowns() {
        Object.entries(currencies).forEach(([code, details]) => {
            const option1 = new Option(`${details.symbol} ${code} - ${details.name}`, code);
            const option2 = new Option(`${details.symbol} ${code} - ${details.name}`, code);
            this.fromCurrency.add(option1);
            this.toCurrency.add(option2);
        });

        this.fromCurrency.value = 'USD';
        this.toCurrency.value = 'EUR';
    }

    async handleSubmit(e) {
        e.preventDefault();
        const amount = parseFloat(this.amount.value);
        const fromCurrency = this.fromCurrency.value;
        const toCurrency = this.toCurrency.value;

        if (amount <= 0) {
            this.showError('Please enter a valid amount');
            return;
        }

        try {
            const rate = await this.api.getRate(fromCurrency, toCurrency);
            const convertedAmount = (amount * rate).toFixed(2);
            this.displayResult(amount, convertedAmount, fromCurrency, toCurrency, rate);
            this.addToHistory(amount, convertedAmount, fromCurrency, toCurrency);
        } catch (error) {
            this.showError(error.message);
        }
    }

    displayResult(amount, convertedAmount, fromCurrency, toCurrency, rate) {
        const fromSymbol = currencies[fromCurrency].symbol;
        const toSymbol = currencies[toCurrency].symbol;

        this.result.style.display = 'block';
        this.error.style.display = 'none';
        
        document.getElementById('conversionText').textContent = 
            `${fromSymbol}${amount} ${fromCurrency} = ${toSymbol}${convertedAmount} ${toCurrency}`;
        document.getElementById('rateText').textContent = 
            `Exchange rate: ${fromSymbol}1 ${fromCurrency} = ${toSymbol}${rate} ${toCurrency}`;
        document.getElementById('timestamp').textContent = 
            `Last updated: ${new Date().toLocaleString()}`;
    }

    showError(message) {
        this.result.style.display = 'none';
        this.error.style.display = 'block';
        this.error.textContent = message;
    }

    swapCurrencies() {
        const temp = this.fromCurrency.value;
        this.fromCurrency.value = this.toCurrency.value;
        this.toCurrency.value = temp;
        if (this.amount.value) {
            this.form.dispatchEvent(new Event('submit'));
        }
    }

    clearAmount() {
        this.amount.value = '';
        this.result.style.display = 'none';
        this.error.style.display = 'none';
    }

    validateAmount() {
        if (this.amount.value < 0) {
            this.amount.value = Math.abs(this.amount.value);
        }
    }

    addToHistory(amount, convertedAmount, fromCurrency, toCurrency) {
        const historyItem = {
            amount,
            convertedAmount,
            fromCurrency,
            toCurrency,
            timestamp: new Date().toISOString()
        };

        let history = JSON.parse(localStorage.getItem('conversionHistory') || '[]');
        history.unshift(historyItem);
        history = history.slice(0, 5); // Keep only last 5 conversions
        localStorage.setItem('conversionHistory', JSON.stringify(history));
        this.displayHistory();
    }

    loadHistory() {
        const history = JSON.parse(localStorage.getItem('conversionHistory') || '[]');
        this.displayHistory(history);
    }

    displayHistory() {
        const history = JSON.parse(localStorage.getItem('conversionHistory') || '[]');
        this.historyList.innerHTML = '';

        history.forEach(item => {
            const li = document.createElement('li');
            li.className = 'list-group-item history-item';
            const fromSymbol = currencies[item.fromCurrency].symbol;
            const toSymbol = currencies[item.toCurrency].symbol;
            
            li.innerHTML = `
                ${fromSymbol}${item.amount} ${item.fromCurrency} = 
                ${toSymbol}${item.convertedAmount} ${item.toCurrency}
                <small class="text-muted d-block">
                    ${new Date(item.timestamp).toLocaleString()}
                </small>
            `;

            li.addEventListener('click', () => {
                this.amount.value = item.amount;
                this.fromCurrency.value = item.fromCurrency;
                this.toCurrency.value = item.toCurrency;
                this.form.dispatchEvent(new Event('submit'));
            });

            this.historyList.appendChild(li);
        });
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new CurrencyConverter();
});
