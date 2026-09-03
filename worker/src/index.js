function resultPage() {
  return '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Login OK</title></head>' +
    '<body style="font-family:sans-serif;max-width:640px;margin:40px auto;padding:0 16px;background:#F4F3EE;color:#1A1B1C">' +
    '<h2 style="color:#0b6b46">✅ Login OK</h2>' +
    '<p id="status" style="font-size:14px">Loading...</p>' +
    '<div id="me" style="font-size:14px;margin:8px 0;padding:10px;background:#fff;border-radius:8px;border:1px solid #E4E3DD"></div>' +
    '<textarea id="tok" rows="5" style="width:100%;font-family:monospace;font-size:12px;box-sizing:border-box"></textarea>' +
    '<br><button onclick="copyT()" style="margin-top:8px;padding:10px 18px;font-size:14px">Copy token</button>' +
    '<p style="font-size:12px;color:#666">Use: Authorization: Bearer &lt;token&gt;</p>' +
    '<script>var m=location.hash.match(/token=([^&]+)/);var t=m?decodeURIComponent(m[1]):"";' +
    'if(t){document.getElementById("tok").value=t;document.getElementById("status").textContent="Token ready. Checking /api/users/me ...";' +
    'fetch("/api/users/me",{headers:{Authorization:"Bearer "+t}}).then(function(r){return r.json();}).then(function(d){' +
    'document.getElementById("me").textContent="Email: "+(d.email||"?")+"   Plan: "+(d.plan||"?")+(d.error?"   (error: "+d.error+")":"");' +
    '}).catch(function(e){document.getElementById("me").textContent="check failed";});' +
    '}else{document.getElementById("status").textContent="No token found.";}' +
    'function copyT(){var x=document.getElementById("tok");x.select();try{document.execCommand("copy");}catch(e){}}<\/script>' +
    '</body></html>';
}
