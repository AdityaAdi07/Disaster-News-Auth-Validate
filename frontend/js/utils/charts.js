/**
 * Charts Utility
 * Custom chart implementations using HTML5 Canvas
 */

// Chart configuration
const chartConfig = {
    colors: [
        '#3498db', // blue
        '#e74c3c', // red
        '#2ecc71', // green
        '#f39c12', // orange
        '#9b59b6', // purple
        '#1abc9c', // turquoise
        '#34495e', // dark blue
        '#e67e22', // dark orange
        '#95a5a6'  // gray
    ],
    padding: 40,
    animationDuration: 1000,
    fontSize: 12,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
};

/**
 * Create a pie chart
 * @param {string} canvasId - The ID of the canvas element
 * @param {Array} data - The data to display
 * @param {Object} options - Chart options
 */
function createPieChart(canvasId, data, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas element with ID "${canvasId}" not found`);
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas dimensions based on container
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    // Calculate total value
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    // Calculate center and radius
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - chartConfig.padding;
    
    // Draw pie slices
    let startAngle = 0;
    
    data.forEach((item, index) => {
        // Calculate slice angle
        const sliceAngle = (item.value / total) * 2 * Math.PI;
        
        // Draw slice
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        
        // Fill slice
        ctx.fillStyle = item.color || chartConfig.colors[index % chartConfig.colors.length];
        ctx.fill();
        
        // Draw slice border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Calculate label position
        const labelAngle = startAngle + (sliceAngle / 2);
        const labelRadius = radius * 0.7;
        const labelX = centerX + Math.cos(labelAngle) * labelRadius;
        const labelY = centerY + Math.sin(labelAngle) * labelRadius;
        
        // Draw label
        ctx.fillStyle = '#fff';
        ctx.font = `${chartConfig.fontSize}px ${chartConfig.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Only draw label if slice is big enough
        if (sliceAngle > 0.2) {
            ctx.fillText(item.label, labelX, labelY);
        }
        
        // Update start angle for next slice
        startAngle += sliceAngle;
    });
    
    // Draw legend
    drawLegend(ctx, data, canvas.width, canvas.height);
}

/**
 * Create a bar chart
 * @param {string} canvasId - The ID of the canvas element
 * @param {Array} data - The data to display
 * @param {Object} options - Chart options
 */
function createBarChart(canvasId, data, options = {}) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas element with ID "${canvasId}" not found`);
        return;
    }
    
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas dimensions based on container
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    // Chart dimensions
    const chartWidth = canvas.width - (chartConfig.padding * 2);
    const chartHeight = canvas.height - (chartConfig.padding * 2);
    const barSpacing = 10;
    const barWidth = (chartWidth / data.length) - barSpacing;
    
    // Find maximum value for scaling
    const maxValue = Math.max(...data.map(item => item.value));
    
    // Draw axes
    ctx.beginPath();
    ctx.moveTo(chartConfig.padding, chartConfig.padding);
    ctx.lineTo(chartConfig.padding, chartHeight + chartConfig.padding);
    ctx.lineTo(chartWidth + chartConfig.padding, chartHeight + chartConfig.padding);
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Draw bars
    data.forEach((item, index) => {
        // Calculate bar height
        const barHeight = (item.value / maxValue) * chartHeight;
        
        // Calculate bar position
        const barX = chartConfig.padding + (index * (barWidth + barSpacing));
        const barY = chartHeight + chartConfig.padding - barHeight;
        
        // Animate bar drawing
        const animatedHeight = barHeight;
        
        // Draw bar
        ctx.fillStyle = item.color || chartConfig.colors[index % chartConfig.colors.length];
        ctx.fillRect(barX, barY, barWidth, animatedHeight);
        
        // Draw value on top of bar
        ctx.fillStyle = '#333';
        ctx.font = `${chartConfig.fontSize}px ${chartConfig.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(item.value, barX + (barWidth / 2), barY - 5);
        
        // Draw label below bar
        ctx.fillStyle = '#333';
        ctx.font = `${chartConfig.fontSize}px ${chartConfig.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(truncateText(item.label, 10), barX + (barWidth / 2), chartHeight + chartConfig.padding + 5);
    });
    
    // Draw y-axis labels
    const yAxisSteps = 5;
    for (let i = 0; i <= yAxisSteps; i++) {
        const value = Math.round((maxValue / yAxisSteps) * i);
        const y = chartHeight + chartConfig.padding - ((i / yAxisSteps) * chartHeight);
        
        // Draw grid line
        ctx.beginPath();
        ctx.moveTo(chartConfig.padding, y);
        ctx.lineTo(chartWidth + chartConfig.padding, y);
        ctx.strokeStyle = '#eee';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw label
        ctx.fillStyle = '#666';
        ctx.font = `${chartConfig.fontSize}px ${chartConfig.fontFamily}`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(value, chartConfig.padding - 5, y);
    }
}

/**
 * Draw chart legend
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Array} data - The chart data
 * @param {number} width - The canvas width
 * @param {number} height - The canvas height
 */
function drawLegend(ctx, data, width, height) {
    const legendX = width - chartConfig.padding - 150;
    const legendY = chartConfig.padding;
    const itemHeight = 20;
    
    // Draw legend background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fillRect(legendX, legendY, 150, data.length * itemHeight + 10);
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.strokeRect(legendX, legendY, 150, data.length * itemHeight + 10);
    
    // Draw legend items
    data.forEach((item, index) => {
        const itemY = legendY + 10 + (index * itemHeight);
        
        // Draw color box
        ctx.fillStyle = item.color || chartConfig.colors[index % chartConfig.colors.length];
        ctx.fillRect(legendX + 10, itemY, 15, 15);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(legendX + 10, itemY, 15, 15);
        
        // Draw label
        ctx.fillStyle = '#333';
        ctx.font = `${chartConfig.fontSize}px ${chartConfig.fontFamily}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${item.label} (${item.value})`, legendX + 35, itemY + 7);
    });
}

/**
 * Update charts with new data
 * @param {Object} data - The analytics data
 */
function updateCharts(data) {
    // Update disaster types chart
    if (data.disasterTypes) {
        const disasterTypesData = Object.entries(data.disasterTypes).map(([label, value]) => ({ label, value }));
        createPieChart('disaster-types-chart', disasterTypesData);
    }
    
    // Update region disaster chart
    if (data.regionDisasters) {
        const regionDisastersData = Object.entries(data.regionDisasters).map(([label, value]) => ({ label, value }));
        createBarChart('region-disaster-chart', regionDisastersData);
    }
}

/**
 * Refresh all charts
 */
function refreshCharts() {
    // Get the canvas elements
    const pieCanvas = document.getElementById('disaster-types-chart');
    const barCanvas = document.getElementById('region-disaster-chart');
    
    // Resize charts if needed
    if (pieCanvas) {
        const pieContainer = pieCanvas.parentElement;
        pieCanvas.width = pieContainer.clientWidth;
        pieCanvas.height = pieContainer.clientHeight;
    }
    
    if (barCanvas) {
        const barContainer = barCanvas.parentElement;
        barCanvas.width = barContainer.clientWidth;
        barCanvas.height = barContainer.clientHeight;
    }
    
    // Redraw charts with current data
    // This will be called when the analytics tab is shown
}
