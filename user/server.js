const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Add specific route for JSON files
app.get('/user/:city.json', (req, res) => {
    const city = req.params.city;
    const filePath = path.join(__dirname, `${city}.json`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return res.status(404).json({ error: `Data for ${city} not found` });
    }
    
    // Read and send the file
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading ${city}.json:`, err);
            return res.status(500).json({ error: 'Error reading city data' });
        }
        
        try {
            const jsonData = JSON.parse(data);
            res.json(jsonData);
        } catch (parseError) {
            console.error(`Error parsing ${city}.json:`, parseError);
            res.status(500).json({ error: 'Error parsing city data' });
        }
    });
});

// Helper function to run Python scripts
function runPythonScript(scriptPath, args = []) {
    return new Promise((resolve, reject) => {
        const fullPath = path.join(__dirname, scriptPath);
        console.log(`[${new Date().toISOString()}] Starting Python script: ${fullPath} with args:`, args);
        
        // Check if file exists
        if (!fs.existsSync(fullPath)) {
            console.error(`[${new Date().toISOString()}] Script file not found: ${fullPath}`);
            return reject(new Error(`Script file not found: ${scriptPath}`));
        }

        const pythonProcess = spawn('python', [fullPath, ...args]);
        let data = '';
        let error = '';
        let timeoutId;

        // Set a timeout of 30 seconds
        timeoutId = setTimeout(() => {
            console.log(`[${new Date().toISOString()}] Script execution timed out - killing process`);
            pythonProcess.kill();
            reject(new Error('Script execution timed out after 30 seconds'));
        }, 30000);

        pythonProcess.stdout.on('data', (chunk) => {
            const chunkStr = chunk.toString();
            console.log(`[${new Date().toISOString()}] Python stdout:`, chunkStr);
            data += chunkStr;
        });

        pythonProcess.stderr.on('data', (chunk) => {
            const chunkStr = chunk.toString();
            console.log(`[${new Date().toISOString()}] Python stderr:`, chunkStr);
            error += chunkStr;
        });

        pythonProcess.on('close', (code) => {
            console.log(`[${new Date().toISOString()}] Python process exited with code:`, code);
            clearTimeout(timeoutId);
            
            if (code !== 0) {
                console.error(`[${new Date().toISOString()}] Python script failed with error:`, error);
                return reject(new Error(`Python script failed: ${error || 'Unknown error'}`));
            }

            try {
                // Clean the output - remove any non-JSON text
                const cleanOutput = data.trim().split('\n').pop();
                console.log(`[${new Date().toISOString()}] Cleaned output:`, cleanOutput);
                
                if (!cleanOutput) {
                    throw new Error('No output received from Python script');
                }
                const jsonData = JSON.parse(cleanOutput);
                console.log(`[${new Date().toISOString()}] Successfully parsed JSON output`);
                resolve(jsonData);
            } catch (parseError) {
                console.error(`[${new Date().toISOString()}] Failed to parse Python output:`, parseError);
                console.error(`[${new Date().toISOString()}] Raw output:`, data);
                reject(new Error(`Failed to parse Python output: ${parseError.message}\nRaw output: ${data}`));
            }
        });

        pythonProcess.on('error', (err) => {
            console.error(`[${new Date().toISOString()}] Failed to start Python process:`, err);
            clearTimeout(timeoutId);
            reject(new Error(`Failed to start Python script: ${err.message}`));
        });
    });
}

// API Endpoints
app.get('/api/disaster-news', async (req, res) => {
    try {
        const data = await runPythonScript('disaster_news.py');
        res.json(data);
    } catch (error) {
        console.error('Error running disaster_news.py:', error);
        res.status(500).json({ 
            error: 'Failed to fetch disaster news',
            details: error.message 
        });
    }
});

app.post('/api/event-data', async (req, res) => {
    try {
        const { type } = req.body;
        if (!type) {
            return res.status(400).json({ 
                error: 'Event type is required',
                details: 'Please provide an event type'
            });
        }

        console.log('Running event_data_india.py with type:', type);
        const eventData = await runPythonScript('event_data_india.py', ['--type', type]);
        
        // Check if it's an error response
        if (eventData.error) {
            return res.status(500).json({
                error: 'Failed to process event data',
                details: eventData.error
            });
        }

        // Validate required fields
        if (!eventData.type || !eventData.severity || !eventData.affected_areas || !eventData.recommendations) {
            throw new Error('Invalid event data structure');
        }

        // Send the event data
        res.json(eventData);
    } catch (error) {
        console.error('Error running event_data_india.py:', error);
        res.status(500).json({ 
            error: 'Failed to process event data',
            details: error.message 
        });
    }
});

app.get('/api/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ 
                error: 'Search query is required',
                details: 'Please provide a search query'
            });
        }

        console.log('Running structured_disaster_data.py with query:', q);
        
        // Set a timeout for the entire request
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timed out')), 35000);
        });

        const searchPromise = runPythonScript('structured_disaster_data.py', ['--query', q]);
        
        // Race between the search and timeout
        const searchData = await Promise.race([searchPromise, timeoutPromise]);
        
        // Check if it's an error response
        if (searchData.error) {
            return res.status(500).json({
                error: 'Failed to perform search',
                details: searchData.error
            });
        }

        // Send the search results
        res.json(searchData);
    } catch (error) {
        console.error('Error running structured_disaster_data.py:', error);
        res.status(500).json({ 
            error: 'Failed to perform search',
            details: error.message 
        });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Serving static files from: ${path.join(__dirname)}`);
}); 