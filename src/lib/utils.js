/**
 * Get a random number between `min` and `max`
 * @param {number} min The minimum number you want to include in the random output
 * @param {number} max The maximum number you want to include in the random output
 * @returns {number} A random number including and between the `min` and `max`
 */
export function randomMinMax(min = 0, max = 100) {
    return Math.floor(Math.random() * (max - min)) + min;
}

export function uuidv4() {
    return 'xxxxxxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0,
            v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
