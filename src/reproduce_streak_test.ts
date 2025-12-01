
import { isYesterday, getToday } from './utils/dateUtils';

console.log('--- Date Utils Test ---');
console.log('Current Date (getToday):', getToday());

const today = new Date();
const todayStr = getToday();

// Helper to format date as YYYY-MM-DD
const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Test 1: Real Yesterday
const realYesterday = new Date(today);
realYesterday.setDate(today.getDate() - 1);
const realYesterdayStr = formatDate(realYesterday);
console.log(`Test 1: Real Yesterday (${realYesterdayStr}) -> isYesterday?`, isYesterday(realYesterdayStr));

// Test 2: 3 Days Ago
const threeDaysAgo = new Date(today);
threeDaysAgo.setDate(today.getDate() - 3);
const threeDaysAgoStr = formatDate(threeDaysAgo);
console.log(`Test 2: 3 Days Ago (${threeDaysAgoStr}) -> isYesterday?`, isYesterday(threeDaysAgoStr));

// Test 3: Month Boundary Simulation (if today is Dec 1)
// We can't easily mock "today" inside isYesterday without modifying it, 
// but we can see if the logic holds for the current date.

// Let's manually simulate the logic from isYesterday to see if it's flawed
const simulateIsYesterday = (dateString: string, assumedToday: Date) => {
    const yesterday = new Date(assumedToday);
    yesterday.setDate(yesterday.getDate() - 1);

    const yYear = yesterday.getFullYear();
    const yMonth = String(yesterday.getMonth() + 1).padStart(2, '0');
    const yDay = String(yesterday.getDate()).padStart(2, '0');
    const yesterdayString = `${yYear}-${yMonth}-${yDay}`;

    return dateString === yesterdayString;
};

console.log('--- Simulation Tests ---');

// Simulating Today = Dec 1, 2025
const dec1 = new Date('2025-12-01T12:00:00');
const nov30 = '2025-11-30';
const nov28 = '2025-11-28';

console.log(`Sim: Today=Dec 1, Check Nov 30 (Yesterday):`, simulateIsYesterday(nov30, dec1));
console.log(`Sim: Today=Dec 1, Check Nov 28 (3 Days Ago):`, simulateIsYesterday(nov28, dec1));

