// Summary and Alerts Management
document.addEventListener('DOMContentLoaded', function() {
    const generateSummaryBtn = document.getElementById('generateSummary');
    const markAllReadBtn = document.getElementById('markAllRead');
    const clearAlertsBtn = document.getElementById('clearAlerts');
    const alertsContainer = document.getElementById('notificationAlerts');

    // Generate Summary
    generateSummaryBtn.addEventListener('click', async function() {
        this.classList.add('loading');
        // Simulate API call
        setTimeout(async () => {
            await updateSummary();
            await generatePDFReport();
            this.classList.remove('loading');
        }, 1000);
    });

    // Mark All Alerts as Read
    markAllReadBtn.addEventListener('click', function() {
        const unreadAlerts = document.querySelectorAll('.alert-item.unread');
        unreadAlerts.forEach(alert => {
            alert.classList.remove('unread');
        });
    });

    // Clear All Alerts
    clearAlertsBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear all alerts?')) {
            alertsContainer.innerHTML = '';
        }
    });

    // Mark Single Alert as Read
    document.addEventListener('click', function(e) {
        if (e.target.closest('.mark-read')) {
            const alertItem = e.target.closest('.alert-item');
            alertItem.classList.remove('unread');
        }
    });

    // Update Summary Content
    async function updateSummary() {
        // Event Distribution
        const eventDistribution = document.getElementById('eventDistribution');
        eventDistribution.innerHTML = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Event Type</th>
                            <th>Count</th>
                            <th>Percentage</th>
                            <th>Trend</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><i class="fas fa-water text-primary"></i> Floods</td>
                            <td>45</td>
                            <td>45%</td>
                            <td><span class="trend-up"><i class="fas fa-arrow-up"></i> 12%</span></td>
                        </tr>
                        <tr>
                            <td><i class="fas fa-house-crack text-danger"></i> Earthquakes</td>
                            <td>25</td>
                            <td>25%</td>
                            <td><span class="trend-down"><i class="fas fa-arrow-down"></i> 5%</span></td>
                        </tr>
                        <tr>
                            <td><i class="fas fa-hurricane text-warning"></i> Cyclones</td>
                            <td>20</td>
                            <td>20%</td>
                            <td><span class="trend-up"><i class="fas fa-arrow-up"></i> 8%</span></td>
                        </tr>
                        <tr>
                            <td><i class="fas fa-ellipsis text-secondary"></i> Others</td>
                            <td>10</td>
                            <td>10%</td>
                            <td><span class="trend-neutral"><i class="fas fa-minus"></i> 0%</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;

        // Affected Regions
        const affectedRegions = document.getElementById('affectedRegions');
        affectedRegions.innerHTML = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Region</th>
                            <th>Events</th>
                            <th>Population Affected</th>
                            <th>Risk Level</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><i class="fas fa-map-marker-alt text-danger"></i> Mumbai</td>
                            <td>12</td>
                            <td>2.5M</td>
                            <td><span class="badge bg-danger">High</span></td>
                        </tr>
                        <tr>
                            <td><i class="fas fa-map-marker-alt text-warning"></i> Delhi</td>
                            <td>8</td>
                            <td>1.8M</td>
                            <td><span class="badge bg-warning">Medium</span></td>
                        </tr>
                        <tr>
                            <td><i class="fas fa-map-marker-alt text-info"></i> Chennai</td>
                            <td>6</td>
                            <td>1.2M</td>
                            <td><span class="badge bg-info">Low</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;

        // Severity Overview
        const severityOverview = document.getElementById('severityOverview');
        severityOverview.innerHTML = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Risk Level</th>
                            <th>Events</th>
                            <th>Affected Areas</th>
                            <th>Response Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><span class="badge bg-danger">High Risk</span></td>
                            <td>5</td>
                            <td>8</td>
                            <td><i class="fas fa-clock text-danger"></i> 2-4 hours</td>
                        </tr>
                        <tr>
                            <td><span class="badge bg-warning">Medium Risk</span></td>
                            <td>8</td>
                            <td>12</td>
                            <td><i class="fas fa-clock text-warning"></i> 4-8 hours</td>
                        </tr>
                        <tr>
                            <td><span class="badge bg-success">Low Risk</span></td>
                            <td>12</td>
                            <td>15</td>
                            <td><i class="fas fa-clock text-success"></i> 8-12 hours</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    // Generate PDF Report
    async function generatePDFReport() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        let yOffset = 20;

        // Add title with styling
        doc.setFontSize(24);
        doc.setTextColor(59, 130, 246); // Primary blue color
        doc.text('Disaster Intelligence Report', pageWidth / 2, yOffset, { align: 'center' });
        yOffset += 15;

        // Add subtitle
        doc.setFontSize(12);
        doc.setTextColor(100, 116, 139); // Secondary text color
        const currentDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        doc.text(`Generated on: ${currentDate}`, pageWidth / 2, yOffset, { align: 'center' });
        yOffset += 20;

        // Add executive summary
        doc.setFontSize(14);
        doc.setTextColor(30, 41, 59); // Dark text color
        doc.text('Executive Summary', margin, yOffset);
        yOffset += 10;
        doc.setFontSize(10);
        doc.text('This report provides a comprehensive overview of current disaster situations, affected regions, and risk assessments.', margin, yOffset, { maxWidth: pageWidth - (margin * 2) });
        yOffset += 20;

        // Add summary sections with improved styling
        const sections = [
            { title: 'Event Distribution', id: 'eventDistribution' },
            { title: 'Affected Regions', id: 'affectedRegions' },
            { title: 'Severity Overview', id: 'severityOverview' }
        ];

        for (const section of sections) {
            if (yOffset > doc.internal.pageSize.getHeight() - 40) {
                doc.addPage();
                yOffset = 20;
            }

            // Section header
            doc.setFontSize(16);
            doc.setTextColor(59, 130, 246);
            doc.text(section.title, margin, yOffset);
            yOffset += 10;

            // Section content
            const sectionElement = document.getElementById(section.id);
            const sectionCanvas = await html2canvas(sectionElement, {
                scale: 2, // Higher quality
                backgroundColor: '#ffffff'
            });
            const sectionImg = sectionCanvas.toDataURL('image/png');
            
            // Calculate aspect ratio to maintain proportions
            const imgWidth = pageWidth - (margin * 2);
            const imgHeight = (sectionCanvas.height * imgWidth) / sectionCanvas.width;
            
            doc.addImage(sectionImg, 'PNG', margin, yOffset, imgWidth, imgHeight);
            yOffset += imgHeight + 20;
        }

        // Add analytics charts with improved styling
        if (yOffset > doc.internal.pageSize.getHeight() - 40) {
            doc.addPage();
            yOffset = 20;
        }

        doc.setFontSize(16);
        doc.setTextColor(59, 130, 246);
        doc.text('Analytics Overview', margin, yOffset);
        yOffset += 15;

        const charts = document.querySelectorAll('canvas');
        for (const chart of charts) {
            if (yOffset > doc.internal.pageSize.getHeight() - 40) {
                doc.addPage();
                yOffset = 20;
            }

            const chartCanvas = await html2canvas(chart, {
                scale: 2, // Higher quality
                backgroundColor: '#ffffff'
            });
            const chartImg = chartCanvas.toDataURL('image/png');
            
            // Calculate aspect ratio to maintain proportions
            const imgWidth = pageWidth - (margin * 2);
            const imgHeight = (chartCanvas.height * imgWidth) / chartCanvas.width;
            
            doc.addImage(chartImg, 'PNG', margin, yOffset, imgWidth, imgHeight);
            yOffset += imgHeight + 20;
        }

        // Add footer with improved styling
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setTextColor(100, 116, 139);
            
            // Add page number
            doc.text(
                `Page ${i} of ${totalPages}`,
                pageWidth / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
            
            // Add footer line
            doc.setDrawColor(226, 232, 240);
            doc.line(
                margin,
                doc.internal.pageSize.getHeight() - 15,
                pageWidth - margin,
                doc.internal.pageSize.getHeight() - 15
            );
        }

        // Save the PDF
        doc.save('disaster-intelligence-report.pdf');
    }

    // Add New Alert
    function addNewAlert(title, message, severity = 'high') {
        const alertItem = document.createElement('div');
        alertItem.className = `alert-item unread`;
        alertItem.innerHTML = `
            <div class="alert-icon">
                <i class="fas fa-bell"></i>
            </div>
            <div class="alert-content">
                <div class="alert-title">${title}</div>
                <div class="alert-message">${message}</div>
                <div class="alert-meta">
                    <span class="alert-time">Just now</span>
                    <span class="alert-severity ${severity}">${severity.charAt(0).toUpperCase() + severity.slice(1)} Priority</span>
                </div>
            </div>
            <div class="alert-actions">
                <button class="btn btn-link btn-sm mark-read">
                    <i class="fas fa-check"></i>
                </button>
            </div>
        `;
        alertsContainer.insertBefore(alertItem, alertsContainer.firstChild);
    }

    // Simulate new alerts (for demonstration)
    setInterval(() => {
        const alerts = [
            {
                title: 'New Disaster Reported',
                message: 'Heavy rainfall warning for coastal regions',
                severity: 'high'
            },
            {
                title: 'Update Available',
                message: 'New data points added to the map',
                severity: 'medium'
            },
            {
                title: 'System Status',
                message: 'All systems operating normally',
                severity: 'low'
            }
        ];
        const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
        addNewAlert(randomAlert.title, randomAlert.message, randomAlert.severity);
    }, 30000); // Add new alert every 30 seconds
}); 