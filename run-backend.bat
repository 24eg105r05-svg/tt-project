@echo off
cd /d "%~dp0backend"
set MAVEN_OPTS=-Dmaven.wagon.http.retryHandler.count=10 -Dmaven.wagon.httpconnectionManager.ttlSeconds=25 -Dmaven.wagon.http.readTimeout=120000 -Dmaven.wagon.http.connectionTimeout=60000
echo Trying with Google mirror...
call mvn -s maven-settings.xml spring-boot:run
if errorlevel 1 (
  echo Retrying with default Maven Central...
  call mvn spring-boot:run
)
pause
