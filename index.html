// worker.js - Complete working version
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Serve HTML page for root path
    if (url.pathname === "/" || url.pathname === "/index.html") {
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cloudflare Database Demo</title>
  <style>
    /* Add all the CSS from above here */
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
    }
    h1 { color: #333; margin-bottom: 10px; }
    h2 { color: #555; margin: 30px 0 15px 0; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
    .form-group { margin-bottom: 20px; }
    label { display: block; margin-bottom: 8px; color: #333; font-weight: 500; }
    input {
      width: 100%;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 10px;
      font-size: 16px;
    }
    input:focus { outline: none; border-color: #667eea; }
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
    }
    button:hover { transform: translateY(-2px); }
    .records-list { list-style: none; margin-top: 20px; }
    .record-item {
      background: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 8px;
    }
    .record-name { font-weight: bold; color: #667eea; }
    .record-email { color: #666; margin-top: 5px; }
    .record-time { color: #999; margin-top: 5px; font-size: 12px; }
    .empty-state { text-align: center; padding: 40px; color: #999; background: #f8f9fa; border-radius: 10px; }
    .status {
      margin-top: 20px;
      padding: 10px;
      border-radius: 8px;
      display: none;
    }
    .status.success { background: #d4edda; color: #155724; display: block; }
    .status.error { background: #f8d7da; color: #721c24; display: block; }
    .loading { text-align: center; padding: 20px; display: none; }
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
    .refresh-btn {
      background: #28a745;
      margin-top: 10px;
      width: auto;
      padding: 8px 20px;
      float: right;
    }
    .clearfix::after { content: ""; clear: both; display: table; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 Cloudflare Durable Objects Database</h1>
    <p class="subtitle">Store and retrieve data in persistent storage</p>
    
    <div class="form-group">
      <label>👤 Name *</label>
      <input type="text" id="name" placeholder="Enter your name" />
    </div>
    
    <div class="form-group">
      <label>📧 Email *</label>
      <input type="email" id="email" placeholder="Enter your email" />
    </div>
    
    <button onclick="addRecord()">💾 Add Record to Database</button>
    
    <div id="status" class="status"></div>
    <div id="loading" class="loading"><div class="spinner"></div></div>
    
    <div class="clearfix">
      <h2 style="float: left;">📋 Stored Records</h2>
      <button class="refresh-btn" onclick="loadRecords()">🔄 Refresh</button>
    </div>
    
    <div id="recordsContainer"></div>
  </div>

  <script>
    async function addRecord() {
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      
      if (!name || !email) {
        showStatus("Please enter both name and email.", "error");
        return;
      }
      
      showLoading(true);
      
      try {
        const response = await fetch('/add', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email })
        });
        
        if (response.ok) {
          document.getElementById("name").value = "";
          document.getElementById("email").value = "";
          showStatus("✅ Record added successfully!", "success");
          await loadRecords();
        } else {
          const error = await response.text();
          showStatus("❌ Failed: " + error, "error");
        }
      } catch (error) {
        showStatus("❌ Error: " + error.message, "error");
      } finally {
        showLoading(false);
      }
    }
    
    async function loadRecords() {
      showLoading(true);
      try {
        const response = await fetch('/list');
        const records = await response.json();
        const container = document.getElementById("recordsContainer");
        
        if (!records || records.length === 0) {
          container.innerHTML = '<div class="empty-state">📭 No records found. Add your first record!</div>';
        } else {
          container.innerHTML = \`
            <div class="records-list">
              \${records.map(record => \`
                <div class="record-item">
                  <div class="record-name">👤 \${escapeHtml(record.name)}</div>
                  <div class="record-email">📧 \${escapeHtml(record.email)}</div>
                  <div class="record-time">🕒 \${record.timestamp || new Date().toLocaleString()}</div>
                </div>
              \`).join('')}
            </div>
          \`;
        }
      } catch (error) {
        document.getElementById("recordsContainer").innerHTML = 
          '<div class="empty-state">❌ Failed to load records</div>';
      } finally {
        showLoading(false);
      }
    }
    
    function showStatus(message, type) {
      const statusDiv = document.getElementById("status");
      statusDiv.textContent = message;
      statusDiv.className = \`status \${type}\`;
      setTimeout(() => {
        statusDiv.className = "status";
      }, 3000);
    }
    
    function showLoading(show) {
      document.getElementById("loading").style.display = show ? "block" : "none";
    }
    
    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
    
    loadRecords();
  </script>
</body>
</html>`;
      
      return new Response(html, {
        headers: { "Content-Type": "text/html" }
      });
    }
    
    // Handle API routes with Durable Object
    if (url.pathname === "/add" || url.pathname === "/list") {
      const id = env.MY_DATABASE.idFromName("main");
      const obj = env.MY_DATABASE.get(id);
      return obj.fetch(request);
    }
    
    return new Response("Not found", { status: 404 });
  }
}

export class MyDatabase {
  constructor(state, env) {
    this.storage = state.storage;
  }

  async fetch(request) {
    const url = new URL(request.url);
    
    if (url.pathname === "/add" && request.method === "POST") {
      try {
        const { name, email } = await request.json();
        
        if (!name || !email) {
          return new Response("Name and email are required", { status: 400 });
        }
        
        const timestamp = new Date().toISOString();
        await this.storage.put(name, { name, email, timestamp });
        
        return new Response("Added successfully", { status: 200 });
      } catch (error) {
        return new Response(`Error: ${error.message}`, { status: 500 });
      }
    }
    
    if (url.pathname === "/list" && request.method === "GET") {
      const entries = await this.storage.list();
      const records = Array.from(entries.values());
      return new Response(JSON.stringify(records), {
        headers: { "Content-Type": "application/json" },
        status: 200
      });
    }
    
    return new Response("Not found", { status: 404 });
  }
}
