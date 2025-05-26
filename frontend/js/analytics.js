document.addEventListener('DOMContentLoaded', function() {
    const generateAnalyticsBtn = document.getElementById('generateAnalytics');
    let charts = {};

    // Set global Chart.js defaults for styling
    Chart.defaults.font.family = 'Arial, sans-serif'; // Example font, match dashboard image if possible
    Chart.defaults.color = '#333'; // Default text color
    Chart.defaults.borderColor = '#ddd'; // Default border color

    // Chart configurations
    const chartConfigs = {
        eventsByCity: {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Number of Events', // Updated label for clarity
                    data: [],
                    // Using a single brand color with transparency, similar to bar chart in image
                    backgroundColor: 'rgba(0, 123, 255, 0.8)', // Example blue color
                    borderColor: 'rgba(0, 123, 255, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Allow control over aspect ratio if needed via CSS
                plugins: {
                    title: {
                        display: true,
                        text: 'Disaster Events by City',
                        font: { size: 16 }
                    },
                     legend: { // Configure legend
                        display: false // Hide legend if data series is obvious
                     },
                    tooltip: { // Configure tooltips
                         backgroundColor: 'rgba(0, 0, 0, 0.7)',
                         bodyColor: '#fff',
                         titleColor: '#fff'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Events',
                            font: { size: 12 }
                        },
                        grid: { // Configure grid lines
                            color: '#eee' // Lighter grid lines
                        }
                    },
                     x: {
                         grid: { // Configure grid lines
                             display: false // Hide x-axis grid lines
                         }
                     }
                } // Animation options are handled in initializeCharts
            }
        },
        severityDistribution: {
            type: 'doughnut', // Changed to doughnut as it's closer to image
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    // Using a color palette similar to the donut chart in the image
                    backgroundColor: [
                        '#6610f2', // Purple
                        '#007bff', // Blue
                        '#ffc107', // Yellow
                        '#28a745', // Green
                        '#dc3545'  // Red
                    ],
                    borderColor: '#fff', // White border for segments
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                 maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Severity Distribution',
                        font: { size: 16 }
                    },
                     legend: {
                         display: true, // Show legend
                         position: 'right', // Position legend to the right
                         labels: {
                             usePointStyle: true // Use circular markers in legend
                         }
                     },
                     tooltip: {
                         backgroundColor: 'rgba(0, 0, 0, 0.7)',
                         bodyColor: '#fff',
                         titleColor: '#fff'
                     }
                },
                 cutout: '80%' // Make it a donut chart with a hole
                 // Animation options handled in initializeCharts
            }
        },
        newspaperDistribution: {
            type: 'bar',
            data: {
                labels: ['Times of India', 'India Today', 'Hindustan Times', 'The Hindu', 'NDTV', 'BBC', 'Others'],
                datasets: [{
                    label: 'Number of Reports',
                    data: [12, 8, 6, 5, 4, 3, 7],
                    backgroundColor: [
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(255, 206, 86, 0.8)',
                        'rgba(153, 102, 255, 0.8)',
                        'rgba(255, 159, 64, 0.8)',
                        'rgba(199, 199, 199, 0.8)'
                    ],
                    borderColor: [
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 99, 132, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(199, 199, 199, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Distribution of News Sources',
                        font: { size: 16 }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        bodyColor: '#fff',
                        titleColor: '#fff'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Reports',
                            font: { size: 12 }
                        },
                        grid: {
                            color: '#eee'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'News Sources',
                            font: { size: 12 }
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        },
        deathsOverTime: {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Number of Deaths', // Updated label
                    data: [],
                    fill: true, // Fill area below the line
                    backgroundColor: 'rgba(0, 123, 255, 0.3)', // Area fill color
                    borderColor: 'rgba(0, 123, 255, 1)', // Line color
                    tension: 0.3, // Smoother line tension
                     pointRadius: 3, // Smaller points
                     pointBackgroundColor: '#fff' // White points
                }]
            },
            options: {
                responsive: true,
                 maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Deaths Over Time',
                        font: { size: 16 }
                    },
                    legend: {
                        display: false // Hide legend for single line
                    },
                     tooltip: {
                         backgroundColor: 'rgba(0, 0, 0, 0.7)',
                         bodyColor: '#fff',
                         titleColor: '#fff',
                         mode: 'index', // Show tooltip for all points on the same x-axis
                         intersect: false
                     }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Deaths',
                            font: { size: 12 }
                        },
                         grid: {
                            color: '#eee'
                        }
                    },
                    x: {
                         title: {
                             display: true,
                             text: 'Date' // Assuming labels will be dates
                         },
                         grid: {
                             color: '#eee'
                         }
                    }
                }
                 // Animation options handled in initializeCharts
            }
        },
        disasterTypes: {
            type: 'pie',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#fd7e14',
                        '#6f42c1',
                        '#20c997',
                        '#dc3545',
                        '#007bff'
                    ],
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Disaster Types Distribution',
                        font: { size: 16 }
                    },
                    legend: {
                        display: true,
                        position: 'right',
                        labels: {
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        bodyColor: '#fff',
                        titleColor: '#fff'
                    }
                }
            }
        }
    };

    // Initialize charts
    function initializeCharts() {
        Object.keys(chartConfigs).forEach(chartId => {
            const canvas = document.getElementById(chartId);
            if (canvas) {
                // Add default animation options
                if (!chartConfigs[chartId].options.animation) {
                     chartConfigs[chartId].options.animation = {
                         duration: 1000, // Animation duration in milliseconds
                         easing: 'easeInOutQuad' // Easing function
                     };
                 }
                // Add animation for specific chart types if needed for visual effect
                 if (chartConfigs[chartId].type === 'bar') {
                      chartConfigs[chartId].options.animation.y = { // Animate bars from bottom
                           duration: 1000,
                           easing: 'easeInOutQuad',
                           from: 500 // Starting point for animation
                      };
                 } else if (chartConfigs[chartId].type === 'doughnut' || chartConfigs[chartId].type === 'pie') {
                     chartConfigs[chartId].options.animation.animateScale = true;
                     chartConfigs[chartId].options.animation.animateRotate = true;
                 } else if (chartConfigs[chartId].type === 'line') {
                      chartConfigs[chartId].options.animation.drawoverTime = true; // Animate line drawing
                      // Further line animation configuration might be needed depending on Chart.js version
                 }

                // Destroy previous chart instance if it exists before creating a new one
                 if (charts[chartId]) {
                     charts[chartId].destroy();
                 }

                charts[chartId] = new Chart(canvas, chartConfigs[chartId]);
            }
        });
    }

    // Update charts with new data
    function updateCharts(data) {
        console.log(`Updating charts with ${data.length} data items.`); // Log data length
        // Process data for each chart
        const cityCounts = {};
        const severityCounts = {};
        const disasterTypeCounts = {};
        let totalDeaths = 0;
        let mostAffectedCity = { name: '', count: 0 };

        data.forEach(item => {
            // City counts
            if (item.city) {
                cityCounts[item.city] = (cityCounts[item.city] || 0) + 1;
                if (cityCounts[item.city] > mostAffectedCity.count) {
                    mostAffectedCity = { name: item.city, count: cityCounts[item.city] };
                }
            }

            // Severity counts
            if (item.severity) {
                severityCounts[item.severity] = (severityCounts[item.severity] || 0) + 1;
            }

            // Disaster type counts
            if (item.event) {
                disasterTypeCounts[item.event] = (disasterTypeCounts[item.event] || 0) + 1;
            }

            // Death count
            if (item.death) {
                totalDeaths += item.death;
            }
        });

        console.log('Processed cityCounts:', cityCounts);
        console.log('Processed severityCounts:', severityCounts);
        console.log('Processed disasterTypeCounts:', disasterTypeCounts);
        console.log('Calculated totalDeaths:', totalDeaths);
        console.log('Calculated mostAffectedCity:', mostAffectedCity);

        // Update number cards
        document.getElementById('totalDisasters').textContent = data.length;
        document.getElementById('totalDeaths').textContent = totalDeaths;
        document.getElementById('mostAffectedCity').textContent = mostAffectedCity.name || '-';
        document.getElementById('activeEvents').textContent = Object.keys(cityCounts).length;

        // Update charts
        if (charts.eventsByCity) {
            // Sort cities by event count in descending order
            const sortedCities = Object.keys(cityCounts).sort((a, b) => cityCounts[b] - cityCounts[a]);
            const sortedCounts = sortedCities.map(city => cityCounts[city]);

            charts.eventsByCity.data.labels = sortedCities;
            charts.eventsByCity.data.datasets[0].data = sortedCounts;
            charts.eventsByCity.update();
            console.log('Updated eventsByCity chart (sorted).');
        }

        if (charts.severityDistribution) {
            charts.severityDistribution.data.labels = Object.keys(severityCounts);
            charts.severityDistribution.data.datasets[0].data = Object.values(severityCounts);
            charts.severityDistribution.update();
            console.log('Updated severityDistribution chart.');
        }

        if (charts.disasterTypes) {
            charts.disasterTypes.data.labels = Object.keys(disasterTypeCounts);
            charts.disasterTypes.data.datasets[0].data = Object.values(disasterTypeCounts);
            charts.disasterTypes.update();
            console.log('Updated disasterTypes chart.');
        }

         // The deathsOverTime chart requires date processing, which is not currently fully implemented
         // based on event_data_india.json structure which lacks a date field for each event.
         // To make this chart functional, the backend /api/event-data would need to provide date info, or
         // we would need to infer it or use another data source.
         console.warn('Deaths Over Time chart not fully implemented due to missing date data in event_data_india.json structure.');
         if (charts.deathsOverTime) {
             charts.deathsOverTime.update(); // Update to show initial state or no data
             console.log('Updated deathsOverTime chart (placeholder).');
         }
    }

    // Initialize charts on load
    initializeCharts();

    // Automatically generate analytics when the page loads
    if (generateAnalyticsBtn) {
         console.log('Attempting to auto-generate analytics on page load.'); // Log auto-trigger attempt
         // Instead of clicking the button, directly trigger the data load function
        loadAnalyticsData();
    }

    // Function to load analytics data
    async function loadAnalyticsData() {
         try {
                console.log('Loading analytics data from JSON file.'); // Log data loading attempt

                // Fetch data directly from the JSON file
                const response = await fetch('/data/event_data_india.json');

                if (!response.ok) {
                    console.error('Failed to fetch event data from JSON. Response not OK.', response.status, response.statusText); // Log fetch error
                    throw new Error('Failed to fetch event data from JSON');
                }

                const data = await response.json();
                
                console.log('Analytics data received from JSON:', data); // Log received data

                // Assuming the JSON structure is a direct array of events
                updateCharts(data);
                console.log('updateCharts function called with data from JSON.'); // Log updateCharts call

            } catch (error) {
                console.error('Error loading analytics data from JSON:', error); // Log error
                alert('Failed to load analytics data: ' + error.message);
            } finally {
                // Re-enable button if needed, or remove if auto-loading is the only method
                // generateAnalyticsBtn.disabled = false;
                // generateAnalyticsBtn.textContent = 'Generate Analytics';
            }
    }

    // Handle generate analytics button click - modified to call the new load function
    if (generateAnalyticsBtn) {
        generateAnalyticsBtn.addEventListener('click', function() {
            // Simply call the load function on button click
            loadAnalyticsData();
        });
         // Optionally hide the button if auto-loading is preferred
         // generateAnalyticsBtn.style.display = 'none';
    }
}); 