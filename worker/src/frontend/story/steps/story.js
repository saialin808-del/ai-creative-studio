// ============================================================
// Story Studio — Step 3: Story (frontend/story/steps/story.js)
// ------------------------------------------------------------
// ဇာတ်လမ်း ဖန်တီးရန် — API: POST /api/studio/story/generate
// Idea + Characters မှ ဇာတ်လမ်း အပြည့်အစုံ ထုတ်သည်
// ============================================================

import { wrCtx, wrInputZone, wrActionZone, wrResultZone, wrPrimaryBtn, wrGhostBtn, wrLoading, wrError, wrStaleBadge } from '../../shared/ui.js';

export const storyStep = {
  id: 'story',

  html() {
    return '<div class="wr-zone">' + wrCtx('Step 3 — Story', 'AI က မင်းရဲ့ Idea + Characters ကို သုံးပြီး ဇာတ်လမ်းအပြည့်အစုံ ရေးပေးပါမယ်။') + '</div>' +
      wrInputZone(
        '<div id="styContext" style="margin-bottom:12px;"></div>' +
        wrPrimaryBtn('styGenBtn', '&#9654; Generate Story', false) +
        ' ' + wrGhostBtn('styRegen()', '&#128260; Regenerate') +
        wrLoading('styLoading', 'AI ဇာတ်လမ်းရေးသားနေပါသည်...') + wrError('styError')
      ) +
      wrResultZone(
        wrStaleBadge('styStale', 'Idea / Character ပြောင်းထားပါသည် — ရလဒ် နောက်ကျနေနိုင်သည်။') +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><span class="card-title" style="margin:0;">&#128221; ရလဒ် (ဇာတ်လမ်း)</span>' +
        '<span style="font-size:11.5px;color:var(--text3);font-style:italic;">&#9997; တိုက်ရိုက် နှိပ်ပြီး ပြင်နိုင်သည်</span></div>' +
        '<textarea class="result-textarea" id="styResult" placeholder="ဇာတ်လမ်း ဒီနေရာမှာ ပေါ်လာပါမယ်..."></textarea>' +
        '<div style="margin-top:12px;">' + wrPrimaryBtn('styContinueBtn', 'Continue to Scene &#10132;', true) + '</div>'
      );
  },

  script() {
    return `
function styBuildIdeaText(){
  var idea=AICS.flow.getData('idea');
  var lines=[];
  var fields=idea.fields||{};
  var defs=AICS_STEP_DATA.idea.fields;
  for(var i=0;i<defs.length;i++){var k=defs[i].key;if(fields[k])lines.push(defs[i].label+': '+fields[k]);}
  var chars=(AICS.flow.getData('character').characters||[]);
  if(chars.length){lines.push('ဇာတ်ကောင်များ:');for(var j=0;j<chars.length;j++){lines.push('  - '+chars[j].name+(chars[j].role?' ('+chars[j].role+')':'')+(chars[j].desc?' — '+chars[j].desc:''));}}
  return lines.join('\\n');
}
function styHydrate(){
  var idea=AICS.flow.getData('idea');
  var chars=AICS.flow.getData('character').characters||[];
  var box=document.getElementById('styContext');
  var html='';
  html+='<div style="font-size:12.5px;color:var(--text2);margin-bottom:4px;">Idea '+(idea.type?'(Type '+idea.type+')':'')+'</div>';
  var defs=AICS_STEP_DATA.idea.fields;
  var fields=idea.fields||{};
  for(var i=0;i<defs.length;i++){var k=defs[i].key;if(fields[k])html+='<span class="wr-chip">'+escapeHtml(defs[i].label)+' <small>» '+escapeHtml(String(fields[k]).slice(0,40))+'</small></span>';}
  for(var j=0;j<chars.length;j++){html+='<span class="wr-chip">&#129489; '+escapeHtml(chars[j].name)+'</span>';}
  box.innerHTML=html||'<div class="empty-note">Idea မရှိသေးပါ — Step 1 သို့ ပြန်သွားပါ</div>';
  var st=AICS.flow.getData('story');
  if(st.story){
    document.getElementById('styResult').value=st.story;
    styShowResult(true);
  } else { styShowResult(false); }
}
function styShowResult(show){
  var zone=document.getElementById('styResult').closest('.wr-result');
  if(zone)zone.style.display=show?'':'none';
}
function styGenerate(){
  var ideaText=styBuildIdeaText();
  if(!ideaText){showToast('Idea မရှိသေးပါ','error');return;}
  setLoading('styLoading',true);hideError('styError');
  document.getElementById('styGenBtn').disabled=true;
  var body={idea:ideaText,type:(AICS.flow.getData('idea').type||'1')};
  apiCall('/api/studio/story/generate',body)
    .then(function(data){
      AICS.flow.setData('story',{story:data.story||''});
      document.getElementById('styResult').value=data.story||'';
      document.getElementById('styStale').style.display='none';
      AICS.flow.complete('story');
      renderAll();
    })
    .catch(function(err){AICS.flow.fail('story');showError('styError',err.message);renderAll();})
    .finally(function(){setLoading('styLoading',false);document.getElementById('styGenBtn').disabled=false;});
}
function styRegen(){styGenerate();}
function styContinue(){
  var text=document.getElementById('styResult').value;
  if(!text||!text.trim()){showToast('ဇာတ်လမ်း မရှိသေးပါ','error');return;}
  AICS.flow.setData('story',{story:text.trim()});
  AICS.flow.complete('story');
  AICS.flow.activate('scene');
  renderAll();
}
`;
  },
};
