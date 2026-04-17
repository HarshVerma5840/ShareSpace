$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $projectRoot "backend"

if (-not (Test-Path (Join-Path $backendDir "pom.xml"))) {
  throw "Could not find backend\\pom.xml. Run this script from the project root."
}

Push-Location $backendDir
try {
  mvn spring-boot:run
}
finally {
  Pop-Location
}
