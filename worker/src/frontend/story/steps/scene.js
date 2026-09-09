// ============================================================
// Story Studio — Step 4: Scene (frontend/story/steps/scene.js)
// ------------------------------------------------------------
// ဇာတ်ကွက် / Scene Plan ဖန်တီးရန် — API: POST /api/studio/story/video
// Scene + Character Reference Prompts များကို ထုတ်ပေးသည်
// ============================================================

import { wrCtx, wrInputZone, wrActionZone, wrResultZone, wrPrimaryBtn, wrGhostBtn, wrLoading, wrError, wrStaleBadge } from '../../shared/ui.js';

const VIDEO_TYPES = [
  { v: '1', label: 'Video', pro: false },
  { v: '2', label: 'ရုပ်ရှင်', pro: true },
  { v: '3', label: 'ဇာတ်လမ်းတွဲ', pro: true },
  { v: '4', label: 'ဇာတ်လမ်းတို', pro: true },
  { v: '5', label: 'Type 5', pro: true },
];

export const sceneStep = {
  id: 'scene',

  clientData() {
    return { types: VIDEO_TYPES };
  },

  html() {
    let chips = '';
    for (let i = 0; i < VIDEO_TYPES.length; i++) {
      const t = VIDEO_TYPES[i];
      const sel = t.v === '1' ? ' style="border-color:var(--cyan);color:var(--cyan);"' : '';
      chips += '<span class="wr-chip" data-vt="' + t.v + '"' + sel + (t.pro ? ' data-pro="1"' : '') +
        ' onclick="scnSetType(\'' + t.v + '\')">' + t.label + (t.pro ? ' <small>(PRO)</small>' : '') + '</span>';
    }
    return '<div class="wr-zone">' + wrCtx('Step 4 — Scene', 'ဇာတ်လမ်းမှ Scene အလိုက် Video / Environment Prompt များ ဖန်တီးပါ။') + '</div>' +
      wrInputZone(
        '<div class="form-group"><label>Video Type ရွေးပါ</label><div id="scnTypes">' + chips + '</div></div>' +
        '<div class="form-group"><label>Story / Idea (ပြင်ဆင်နိုင်)</label>' +
        '<textarea id="scnIdea" style="min-height:130px;"></textarea></div>'
      ) +
      wrActionZone(wrPrimaryBtn('scnGenBtn', '&#9654; Generate Scene Plan', false) +
        wrLoading('scnLoading', 'AI Video Plan ရေးသားနေပါသည်...') + wrError('scnError')) +
      wrResultZone(
        wrStaleBadge('scnStale', 'Story ပြောင်းထားပါသည် — Scene Plan နောက်ကျနေနိုင်သည်။') +
        '<div id="scnResult" style="display:none;">' +
        '<div class="card" id="scnCharsCard" style="display:none;"><div class="card-title"><span class="section-badge">01</span> &#128100; CHARACTER REFERENCE PROMPT</div><div id="scnCharsList" class="characters-list"></div></div>' +
        '<div class="card"><div class="card-title"><span class="section-badge">02</span> &#127757;&#127916; SCENE PROMPT (Environment &amp; Video)</div><div id="scnScenesList"></div></div>' +
        '<div class="card"><div class="btn-row">' +
        wrGhostBtn('scnCopyAll()', '&#128203; All Copy') +
        '</div><p style="color:var(--text3);font-size:12px;margin-top:8px;">(Text Prompt များသာ Copy ဖြစ်ပါမည် — Image များကို ကတ်ထဲက Download ဖြင့် သိမ်းပါ)</p></div>' +
        '</div>' +
        '<div style="margin-top:12px;">' + wrPrimaryBtn('scnContinueBtn', 'Continue to Result &#10132;', true) + '</div>'
      );
  },

  script() {
    return `
function scnSetType(v){
  var t=AICS_STEP_DATA.scene.types;
  for(var i=0;i<t.length;i++){if(t[i].v===v&&t[i].pro&&!AICS.isPro){showToast('ဒီ Type ကို Pro User သာ အသုံးပြုနိုင်ပါသည်။','error');return;}}
  AICS.scnType=v;
  var chips=document.querySelectorAll('#scnTypes .wr-chip');
  for(var j=0;j<chips.length;j++){var c=chips[j];
    if(c.getAttribute('data-vt')===v){c.style.borderColor='var(--cyan)';c.style.color='var(--cyan)';}
    else{c.style.borderColor='';c.style.color='';}
  }
}
function scnHydrate(){
  var st=AICS.flow.getData('story').story||'';
  var el=document.getElementById('scnIdea');
  if(el&&!el.value.trim())el.value=st;
  var d=AICS.flow.getData('scene');
  if(d.scenes){AICS.scnScenes=d.scenes;AICS.scnChars=d.characters||[];scnRender();}
  else{AICS.scnScenes=[];AICS.scnChars=[];}
  var btn=document.getElementById('scnContinueBtn');
  if(btn)btn.disabled=!(AICS.scnScenes&&AICS.scnScenes.length>0);
}
function scnGenerate(){
  var idea=document.getElementById('scnIdea').value.trim();
  if(!idea){showError('scnError','Story/Idea ထည့်ပါ');return;}
  if(!AICS.scnType)AICS.scnType='1';
  setLoading('scnLoading',true);hideError('scnError');
  document.getElementById('scnGenBtn').disabled=true;
  var body={idea:idea,type:AICS.scnType};
  apiCall('/api/studio/story/video',body)
    .then(function(data){
      AICS.scnScenes=data.scenes||[];AICS.scnChars=data.characters||[];
      AICS.flow.setData('scene',{scenes:AICS.scnScenes,characters:AICS.scnChars,rawFallback:!!data.rawFallback,idea:idea});
      scnRender();
      document.getElementById('scnStale').style.display='none';
      AICS.flow.complete('scene');
      renderAll();
    })
    .catch(function(err){AICS.flow.fail('scene');showError('scnError',err.message);renderAll();})
    .finally(function(){setLoading('scnLoading',false);document.getElementById('scnGenBtn').disabled=false;});
}
function scnRender(){
  var box=document.getElementById('scnResult');
  if(!box)return;
  if(!AICS.scnScenes||AICS.scnScenes.length===0){box.style.display='none';var b2=document.getElementById('scnContinueBtn');if(b2)b2.disabled=true;return;}
  box.style.display='';
  scnRenderChars();scnRenderScenes();
  var btn=document.getElementById('scnContinueBtn');if(btn)btn.disabled=false;
}
function scnRenderChars(){
  var card=document.getElementById('scnCharsCard'),list=document.getElementById('scnCharsList');
  if(!card)return;
  if(!AICS.scnChars||AICS.scnChars.length===0){card.style.display='none';return;}
  card.style.display='block';list.innerHTML='';
  for(var i=0;i<AICS.scnChars.length;i++){
    (function(idx){
      var ch=AICS.scnChars[idx];
      var div=document.createElement('div');div.className='character-card';
      var html='<div class="character-header"><span class="character-name">&#129489; '+(ch.name||'Character '+(idx+1))+'</span>'+
        '<button class="btn-ghost" onclick="scnCopyText(scnCharText('+idx+'))">&#128203; Copy</button></div>'+
        '<div class="character-role">Role: '+(ch.role||'-')+'</div>'+
        '<div class="character-prompt">'+escapeHtml(ch.prompt||'(မရှိပါ)')+'</div>'+
        '<div class="scene-image-area" id="scnCharImg_'+idx+'"><button class="btn btn-orange" style="font-size:12px;padding:8px 14px;min-height:36px;" onclick="scnCharImage('+idx+')">&#127912; Character Image ဖန်တီးပါ</button></div>';
      div.innerHTML=html;list.appendChild(div);
    })(i);
  }
}
function scnCharText(idx){
  var ch=AICS.scnChars[idx];return ch?(ch.prompt||''):'';
}
function scnCopyText(text){
  if(!text){showToast('Text မရှိပါ','error');return;}
  if(navigator.clipboard)navigator.clipboard.writeText(text).then(function(){showToast();});
  else{var ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);showToast();}
}
function scnRenderScenes(){
  var list=document.getElementById('scnScenesList');if(!list)return;list.innerHTML='';
  if(!AICS.scnScenes||AICS.scnScenes.length===0){list.innerHTML='<div class="empty-note">Scene Prompt မရှိသေးပါ</div>';return;}
  for(var i=0;i<AICS.scnScenes.length;i++){
    (function(idx){
      var s=AICS.scnScenes[idx];
      var group=document.createElement('div');group.className='scene-group';
      var html='<div class="scene-group-title">SCENE '+(s.number||(idx+1))+'</div>';
      html+='<div class="scene-card"><div class="scene-card-header"><span class="scene-card-title">&#127757; Environment Reference Prompt</span>'+
        '<button class="btn-ghost" onclick="scnCopyText(scnEnvText('+idx+'))">&#128203; Copy</button></div>'+
        '<div class="scene-prompt-text">'+escapeHtml(s.environmentPrompt||'(မရှိပါ)')+'</div>'+
        '<div class="scene-image-area" id="scnEnvImg_'+idx+'"><button class="btn btn-orange" style="font-size:12px;padding:8px 14px;min-height:36px;" onclick="scnEnvImage('+idx+')">&#127912; Environment Image ဖန်တီးပါ</button></div></div>';
      html+='<div class="scene-card"><div class="scene-card-header"><span class="scene-card-title">&#127916; Video Prompt</span>'+
        '<button class="btn-ghost" onclick="scnCopyText(scnVidText('+idx+'))">&#128203; Copy</button></div>'+
        '<textarea class="scene-prompt-textarea" id="scnVid_'+idx+'" oninput="AICS.scnScenes['+idx+'].videoPrompt=this.value">'+escapeHtml(s.videoPrompt||'')+'</textarea></div>';
      group.innerHTML=html;list.appendChild(group);
    })(i);
  }
}
function scnEnvText(idx){var s=AICS.scnScenes[idx];return s?(s.environmentPrompt||''):'';}
function scnVidText(idx){var el=document.getElementById('scnVid_'+idx);return el?el.value:'';}
function scnEnvImage(idx){
  var s=AICS.scnScenes[idx];if(!s||!s.environmentPrompt){showToast('Prompt မရှိပါ','error');return;}
  var area=document.getElementById('scnEnvImg_'+idx);
  area.innerHTML='<div class="loading show"><div class="spinner"></div> ပုံဖန်တီးနေပါသည်...</div>';
  apiCall('/api/studio/story/video-image',{prompt:s.environmentPrompt})
    .then(function(data){scnShowImg(area,data,'story_scene_'+(idx+1)+'_env.png');})
    .catch(function(err){area.innerHTML='<div style="color:var(--error);font-size:12px;padding:10px;">Error: '+escapeHtml(err.message)+'</div><button class="btn-ghost" onclick="scnEnvImage('+idx+')">ထပ်စမ်းပါ</button>';});
}
function scnCharImage(idx){
  var ch=AICS.scnChars[idx];if(!ch||!ch.prompt){showToast('Prompt မရှိပါ','error');return;}
  var area=document.getElementById('scnCharImg_'+idx);
  area.innerHTML='<div class="loading show"><div class="spinner"></div> ပုံဖန်တီးနေပါသည်...</div>';
  apiCall('/api/studio/story/video-image',{prompt:ch.prompt})
    .then(function(data){scnShowImg(area,data,'story_character_'+(idx+1)+'.png');})
    .catch(function(err){area.innerHTML='<div style="color:var(--error);font-size:12px;padding:10px;">Error: '+escapeHtml(err.message)+'</div><button class="btn-ghost" onclick="scnCharImage('+idx+')">ထပ်စမ်းပါ</button>';});
}
function scnShowImg(area,data,filename){
  if(data&&data.data){
    var src='data:'+(data.mimeType||'image/png')+';base64,'+data.data;
    area.innerHTML='<img src="'+src+'"><div style="margin-top:8px;"><a href="'+src+'" download="'+filename+'"><button class="btn-ghost">&#128190; Save Image</button></a></div>';
  }else{area.innerHTML='<div class="empty-note">ရုပ်ပုံမထွက်ပါ</div>';}
}
function scnBuildCombined(){
  var out='&#128100; CHARACTER REFERENCE PROMPTS\\n\\n';
  for(var i=0;i<AICS.scnChars.length;i++){
    var ch=AICS.scnChars[i];
    out+='CHARACTER '+(i+1)+'\\n----------------------\\nName: '+(ch.name||'-')+'\\nRole: '+(ch.role||'-')+'\\n\\nCharacter Reference Prompt:\\n'+(ch.prompt||'-')+'\\n\\n======================\\n\\n';
  }
  out+='\\n&#127757;&#127916; SCENE PROMPTS (Environment & Video)\\n\\n';
  for(var j=0;j<AICS.scnScenes.length;j++){
    var sc=AICS.scnScenes[j];
    out+='SCENE '+(sc.number||(j+1))+'\\n----------------------\\nEnvironment Prompt:\\n'+(sc.environmentPrompt||'-')+'\\n\\nVideo Prompt:\\n'+(document.getElementById('scnVid_'+j)?document.getElementById('scnVid_'+j).value:(sc.videoPrompt||'-'))+'\\n\\n======================\\n\\n';
  }
  return out;
}
function scnCopyAll(){
  if((!AICS.scnScenes||AICS.scnScenes.length===0)&&(!AICS.scnChars||AICS.scnChars.length===0)){showToast('Result မရှိသေးပါ','error');return;}
  scnCopyText(scnBuildCombined());
}
function scnContinue(){
  if(!AICS.scnScenes||AICS.scnScenes.length===0){showToast('Scene Plan မရှိသေးပါ','error');return;}
  AICS.flow.complete('scene');
  AICS.flow.activate('result');
  renderAll();
}
`;
  },
};
