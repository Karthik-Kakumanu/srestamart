Set-Location 'C:\srestamart\frontend'
$env:VITE_API_URL = 'https://srestamart.onrender.com'
node node_modules\vite\bin\vite.js --host 127.0.0.1 --port 5173 *> 'C:\srestamart\sresta-frontend-live.log'
