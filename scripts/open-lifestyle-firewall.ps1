# 以管理员身份运行此脚本，允许手机通过 Wi-Fi 访问 Lifestyle App
# 右键 → 使用 PowerShell 运行，或在管理员终端执行：
#   powershell -ExecutionPolicy Bypass -File scripts/open-lifestyle-firewall.ps1

$ports = 5160, 4000, 5173, 5174, 5175, 5176, 5177, 5178, 5179, 5180, 5181, 5182, 5183, 5190, 5191
foreach ($p in $ports) {
  netsh advfirewall firewall add rule name="Lifestyle App TCP $p" dir=in action=allow protocol=TCP localport=$p | Out-Null
  Write-Host "已放行端口 $p"
}
Write-Host "`n完成。常用地址："
Write-Host "  阅读书单  https://192.168.1.4:5181/"
Write-Host "  云同步 API https://192.168.1.4:4000/"
