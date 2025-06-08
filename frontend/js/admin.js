document.addEventListener('DOMContentLoaded', function() {
    const loadReportsBtn = document.getElementById('loadReports');
    const reportsList = document.getElementById('reportsList');
    const verificationModal = new bootstrap.Modal(document.getElementById('verificationModal'));
    let currentReport = null;

    // Define a mapping of media outlets to icons
    const mediaOutletIcons = {
        'timesofindia.indiatimes.com': 'fas fa-newspaper', // Times of India
        'ndtv.com': 'fas fa-tv', // NDTV
        'youtube.com': 'fab fa-youtube', // YouTube
        'twitter.com': 'fab fa-twitter', // Twitter
        'facebook.com': 'fab fa-facebook', // Facebook
        'instagram.com': 'fab fa-instagram', // Instagram
        'thehindu.com': 'fas fa-newspaper', // The Hindu
        'indianexpress.com': 'fas fa-newspaper', // Indian Express
        'hindustantimes.com': 'fas fa-newspaper', // Hindustan Times
        'abplive.com': 'fas fa-tv', // ABP Live
        'zeenews.india.com': 'fas fa-tv', // Zee News
        'news18.com': 'fas fa-tv', // News18
        'india Today': 'fas fa-tv', // India Today (based on previous report title, though domain is better)
        'bbc.com': 'fas fa-newspaper', // BBC News
        'cnn.com': 'fas fa-newspaper', // CNN
        'reuters.com': 'fas fa-newspaper', // Reuters
        'apnews.com': 'fas fa-newspaper', // Associated Press
        'blog': 'fas fa-blog', // Generic blog icon (might need string checking)
        'gov.in': 'fas fa-landmark', // Indian Government websites
        // Add more mappings here
    };

    // Helper function to get the appropriate icon for a media outlet
    function getMediaIconClass(outletName) {
        if (!outletName) return 'fas fa-globe'; // Default icon if no outlet name
        // Check for specific matches
        for (const domain in mediaOutletIcons) {
            if (outletName.includes(domain)) {
                return mediaOutletIcons[domain];
            }
        }
        return 'fas fa-globe'; // Default icon if no specific match
    }

    // Load reports
    loadReportsBtn.addEventListener('click', async function() {
        try {
            loadReportsBtn.disabled = true;
            loadReportsBtn.textContent = 'Loading...';
            reportsList.classList.add('loading');

            const response = await fetch('/api/live-feed', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch reports');
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to load reports');
            }

            // Clear existing reports
            reportsList.innerHTML = '';

            // Render reports
            result.data.forEach(report => {
                const reportElement = createReportElement(report);
                reportsList.appendChild(reportElement);
            });

        } catch (error) {
            console.error('Error loading reports:', error);
            reportsList.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    Failed to load reports: ${error.message}
                </div>
            `;
        } finally {
            loadReportsBtn.disabled = false;
            loadReportsBtn.textContent = 'Load Reports';
            reportsList.classList.remove('loading');
        }
    });

    // Create report element
    function createReportElement(report) {
        const div = document.createElement('div');
        div.className = 'report-item card mb-3';
        
        // Format date
        const publishedDate = new Date(report.published);
        const formattedDate = publishedDate.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Store report data in a data attribute with proper escaping
        const reportData = encodeURIComponent(JSON.stringify(report));

        div.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h6 class="card-title">${report.title}</h6>
                        <p class="card-text text-muted mb-2">
                            <small>
                                <i class="fas fa-newspaper"></i> ${report.source} • 
                                <i class="fas fa-calendar"></i> ${formattedDate}
                            </small>
                        </p>
                        <span class="badge bg-secondary">${report.location}</span>
                    </div>
                    <button class="btn btn-primary btn-sm verify-btn" data-report="${reportData}">
                        <i class="fas fa-check"></i> Verify
                    </button>
                </div>
            </div>
        `;

        // Add verify button click handler
        div.querySelector('.verify-btn').addEventListener('click', function() {
            const reportData = JSON.parse(decodeURIComponent(this.dataset.report));
            openVerificationModal(reportData);
        });

        return div;
    }

    // Open verification modal
    async function openVerificationModal(report) {
        try {
            currentReport = report;
            
            // Show loading state
            const modal = document.getElementById('verificationModal');
            if (!modal) {
                throw new Error('Verification modal not found');
            }
            const modalContent = modal.querySelector('.modal-content');
            modalContent.classList.add('loading');
            
            // Fetch structured data from Python script
            const response = await fetch('/api/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title: report.title })
            });

            const result = await response.json();
            
            if (!response.ok || !result.success) {
                let errorMessage = result.error || 'Failed to fetch structured data';
                if (result.details) {
                    console.error('Error details:', result.details);
                    errorMessage += '\n\nDetails:\n' + JSON.stringify(result.details, null, 2);
                }
                throw new Error(errorMessage);
            }

            const structuredData = result.data;
            
            // Set modal content with structured data
            const reportTitle = document.querySelector('.report-title');
            if (reportTitle) {
                reportTitle.textContent = structuredData.Title || report.title;
            }

            const severitySelect = document.getElementById('severitySelect');
            if (severitySelect) {
                severitySelect.value = structuredData.severity || 'moderate';
            }

            const deathCount = document.getElementById('deathCount');
            if (deathCount) {
                deathCount.value = structuredData.death || '0';
            }
            
            // Generate random verification scores between 70 and 97
            const deepfakeScore = Math.floor(Math.random() * (97 - 70 + 1)) + 70;
            const llmScore = Math.floor(Math.random() * (97 - 70 + 1)) + 70;
            const scrapyScore = Math.floor(Math.random() * (97 - 70 + 1)) + 70;
            
            // Update verification scores
            const scoreCards = document.querySelectorAll('.score-card');
            if (scoreCards.length >= 3) {
                scoreCards[0].querySelector('.score-value h3').textContent = `${deepfakeScore}%`;
                scoreCards[1].querySelector('.score-value h3').textContent = `${llmScore}%`;
                scoreCards[2].querySelector('.score-value h3').textContent = `${scrapyScore}%`;
            }
            
            // Clear and populate media links
            const mediaLinks = document.getElementById('mediaLinks');
            if (mediaLinks) {
                mediaLinks.innerHTML = ''; // Clear existing links first

                // Add a few random placeholder media links
                const placeholderLinks = [
                    'https://timesofindia.indiatimes.com/city/bengaluru/bengaluru-rain-floods-roads-traffic-disruption/articleshow/91677395.cms',
                    'https://www.ndtv.com/bangalore-news/heavy-rain-in-bengaluru-leads-to-waterlogging-traffic-snarls-2987231',
                    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    'https://twitter.com/someuser/status/1234567890',
                    'https://www.thehindu.com/news/national/karnataka/bengaluru-rains-disrupt-life-in-tech-city/article65428946.ece'
                ];

                placeholderLinks.forEach(link => {
                    const linkItem = createMediaLinkElement(link);
                    mediaLinks.appendChild(linkItem);
                });
            }
            
            // Clear and populate image gallery
            const imageGallery = document.getElementById('imageGallery');
            if (imageGallery) {
                imageGallery.innerHTML = '';
                if (structuredData.image_urls && structuredData.image_urls.length > 0) {
                    structuredData.image_urls.forEach(url => {
                        const col = document.createElement('div');
                        col.className = 'col-md-4 mb-3';
                        col.innerHTML = `
                            <div class="card">
                                <div class="card-body p-2">
                                    <img src="${url}" class="img-fluid rounded" style="width: 100%; height: 200px; object-fit: cover;" alt="Disaster image">
                                    <input type="url" class="form-control mt-2" value="${url}" placeholder="Enter image URL">
                                </div>
                            </div>
                        `;
                        imageGallery.appendChild(col);
                    });
                }
            }

            // Show modal
            verificationModal.show();
            
        } catch (error) {
            console.error('Error opening verification modal:', error);
            // Show error in a more detailed way
            const errorMessage = error.message.split('\n').join('<br>');
            alert(`Failed to load structured data: ${errorMessage}`);
        } finally {
            // Remove loading state
            const modal = document.getElementById('verificationModal');
            if (modal) {
                const modalContent = modal.querySelector('.modal-content');
                if (modalContent) {
                    modalContent.classList.remove('loading');
                }
            }
        }
    }

    // Create media link element (for existing and new links)
    function createMediaLinkElement(url = '') {
        const linkItem = document.createElement('div');
        linkItem.className = 'col-md-6';

        const outletName = getMediaOutletName(url);
        const displayText = outletName || (url ? 'Unknown Outlet' : 'Enter Media URL'); // Text to show in display mode
        const iconClass = getMediaIconClass(outletName); // Get icon based on outlet name

        linkItem.innerHTML = `
            <div class="p-2 border rounded d-flex align-items-center">
                <div class="media-display d-flex flex-grow-1 align-items-center">
                    <span class="media-icon me-2"><i class="${iconClass}"></i></span> <!-- Dynamic icon -->
                    <span class="media-outlet-name text-muted small flex-grow-1">${displayText}</span> <!-- Extracted outlet name or placeholder -->
                </div>
                <div class="media-edit d-flex flex-grow-1 align-items-center d-none"> <!-- Initially hidden -->
                     <input type="url" class="form-control me-2" value="${url}" placeholder="Enter media URL">
                     <span class="media-outlet-name-edit text-muted small">${outletName || ''}</span> <!-- Display outlet name while editing -->
                </div>
                <button class="btn btn-sm btn-danger remove-link ms-auto"> <!-- Added ms-auto for alignment -->
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Add remove button handler
        linkItem.querySelector('.remove-link').addEventListener('click', function() {
            linkItem.remove();
        });

        // Toggle edit mode on click
        linkItem.querySelector('.media-display').addEventListener('click', function() {
            linkItem.querySelector('.media-display').classList.add('d-none');
            linkItem.querySelector('.media-edit').classList.remove('d-none');
            const urlInput = linkItem.querySelector('input[type="url"]');
            urlInput.focus();
            // Select the text in the input field for easier editing/replacement
            urlInput.select();
        });

         // Update outlet name on input change
        const urlInput = linkItem.querySelector('input[type="url"]');
        const outletNameEditSpan = linkItem.querySelector('.media-outlet-name-edit');
        const outletNameDisplaySpan = linkItem.querySelector('.media-outlet-name');
        urlInput.addEventListener('input', function() {
            const currentOutletName = getMediaOutletName(this.value);
            outletNameEditSpan.textContent = currentOutletName;
            // Update the hidden display version as well
            outletNameDisplaySpan.textContent = currentOutletName || (this.value ? 'Unknown Outlet' : 'Enter Media URL');
            // Update the icon in the display view
            linkItem.querySelector('.media-display .media-icon i').className = getMediaIconClass(currentOutletName);
        });

        // Auto-hide input when it loses focus
        urlInput.addEventListener('blur', function() {
             // Small delay to allow click on remove button before hiding
             setTimeout(() => {
                 const currentValue = this.value.trim();
                 const outletName = getMediaOutletName(currentValue);
                 outletNameDisplaySpan.textContent = outletName || (currentValue ? 'Unknown Outlet' : 'Enter Media URL');

                 // Always revert to display mode on blur
                 linkItem.querySelector('.media-display').classList.remove('d-none');
                 linkItem.querySelector('.media-edit').classList.add('d-none');
             }, 100);
        });

        return linkItem;
    }

    // Add media link
    document.getElementById('addMediaLink').addEventListener('click', function() {
        const mediaLinks = document.getElementById('mediaLinks');
        const linkItem = createMediaLinkElement(); // Create with empty URL
        mediaLinks.appendChild(linkItem);
        // Immediately switch to edit mode for the new link
        linkItem.querySelector('.media-display').click(); // Simulate click to toggle
    });

    // Helper function to extract media outlet name from URL
    function getMediaOutletName(url) {
        if (!url) return '';
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace('www.', '');
        } catch {
            return '';
        }
    }

    // Add image
    document.getElementById('addImage').addEventListener('click', function() {
        const imageGallery = document.getElementById('imageGallery');
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-3';
        col.innerHTML = `
            <div class="card">
                <div class="card-body p-2">
                    <div class="img-placeholder rounded" style="width: 100%; height: 200px; background: #f8f9fa; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-image text-muted"></i>
                    </div>
                    <input type="url" class="form-control mt-2" placeholder="Enter image URL">
                </div>
            </div>
        `;
        imageGallery.appendChild(col);
    });

    // Confirm verification
    document.getElementById('confirmVerification').addEventListener('click', async function() {
        try {
            if (!currentReport) return;

            // Collect verification data
            const verificationData = {
                title: currentReport.title,
                severity: document.getElementById('severitySelect').value,
                death: parseInt(document.getElementById('deathCount').value) || 0,
                media_links: Array.from(document.getElementById('mediaLinks').querySelectorAll('input'))
                    .map(input => input.value)
                    .filter(url => url.trim() !== ''),
                image_urls: Array.from(document.getElementById('imageGallery').querySelectorAll('input'))
                    .map(input => input.value)
                    .filter(url => url.trim() !== ''),
                notes: document.getElementById('verificationNotes').value,
                media_outlets: Array.from(document.getElementById('mediaLinks').querySelectorAll('input'))
                    .map(input => {
                        const url = input.value.trim();
                        if (!url) return '';
                        try {
                            const urlObj = new URL(url);
                            return urlObj.hostname.replace('www.', '');
                        } catch {
                            return '';
                        }
                    })
                    .filter(name => name !== '')
            };

            // Send verification data
            const response = await fetch('/api/confirm-verification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(verificationData)
            });

            if (!response.ok) {
                throw new Error('Failed to confirm verification');
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to confirm verification');
            }

            // Close modal and show success message
            verificationModal.hide();
            alert('Report verified successfully!');

            // Reload reports
            loadReportsBtn.click();

        } catch (error) {
            console.error('Error confirming verification:', error);
            alert('Failed to confirm verification: ' + error.message);
        }
    });

    // Discard report
    document.getElementById('discardReport').addEventListener('click', function() {
        if (confirm('Are you sure you want to discard this report?')) {
            verificationModal.hide();
            // Remove the report from the list
            const reportElement = document.querySelector(`[data-report='${JSON.stringify(currentReport)}']`).closest('.report-item');
            reportElement.remove();
        }
    });
}); 