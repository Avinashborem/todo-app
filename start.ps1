# start.ps1
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; .\venv\Scripts\activate; uvicorn main:app --reload"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; npm run dev"