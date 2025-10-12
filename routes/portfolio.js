const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middleware/auth');
const Portfolio = require('../models/portfolio');
const Transaction = require('../models/transaction');
const { fetchStockPrice } = require('../utils/stockAPI'); 

// Test route
router.get('/test', (req, res) => {
    res.send('Portfolio routes working!');
});

// Dashboard route
router.get('/dashboard', isLoggedIn, async (req, res) => {
    try {
        const portfolio = await Portfolio.find({ user: req.user._id });
        
        // Calculate portfolio summary
        let totalInvestment = 0;
        let totalCurrentValue = 0;
        
        for (let stock of portfolio) {
            const currentPrice = await fetchStockPrice(stock.symbol);
            if (currentPrice) {
                totalInvestment += stock.purchasePrice * stock.quantity;
                totalCurrentValue += currentPrice * stock.quantity;
            }
        }
        
        const totalProfitLoss = totalCurrentValue - totalInvestment;
        const profitLossPercent = totalInvestment > 0 ? (totalProfitLoss / totalInvestment) * 100 : 0;

        res.render('dashboard', { 
            portfolio,
            summary: {
                totalInvestment,
                totalCurrentValue,
                totalProfitLoss,
                profitLossPercent
            }
        });
    } catch (error) {
        res.redirect('/');
    }
});

// Add stock form route
router.get('/add', isLoggedIn, (req, res) => {
    res.render('portfolio/add');
});

// Add stock to portfolio
router.post('/add', isLoggedIn, async (req, res) => {
    try {
        const { symbol, quantity, purchasePrice } = req.body;
        console.log('Adding stock:', symbol, quantity, purchasePrice);
        
        const portfolioItem = new Portfolio({
            user: req.user._id,
            symbol: symbol.toUpperCase(),
            quantity: parseInt(quantity),
            purchasePrice: parseFloat(purchasePrice)
        });
        await portfolioItem.save();
        console.log('Portfolio item saved');
        
        // Record BUY transaction
        const transaction = new Transaction({
            user: req.user._id,
            type: 'BUY',
            symbol: symbol.toUpperCase(),
            quantity: parseInt(quantity),
            price: parseFloat(purchasePrice)
        });
        await transaction.save();
        console.log('BUY transaction recorded');
        
        res.redirect('/portfolio/dashboard');
    } catch (error) {
        console.error('Add stock error:', error);
        res.redirect('/portfolio/add');
    }
});

// Get current stock price API
router.get('/price/:symbol', isLoggedIn, async (req, res) => {
    try {
        const price = await fetchStockPrice(req.params.symbol);
        res.json({ price });
    } catch (error) {
        res.json({ price: null });
    }
});

// Edit stock form
router.get('/edit/:id', isLoggedIn, async (req, res) => {
    try {
        const stock = await Portfolio.findById(req.params.id);
        res.render('portfolio/edit', { stock });
    } catch (error) {
        res.redirect('/portfolio/dashboard');
    }
});

// Update stock
router.post('/edit/:id', isLoggedIn, async (req, res) => {
    try {
        const { quantity, purchasePrice } = req.body;
        const oldStock = await Portfolio.findById(req.params.id);
        console.log('Editing stock:', oldStock.symbol, 'to', quantity, purchasePrice);
        
        await Portfolio.findByIdAndUpdate(req.params.id, {
            quantity: parseInt(quantity),
            purchasePrice: parseFloat(purchasePrice)
        });
        
        // Record EDIT transaction
        const transaction = new Transaction({
            user: req.user._id,
            type: 'EDIT',
            symbol: oldStock.symbol,
            quantity: parseInt(quantity),
            price: parseFloat(purchasePrice)
        });
        await transaction.save();
        console.log('EDIT transaction recorded');
        
        res.redirect('/portfolio/dashboard?updated=' + Date.now());
    } catch (error) {
        console.error('Edit stock error:', error);
        res.redirect('/portfolio/edit/' + req.params.id);
    }
});

// Delete stock from portfolio
router.post('/delete/:id', isLoggedIn, async (req, res) => {
    try {
        const stock = await Portfolio.findById(req.params.id);
        console.log('Deleting stock:', stock.symbol);
        
        await Portfolio.findByIdAndDelete(req.params.id);
        
        // Record DELETE transaction
        const transaction = new Transaction({
            user: req.user._id,
            type: 'DELETE',
            symbol: stock.symbol,
            quantity: stock.quantity,
            price: stock.purchasePrice
        });
        await transaction.save();
        console.log('DELETE transaction recorded');
        
        res.redirect('/portfolio/dashboard');
    } catch (error) {
        console.error('Delete stock error:', error);
        res.redirect('/portfolio/dashboard');
    }
});

// Transactions history route
router.get('/transactions', isLoggedIn, async (req, res) => {
    console.log('TRANSACTIONS ROUTE CALLED - User ID:', req.user._id);
    try {
        const transactions = await Transaction.find({ user: req.user._id }).sort({ date: -1 });
        console.log('Found transactions:', transactions.length, 'records');
        console.log('Transaction details:', transactions);
        res.render('portfolio/transactions', { transactions });
    } catch (error) {
        console.error('Transactions error:', error);
        res.redirect('/portfolio/dashboard');
    }
});

module.exports = router;