/* ============================================
   E-Commerce Dashboard — Application Logic
   ============================================ */

// Chart.js global defaults
Chart.defaults.color = '#a0a0c0';
Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.06)';
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.font.size = 11;
Chart.defaults.plugins.legend.labels.padding = 14;
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.pointStyle = 'circle';
Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(14, 17, 23, 0.95)';
Chart.defaults.plugins.tooltip.borderColor = 'rgba(0, 210, 255, 0.2)';
Chart.defaults.plugins.tooltip.borderWidth = 1;
Chart.defaults.plugins.tooltip.cornerRadius = 10;
Chart.defaults.plugins.tooltip.padding = 12;
Chart.defaults.plugins.tooltip.titleFont = { weight: '700', size: 12 };
Chart.defaults.plugins.tooltip.bodyFont = { size: 11 };

const COLORS = ['#00d2ff', '#7b2ff7', '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#01a3a4', '#f368e0'];
const COLORS_ALPHA = COLORS.map(c => c + '99');

// ==================== DATA LOADING ====================
async function loadData() {
    return new Promise((resolve, reject) => {
        Papa.parse('data.csv', {
            download: true,
            header: true,
            dynamicTyping: false,
            skipEmptyLines: true,
            complete: (results) => {
                const data = results.data.map(row => ({
                    ...row,
                    Age: parseInt(row.Age) || 0,
                    Purchase_Amount: parseFloat((row.Purchase_Amount || '').replace(/[$,\s]/g, '')) || 0,
                    Frequency_of_Purchase: parseInt(row.Frequency_of_Purchase) || 0,
                    Brand_Loyalty: parseInt(row.Brand_Loyalty) || 0,
                    Product_Rating: parseInt(row.Product_Rating) || 0,
                    'Time_Spent_on_Product_Research(hours)': parseFloat(row['Time_Spent_on_Product_Research(hours)']) || 0,
                    Return_Rate: parseInt(row.Return_Rate) || 0,
                    Customer_Satisfaction: parseInt(row.Customer_Satisfaction) || 0,
                    Time_to_Decision: parseInt(row.Time_to_Decision) || 0,
                    Discount_Used: row.Discount_Used === 'TRUE' || row.Discount_Used === 'True' || row.Discount_Used === 'true',
                    Customer_Loyalty_Program_Member: row.Customer_Loyalty_Program_Member === 'TRUE' || row.Customer_Loyalty_Program_Member === 'True' || row.Customer_Loyalty_Program_Member === 'true',
                    Purchase_Month: new Date(row.Time_of_Purchase).getMonth() + 1,
                }));
                resolve(data);
            },
            error: reject
        });
    });
}

// ==================== UTILITY FUNCTIONS ====================
function countBy(data, key) {
    const counts = {};
    data.forEach(d => {
        const val = d[key];
        if (val !== undefined && val !== null && val !== '') {
            counts[val] = (counts[val] || 0) + 1;
        }
    });
    return counts;
}

function groupBy(data, key) {
    const groups = {};
    data.forEach(d => {
        const val = d[key];
        if (val !== undefined && val !== null && val !== '') {
            if (!groups[val]) groups[val] = [];
            groups[val].push(d);
        }
    });
    return groups;
}

function mean(arr) {
    if (!arr.length) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function histBins(data, key, binCount) {
    const values = data.map(d => d[key]).filter(v => !isNaN(v));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binWidth = (max - min) / binCount;
    const bins = [];
    const counts = new Array(binCount).fill(0);
    for (let i = 0; i < binCount; i++) {
        bins.push(Math.round(min + i * binWidth));
    }
    values.forEach(v => {
        let idx = Math.floor((v - min) / binWidth);
        if (idx >= binCount) idx = binCount - 1;
        counts[idx]++;
    });
    return { labels: bins, values: counts };
}

// ==================== ANIMATED COUNTER ====================
function animateCounter(elementId, target, prefix = '', suffix = '', duration = 1500) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (target - start) * eased);

        if (target >= 1000) {
            el.textContent = prefix + current.toLocaleString() + suffix;
        } else if (target < 10) {
            const curr = (start + (target - start) * eased).toFixed(1);
            el.textContent = prefix + curr + suffix;
        } else {
            el.textContent = prefix + current.toLocaleString() + suffix;
        }

        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

