// ============================================================
// Story Studio — Step 5: Result (frontend/story/steps/result.js)
// ------------------------------------------------------------
// နောက်ဆုံး ရလဒ် — Copy / Save to My Creations / Revise / Restart
// API: POST /api/studio/story/revise (Revise Chat)
// ============================================================

import { wrCtx, wrResultZone, wrPrimaryBtn, wrGhostBtn, wrLoading, wrError, wrStaleBadge } from '../../shared/ui.js';

export const resultStep = {
  id: 'result',

  html() {
    return '<div class="wr-zone">' + wrCtx('Step 5 — Result', 'မင်းရဲ့ ဇာတ်လမ်းနဲ့ Scene Plan အပြည့်အစုံ — ကူးယူ / သိမ်း / ပြင်နိုင်သည်။') + '</div>' +
      wrResultZone(
        wrStaleBadge('resStale', 'အပေါ်က Step ပြောင်းထားပါသည် — ရလဒ် နောက်ကျနေနိုင်သည်။') +
        '<div class="card" style="background:var(--bg-card2);">' +
        '<div class="card-title">&#128214; ဇာတ်လမ်း</div>' +
        '<textarea class="result-textarea" id="resStory" style="min-height:180px;"></textarea>' +
        '<div class="btn-row">' +
        wrGhostBtn('resCopyStory()', '&#128203; Copy Story') +
        wrGhostBtn('resRegen()', '&#128260; Regenerate') +
        '</div></div>' +
        '<div class="card" style="background:var(--bg-card2);margin-top:14px;">' +
        '<div class="card-title">&#127916; Scene Plan <span id="resStats" style="font-size:12px;color:var(--text3);font-weight:400;"></span></div>' +
        '<div id="resScenesSummary" style="font-size:13px;color:var(--text2);white-space:pre-wrap;max-height:200px;overflow-y:auto;"></div>' +
        '<div class="btn-row">' + wrGhostBtn('resCopyAll()', '&#128203; Copy All (Story + Scenes)') + '</div>' +
        '</div>' +
        '<div class="card" style="background:var(--bg-card2);margin-top:14px;">' +
        '<div class="card-title">&#129302; AI ကို ဆက်ညွှန်ကြားရန် (Revise)</div>' +
        '<div class="revise-input-row"><input type="text" id="resFeedback" placeholder="ဥပမာ — နိဂုံးကို ပိုစိတ်ခံစားရအောင် ပြင်ပေးပါ" style="flex:1;" onkeypress="if(event.key===\'Enter\'){resRevise();}">' +
        '<button class="btn btn-secondary" id="resReviseBtn" onclick="resRevise()">&#128260; ပြင်ပါ</button></div>' +
        wrLoading('resRevLoading', 'ပြင်ဆင်နေပါသည်...') + wrError('resRevError') +
        '</div>' +
        '<div class="btn-row" style="margin-top:16px;">' +
        wrPrimaryBtn('resSaveBtn', '&#128190; Save to My Creations', true) +
        '<button class="btn btn-purple" onclick="resRestart()">&#8634; အသစ်ပြန်စမည်</button>' +
        '</div>'
      );
  },

  script() {
    return `
function resHydrate(){
  var st=AICS.flow.getData('story').story||'';
  var el=document.getElementById('resStory');
  if(el){el.value=st;el.oninput=function(){AICS.flow.setData('story',{story:el.value});};}
  var sc=AICS.flow.getData('scene');
  var sum=document.getElementById('resScenesSummary');
  var stats=document.getElementById('resStats');
  var sTxt='';
  if(sc&&sc.scenes&&sc.scenes.length){
    for(var i=0;i<sc.scenes.length;i++){var s=sc.scenes[i];sTxt+='SCENE '+(s.number||(i+1))+': '+(s.videoPrompt||'').slice(0,120)+'\\n\\n';}
    if(stats)stats.textContent='— Scene '+sc.scenes.length+' ခု / Character '+((sc.characters||[]).length)+' ခု';
  }
  if(sum)sum.textContent=sTxt||'(Scene Plan မရှိသေးပါ — Step 4 သို့ ပြန်သွားပါ)';
  var btn=document.getElementById('resSaveBtn');
  if(btn)btn.disabled=!st.trim();
}
function resCopyStory(){
  var t=document.getElementById('resStory').value;
  if(!t){showToast('Story မရှိပါ','error');return;}
  if(navigator.clipboard)navigator.clipboard.writeText(t).then(function(){showToast();});
  else{var ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);showToast();}
}
function resBuildAll(){
  var out='';
  var st=document.getElementById('resStory').value||'';
  out+='&#128214; STORY\\n\\n'+st+'\\n\\n';
  var sc=AICS.flow.getData('scene');
  if(sc&&sc.scenes&&sc.scenes.length){
    out+='\\n&#127757;&#127916; SCENE PROMPTS\\n\\n';
    for(var i=0;i<sc.scenes.length;i++){var s=sc.scenes[i];
      out+='SCENE '+(s.number||(i+1))+'\\nEnvironment: '+(s.environmentPrompt||'-')+'\\nVideo: '+(s.videoPrompt||'-')+'\\n\\n';
    }
  }
  return out;
}
function resCopyAll(){
  var t=resBuildAll();if(!t.trim()){showToast('Result မရှိပါ','error');return;}
  if(navigator.clipboard)navigator.clipboard.writeText(t).then(function(){showToast();});
  else{var ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);showToast();}
}
function resSave(){
  var text=document.getElementById('resStory').value;
  if(!text.trim()){showToast('Save လုပ်ဖို့ Story မရှိသေးပါ','error');return;}
  var topic=(AICS.flow.getData('idea').fields||{}).topic||'ဇာတ်လမ်း';
  var defaultTitle=topic.substring(0,40)+(topic.length>40?'...':'');
  var title=prompt('Creation အမည် ပေးပါ:',defaultTitle);
  if(title===null)return;
  AICS_CREATIONS.save({studio:'STORY',type:(AICS.flow.getData('idea').type||'1'),title:title||defaultTitle,original_prompt:resBuildAll(),ai_output:text})
    .then(function(){showToast('My Creations ထဲ Save ပြီးပါပြီ');})
    .catch(function(err){showToast('Save မအောင်မြင်ပါ: '+(err&&err.message||'Error'),'error');});
}
function resRevise(){
  var instruction=document.getElementById('resFeedback').value.trim();
  var current=document.getElementById('resStory').value;
  if(!instruction){showError('resRevError','ဘယ်လိုပြင်ချင်လဲ ရေးပါ');return;}
  if(!current){showError('resRevError','အရင် Story ကို ဖန်တီးပါ');return;}
  setLoading('resRevLoading',true);hideError('resRevError');
  document.getElementById('resReviseBtn').disabled=true;
  var idea=AICS.flow.getData('idea');
  var body={idea:resBuildIdeaText(),type:(idea.type||'1'),currentStory:current,instruction:instruction};
  apiCall('/api/studio/story/revise',body)
    .then(function(data){
      AICS.flow.setData('story',{story:data.story||current});
      document.getElementById('resStory').value=data.story||current;
      document.getElementById('resFeedback').value='';
      showToast('ပြင်ဆင်ပြီးပါပြီ');
    })
    .catch(function(err){showError('resRevError',err.message);})
    .finally(function(){setLoading('resRevLoading',false);document.getElementById('resReviseBtn').disabled=false;});
}
function resBuildIdeaText(){
  var idea=AICS.flow.getData('idea');
  var lines=[];var fields=idea.fields||{};var defs=AICS_STEP_DATA.idea.fields;
  for(var i=0;i<defs.length;i++){var k=defs[i].key;if(fields[k])lines.push(defs[i].label+': '+fields[k]);}
  var chars=(AICS.flow.getData('character').characters||[]);
  if(chars.length){lines.push('ဇာတ်ကောင်များ:');for(var j=0;j<chars.length;j++){lines.push('  - '+chars[j].name);}}
  return lines.join('\\n');
}
function resRegen(){
  if(!confirm('ဇာတ်လမ်းကို ပြန်ရေးမှာလား?'))return;
  AICS.flow.activate('story');renderAll();
}
function resRestart(){
  if(!confirm('အစကနေ ပြန်စမှာလား? (အလုပ်အားလုံး ရှင်းမယ်)'))return;
  try{localStorage.removeItem(AICS_STATE_KEY);}catch(e){}
  location.reload();
}
`;
  },
};
