// ====== worker/src/ui/story.js ======
// Story Studio — Frontend UI (self-contained module).
// Studio Separation Rule: ဒီဖိုင်ကို ပြင်ဆင်ခြင်းသည် Studio UI တခြားများ
// (Content/Short/Image/Voice/Shop) ကို လုံးဝ မထိခိုက်ပါ။
// Shell (frontend.js) က ဒီ HTML string ကို မြင်ကွင်းတစ်ခုအဖြစ် ထည့်ပြီး
// view ပြောင်းတဲ့အခါ window.StoryStudio.init() ကို ခေါ်ရုံသာ လုပ်ပေးရပါမည်။
// Shell ရဲ့ ရှိပြီးသား global "token" / "api()" ကိုသာ မှီခိုသုံးပါတယ်။

export const STORY_STUDIO_HTML = `
<div class="card" style="padding:6px;display:flex;gap:6px">
  <button id="storyTabBtn1" class="btn" style="flex:1" onclick="StoryStudio.showTab('text')">📖 ဇာတ်လမ်း</button>
  <button id="storyTabBtn2" class="btn ghost" style="flex:1;color:#1b6d96;border:1px solid #1b6d96" onclick="StoryStudio.showTab('video')">🎬 ဇာတ်လမ်းဗီဒီယို</button>
</div>

<div id="storyTabText">
  <div class="card">
    <label>Type (1 = FREE, 2-5 = PRO)</label>
    <input id="storyType" value="1" inputmode="numeric">
    <label>သင့် ဇာတ်လမ်း အကြံ</label>
    <textarea id="storyIdea" placeholder="ဥပမာ - တောရွာလေးမှာ နေထိုင်တဲ့ ဆင်းရဲသားကလေးတစ်ယောက် ကြိုးစားပြီး အောင်မြင်လာတဲ့ ဇာတ်လမ်း"></textarea>
    <label>Gemini API Key (ရွေးစရာ — BYOK)</label>
    <input id="storyKey" type="password" placeholder="ထည့်လိုပါက">
    <div style="margin-top:12px"><button class="btn" onclick="StoryStudio.generate()">▶ ဇာတ်လမ်းဖန်တီးမယ်</button></div>
  </div>
  <div class="result" id="storyResult">ဇာတ်လမ်း ဤနေရာတွင် ပေါ်မည်...</div>
  <div class="card hidden" id="storyReviseBox">
    <label>ပြင်ချင်တာ ပြောပါ (ဥပမာ - ပိုတိုအောင် ပြင်ပေးပါ)</label>
    <textarea id="storyInstruction" rows="2"></textarea>
    <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn" onclick="StoryStudio.revise()">🔁 ပြင်မယ်</button>
      <button class="btn" style="background:#52C41A" onclick="StoryStudio.copyResult()">📋 Copy</button>
      <button class="btn" style="background:#8a5cf6" onclick="StoryStudio.saveResult()">💾 Save</button>
    </div>
  </div>
</div>

<div id="storyTabVideo" class="hidden">
  <div class="card">
    <label>Type (1 = FREE, 2-5 = PRO)</label>
    <input id="storyVideoType" value="1" inputmode="numeric">
    <label>ဇာတ်လမ်း / အကြံ</label>
    <textarea id="storyVideoIdea" placeholder="ဗီဒီယို Scene Plan ထုတ်ချင်တဲ့ ဇာတ်လမ်း/အကြံ ရေးပါ"></textarea>
    <label>Gemini API Key (ရွေးစရာ — Reference Image အတွက်)</label>
    <input id="storyVideoKey" type="password" placeholder="ထည့်လိုပါက">
    <div style="margin-top:12px"><button class="btn" onclick="StoryStudio.generateVideoPlan()">▶ Plan ဖန်တီးမယ်</button></div>
  </div>
  <div id="storyVideoFallback" class="card hidden" style="background:#fff8e1;border-color:#ffe082">⚠️ AI ရဲ့ format ကို အပြည့်အစုံ မခွဲထုတ်နိုင်ခဲ့ပါ — raw output ကိုသာ ပြထားပါသည်။</div>
  <div id="storyVideoChars"></div>
  <div id="storyVideoScenes"></div>
  <div class="hidden" id="storyVideoActions" style="display:flex;gap:8px;flex-wrap:wrap;margin:12px 0">
    <button class="btn" style="background:#52C41A" onclick="StoryStudio.copyAllVideo()">📋 Copy အားလုံး</button>
    <button class="btn" style="background:#8a5cf6" onclick="StoryStudio.saveVideo()">💾 Save</button>
  </div>
</div>

<style>
.story-scene-card,.story-char-card{background:#fff;border:1px solid #E4E3DD;border-radius:12px;padding:12px;margin-bottom:10px}
.story-scene-card h4,.story-char-card h4{margin:0 0 6px;font-size:14px;color:#1b6d96}
.story-scene-card textarea,.story-char-card textarea{min-height:60px;margin-bottom:6px}
.story-img-area img{max-width:100%;border-radius:8px;margin-top:8px}
.story-toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#1A1B1C;color:#fff;padding:10px 18px;border-radius:20px;font-size:13px;z-index:999;opacity:0;transition:opacity .2s}
.story-toast.show{opacity:1}
</style>

<script>
(function(){
  var currentScenes = [];
  var currentCharacters = [];
  var currentVideoIdea = '';

  function esc(s){
    return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function toast(msg){
    var t=document.createElement('div');
    t.className='story-toast';
    t.textContent=msg;
    document.body.appendChild(t);
    setTimeout(function(){t.classList.add('show');},10);
    setTimeout(function(){t.classList.remove('show');setTimeout(function(){t.remove();},250);},1600);
  }

  function showTab(t){
    document.getElementById('storyTabText').classList.toggle('hidden', t!=='text');
    document.getElementById('storyTabVideo').classList.toggle('hidden', t!=='video');
    var b1=document.getElementById('storyTabBtn1'), b2=document.getElementById('storyTabBtn2');
    if(t==='text'){ b1.className='btn'; b1.style=''; b2.className='btn ghost'; b2.style='color:#1b6d96;border:1px solid #1b6d96'; }
    else{ b2.className='btn'; b2.style=''; b1.className='btn ghost'; b1.style='color:#1b6d96;border:1px solid #1b6d96'; }
  }

  function generate(){
    var out=document.getElementById('storyResult');
    if(!window.token){ out.innerHTML='<span class="err">Login ဦးစွာပြုလုပ်ပါ။</span>'; return; }
    var idea=document.getElementById('storyIdea').value;
    if(!idea || !idea.trim()){ out.innerHTML='<span class="err">ဇာတ်လမ်းအကြံ ထည့်ပါ။</span>'; return; }
    out.textContent='⏳ ဖန်တီးနေသည်...';
    window.api('/api/studio/action', { method:'POST', body: JSON.stringify({
      studio:'STORY', action:'generate', idea:idea,
      type: document.getElementById('storyType').value || '1',
      apiKey: document.getElementById('storyKey').value
    }) }).then(function(d){
      if(d.output){
        out.textContent = d.output;
        document.getElementById('storyReviseBox').classList.remove('hidden');
      } else {
        out.innerHTML = '<span class="err">ERROR: '+(d.error||'')+' '+(d.detail||'')+'</span>';
      }
    }).catch(function(e){ out.innerHTML = '<span class="err">Network error: '+e+'</span>'; });
  }

  function revise(){
    var out=document.getElementById('storyResult');
    var instruction=document.getElementById('storyInstruction').value;
    if(!instruction || !instruction.trim()){ toast('ဘယ်လိုပြင်ချင်လဲ ရေးပါ'); return; }
    var current=out.textContent;
    out.textContent='⏳ ပြင်နေသည်...';
    window.api('/api/studio/action', { method:'POST', body: JSON.stringify({
      studio:'STORY', action:'revise',
      idea: document.getElementById('storyIdea').value,
      type: document.getElementById('storyType').value || '1',
      currentStory: current, instruction: instruction,
      apiKey: document.getElementById('storyKey').value
    }) }).then(function(d){
      if(d.output){ out.textContent = d.output; document.getElementById('storyInstruction').value=''; }
      else { out.innerHTML = '<span class="err">ERROR: '+(d.error||'')+' '+(d.detail||'')+'</span>'; }
    }).catch(function(e){ out.innerHTML = '<span class="err">Network error: '+e+'</span>'; });
  }

  function copyResult(){
    var text=document.getElementById('storyResult').textContent;
    if(!text){ toast('Copy စရာ မရှိပါ'); return; }
    navigator.clipboard.writeText(text);
    toast('✓ Copy ပြီးပါပြီ');
  }

  function saveResult(){
    var text=document.getElementById('storyResult').textContent;
    if(!text){ toast('Save စရာ မရှိပါ'); return; }
    window.api('/api/creations/save', { method:'POST', body: JSON.stringify({
      studio:'STORY', type: document.getElementById('storyType').value || '1',
      original_prompt: document.getElementById('storyIdea').value, ai_output: text
    }) }).then(function(d){
      if(d.ok) toast('💾 Save ပြီးပါပြီ'); else toast('Error: '+(d.error||''));
    }).catch(function(e){ toast('Network error: '+e); });
  }

  function generateVideoPlan(){
    var idea=document.getElementById('storyVideoIdea').value;
    if(!window.token){ toast('Login ဦးစွာပြုလုပ်ပါ'); return; }
    if(!idea || !idea.trim()){ toast('ဇာတ်လမ်း/အကြံ ထည့်ပါ'); return; }
    currentVideoIdea = idea;
    document.getElementById('storyVideoChars').innerHTML = '⏳ Plan ဖန်တီးနေသည်...';
    document.getElementById('storyVideoScenes').innerHTML = '';
    document.getElementById('storyVideoFallback').classList.add('hidden');
    document.getElementById('storyVideoActions').classList.add('hidden');
    window.api('/api/studio/action', { method:'POST', body: JSON.stringify({
      studio:'STORYVIDEO', action:'generate', idea:idea,
      type: document.getElementById('storyVideoType').value || '1',
      apiKey: document.getElementById('storyVideoKey').value
    }) }).then(function(d){
      if(d.error){ document.getElementById('storyVideoChars').innerHTML='<span class="err">ERROR: '+d.error+' '+(d.detail||'')+'</span>'; return; }
      currentScenes = d.scenes || [];
      currentCharacters = d.characters || [];
      if(d.rawFallback) document.getElementById('storyVideoFallback').classList.remove('hidden');
      renderCharacters();
      renderScenes();
      document.getElementById('storyVideoActions').classList.remove('hidden');
    }).catch(function(e){ document.getElementById('storyVideoChars').innerHTML='<span class="err">Network error: '+e+'</span>'; });
  }

  function renderCharacters(){
    var area=document.getElementById('storyVideoChars'); area.innerHTML='';
    currentCharacters.forEach(function(c, idx){
      var card=document.createElement('div');
      card.className='story-char-card';
      card.innerHTML =
        '<h4>🧑 CHARACTER '+(idx+1)+' — '+esc(c.name||'(အမည်မသိ)')+' ('+esc(c.role||'-')+')</h4>' +
        '<textarea readonly id="charText_'+idx+'">'+esc(c.prompt)+'</textarea>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
          '<button class="btn" onclick="StoryStudio.genImage('+idx+',\\'char\\')">🎨 ပုံဖန်တီးမယ်</button>' +
          '<button class="btn" style="background:#52C41A" onclick="StoryStudio.copyField(\\'charText_'+idx+'\\')">📋 Copy</button>' +
        '</div>' +
        '<div class="story-img-area" id="charImg_'+idx+'"></div>';
      area.appendChild(card);
    });
  }

  function renderScenes(){
    var area=document.getElementById('storyVideoScenes'); area.innerHTML='';
    currentScenes.forEach(function(s, idx){
      var card=document.createElement('div');
      card.className='story-scene-card';
      card.innerHTML =
        '<h4>🎬 SCENE '+esc(s.number)+'</h4>' +
        '<label style="font-size:12px;color:#8aa0c0">🌍 Environment Prompt</label>' +
        '<textarea readonly id="envText_'+idx+'">'+esc(s.environmentPrompt)+'</textarea>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px">' +
          '<button class="btn" onclick="StoryStudio.genImage('+idx+',\\'env\\')">🎨 Environment ပုံ</button>' +
          '<button class="btn" style="background:#52C41A" onclick="StoryStudio.copyField(\\'envText_'+idx+'\\')">📋 Copy</button>' +
        '</div>' +
        '<div class="story-img-area" id="envImg_'+idx+'"></div>' +
        '<label style="font-size:12px;color:#8aa0c0">🎥 Video Prompt</label>' +
        '<textarea id="videoText_'+idx+'">'+esc(s.videoPrompt)+'</textarea>' +
        '<button class="btn" style="background:#52C41A" onclick="StoryStudio.copyField(\\'videoText_'+idx+'\\')">📋 Copy</button>';
      area.appendChild(card);
    });
  }

  function genImage(idx, kind){
    var promptText, containerId;
    if(kind==='char'){ promptText=document.getElementById('charText_'+idx).value; containerId='charImg_'+idx; }
    else { promptText=document.getElementById('envText_'+idx).value; containerId='envImg_'+idx; }
    if(!promptText){ toast('Prompt မရှိပါ'); return; }
    var container=document.getElementById(containerId);
    container.innerHTML='⏳ ပုံဖန်တီးနေသည်... (မိနစ်အနည်းငယ်ကြာနိုင်)';
    window.api('/api/studio/action', { method:'POST', body: JSON.stringify({
      studio:'STORYVIDEO', action:'videoImage', promptText:promptText,
      apiKey: document.getElementById('storyVideoKey').value
    }) }).then(function(d){
      if(d.data){ container.innerHTML='<img src="data:'+d.mimeType+';base64,'+d.data+'">'; }
      else{ container.innerHTML='<span class="err">ERROR: '+(d.error||'')+' '+(d.detail||'')+'</span>'; }
    }).catch(function(e){ container.innerHTML='<span class="err">Network error: '+e+'</span>'; });
  }

  function copyField(id){
    var text=document.getElementById(id).value;
    if(!text){ toast('Copy စရာ မရှိပါ'); return; }
    navigator.clipboard.writeText(text);
    toast('✓ Copy ပြီးပါပြီ');
  }

  function buildCombinedVideoText(){
    var out='🧑 CHARACTER REFERENCE PROMPTS\\n\\n';
    currentCharacters.forEach(function(c, idx){
      out += 'CHARACTER '+(idx+1)+'\\n----------------------\\n\\n';
      out += 'Name: '+(c.name||'-')+'\\nRole: '+(c.role||'-')+'\\n\\n';
      out += 'Character Reference Prompt:\\n'+(document.getElementById('charText_'+idx)?document.getElementById('charText_'+idx).value:(c.prompt||'-'))+'\\n\\n======================\\n\\n';
    });
    out += '\\n🌍🎬 SCENE PROMPTS (Environment & Video)\\n\\n';
    currentScenes.forEach(function(s, idx){
      out += 'SCENE '+s.number+'\\n----------------------\\n\\n';
      out += 'Environment Prompt:\\n'+(document.getElementById('envText_'+idx)?document.getElementById('envText_'+idx).value:(s.environmentPrompt||'-'))+'\\n\\n----------------------\\n\\n';
      out += 'Video Prompt:\\n'+(document.getElementById('videoText_'+idx)?document.getElementById('videoText_'+idx).value:(s.videoPrompt||'-'))+'\\n\\n======================\\n\\n';
    });
    return out;
  }

  function copyAllVideo(){
    if(currentScenes.length===0 && currentCharacters.length===0){ toast('Result မရှိသေးပါ'); return; }
    navigator.clipboard.writeText(buildCombinedVideoText());
    toast('✓ Copy ပြီးပါပြီ');
  }

  function saveVideo(){
    if(currentScenes.length===0 && currentCharacters.length===0){ toast('Result မရှိသေးပါ'); return; }
    var combined=buildCombinedVideoText();
    window.api('/api/creations/save', { method:'POST', body: JSON.stringify({
      studio:'STORYVIDEO', type: document.getElementById('storyVideoType').value || '1',
      original_prompt: currentVideoIdea, ai_output: combined
    }) }).then(function(d){
      if(d.ok) toast('💾 Save ပြီးပါပြီ'); else toast('Error: '+(d.error||''));
    }).catch(function(e){ toast('Network error: '+e); });
  }

  window.StoryStudio = {
    init: function(){ showTab('text'); },
    showTab: showTab,
    generate: generate,
    revise: revise,
    copyResult: copyResult,
    saveResult: saveResult,
    generateVideoPlan: generateVideoPlan,
    genImage: genImage,
    copyField: copyField,
    copyAllVideo: copyAllVideo,
    saveVideo: saveVideo
  };
})();
</script>
`;
