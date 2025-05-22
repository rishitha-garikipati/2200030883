const express = require("express");
const axios = require("axios");
const WindowManager = require("./windowManager");

const app = express();
const PORT = 9876;
const windowSize = 10;
const windowManager = new WindowManager(windowSize);

const accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjox7639163htgDtmp0aSI6IjU4MTI1YzZmLTYzYTMtNDNhZi05NjJjLTcwYTU1MzQ1MmEyMyIsInN1YiI6IjIyMDAwMzA5MDdjc2VoQGdtYWlsLmNvbSJ9LCJlbWFpbCI6IjIyMDAwMzA5MDdjc2VoQGdtYWlsLmNvbSIsIm5hbWUiOiJtYWxleSB2ZW5rYXRhIHNhaSB2YW1zaGkiLCJyb2xsTm8iOiIyMjAwMDMwOTA3IiwiYWNjZXNzQ29kZSI6ImJlVEpqSiIsImNsaWVudElEIjoiNTgxMjVjNmYtNjNhMy00M2FmLTk2MmMtNzBhNTUzNDUyYTIzIiwiY2xpZW50U2VjcmV0IjoiUmtzcE11bkJlRUZLdkVCRSJ9.NJA33UwiMoybwTwyqhlR6r_L40tryP1y-Zt8QpXgrPA";
const THIRD_PARTY_API_MAP = {
    p: "http://20.244.56.144/evaluation-service/primes",
    f: "http://20.244.56.144/evaluation-service/fibo",
    e: "http://20.244.56.144/evaluation-service/even",
    r: "http://20.244.56.144/evaluation-service/rand"
};

app.get("/numbers/:id", async (req, res) => {
    const id = req.params.id;
    const url = THIRD_PARTY_API_MAP[id];

    if (!url) {
        return res.status(400).json({ error: "Invalid number ID" });
    }

    try {
        const start = Date.now();
        const response = await axios.get(url, {
            timeout: 500,
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        const numbers = response.data.numbers;
        const result = windowManager.update(numbers);
        const end = Date.now();

        if (end - start > 500) {
            console.warn("⚠️ Warning: 3rd party API took too long");
        }

        res.json(result);
    } catch (error) {
        console.error("Error fetching:", error.message);
        res.status(500).json({ error: "Failed to fetch from 3rd party API" });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
