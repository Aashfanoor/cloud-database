// Main worker entry point
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Serve HTML page for root path
    if (path === "/" || path === "/index.html") {
      return new Response(getHTML(), {
        headers: { "Content-Type": "text/html" }
      });
    }
    
    // Handle API endpoints - forward to Durable Object
    if (path === "/add" || path === "/list") {
      try {
        // Get or create Durable Object instance
        const id = env.MY_DATABASE.idFromName("global");
        const stub = env.MY_DATABASE.get(id);
        
        // Forward the request to Durable Object
        return await stub.fetch(request);
      } catch (error) {
        console.error("Durable Object error:", error);
        return new Response(
          JSON.stringify({ 
            error: "Database error", 
            details: error.message 
          }),
          { 
            status: 500, 
            headers: { "Content-Type": "application/json" } 
          }
        );
      }
    }
    
    // 404 for any other routes
    return new Response("Not found", { status: 404 });
  }
}

// Durable Object Class for persistent storage
export class MyDatabase {
  constructor(state, env) {
    this.storage = state.storage;
  }
  
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // Handle POST /add - Add new record
    if (path === "/add" && request.method === "POST") {
      try {
        const { name, email } = await request.json();
        
        // Validate input
        if (!name || !email) {
          return new Response(
            JSON.stringify({ error: "Name and email are required" }),
            { 
              status: 400, 
              headers: { "Content-Type": "application/json" } 
            }
          );
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return new Response(
            JSON.stringify({ error: "Invalid email format" }),
            { 
              status: 400, 
              headers: { "Content-Type": "application/json" } 
            }
          );
        }
        
        // Create record with timestamp
        const timestamp = new Date().toISOString();
        const recordId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const record = {
          id: recordId,
          name: name,
          email: email,
          timestamp: timestamp
        };
        
        // Store the record
        await this.storage.put(recordId, record);
        
        // Update the list of all record IDs
        const allIds = await this.storage.get("all_ids") || [];
        allIds.push(recordId);
        await this.storage.put("all_ids", allIds);
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Record added successfully",
            record: record 
          }),
          { 
            status: 200, 
            headers: { "Content-Type": "application/json" } 
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            status: 500, 
            headers: { "Content-Type": "application/json" } 
          }
        );
      }
    }
    
    // Handle GET /list - Get all records
    if (path === "/list" && request.method === "GET") {
      try {
        const allIds = await this.storage.get("all_ids") || [];
        const records = [];
        
        // Fetch each record
        for (const id of allIds) {
          const record = await this.storage.get(id);
          if (record) {
            records.push(record);
          }
        }
        
        // Return records in reverse order (newest first)
        records.reverse();
        
        return new Response(
          JSON.stringify(records),
          { 
            status: 200, 
            headers: { "Content-Type": "application/json" } 
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ error: error.message, records: [] }),
          { 
            status: 500, 
            headers: { "Content-Type": "application/json" } 
          }
        );
      }
    }
    
    return new Response("Not found", { status: 404 });
  }
}

