// Admin — minimal JS test
export const ADMIN_HTML = `<!DOCTYPE html>
<html lang="my">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Admin Test</title>
</head>
<body style="margin:0;background:#F4F3EE;font-family:sans-serif;padding:40px 20px;text-align:center;">
<div id="test" style="font-size:18px;color:#666;padding:20px;">⏳ Loading — JS မrun သေး</div>
<script>
document.getElementById('test').innerHTML = '✅ JS is running!';
</script>
</body>
</html>`;

export async function adminApi(request, path, env, verifyToken) {
  return null;
}
