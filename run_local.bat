@echo off
:: MaintenOps Local Runner Script
:: Edit the values below to match your Supabase database connection details

set SPRING_DATASOURCE_URL=jdbc:postgresql://db.cyjuuymgyyiymxpudpsl.supabase.co:5432/postgres
set SPRING_DATASOURCE_USERNAME=postgres
set SPRING_DATASOURCE_PASSWORD=YOUR_DB_PASSWORD_HERE

:: Port for frontend CORS mapping (matches React Vite port)
set FRONTEND_URL=http://localhost:5173

echo Starting Spring Boot backend...
cd maintenops-backend
call mvnw spring-boot:run
pause