// ==================== CHART CREATION ====================
function createChart(canvasId, config) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    return new Chart(canvas, config);
}

// ==================== RENDER ALL CHARTS ====================
function renderDashboard(data) {
    // --- KPIs ---
    const totalRevenue = data.reduce((s, d) => s + d.Purchase_Amount, 0);
    const avgPurchase = totalRevenue / data.length;
    const avgSatisfaction = mean(data.map(d => d.Customer_Satisfaction));

    animateCounter('kpi-revenue-val', Math.round(totalRevenue), '$', '', 2000);
    animateCounter('kpi-avg-val', Math.round(avgPurchase), '$', '', 1800);
    animateCounter('kpi-customers-val', data.length, '', '', 1600);
    animateCounter('kpi-satisfaction-val', avgSatisfaction, '', '/10', 1400);

    // --- Demographics: Age ---
    const ageBins = histBins(data, 'Age', 15);
    createChart('chart-age', {
        type: 'bar',
        data: {
            labels: ageBins.labels,
            datasets: [{
                label: 'Customers',
                data: ageBins.values,
                backgroundColor: '#00d2ff88',
                borderColor: '#00d2ff',
                borderWidth: 1,
                borderRadius: 4,
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { title: { display: true, text: 'Age' }, grid: { display: false } },
                y: { title: { display: true, text: 'Count' }, beginAtZero: true }
            }
        }
    });

    // --- Demographics: Gender ---
    const genderCounts = countBy(data, 'Gender');
    // Group minor genders into "Other"
    const mainGenders = ['Male', 'Female'];
    const genderLabels = [];
    const genderValues = [];
    let otherCount = 0;
    Object.entries(genderCounts).forEach(([k, v]) => {
        if (mainGenders.includes(k)) {
            genderLabels.push(k);
            genderValues.push(v);
        } else {
            otherCount += v;
        }
    });
    if (otherCount > 0) {
        genderLabels.push('Other');
        genderValues.push(otherCount);
    }

    createChart('chart-gender', {
        type: 'doughnut',
        data: {
            labels: genderLabels,
            datasets: [{
                data: genderValues,
                backgroundColor: ['#ff6b6b', '#48dbfb', '#feca57'],
                borderColor: 'transparent',
                borderWidth: 0,
                hoverOffset: 8,
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            cutout: '55%',
            plugins: {
                legend: { position: 'bottom' },
            }
        }
    });

    // --- Demographics: Income ---
    const incomeCounts = countBy(data, 'Income_Level');
    const incomeOrder = ['Low', 'Middle', 'High'];
    createChart('chart-income', {
        type: 'doughnut',
        data: {
            labels: incomeOrder.filter(k => incomeCounts[k]),
            datasets: [{
                data: incomeOrder.filter(k => incomeCounts[k]).map(k => incomeCounts[k]),
                backgroundColor: ['#7b2ff7', '#00d2ff', '#ff9ff3'],
                borderColor: 'transparent',
                borderWidth: 0,
                hoverOffset: 8,
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            cutout: '55%',
            plugins: { legend: { position: 'bottom' } }
        }
    });

    // --- Demographics: Education ---
    const eduCounts = countBy(data, 'Education_Level');
    createChart('chart-education', {
        type: 'bar',
        data: {
            labels: Object.keys(eduCounts),
            datasets: [{
                label: 'Count',
                data: Object.values(eduCounts),
                backgroundColor: ['#00d2ff88', '#7b2ff788', '#ff6b6b88', '#feca5788'],
                borderColor: ['#00d2ff', '#7b2ff7', '#ff6b6b', '#feca57'],
                borderWidth: 1,
                borderRadius: 6,
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true }, x: { grid: { display: false } } }
        }
    });

    // --- Demographics: Marital Status ---
    const maritalCounts = countBy(data, 'Marital_Status');
    createChart('chart-marital', {
        type: 'bar',
        data: {
            labels: Object.keys(maritalCounts),
            datasets: [{
                label: 'Count',
                data: Object.values(maritalCounts),
                backgroundColor: ['#48dbfb88', '#ff9ff388', '#54a0ff88', '#01a3a488'],
                borderColor: ['#48dbfb', '#ff9ff3', '#54a0ff', '#01a3a4'],
                borderWidth: 1,
                borderRadius: 6,
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true }, x: { grid: { display: false } } }
        }
    });

    // --- Purchase: Category Average Spending ---
    const catGroups = groupBy(data, 'Purchase_Category');
    const catEntries = Object.entries(catGroups)
        .map(([cat, items]) => ({ cat, avg: mean(items.map(i => i.Purchase_Amount)) }))
        .sort((a, b) => a.avg - b.avg);

    createChart('chart-category-avg', {
        type: 'bar',
        data: {
            labels: catEntries.map(e => e.cat),
            datasets: [{
                label: 'Avg Amount ($)',
                data: catEntries.map(e => Math.round(e.avg)),
                backgroundColor: catEntries.map((_, i) => COLORS_ALPHA[i % COLORS.length]),
                borderColor: catEntries.map((_, i) => COLORS[i % COLORS.length]),
                borderWidth: 1,
                borderRadius: 4,
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { title: { display: true, text: 'Average Purchase Amount ($)' } }, y: { grid: { display: false } } }
        }
    });

    // --- Purchase: Category Revenue ---
    const catRevEntries = Object.entries(catGroups)
        .map(([cat, items]) => ({ cat, revenue: items.reduce((s, i) => s + i.Purchase_Amount, 0) }))
        .sort((a, b) => b.revenue - a.revenue);

    createChart('chart-category-revenue', {
        type: 'bar',
        data: {
            labels: catRevEntries.map(e => e.cat),
            datasets: [{
                label: 'Total Revenue ($)',
                data: catRevEntries.map(e => Math.round(e.revenue)),
                backgroundColor: catRevEntries.map((_, i) => COLORS_ALPHA[i % COLORS.length]),
                borderColor: catRevEntries.map((_, i) => COLORS[i % COLORS.length]),
                borderWidth: 1,
                borderRadius: 4,
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { x: { title: { display: true, text: 'Total Revenue ($)' } }, y: { grid: { display: false } } }
        }
    });

    // --- Purchase: Channel ---
    const channelCounts = countBy(data, 'Purchase_Channel');
    createChart('chart-channel', {
        type: 'bar',
        data: {
            labels: Object.keys(channelCounts),
            datasets: [{
                label: 'Count',
                data: Object.values(channelCounts),
                backgroundColor: ['#00d2ff88', '#ff6b6b88', '#feca5788'],
                borderColor: ['#00d2ff', '#ff6b6b', '#feca57'],
                borderWidth: 1,
                borderRadius: 6,
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true }, x: { grid: { display: false } } }
        }
    });

    // --- Purchase: Monthly Trends ---
    const monthGroups = groupBy(data, 'Purchase_Month');
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthOrders = months.map(m => (monthGroups[m] || []).length);
    const monthRevenue = months.map(m => (monthGroups[m] || []).reduce((s, d) => s + d.Purchase_Amount, 0));

    createChart('chart-monthly', {
        type: 'bar',
        data: {
            labels: monthLabels,
            datasets: [
                {
                    type: 'line',
                    label: 'Orders',
                    data: monthOrders,
                    borderColor: '#00d2ff',
                    backgroundColor: '#00d2ff33',
                    borderWidth: 3,
                    pointRadius: 5,
                    pointBackgroundColor: '#00d2ff',
                    tension: 0.3,
                    yAxisID: 'y',
                    fill: false,
                    order: 0,
                },
                {
                    type: 'bar',
                    label: 'Revenue ($)',
                    data: monthRevenue.map(v => Math.round(v)),
                    backgroundColor: '#7b2ff744',
                    borderColor: '#7b2ff7',
                    borderWidth: 1,
                    borderRadius: 4,
                    yAxisID: 'y1',
                    order: 1,
                }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } },
            scales: {
                x: { grid: { display: false } },
                y: { position: 'left', title: { display: true, text: 'Orders' }, beginAtZero: true },
                y1: { position: 'right', title: { display: true, text: 'Revenue ($)' }, beginAtZero: true, grid: { drawOnChartArea: false } },
            }
        }
    });

    // --- Satisfaction: by Category ---
    const topCats = Object.entries(catGroups)
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 10)
        .map(([cat]) => cat);
    const satByCat = topCats.map(cat => mean(catGroups[cat].map(d => d.Customer_Satisfaction)));

    createChart('chart-sat-category', {
        type: 'bar',
        data: {
            labels: topCats,
            datasets: [{
                label: 'Avg Satisfaction',
                data: satByCat.map(v => v.toFixed(2)),
                backgroundColor: topCats.map((_, i) => COLORS_ALPHA[i % COLORS.length]),
                borderColor: topCats.map((_, i) => COLORS[i % COLORS.length]),
                borderWidth: 1,
                borderRadius: 6,
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, ticks: { maxRotation: 45 } },
                y: { beginAtZero: true, max: 10, title: { display: true, text: 'Satisfaction Score' } }
            }
        }
    });

    // --- Satisfaction: by Income ---
    const incomeGroups = groupBy(data, 'Income_Level');
    createChart('chart-sat-income', {
        type: 'bar',
        data: {
            labels: incomeOrder.filter(k => incomeGroups[k]),
            datasets: [{
                label: 'Avg Satisfaction',
                data: incomeOrder.filter(k => incomeGroups[k]).map(k => mean(incomeGroups[k].map(d => d.Customer_Satisfaction)).toFixed(2)),
                backgroundColor: ['#7b2ff788', '#00d2ff88', '#ff6b6b88'],
                borderColor: ['#7b2ff7', '#00d2ff', '#ff6b6b'],
                borderWidth: 1,
                borderRadius: 6,
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, max: 10, title: { display: true, text: 'Satisfaction Score' } },
                x: { grid: { display: false } }
            }
        }
    });

    // --- Satisfaction: Rating vs Satisfaction Scatter ---
    const scatterData = data.slice(0, 300).map(d => ({
        x: d.Product_Rating + (Math.random() - 0.5) * 0.3,
        y: d.Customer_Satisfaction + (Math.random() - 0.5) * 0.3,
    }));

    createChart('chart-rating-satisfaction', {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Rating vs Satisfaction',
                data: scatterData,
                backgroundColor: '#00d2ff55',
                borderColor: '#00d2ff',
                borderWidth: 1,
                pointRadius: 4,
                pointHoverRadius: 7,
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { title: { display: true, text: 'Product Rating' }, min: 0, max: 6 },
                y: { title: { display: true, text: 'Customer Satisfaction' }, min: 0, max: 11 }
            }
        }
    });

    // --- Digital: Device ---
    const deviceCounts = countBy(data, 'Device_Used_for_Shopping');
    createChart('chart-device', {
        type: 'doughnut',
        data: {
            labels: Object.keys(deviceCounts),
            datasets: [{
                data: Object.values(deviceCounts),
                backgroundColor: COLORS.slice(0, Object.keys(deviceCounts).length),
                borderColor: 'transparent', borderWidth: 0, hoverOffset: 8,
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            cutout: '50%',
            plugins: { legend: { position: 'bottom' } }
        }
    });

    // --- Digital: Payment ---
    const paymentCounts = countBy(data, 'Payment_Method');
    createChart('chart-payment', {
        type: 'doughnut',
        data: {
            labels: Object.keys(paymentCounts),
            datasets: [{
                data: Object.values(paymentCounts),
                backgroundColor: COLORS.slice(3, 3 + Object.keys(paymentCounts).length),
                borderColor: 'transparent', borderWidth: 0, hoverOffset: 8,
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            cutout: '50%',
            plugins: { legend: { position: 'bottom' } }
        }
    });

    // --- Digital: Social Media ---
    const socialCounts = countBy(data, 'Social_Media_Influence');
    createChart('chart-social', {
        type: 'bar',
        data: {
            labels: Object.keys(socialCounts),
            datasets: [{
                label: 'Count',
                data: Object.values(socialCounts),
                backgroundColor: Object.keys(socialCounts).map((_, i) => COLORS_ALPHA[i]),
                borderColor: Object.keys(socialCounts).map((_, i) => COLORS[i]),
                borderWidth: 1, borderRadius: 6,
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true }, x: { grid: { display: false } } }
        }
    });

    // --- Digital: Ads ---
    const adsCounts = countBy(data, 'Engagement_with_Ads');
    createChart('chart-ads', {
        type: 'bar',
        data: {
            labels: Object.keys(adsCounts),
            datasets: [{
                label: 'Count',
                data: Object.values(adsCounts),
                backgroundColor: Object.keys(adsCounts).map((_, i) => COLORS_ALPHA[i + 3]),
                borderColor: Object.keys(adsCounts).map((_, i) => COLORS[i + 3]),
                borderWidth: 1, borderRadius: 6,
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true }, x: { grid: { display: false } } }
        }
    });

    // --- Loyalty: Member vs Non-Member ---
    const memberData = data.filter(d => d.Customer_Loyalty_Program_Member);
    const nonMemberData = data.filter(d => !d.Customer_Loyalty_Program_Member);
    createChart('chart-loyalty', {
        type: 'bar',
        data: {
            labels: ['Avg Purchase', 'Avg Satisfaction', 'Avg Frequency', 'Avg Brand Loyalty'],
            datasets: [
                {
                    label: 'Non-Member',
                    data: [
                        mean(nonMemberData.map(d => d.Purchase_Amount)).toFixed(0),
                        mean(nonMemberData.map(d => d.Customer_Satisfaction)).toFixed(1),
                        mean(nonMemberData.map(d => d.Frequency_of_Purchase)).toFixed(1),
                        mean(nonMemberData.map(d => d.Brand_Loyalty)).toFixed(1),
                    ],
                    backgroundColor: '#ff6b6b88',
                    borderColor: '#ff6b6b',
                    borderWidth: 1, borderRadius: 4,
                },
                {
                    label: 'Member',
                    data: [
                        mean(memberData.map(d => d.Purchase_Amount)).toFixed(0),
                        mean(memberData.map(d => d.Customer_Satisfaction)).toFixed(1),
                        mean(memberData.map(d => d.Frequency_of_Purchase)).toFixed(1),
                        mean(memberData.map(d => d.Brand_Loyalty)).toFixed(1),
                    ],
                    backgroundColor: '#00d2ff88',
                    borderColor: '#00d2ff',
                    borderWidth: 1, borderRadius: 4,
                },
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } },
            scales: { y: { beginAtZero: true }, x: { grid: { display: false } } }
        }
    });

    // --- Loyalty: Discount Sensitivity by Income ---
    const discSens = ['Not Sensitive', 'Somewhat Sensitive', 'Very Sensitive'];
    const discDatasets = incomeOrder.filter(k => incomeGroups[k]).map((income, idx) => {
        const incData = incomeGroups[income] || [];
        const discCounts = countBy(incData, 'Discount_Sensitivity');
        return {
            label: income,
            data: discSens.map(s => discCounts[s] || 0),
            backgroundColor: ['#7b2ff788', '#00d2ff88', '#ff6b6b88'][idx],
            borderColor: ['#7b2ff7', '#00d2ff', '#ff6b6b'][idx],
            borderWidth: 1, borderRadius: 4,
        };
    });

    createChart('chart-discount', {
        type: 'bar',
        data: { labels: discSens, datasets: discDatasets },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } },
            scales: { y: { beginAtZero: true }, x: { grid: { display: false } } }
        }
    });

    // --- Loyalty: Purchase Intent ---
    const intentCounts = countBy(data, 'Purchase_Intent');
    const genderGroups = groupBy(data, 'Gender');
    const intentTypes = Object.keys(intentCounts);
    const intentGenderDatasets = ['Male', 'Female'].map((g, idx) => {
        const gData = genderGroups[g] || [];
        const gIntentCounts = countBy(gData, 'Purchase_Intent');
        return {
            label: g,
            data: intentTypes.map(t => gIntentCounts[t] || 0),
            backgroundColor: ['#ff6b6b88', '#48dbfb88'][idx],
            borderColor: ['#ff6b6b', '#48dbfb'][idx],
            borderWidth: 1, borderRadius: 4,
        };
    });

    createChart('chart-intent', {
        type: 'bar',
        data: { labels: intentTypes, datasets: intentGenderDatasets },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } },
            scales: { y: { beginAtZero: true }, x: { grid: { display: false } } }
        }
    });

    // --- Loyalty: Time to Decision by Intent ---
    const intentGroups = groupBy(data, 'Purchase_Intent');
    createChart('chart-decision-time', {
        type: 'bar',
        data: {
            labels: intentTypes,
            datasets: [{
                label: 'Avg Decision Time (days)',
                data: intentTypes.map(t => mean((intentGroups[t] || []).map(d => d.Time_to_Decision)).toFixed(1)),
                backgroundColor: intentTypes.map((_, i) => COLORS_ALPHA[i]),
                borderColor: intentTypes.map((_, i) => COLORS[i]),
                borderWidth: 1, borderRadius: 6,
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Avg Days' } },
                x: { grid: { display: false } }
            }
        }
    });

    // --- Segments: Radar Chart ---
    const clusterProfiles = [
        { label: 'Cluster 0', data: [37.6, 274.96, 5.34, 1.87, 4.15, 4.15, 4.29, 1.20] },
        { label: 'Cluster 1', data: [29.1, 265.83, 6.01, 3.95, 3.18, 7.66, 3.63, 1.41] },
        { label: 'Cluster 2', data: [26.8, 391.26, 9.13, 2.39, 3.48, 5.32, 8.41, 0.31] },
        { label: 'Cluster 3', data: [34.7, 255.54, 8.43, 1.99, 2.32, 6.58, 10.96, 1.66] },
        { label: 'Cluster 4', data: [32.6, 151.79, 9.57, 4.01, 2.19, 4.97, 6.57, 0.37] },
        { label: 'Cluster 5', data: [39.9, 323.32, 8.73, 4.41, 3.25, 3.19, 9.07, 1.59] },
        { label: 'Cluster 6', data: [32.2, 210.57, 4.00, 3.55, 3.78, 4.10, 10.60, 0.76] },
        { label: 'Cluster 7', data: [41.6, 329.77, 5.19, 2.52, 1.93, 6.76, 6.96, 0.38] },
    ];

    const radarLabels = ['Age', 'Purchase Amt', 'Frequency', 'Brand Loyalty', 'Rating', 'Satisfaction', 'Decision Time', 'Return Rate'];

    // Normalize for radar
    const mins = radarLabels.map((_, i) => Math.min(...clusterProfiles.map(c => c.data[i])));
    const maxs = radarLabels.map((_, i) => Math.max(...clusterProfiles.map(c => c.data[i])));

    const radarDatasets = clusterProfiles.map((cluster, idx) => ({
        label: cluster.label,
        data: cluster.data.map((v, i) => ((v - mins[i]) / (maxs[i] - mins[i] + 0.001)).toFixed(2)),
        borderColor: COLORS[idx],
        backgroundColor: COLORS[idx] + '22',
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: COLORS[idx],
    }));

    createChart('chart-radar', {
        type: 'radar',
        data: { labels: radarLabels, datasets: radarDatasets },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'top', labels: { font: { size: 10 } } } },
            scales: {
                r: {
                    grid: { color: 'rgba(255,255,255,0.06)' },
                    angleLines: { color: 'rgba(255,255,255,0.06)' },
                    pointLabels: { font: { size: 10 }, color: '#a0a0c0' },
                    ticks: { display: false },
                    suggestedMin: 0, suggestedMax: 1,
                }
            }
        }
    });
}

// ==================== SCROLL REVEAL ====================
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, idx) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, idx * 80);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ==================== ACTIVE NAV TRACKING ====================
function initNavTracking() {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('data-section') === id);
                });
            }
        });
    }, { threshold: 0.3 });

    sections.forEach(section => observer.observe(section));
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', async () => {
    initScrollReveal();
    initNavTracking();

    try {
        const data = await loadData();
        renderDashboard(data);
    } catch (error) {
        console.error('Error loading data:', error);
    }
});
