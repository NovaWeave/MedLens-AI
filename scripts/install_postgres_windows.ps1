Param(
  [string]$PostgresVersion = "15",
  [string]$DbUser = "medlens",
  [string]$DbPassword = "medlens",
  [string]$DbName = "medlens"
)

Write-Host "Checking for Chocolatey..."
if (-not (Get-Command choco -ErrorAction SilentlyContinue)) {
  Write-Host "Chocolatey not found. Installing Chocolatey..."
  Set-ExecutionPolicy Bypass -Scope Process -Force
  [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
  Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
}

Write-Host "Installing PostgreSQL $PostgresVersion via Chocolatey (requires admin)..."
choco install postgresql --version=$PostgresVersion -y

# Add psql to PATH for current session
$pgBin = Get-ChildItem -Directory "C:\Program Files\PostgreSQL" | Sort-Object Name -Descending | Select-Object -First 1 | ForEach-Object { Join-Path $_.FullName "bin" }
if ($pgBin -and (Test-Path $pgBin)) { $env:Path = "$pgBin;" + $env:Path }

Write-Host "Ensuring service is running..."
Start-Service postgresql* -ErrorAction SilentlyContinue | Out-Null

Write-Host "Creating role and database if not present..."
try {
  # Create user
  & psql -U postgres -c "DO $$ BEGIN IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$DbUser') THEN CREATE ROLE $DbUser LOGIN PASSWORD '$DbPassword'; END IF; END $$;" 2>$null
  # Create database
  & psql -U postgres -c "DO $$ BEGIN IF NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DbName') THEN CREATE DATABASE $DbName OWNER $DbUser; END IF; END $$;" 2>$null
} catch {
  Write-Host "Note: You may need to set a password for the 'postgres' superuser and re-run."
}

Write-Host "PostgreSQL setup attempted. Connection string: postgresql://$DbUser:$DbPassword@localhost:5432/$DbName"


