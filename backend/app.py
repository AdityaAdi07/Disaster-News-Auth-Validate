from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json
import os
import subprocess
from datetime import datetime
import sys

app = Flask(__name__,
    static_folder='../frontend',
    static_url_path=''
)
CORS(app)

# Add a route to serve files from the data directory
@app.route('/data/<path:filename>')
def serve_data_file(filename):
    # DATA_DIR is defined earlier and points to the root of the workspace
    # We need to serve from the 'data' sub-directory relative to the root
    data_directory_path = os.path.join(DATA_DIR, 'data')
    print(f"Attempting to serve file '{filename}' from directory: {data_directory_path}")
    return send_from_directory(data_directory_path, filename)

# Update DATA_DIR to point to root directory
DATA_DIR = os.path.dirname(os.path.dirname(__file__))

def read_json_file(filename):
    filepath = os.path.join(DATA_DIR, filename)
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def write_json_file(filename, data):
    filepath = os.path.join(DATA_DIR, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/admin')
def admin():
    return send_from_directory(app.static_folder, 'admin.html')

@app.route('/map')
def map():
    return send_from_directory(app.static_folder, 'map.html')

@app.route('/analytics')
def analytics():
    return send_from_directory(app.static_folder, 'analytics.html')

@app.route('/api/live-feed', methods=['POST'])
def live_feed():
    try:
        # In a real implementation, this would call disaster_news.py
        # For now, we'll just return the existing data
        data = read_json_file('disaster_news.json')
        return jsonify({'success': True, 'data': data})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/event-data', methods=['POST'])
def event_data():
    try:
        # In a real implementation, this would call event_data_india.py
        data = read_json_file('event_data_india.json')
        return jsonify({'success': True, 'data': data})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/verify', methods=['POST'])
def verify():
    try:
        title = request.json.get('title')
        if not title:
            return jsonify({'success': False, 'error': 'Title is required'}), 400

        # Get the directory where main.py is located
        script_dir = os.path.dirname(os.path.abspath(__file__))
        script_path = os.path.join(script_dir, 'structured_disaster_data.py')
        
        # Check if script exists
        if not os.path.exists(script_path):
            return jsonify({
                'success': False, 
                'error': f'Script not found at path: {script_path}'
            }), 500

        print(f"Running script: {script_path}")
        print(f"With title: {title}")
        print(f"Current directory: {script_dir}")

        # Run the script with the title as input
        result = subprocess.run(
            [sys.executable, script_path],  # Use sys.executable to get the correct Python path
            input=title,  # Pass title as string directly
            capture_output=True,
            text=True,  # This ensures input/output are handled as strings
            cwd=script_dir
        )
        
        print(f"Script stdout: {result.stdout}")
        print(f"Script stderr: {result.stderr}")
        print(f"Script return code: {result.returncode}")
        
        if result.returncode != 0:
            return jsonify({
                'success': False, 
                'error': f'Script error: {result.stderr}',
                'details': {
                    'return_code': result.returncode,
                    'stdout': result.stdout,
                    'stderr': result.stderr
                }
            }), 500

        # Parse the script output as JSON
        try:
            structured_data = json.loads(result.stdout)
            return jsonify({'success': True, 'data': structured_data})
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}")
            print(f"Raw output: {result.stdout}")
            return jsonify({
                'success': False, 
                'error': 'Invalid JSON output from script',
                'details': {
                    'stdout': result.stdout,
                    'error': str(e)
                }
            }), 500

    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(f"Error in verify endpoint: {error_details}")
        return jsonify({
            'success': False, 
            'error': str(e),
            'details': error_details
        }), 500

@app.route('/api/confirm-verification', methods=['POST'])
def confirm_verification():
    try:
        data = request.json
        if not data:
            return jsonify({'success': False, 'error': 'Data is required'}), 400

        verified_data = read_json_file('verified_disasters.json')
        verified_data.append({
            **data,
            'verified_at': datetime.now().isoformat()
        })
        write_json_file('verified_disasters.json', verified_data)
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000) 