// HTML Page with form and records display
function getHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cloudflare Durable Objects Database</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 20px;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      animation: slideIn 0.5s ease-out;
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    h1 {
      color: #333;
      margin-bottom: 10px;
      font-size: 28px;
    }
    
    h2 {
      color: #555;
      margin: 30px 0 15px 0;
      font-size: 22px;
      border-bottom: 2px solid #667eea;
      padding-bottom: 10px;
    }
    
    .subtitle {
      color: #666;
      margin-bottom: 30px;
      font-size: 14px;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    label {
      display: block;
      margin-bottom: 8px;
      color: #333;
      font-weight: 500;
    }
    
    input {
      width: 100%;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      font-size: 16px;
      transition: all 0.3s;
    }
    
    input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    button {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
    }
    
    button:active {
      transform: translateY(0);
    }
    
    .button-group {
      display: flex;
      gap: 10px;
      margin-top: 10px;
    }
    
    .button-group button {
      flex: 1;
    }
    
    .refresh-btn {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    }
    
    .refresh-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 20px rgba(40, 167, 69, 0.4);
    }
    
    .message {
      margin-top: 20px;
      padding: 12px;
      border-radius: 10px;
      display: none;
      animation: fadeIn 0.3s;
    }
    
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .message.success {
      background: #d4edda;
      color: #155724;
      display: block;
      border: 1px solid #c3e6cb;
    }
    
    .message.error {
      background: #f8d7da;
      color: #721c24;
      display: block;
      border: 1px solid #f5c6cb;
    }
    
    .loading {
      display: none;
      text-align: center;
      margin-top: 20px;
    }
    
    .spinner {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #667eea;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .records-container {
      margin-top: 20px;
      max-height: 500px;
      overflow-y: auto;
    }
    
    .record-item {
      background: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 8px;
      transition: transform 0.2s, box-shadow 0.2s;
      animation: slideInRecord 0.3s ease-out;
    }
    
    @keyframes slideInRecord {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    .record-item:hover {
      transform: translateX(5px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      background: #fff;
    }
    
    .record-name {
      font-weight: bold;
      color: #667eea;
      font-size: 16px;
      margin-bottom: 5px;
    }
    
    .record-email {
      color: #666;
      font-size: 14px;
      margin-bottom: 5px;
      word-break: break-all;
    }
    
    .record-time {
      color: #999;
      font-size: 12px;
      margin-top: 5px;
    }
    
    .empty-state {
      text-align: center;
      padding: 40px;
      color: #999;
      background: #f8f9fa;
      border-radius: 10px;
    }
    
    .stats {
      background: linear-gradient(135deg, #e7f3ff 0%, #d4e6f1 100%);
      padding: 12px;
      border-radius: 10px;
      margin: 20px 0;
      text-align: center;
      color: #0066cc;
      font-weight: 600;
    }
    
    /* Scrollbar styling */
    .records-container::-webkit-scrollbar {
      width: 8px;
    }
    
    .records-container::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 10px;
    }
    
    .records-container::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 10px;
    }
    
    .records-container::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🗄️ Cloudflare Durable Objects Database</h1>
    <p class="subtitle">Persistent storage with real-time data sync</p>
    
    <div class="form-group">
      <label for="name">👤 Full Name *</label>
      <input type="text" id="name" name="name" required placeholder="Enter your full name">
    </div>
    
    <div class="form-group">
      <label for="email">📧 Email Address *</label>
      <input type="email" id="email" name="email" required placeholder="Enter your email address">
    </div>
    
    <div class="button-group">
      <button onclick="addRecord()">💾 Add Record</button>
      <button class="refresh-btn" onclick="loadRecords()">🔄 Refresh List</button>
    </div>
    
    <div id="message" class="message"></div>
    <div id="loading" class="loading">
      <div class="spinner"></div>
    </div>
    
    <div id="stats" class="stats" style="display: none;"></div>
    
    <h2>📋 Stored Records</h2>
    <div id="records" class="records-container"></div>
  </div>

  <script>
    async function addRecord() {
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      
      // Validation
      if (!name || !email) {
        showMessage('⚠️ Please enter both name and email', 'error');
        return;
      }
      
      // Email format validation
      const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
      if (!emailRegex.test(email)) {
        showMessage('⚠️ Please enter a valid email address (e.g., name@example.com)', 'error');
        return;
      }
      
      showLoading(true);
      
      try {
        const response = await fetch('/add', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name, email })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
          showMessage('✅ ' + data.message, 'success');
          
          // Clear form
          document.getElementById('name').value = '';
          document.getElementById('email').value = '';
          
          // Reload records to show the new one
          await loadRecords();
        } else {
          showMessage('❌ Error: ' + (data.error || 'Failed to add record'), 'error');
        }
      } catch (error) {
        console.error('Add record error:', error);
        showMessage('❌ Network error: ' + error.message, 'error');
      } finally {
        showLoading(false);
      }
    }
    
    async function loadRecords() {
      showLoading(true);
      
      try {
        console.log('Fetching records from /list...');
        const response = await fetch('/list');
        
        if (!response.ok) {
          throw new Error(\`HTTP \${response.status}: \${response.statusText}\`);
        }
        
        const records = await response.json();
        console.log(\`Received \${records.length} records\`);
        
        const container = document.getElementById('records');
        const statsDiv = document.getElementById('stats');
        
        if (!records || records.length === 0) {
          container.innerHTML = \`
            <div class="empty-state">
              📭 No records found<br>
              <small>Add your first record using the form above!</small>
            </div>
          \`;
          statsDiv.style.display = 'none';
        } else {
          // Display records
          container.innerHTML = records.map(record => \`
            <div class="record-item">
              <div class="record-name">👤 \${escapeHtml(record.name)}</div>
              <div class="record-email">📧 \${escapeHtml(record.email)}</div>
              <div class="record-time">🕒 Added: \${formatDate(record.timestamp)}</div>
            </div>
          \`).join('');
          
          // Update stats
          statsDiv.innerHTML = \`
            📊 Total Records: \${records.length} | 
            Last Updated: \${new Date().toLocaleTimeString()}
          \`;
          statsDiv.style.display = 'block';
        }
      } catch (error) {
        console.error('Load records error:', error);
        document.getElementById('records').innerHTML = \`
          <div class="empty-state">
            ❌ Failed to load records<br>
            <small>\${error.message}</small><br><br>
            <button onclick="loadRecords()" style="width: auto; padding: 8px 20px;">🔄 Try Again</button>
          </div>
        \`;
        showMessage('Failed to load records: ' + error.message, 'error');
      } finally {
        showLoading(false);
      }
    }
    
    function showMessage(text, type) {
      const msgDiv = document.getElementById('message');
      msgDiv.textContent = text;
      msgDiv.className = \`message \${type}\`;
      
      // Auto hide after 4 seconds
      setTimeout(() => {
        if (msgDiv.className === \`message \${type}\`) {
          msgDiv.style.display = 'none';
          setTimeout(() => {
            msgDiv.className = 'message';
          }, 100);
        }
      }, 4000);
    }
    
    function showLoading(show) {
      const loadingDiv = document.getElementById('loading');
      loadingDiv.style.display = show ? 'block' : 'none';
    }
    
    function escapeHtml(text) {
      if (!text) return '';
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    
    function formatDate(timestamp) {
      if (!timestamp) return 'Unknown date';
      try {
        const date = new Date(timestamp);
        return date.toLocaleString();
      } catch (e) {
        return timestamp;
      }
    }
    
    // Load records when page loads
    document.addEventListener('DOMContentLoaded', () => {
      loadRecords();
      
      // Allow Enter key to submit
      const emailInput = document.getElementById('email');
      if (emailInput) {
        emailInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            addRecord();
          }
        });
      }
      
      const nameInput = document.getElementById('name');
      if (nameInput) {
        nameInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            emailInput.focus();
          }
        });
      }
    });
  </script>
</body>
</html>`;
}
