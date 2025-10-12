// routes/stock.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Demo stock data generator (fallback when API is limited)
function generateDemoData(symbol, basePrice = 150) {
    const timeSeries = {};
    const today = new Date();
    
    for (let i = 30; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Generate realistic price movement
        const volatility = basePrice * 0.02; // 2% daily volatility
        const priceChange = (Math.random() - 0.5) * volatility;
        const price = (basePrice + priceChange).toFixed(2);
        
        timeSeries[dateStr] = {
            '1. open': price,
            '2. high': (parseFloat(price) + Math.random() * 2).toFixed(2),
            '3. low': (parseFloat(price) - Math.random() * 2).toFixed(2),
            '4. close': price,
            '5. volume': Math.floor(Math.random() * 10000000) + 5000000
        };
        
        // Update base price for next day
        basePrice = parseFloat(price);
    }
    
    return {
        'Meta Data': {
            '1. Information': 'Demo Data (API Limited)',
            '2. Symbol': symbol,
            '3. Last Refreshed': today.toISOString().split('T')[0],
            '4. Output Size': 'Compact',
            '5. Time Zone': 'US/Eastern'
        },
        'Time Series (Daily)': timeSeries
    };
}

// Base prices for popular stocks for realistic demo data
const stockBasePrices = {
    'AAPL': 180, 'MSFT': 330, 'GOOGL': 135, 'AMZN': 150, 'TSLA': 200,
    'META': 320, 'NVDA': 450, 'NFLX': 500, 'JPM': 170, 'JNJ': 155,
    'V': 250, 'WMT': 160, 'DIS': 90, 'XOM': 110, 'BAC': 35
};

router.get('/:symbol', async (req, res) => {
    const symbol = req.params.symbol.toUpperCase();
    
    console.log(`Stock API request for: ${symbol}`);
    
    // Always use demo data for now (API is rate limited)
    // You can switch back to real API tomorrow when limits reset
    try {
        const basePrice = stockBasePrices[symbol] || 150;
        const demoData = generateDemoData(symbol, basePrice);
        
        console.log(`Using demo data for ${symbol} (API limited)`);
        res.json(demoData);
        
        /* 
        // Uncomment this section tomorrow when API limits reset:
        const response = await axios.get(`https://www.alphavantage.co/query`, {
            params: {
                function: 'TIME_SERIES_DAILY',
                symbol: symbol,
                apikey: process.env.ALPHA_VANTAGE_KEY,
                outputsize: 'compact'
            },
            timeout: 10000 // 10 second timeout
        });
        
        if (response.data['Error Message'] || response.data['Information']) {
            // Fallback to demo data if API fails
            console.log(`API limit reached for ${symbol}, using demo data`);
            const basePrice = stockBasePrices[symbol] || 150;
            const demoData = generateDemoData(symbol, basePrice);
            return res.json(demoData);
        }
        
        if (response.data['Time Series (Daily)']) {
            console.log(`Real data received for ${symbol}`);
            res.json(response.data);
        } else {
            // Fallback to demo data
            const basePrice = stockBasePrices[symbol] || 150;
            const demoData = generateDemoData(symbol, basePrice);
            res.json(demoData);
        }
        */
        
    } catch (error) {
        console.error(`Error fetching data for ${symbol}:`, error.message);
        // Fallback to demo data on any error
        const basePrice = stockBasePrices[symbol] || 150;
        const demoData = generateDemoData(symbol, basePrice);
        res.json(demoData);
    }
});

module.exports = router;