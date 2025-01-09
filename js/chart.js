import CONFIG from './config.js';

class ChartManager {
    constructor() {
        this.chart = null;
        this.chartContext = document.getElementById('rateChart').getContext('2d');
    }

    initChart(fromCurrency, toCurrency, historicalData) {
        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(this.chartContext, {
            type: 'line',
            data: {
                labels: historicalData.dates,
                datasets: [{
                    label: `${fromCurrency}/${toCurrency} Exchange Rate`,
                    data: historicalData.rates,
                    fill: false,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return value.toFixed(4);
                            }
                        }
                    }
                }
            }
        });
    }

    updateChart(newData) {
        if (this.chart) {
            this.chart.data.labels = newData.dates;
            this.chart.data.datasets[0].data = newData.rates;
            this.chart.update();
        }
    }

    setDarkMode(isDark) {
        if (this.chart) {
            this.chart.options.plugins.legend.labels.color = isDark ? '#fff' : '#666';
            this.chart.options.scales.y.grid.color = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
            this.chart.options.scales.x.grid.color = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
            this.chart.update();
        }
    }
}

export default new ChartManager();
