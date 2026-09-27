param(
  [Parameter(Mandatory=$true)][string]$Email,
  [ValidateSet('admin','manager')][string]$Role='manager'
)
$ErrorActionPreference='Stop'
Set-Location -LiteralPath (Split-Path $PSScriptRoot -Parent)
$privatePassword=Read-Host 'Choose a unique password (at least 14 characters)' -AsSecureString
$passwordPointer=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($privatePassword)
try {
  $env:STAFF_EMAIL=$Email
  $env:STAFF_ROLE=$Role
  $env:STAFF_PASSWORD=[Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
  & node --env-file=.env.local scripts/create-staff.mjs
  if ($LASTEXITCODE -ne 0) { throw 'Account creation failed. No existing account was overwritten.' }
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
  Remove-Item Env:STAFF_PASSWORD -ErrorAction SilentlyContinue
  Remove-Item Env:STAFF_EMAIL -ErrorAction SilentlyContinue
  Remove-Item Env:STAFF_ROLE -ErrorAction SilentlyContinue
}
