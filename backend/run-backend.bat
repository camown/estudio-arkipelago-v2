@echo off
set "JAVA_HOME=C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot"
set "PATH=%JAVA_HOME%\bin;E:\estudio-arkipelago\.tools\apache-maven-3.9.9\bin;%PATH%"

echo =========================================================================
echo   ESTUDIO ARKIPELAGO — Spring Boot 3 + Java 21 Backend
echo =========================================================================
echo  API Base URL:  http://localhost:8080/api
echo  Swagger UI:    http://localhost:8080/swagger-ui.html
echo  H2 DB Console: http://localhost:8080/h2-console
echo  WebSocket WSS: ws://localhost:8080/ws
echo =========================================================================

cd /d "%~dp0"
mvn spring-boot:run
