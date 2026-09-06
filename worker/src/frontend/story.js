export const STORY_HTML = `<!DOCTYPE html>
<html lang="my">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Story Studio — AI Creative Studio</title>
<style>
:root{--bg:#080c18;--bg-card:#0d1424;--bg-card2:#111a2e;--bg-input:#0a1020;--border:rgba(0,229,255,0.15);--border-strong:rgba(0,229,255,0.35);--cyan:#00e5ff;--purple:#7b5cff;--text:#e8ecf4;--text2:#8b95a8;--text3:#5a6478;--success:#00e676;--error:#ff5252;--warn:#ffc107}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Noto Sans Myanmar','Roboto','Segoe UI',Arial,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;font-size:14px;line-height:1.6}
a{color:var(--cyan);text-decoration:none}
.header{background:linear-gradient(135deg,#0a1628,#0d1f3c);border-bottom:1px solid var(--border);padding:12px 20px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
.header-left{display:flex;align-items:center;gap:12px}
.logo{font-size:18px;font-weight:700;background:linear-gradient(90deg,var(--cyan),var(--purple));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.header-right{display:flex;align-items:center;gap:12px;font-size:13px}
.user-email{color:var(--text2)}
.plan-badge{background:linear-gradient(135deg,var(--purple),var(--cyan));color:#fff;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600}
.menu-btn{display:none;background:none;border:1px solid var(--border);color:var(--cyan);padding:8px 12px;border-radius:8px;cursor:pointer;font-size:18px}
.layout{display:flex;min-height:calc(100vh - 57px)}
.sidebar{width:220px;background:var(--bg-card);border-right:1px solid var(--border);padding:16px 0;flex-shrink:0}
.sidebar a{display:flex;align-items:center;gap:10px;padding:11px 20px;color:var(--text2);font-size:13.5px;transition:all .2s;border-left:3px solid transparent}
.sidebar a:hover{background:rgba(0,229,255,.06);color:var(--text)}
.sidebar a.active{background:rgba(0,229,255,.1);color:var(--cyan);border-left-color:var(--cyan);font-weight:600}
.sidebar .nav-icon{width:20px;text-align:center;font-size:15px}
.sidebar .soon{font-size:10px;color:var(--text3);margin-left:auto}
.main{flex:1;padding:24px;max-width:960px;margin:0 auto;width:100%}
.tabs{display:flex;gap:4px;border-bottom:1px solid var(--border);margin-bottom:24px;overflow-x:auto}
.tab{padding:12px 20px;background:none;border:none;color:var(--text2);cursor:pointer;font-size:14px;font-family:inherit;border-bottom:2px solid transparent;transition:all .2s;white-space:nowrap;min-height:44px}
.tab:hover{color:var(--text)}
.tab.active{color:var(--cyan);border-bottom-color:var(--cyan);font-weight:600}
.tab-content{display:none}
.tab-content.active{display:block}
.card{background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:20px;margin-bottom:16px}
.card-title{font-size:15px;font-weight:600;color:var(--cyan);margin-bottom:14px;display:flex;align-items:center;gap:8px}
label{display:block;font-size:12.5px;color:var(--text2);margin-bottom:6px;font-weight:500}
input,textarea,select{width:100%;background:var(--bg-input);border:1px solid var(--border);border-radius:8px;padding:11px 14px;color:var(--text);font-size:14px;font-family:inherit;transition:border-color .2s;box-sizing:border-box}
input:focus,textarea:focus,select:focus{outline:none;border-color:var(--cyan);box-shadow:0 0 0 2px rgba(0,229,255,.1)}
textarea{resize:vertical;min-height:90px}
select{cursor:pointer}
select option{background:var(--bg-card);color:var(--text)}
.form-group{margin-bottom:16px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px 24px;border-radius:8px;border:none;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .2s;min-height:44px;min-width:44px}
.btn-primary{background:linear-gradient(135deg,var(--cyan),#00b8d4);color:#080c18}
.btn-primary:hover{opacity:.9;transform:translateY(-1px)}
.btn-primary:disabled{opacity:.5;cursor:not-allowed;transform:none}
.btn-secondary{background:var(--bg-card2);color:var(--cyan);border:1px solid var(--border-strong)}
.btn-secondary:hover{background:rgba(0,229,255,.1)}
.btn-ghost{background:none;color:var(--text2);border:1px solid var(--border);padding:6px 12px;font-size:12px;min-height:32px}
.btn-ghost:hover{color:var(--cyan);border-color:var(--cyan)}
.btn-success{background:linear-gradient(135deg,#00e676,#00c853);color:#080c18}
.btn-purple{background:linear-gradient(135deg,var(--purple),#9c7cff);color:#fff}
.btn-orange{background:linear-gradient(135deg,#ff9f2b,#ff6f00);color:#080c18}
.btn-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.type-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px}
.type-chip{padding:10px 16px;border:1px solid var(--border);border-radius:20px;font-size:13px;cursor:pointer;color:var(--text2);transition:all .2s;user-select:none;min-height:40px;display:inline-flex;align-items:center;gap:6px}
.type-chip:hover{border-color:var(--cyan);color:var(--cyan)}
.type-chip.selected{background:rgba(0,229,255,.12);border-color:var(--cyan);color:var(--cyan);font-weight:600}
.type-chip.locked{opacity:.45;cursor:not-allowed}
.type-chip.locked:hover{border-color:var(--border);color:var(--text2)}
.revise-section{margin-top:20px;padding-top:20px;border-top:1px solid var(--border)}
.revise-history{margin-bottom:14px;max-height:280px;overflow-y:auto}
.revise-msg{background:var(--bg-input);border-radius:8px;padding:10px 14px;margin-bottom:8px;font-size:13px}
.revise-msg.user{border-left:3px solid var(--purple)}
.revise-msg .role{font-size:11px;color:var(--text3);margin-bottom:4px}
.revise-input-row{display:flex;gap:10px;align-items:flex-end}
.revise-input-row input{flex:1}
.result-textarea{width:100%;min-height:220px;background:var(--bg-input);border:1px solid var(--border);border-radius:10px;padding:16px;color:var(--text);font-size:15px;line-height:1.7;font-family:inherit;resize:vertical;box-sizing:border-box}
.result-textarea:focus{outline:none;border-color:var(--cyan)}
.characters-list{display:flex;flex-wrap:wrap;gap:12px}
.character-card{background:var(--bg-card2);border:1px solid var(--border);border-radius:10px;padding:16px;flex:1 1 280px;min-width:260px}
.character-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
.character-name{font-weight:700;color:var(--cyan);font-size:14px}
.character-role{font-size:12px;color:var(--text3);margin-bottom:8px}
.character-prompt{font-size:13px;color:var(--text);line-height:1.6;white-space:pre-wrap;word-break:break-word;background:var(--bg-input);padding:10px 12px;border-radius:8px;margin-bottom:8px;min-height:20px}
.scene-group{margin-bottom:20px}
.scene-group-title{color:var(--cyan);font-weight:700;font-size:15px;padding-bottom:8px;margin-bottom:12px;border-bottom:1px solid var(--border)}
.scene-card{background:var(--bg-card2);border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:12px}
.scene-card-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
.scene-card-title{font-weight:600;color:var(--purple);font-size:13px}
.scene-prompt-text{font-size:13px;color:var(--text);line-height:1.6;white-space:pre-wrap;word-break:break-word;background:var(--bg-input);padding:10px 12px;border-radius:8px;margin-bottom:8px;min-height:20px}
.scene-prompt-textarea{width:100%;background:var(--bg-input);border:1px solid var(--border);border-radius:8px;padding:10px 12px;color:var(--text);font-size:13px;line-height:1.6;font-family:inherit;resize:vertical;min-height:60px;box-sizing:border-box;margin-bottom:8px}
.scene-prompt-textarea:focus{outline:none;border-color:var(--cyan)}
.scene-image-area{margin-top:10px;text-align:center}
.scene-image-area img{max-width:100%;border-radius:8px;border:1px solid var(--border)}
.loading{display:none;align-items:center;gap:10px;color:var(--cyan);font-size:13px;padding:12px 0}
.loading.show{display:flex}
.spinner{width:18px;height:18px;border:2px solid var(--border);border-top-color:var(--cyan);border-radius:50%;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.error-box{display:none;background:rgba(255,82,82,.1);border:1px solid rgba(255,82,82,.3);color:var(--error);padding:12px 16px;border-radius:8px;font-size:13px;margin-top:12px}
.error-box.show{display:block}
.fallback-note{display:none;background:rgba(255,193,7,.1);border:1px solid rgba(255,193,7,.3);color:var(--warn);padding:12px 16px;border-radius:8px;font-size:13px;margin-top:12px}
.fallback-note.show{display:block}
.toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(100px);background:var(--bg-card2);border:1px solid var(--success);color:var(--success);padding:10px 20px;border-radius:8px;font-size...
