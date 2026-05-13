$nodeExe = 'C:\Program Files\nodejs\node.exe'
$ngJs = Join-Path $PSScriptRoot 'node_modules\@angular\cli\bin\ng.js'

& $nodeExe $ngJs serve --port 4200
