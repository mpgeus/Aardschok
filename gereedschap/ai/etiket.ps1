# Opschriften op een vergelijkingsplaat (werklijst vraag 180; Marcel, 18 okt: "ik weet nu niet welke plaatjes SD1.5 en
# welke SDXL zijn", "graag even markeren"). Een strook bovenaan met de titel, en per vakje een label in een donker
# blokje. Aangeroepen door etiket.cjs met een JSON-bestand: { in, uit, titel, onder, labels: [{ tekst, x, y }] }, waarbij
# x en y in pixels van de oorspronkelijke plaat zijn (de strook komt erbij). Alleen .NET van Windows, niets erbij.
param([string]$Spec)
Add-Type -AssemblyName System.Drawing
$s = Get-Content -LiteralPath $Spec -Raw -Encoding UTF8 | ConvertFrom-Json
$bron = [System.Drawing.Image]::FromFile($s.in)
$kop = 44
if ($s.onder) { $kopOnder = 26 } else { $kopOnder = 0 }
$bmp = New-Object System.Drawing.Bitmap $bron.Width, ($bron.Height + $kop + $kopOnder)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.Clear([System.Drawing.Color]::FromArgb(255, 24, 26, 22))
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$g.DrawImage($bron, 0, $kop, $bron.Width, $bron.Height)
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$wit = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 245, 238, 220))
$goud = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 242, 196, 92))
$blok = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(200, 10, 10, 10))
$titel = New-Object System.Drawing.Font ('Segoe UI', 16, [System.Drawing.FontStyle]::Bold)
$klein = New-Object System.Drawing.Font ('Segoe UI', 10, [System.Drawing.FontStyle]::Bold)
$g.DrawString([string]$s.titel, $titel, $goud, 10, 8)
if ($s.onder) { $g.DrawString([string]$s.onder, $klein, $wit, 10, $bron.Height + $kop + 5) }
foreach ($l in $s.labels) {
  $t = [string]$l.tekst
  $maat = $g.MeasureString($t, $klein)
  $x = [float]$l.x
  $y = [float]$l.y + $kop
  $g.FillRectangle($blok, $x, $y, $maat.Width + 2, $maat.Height)
  $g.DrawString($t, $klein, $wit, $x + 1, $y)
}
$bron.Dispose()
$g.Dispose()
$bmp.Save($s.uit, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
