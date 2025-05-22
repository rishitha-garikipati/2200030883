class WindowManager {
    constructor(size) {
        this.size = size;
        this.window = [];
    }

    update(numbers) {
        for (let num of numbers) {
            if (!this.window.includes(num)) {
                this.window.push(num);
            }
        }

        while (this.window.length > this.size) {
            this.window.shift();
        }

        const sum = this.window.reduce((a, b) => a + b, 0);
        const avg = this.window.length ? sum / this.window.length : 0;

        return {
            windowPrevState: [], 
            windowCurrState: [...this.window],
            numbers,
            avg: parseFloat(avg.toFixed(2))
        };
    }
}

module.exports = WindowManager;
