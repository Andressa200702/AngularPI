@echo off
setlocal
set NODE_EXE=C:\Program Files\nodejs\node.exe
set NG_JS=%~dp0node_modules\@angular\cli\bin\ng.js

"%NODE_EXE%" "%NG_JS%" serve --port 4200
