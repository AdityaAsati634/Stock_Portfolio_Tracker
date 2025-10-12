const axios = require('axios');

const fetchStockPrice = async (symbol) => {
    try {
        const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${process.env.ALPHA_VANTAGE_KEY}`;
        const response = await axios.get(url);
        
        // Check if API returned error or no data
        if (response.data['Error Message'] || !response.data['Time Series (5min)']) {
            console.log('API Error for', symbol, response.data);
            return null;
        }
        
        const timeSeries = response.data['Time Series (5min)'];
        const latestTimestamp = Object.keys(timeSeries)[0];
        return parseFloat(timeSeries[latestTimestamp]['4. close']);
    } catch (error) {
        console.error('Error fetching stock price for', symbol, error.message);
        return null;
    }
};

module.exports = { fetchStockPrice };