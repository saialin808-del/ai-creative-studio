// ============================================================
// Story Studio — Step 2: Character (frontend/story/steps/character.js)
// ------------------------------------------------------------
// ဇာတ်ကောင် ဖန်တီးရန် (Manual — API မလို)
// User က နာမည် / အခန်းကဏ္ဍ / ဖော်ပြချက် ထည့်၍ စာရင်း ပြုလုပ်သည်
// ============================================================

import { wrCtx, wrInputZone, wrActionZone, wrPrimaryBtn, wrGhostBtn } from '../../shared/ui.js';

export const characterStep = {
  id: 'character',

  html() {
    return '<div class="wr-zone">' + wrCtx('Step 2 — Characters', 'ဇာတ်လမ်းအတွက် အဓိက ဇာတ်ကောင်များကို ဖန်တီးပါ။ (အနည်းဆုံး ၁ ယောက်)') + '</div>' +
      wrInputZone(
        '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end;margin-bottom:10px;">' +
        '<div style="flex:1 1 150px;min-width:0;"><label>ဇာတ်ကောင် နာမည်</label><input id="chrName" placeholder="ဥပမာ — မြင့်မြတ်"></div>' +
        '<div style="flex:1 1 120px;min-width:0;"><label>အခန်းကဏ္ဍ</label><input id="chrRole" placeholder="ဥပမာ — သူရဲကောင်း"></div>' +
        '<div style="flex:1 1 100px;min-width:0;"><button class="btn btn-secondary" style="width:100%;" onclick="chrAdd()">&#10133; Add</button></div>' +
        '</div>' +
        '<div class="form-group"><label>ဖော်ပြချက် (အသွင်အပြင် / အမူအကျင့်)</label><textarea id="chrDesc" placeholder="ဥပမာ — အသက် ၂၃၊ ရဲရင့်ပြီး စိတ်ထားကောင်း..." style="min-height:60px;"></textarea></div>' +
        '<div id="chrList" class="characters-list"></div>'
      ) +
      wrActionZone(wrPrimaryBtn('chrContinueBtn', 'Continue to Story &#10132;', true) + ' ' +
        wrGhostBtn('chrClear()', '&#128465; အားလုံးရှင်း'));
  },

  script() {
    return `
function chrHydrate(){
  var list=AICS.flow.getData('character').characters||[];
  chrRender(list);
}
function chrGetList(){return AICS.flow.getData('character').characters||[];}
function chrSave(list){AICS.flow.setData('character',{characters:list});chrRender(list);}
function chrRender(list){
  var box=document.getElementById('chrList');
  var btn=document.getElementById('chrContinueBtn');
  if(!box)return;
  if(!list||list.length===0){box.innerHTML='<div class="empty-note">ဇာတ်ကောင် မရှိသေးပါ — အထက်က ပုံစံဖြည့်ပြီး Add နှိပ်ပါ</div>';if(btn)btn.disabled=true;return;}
  var html='';
  for(var i=0;i<list.length;i++){
    var c=list[i];
    html+='<div class="character-card"><div class="character-header"><span class="character-name">&#129489; '+escapeHtml(c.name)+'</span>'+
      '<span style="display:flex;gap:6px;"><button class="btn-ghost" onclick="chrEdit('+i+')">&#9998;</button>'+
      '<button class="btn-ghost" onclick="chrRemove('+i+')">&#128465;</button></span></div>'+
      '<div class="character-role">Role: '+(c.role?escapeHtml(c.role):'-')+'</div>'+
      '<div class="character-prompt">'+(c.desc?escapeHtml(c.desc):'(ဖော်ပြချက် မရှိ)')+'</div></div>';
  }
  box.innerHTML=html;
  if(btn)btn.disabled=false;
}
function chrAdd(){
  var name=document.getElementById('chrName').value.trim();
  if(!name){showToast('ဇာတ်ကောင် နာမည် ထည့်ပါ','error');return;}
  var list=chrGetList();
  var obj={name:name,role:document.getElementById('chrRole').value.trim(),desc:document.getElementById('chrDesc').value.trim()};
  if(AICS.chrEditIdx!==null&&AICS.chrEditIdx>=0&&AICS.chrEditIdx<list.length){list[AICS.chrEditIdx]=obj;AICS.chrEditIdx=null;}
  else{list.push(obj);}
  chrSave(list);
  document.getElementById('chrName').value='';document.getElementById('chrRole').value='';document.getElementById('chrDesc').value='';
}
function chrEdit(i){
  var list=chrGetList();var c=list[i];if(!c)return;
  AICS.chrEditIdx=i;
  document.getElementById('chrName').value=c.name||'';
  document.getElementById('chrRole').value=c.role||'';
  document.getElementById('chrDesc').value=c.desc||'';
  window.scrollTo(0,document.getElementById('chrName').offsetTop-120);
}
function chrRemove(i){
  var list=chrGetList();list.splice(i,1);chrSave(list);
  if(AICS.chrEditIdx===i)AICS.chrEditIdx=null;
}
function chrClear(){
  if(!confirm('ဇာတ်ကောင် အားလုံး ဖျက်မှာလား?'))return;
  chrSave([]);AICS.chrEditIdx=null;
}
function chrContinue(){
  var list=chrGetList();
  if(list.length===0){showToast('အနည်းဆုံး ဇာတ်ကောင် ၁ ယောက် ဖန်တီးပါ','error');return;}
  AICS.flow.complete('character');
  AICS.flow.activate('story');
  renderAll();
}
`;
  },
};
