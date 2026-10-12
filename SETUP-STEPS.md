# CEMS - Step by step (Windows)

1. Install JDK 17+   -> check: java -version
2. Install Maven 3.9+ -> check: mvn -version
3. Install Node 18+   -> check: node -v

## Terminal 1 - backend (http://localhost:8080)
    cd backend
    mvn -s maven-settings.xml spring-boot:run
(or double-click run-backend.bat)
Wait for: "Started CemsApplication"

## Terminal 2 - frontend (http://localhost:3000)
    cd frontend
    npm install
    npm run dev
(or double-click run-frontend.bat)

## Login (password cems@123)
Student   alex.rivera@college.edu
Organizer s.connor@college.edu
Admin     m.vance@college.edu

## Build a jar instead of running
    cd backend
    mvn -s maven-settings.xml clean package -DskipTests
    java -jar target/cems-backend-1.0.0.jar

## If a download times out
Re-run the same command (Maven resumes), or: mvn -U spring-boot:run
Delete a corrupt cache: Remove-Item -Recurse -Force "$env:USERPROFILE\.m2\repository\net\bytebuddy"
