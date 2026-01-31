$hadError = $false

$rootPath = Split-Path -Parent $PSScriptRoot
$srcPath = Join-Path $rootPath 'src'
$testPath = Join-Path $rootPath 'tests'
$publicPath = Join-Path $rootPath 'public'

$roots = @()
if (Test-Path $srcPath) { $roots += $srcPath }
if (Test-Path $testPath) { $roots += $testPath }
if (Test-Path $publicPath) { $roots += $publicPath }

$exts = @('.ts','.tsx','.js','.jsx','.html','.css','.scss','.json')
$skipDirs = @('\\node_modules\\','\\dist\\','\\build\\','\\.git\\','\\coverage\\','\\.vite\\','\\out\\')

function Has-Utf8Bom {
  param([byte[]]$bytes)
  if ($bytes.Length -lt 3) { return $false }
  return ($bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF)
}

function Has-MojibakeBytes {
  param([byte[]]$bytes)
  $patterns = @(
    @(0xC3,0x83,0xC2,0xA9),
    @(0xC3,0x83,0xC2,0xA8),
    @(0xC3,0x83,0xC2,0xAA),
    @(0xC3,0x83,0xC2,0xAB),
    @(0xC3,0x83,0xC2,0x80),
    @(0xC3,0x83,0xC2,0x89),
    @(0xC3,0x83,0xC2,0x9C),
    @(0xC3,0x83,0xC2,0xB4),
    @(0xC3,0x83,0xC2,0xB6),
    @(0xC3,0x83,0xC2,0xB8),
    @(0xC3,0x83,0xC2,0xB1)
  )
  foreach ($pat in $patterns) {
    for ($i = 0; $i -le $bytes.Length - $pat.Length; $i++) {
      $match = $true
      for ($j = 0; $j -lt $pat.Length; $j++) {
        if ($bytes[$i + $j] -ne $pat[$j]) { $match = $false; break }
      }
      if ($match) { return $true }
    }
  }
  return $false
}

foreach ($root in $roots) {
  Get-ChildItem -Path $root -Recurse -File | ForEach-Object {
    $full = $_.FullName.ToLowerInvariant()
    foreach ($skip in $skipDirs) {
      if ($full.Contains($skip)) { return }
    }
    if (-not ($exts -contains $_.Extension)) { return }

    $bytes = [System.IO.File]::ReadAllBytes($_.FullName)
    if (Has-Utf8Bom -bytes $bytes) {
      Write-Host ('Verification failed: BOM found in ' + $_.FullName)
      $hadError = $true
    }
    if (Has-MojibakeBytes -bytes $bytes) {
      Write-Host ('Verification failed: mojibake pattern found in ' + $_.FullName)
      $hadError = $true
    }
  }
}

if ($hadError) {
  Write-Host 'Verification failed: one or more errors (see above)'
} else {
  Write-Host 'Verification failed: none'
}