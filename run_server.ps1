$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8080/")
$listener.Start()
Write-Host "Server running at http://localhost:8080/ - press Ctrl+C to stop"
while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response
    $localFilePath = "." + $request.Url.LocalPath
    if ($localFilePath -eq "./") { $localFilePath = "./index.html" }
    
    if (Test-Path $localFilePath -PathType Leaf) {
        $content = [System.IO.File]::ReadAllBytes($localFilePath)
        $response.ContentLength64 = $content.Length
        $response.OutputStream.Write($content, 0, $content.Length)
    } else {
        $response.StatusCode = 404
    }
    $response.Close()
}
