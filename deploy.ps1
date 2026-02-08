$env:VERCEL_TOKEN = "cYsGSz0jSaacc0khSO21XM7n"
$env:VERCEL_PROJECT_ID = "prj_GxgwXQMsWfKPMFrUXgBJXqviCMGs"
$env:VERCEL_ORG_ID = "danch0"

# Create .vercel directory and project.json
New-Item -ItemType Directory -Path ".vercel" -Force | Out-Null
@'
{
  "projectId": "prj_GxgwXQMsWfKPMFrUXgBJXqviCMGs",
  "orgId": "danch0"
}
'@ | Out-File -FilePath ".vercel/project.json" -Encoding utf8

# Deploy
npx vercel@latest --yes --prod --token "cYsGSz0jSaacc0khSO21XM7n"
