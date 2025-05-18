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
 * Create a line chart
 * @param {string} canvasId - The ID of the canvas element
 * @param {Array} data - The data to display
 * @param {Object} options - Chart options
 */
function createLineChart(canvasId, data, options = {}) {
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
    
    // Default options
    const defaultOptions = {
        interactive: false,
        showLegend: true,
        showGrid: true,
        multiSeries: false,
        lineWidth: 2,
        pointRadius: 4,
        smoothing: 0.2
    };
    
    // Merge options
    const chartOptions = { ...defaultOptions, ...options };
    
    // Chart dimensions
    const chartWidth = canvas.width - (chartConfig.padding * 2);
    const chartHeight = canvas.height - (chartConfig.padding * 2);
    
    // Check if data is empty
    if (!data || data.length === 0) {
        // Draw empty chart message
        ctx.fillStyle = '#666';
        ctx.font = `${chartConfig.fontSize}px ${chartConfig.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('No data available', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    // Determine if data is multi-series
    const isMultiSeries = chartOptions.multiSeries && Array.isArray(data[0]?.values);
    
    // Process data
    let processedData = [];
    let labels = [];
    let maxValue = 0;
    
    if (isMultiSeries) {
        // Multi-series data format: [{name: 'Series1', values: [{x: 'Jan', y: 10}, ...]}, ...]
        processedData = data;
        
        // Extract labels from first series
        if (data[0]?.values) {
            labels = data[0].values.map(point => point.x);
        }
        
        // Find max value across all series
        data.forEach(series => {
            series.values.forEach(point => {
                maxValue = Math.max(maxValue, point.y);
            });
        });
    } else {
        // Single series data format: [{x: 'Jan', y: 10}, ...]
        processedData = [{
            name: 'Value',
            values: data
        }];
        
        // Extract labels
        labels = data.map(point => point.x);
        
        // Find max value
        data.forEach(point => {
            maxValue = Math.max(maxValue, point.y);
        });
    }
    
    // Add padding to max value
    maxValue = Math.ceil(maxValue * 1.1);
    
    // Draw grid
    if (chartOptions.showGrid) {
        // Draw horizontal grid lines
        const yAxisSteps = 5;
        for (let i = 0; i <= yAxisSteps; i++) {
            const y = chartHeight + chartConfig.padding - ((i / yAxisSteps) * chartHeight);
            
            // Draw grid line
            ctx.beginPath();
            ctx.moveTo(chartConfig.padding, y);
            ctx.lineTo(chartWidth + chartConfig.padding, y);
            ctx.strokeStyle = '#eee';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Draw label
            const value = Math.round((maxValue / yAxisSteps) * i);
            ctx.fillStyle = '#666';
            ctx.font = `${chartConfig.fontSize}px ${chartConfig.fontFamily}`;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText(value, chartConfig.padding - 5, y);
        }
        
        // Draw vertical grid lines
        const xStep = chartWidth / (labels.length - 1);
        labels.forEach((label, i) => {
            const x = chartConfig.padding + (i * xStep);
            
            // Draw grid line
            ctx.beginPath();
            ctx.moveTo(x, chartConfig.padding);
            ctx.lineTo(x, chartHeight + chartConfig.padding);
            ctx.strokeStyle = '#eee';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Draw label
            ctx.fillStyle = '#666';
            ctx.font = `${chartConfig.fontSize}px ${chartConfig.fontFamily}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(truncateText(label, 10), x, chartHeight + chartConfig.padding + 5);
        });
    }
    
    // Draw lines
    processedData.forEach((series, seriesIndex) => {
        const color = series.color || chartConfig.colors[seriesIndex % chartConfig.colors.length];
        const points = [];
        
        // Calculate points
        series.values.forEach((point, i) => {
            const x = chartConfig.padding + (i * (chartWidth / (series.values.length - 1)));
            const y = chartHeight + chartConfig.padding - ((point.y / maxValue) * chartHeight);
            points.push({ x, y });
        });
        
        // Draw line
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        
        // Draw curved line if more than 2 points
        if (points.length > 2 && chartOptions.smoothing > 0) {
            for (let i = 0; i < points.length - 1; i++) {
                const xc = (points[i].x + points[i + 1].x) / 2;
                const yc = (points[i].y + points[i + 1].y) / 2;
                ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
            }
            
            // Curve to the last point
            ctx.quadraticCurveTo(
                points[points.length - 2].x,
                points[points.length - 2].y,
                points[points.length - 1].x,
                points[points.length - 1].y
            );
        } else {
            // Draw straight lines
            for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
            }
        }
        
        // Style line
        ctx.strokeStyle = color;
        ctx.lineWidth = chartOptions.lineWidth;
        ctx.stroke();
        
        // Draw area under line
        if (chartOptions.fillArea) {
            ctx.lineTo(points[points.length - 1].x, chartHeight + chartConfig.padding);
            ctx.lineTo(points[0].x, chartHeight + chartConfig.padding);
            ctx.closePath();
            ctx.fillStyle = `${color}20`; // 20 = 12.5% opacity
            ctx.fill();
        }
        
        // Draw points
        points.forEach((point, i) => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, chartOptions.pointRadius, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            // Store point data for interactivity
            if (chartOptions.interactive) {
                const pointData = {
                    x: point.x,
                    y: point.y,
                    radius: chartOptions.pointRadius + 3, // Slightly larger for hit detection
                    value: series.values[i].y,
                    label: series.values[i].x,
                    seriesName: series.name,
                    color: color
                };
                
                // Store point data in canvas
                if (!canvas.chartPoints) {
                    canvas.chartPoints = [];
                }
                canvas.chartPoints.push(pointData);
            }
        });
    });
    
    // Draw legend
    if (chartOptions.showLegend && processedData.length > 1) {
        const legendData = processedData.map((series, index) => ({
            label: series.name,
            value: '',
            color: series.color || chartConfig.colors[index % chartConfig.colors.length]
        }));
        
        drawLegend(ctx, legendData, canvas.width, canvas.height);
    }
    
    // Add interactivity
    if (chartOptions.interactive) {
        // Add tooltip element if not exists
        let tooltip = document.querySelector('.chart-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.className = 'chart-tooltip';
            tooltip.style.position = 'absolute';
            tooltip.style.display = 'none';
            document.body.appendChild(tooltip);
        }
        
        // Mouse move event
        canvas.addEventListener('mousemove', (event) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;
            
            // Check if mouse is over a point
            let hoveredPoint = null;
            if (canvas.chartPoints) {
                for (const point of canvas.chartPoints) {
                    const distance = Math.sqrt(
                        Math.pow(mouseX - point.x, 2) + Math.pow(mouseY - point.y, 2)
                    );
                    
                    if (distance <= point.radius) {
                        hoveredPoint = point;
                        break;
                    }
                }
            }
            
            // Show/hide tooltip
            if (hoveredPoint) {
                tooltip.style.display = 'block';
                tooltip.style.left = `${event.pageX + 10}px`;
                tooltip.style.top = `${event.pageY + 10}px`;
                
                tooltip.innerHTML = `
                    <div class="chart-tooltip-title">${hoveredPoint.seriesName}</div>
                    <div class="chart-tooltip-value">
                        <span class="chart-tooltip-color" style="background-color: ${hoveredPoint.color}"></span>
                        <span>${hoveredPoint.label}: ${hoveredPoint.value}</span>
                    </div>
                `;
                
                // Highlight point
                ctx.beginPath();
                ctx.arc(hoveredPoint.x, hoveredPoint.y, hoveredPoint.radius + 2, 0, 2 * Math.PI);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fill();
            } else {
                tooltip.style.display = 'none';
            }
        });
        
        // Mouse leave event
        canvas.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });
    }
    
    return {
        update: (newData) => {
            createLineChart(canvasId, newData, options);
        }
    };
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
    
    // Update line chart
    if (data.lineChart) {
        createLineChart('line-chart', data.lineChart);
    }
}

