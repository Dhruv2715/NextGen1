 = @{name='Test User'; email='testuser@example.com'; password='Test@1234'; role='candidate'};
 =  | ConvertTo-Json;
 = Invoke-RestMethod -Method Post -Uri http://localhost:5000/api/auth/register -ContentType 'application/json' -Body  -ErrorAction Stop;
 | ConvertTo-Json -Depth 5
