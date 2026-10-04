$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.12.101-hotspot"
$env:Path = "$env:JAVA_HOME\bin;E:\estudio-arkipelago\.tools\apache-maven-3.9.9\bin;$env:Path"

Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host "  ESTUDIO ARKIPELAGO — Spring Boot 3 + Java 21 Backend" -ForegroundColor Green
Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host "  API Base URL:  http://localhost:8080/api" -ForegroundColor White
Write-Host "  Swagger UI:    http://localhost:8080/swagger-ui.html" -ForegroundColor Yellow
Write-Host "  H2 DB Console: http://localhost:8080/h2-console" -ForegroundColor White
Write-Host "  WebSocket WSS: ws://localhost:8080/ws" -ForegroundColor White
Write-Host "=========================================================================" -ForegroundColor Cyan

Set-Location $PSScriptRoot
mvn spring-boot:run
