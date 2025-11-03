@echo off
REM ========================================
REM Script para iniciar o projeto automaticamente
REM ========================================

REM CONFIGURACAO: Defina o caminho do repositorio aqui
SET REPO_PATH=C:\Users\Douglas Moura\Documents\GitHub\stays-observator

REM ========================================
REM Navegando para o diretorio do projeto
REM ========================================
echo.
echo [INFO] Navegando para: %REPO_PATH%
cd /d "%REPO_PATH%"

REM Verifica se o diretorio existe
if not exist "%REPO_PATH%" (
    echo.
    echo [ERRO] O diretorio nao foi encontrado: %REPO_PATH%
    echo [ERRO] Verifique a variavel REPO_PATH no inicio do arquivo .bat
    echo.
    pause
    exit /b 1
)

REM ========================================
REM Iniciando o projeto
REM ========================================
echo.
echo [INFO] Iniciando o projeto...
echo [INFO] Executando: npm start
echo.

npm start

REM Mantem a janela aberta em caso de erro
if errorlevel 1 (
    echo.
    echo [ERRO] Ocorreu um erro ao iniciar o projeto
    echo.
    pause
)
