const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;
const BASE_URL = "http://20.244.56.144/evaluation-service";

app.get('/stocks/:ticker', async (req, res) => {
    const { ticker } = req.params;
    const { minutes, aggregation } = req.query;

    if (aggregation !== 'average') {
        return res.status(400).send({ error: 'Only average aggregation is supported.' });
    }

    try {
        const response = await axios.get(`${BASE_URL}/stocks/${ticker}?minutes=${minutes}`);
        const data = response.data;

        let sum = 0;
        for (let record of data) {
            sum += record.price;
        }

        const avg = sum / data.length;

        res.json({
            averageStockPrice: avg,
            priceHistory: data
        });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.get('/stockcorrelation', async (req, res) => {
    const { minutes, ticker } = req.query;
    const [ticker1, ticker2] = ticker.split(',');

    try {
        const [data1Res, data2Res] = await Promise.all([
            axios.get(`${BASE_URL}/stocks/${ticker1}?minutes=${minutes}`),
            axios.get(`${BASE_URL}/stocks/${ticker2}?minutes=${minutes}`)
        ]);

        const prices1 = data1Res.data.map(p => p.price);
        const prices2 = data2Res.data.map(p => p.price);

        const minLength = Math.min(prices1.length, prices2.length);
        const sliced1 = prices1.slice(-minLength);
        const sliced2 = prices2.slice(-minLength);

        const mean = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
        const avg1 = mean(sliced1);
        const avg2 = mean(sliced2);

        const covariance = sliced1.reduce((sum, x, i) => sum + ((x - avg1) * (sliced2[i] - avg2)), 0) / (minLength - 1);
        const stdDev = arr => Math.sqrt(arr.reduce((sum, x) => sum + Math.pow(x - mean(arr), 2), 0) / (arr.length - 1));
        const std1 = stdDev(sliced1);
        const std2 = stdDev(sliced2);

        const correlation = covariance / (std1 * std2);

        res.json({
            correlation,
            stocks: {
                [ticker1]: {
                    averagePrice: avg1,
                    priceHistory: data1Res.data
                },
                [ticker2]: {
                    averagePrice: avg2,
                    priceHistory: data2Res.data
                }
            }
        });

    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