/**
 * Refresh all charts
 */
function refreshCharts() {
    // Get the canvas elements
    const pieCanvas = document.getElementById('disaster-types-chart');
    const barCanvas = document.getElementById('region-disaster-chart');
    const lineCanvas = document.getElementById('line-chart');
    
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
    
    if (lineCanvas) {
        const lineContainer = lineCanvas.parentElement;
        lineCanvas.width = lineContainer.clientWidth;
        lineCanvas.height = lineContainer.clientHeight;
    }
    
    // Redraw charts with current data
    // This will be called when the analytics tab is shown
}

/**
 * Export analytics to PDF
 */
function exportAnalyticsToPdf() {
    // Check if html2pdf is loaded
    if (typeof html2pdf === 'undefined') {
        // Load html2pdf.js script if not already loaded
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
        script.onload = () => {
            // Call export function once script is loaded
            performPdfExport();
        };
        document.head.appendChild(script);
    } else {
        // Call export function directly
        performPdfExport();
    }
}

/**
 * Perform the actual PDF export
 */
function performPdfExport() {
    // Show loading toast
    showToast('Generating PDF report...', 'info');
    
    // Get analytics section
    const analyticsSection = document.getElementById('analytics');
    if (!analyticsSection) {
        showToast('Analytics section not found', 'error');
        return;
    }
    
    // Set print date
    const printDateSpan = document.getElementById('print-date');
    if (printDateSpan) {
        printDateSpan.textContent = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    // Add print class to body
    document.body.classList.add('printing');
    
    // Configure html2pdf options
    const options = {
        margin: 10,
        filename: `disaster-analytics-report-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // Generate PDF
    html2pdf().set(options).from(analyticsSection).save().then(() => {
        // Remove print class
        document.body.classList.remove('printing');
        
        // Show success toast
        showToast('PDF report generated successfully', 'success');
    }).catch(error => {
        console.error('Error generating PDF:', error);
        
        // Remove print class
        document.body.classList.remove('printing');
        
        // Show error toast
        showToast('Failed to generate PDF report', 'error');
    });
}

/**
 * Truncate text if too long
 * @param {string} text - The text to truncate
 * @param {number} maxLength - The maximum length
 * @returns {string} The truncated text
 */
function truncateText(text, maxLength) {
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength - 3) + '...';
}
