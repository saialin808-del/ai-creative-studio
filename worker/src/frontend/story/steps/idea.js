// ============================================================
// Story Studio — Step 1: Idea (frontend/story/steps/idea.js)
// ------------------------------------------------------------
// ဇာတ်လမ်း အကြံအစည် — Type + Fields ဖြည့်ရန် (API မလို)
// Studio တစ်ခုချင်းစီ၏ Step ဖြစ်သောကြောင့် အခြား Studio ကို မထိခိုက်စေရ
// ============================================================

import { wrCtx, wrInputZone, wrActionZone, wrPrimaryBtn } from '../../shared/ui.js';

const STORY_TYPES = [
  { v: '1', label: 'ဇာတ်လမ်း', pro: false },
  { v: '2', label: 'ရုပ်ရှင်', pro: true },
  { v: '3', label: 'ဇာတ်လမ်းတွဲ', pro: true },
  { v: '4', label: 'ဇာတ်လမ်းတို', pro: true },
  { v: '5', label: 'ဟာသဇာတ်လမ်း', pro: true },
];

const FIELDS = [
  { key: 'topic', label: 'ဇာတ်လမ်းအကြောင်း', placeholder: 'ဥပမာ — ဘာအကြောင်းရေးချင်ပါသလဲ?', required: true, multiline: true },
  { key: 'genre', label: 'ဇာတ်လမ်းအမျိုးအစား', placeholder: 'ဥပမာ — အချစ် / Horror / Action / ဟာသ' },
  { key: 'hero', label: 'အဓိကဇာတ်ကောင်', placeholder: 'ဥပမာ — အသက် / အလုပ် / အိပ်မက်' },
  { key: 'conflict', label: 'အဓိကပြဿနာ', placeholder: 'ဥပမာ — ဇာတ်ကောင် ဘာအခက်အခဲကရမလဲ?' },
  { key: 'mood', label: 'ခံစားချက်ပုစံ', placeholder: 'ဥပမာ — ဝမ်းနည်း / လှုပ်ရှား / ကြောက်စရာ' },
  { key: 'setting', label: 'မြင်ကွင်း/ပတ်ဝန်းကျင်', placeholder: 'ဥပမာ — မြန်မာကျေးရွာ / မြို့' },
  { key: 'length', label: 'ဇာတ်လမ်းအရှည်', placeholder: 'ဥပမာ — နာရီ / မိနစ်' },
];

export const ideaStep = {
  id: 'idea',

  // Client (Browser) တွင် လိုအပ်သော Config
  clientData() {
    return { types: STORY_TYPES, fields: FIELDS };
  },

  // Server-side HTML — Step Panel တစ်ခု
  html() {
    let chips = '';
    for (let i = 0; i < STORY_TYPES.length; i++) {
      const t = STORY_TYPES[i];
      const sel = t.v === '1' ? ' style="border-color:var(--cyan);color:var(--cyan);"' : '';
      chips += '<span class="wr-chip" data-type="' + t.v + '"' + sel + (t.pro ? ' data-pro="1"' : '') +
        ' onclick="setIdeaType(\'' + t.v + '\')">' + t.label + (t.pro ? ' <small>(PRO)</small>' : '') + '</span>';
    }
    let fields = '';
    for (let i = 0; i < FIELDS.length; i++) {
      const f = FIELDS[i];
      fields += '<div class="form-group"><label>' + f.label + (f.required ? ' *' : '') + '</label>' +
        (f.multiline
          ? '<textarea id="idea_' + f.key + '" placeholder="' + f.placeholder + '" style="min-height:70px;" oninput="ideaValidate()"></textarea>'
          : '<input id="idea_' + f.key + '" type="text" placeholder="' + f.placeholder + '" oninput="ideaValidate()">') +
        '</div>';
    }
    return '<div class="wr-zone">' + wrCtx('Step 1 — Idea', 'ဇာတ်လမ်း အကြံအစည်ကို စတင်ဖြည့်ပါ။') + '</div>' +
      wrInputZone('<div class="form-group"><label>Type ရွေးပါ</label><div id="ideaTypes">' + chips + '</div></div>' + fields) +
      wrActionZone(wrPrimaryBtn('ideaContinueBtn', 'Continue to Characters &#10132;', true));
  },

  // Client-side Script (Shell ၏ <script> ထဲ ထည့်သည်)
  // Template Literal (Backtick) — ဤအတွင်းရှိ စာသားအားလုံးသည် Client Code ဖြစ်သည်
  script() {
    return `
function setIdeaType(v){
  var t=AICS_STEP_DATA.idea.types;
  for(var i=0;i<t.length;i++){if(t[i].v===v&&t[i].pro&&!AICS.isPro){showToast('ဒီ Type ကို Pro User သာ အသုံးပြုနိုင်ပါသည်။','error');return;}}
  AICS.ideaType=v;
  var chips=document.querySelectorAll('#ideaTypes .wr-chip');
  for(var j=0;j<chips.length;j++){var c=chips[j];
    if(c.getAttribute('data-type')===v){c.style.borderColor='var(--cyan)';c.style.color='var(--cyan)';}
    else{c.style.borderColor='';c.style.color='';}
  }
}
function ideaHydrate(){
  var d=AICS.flow.getData('idea');
  if(!AICS.ideaType&&d.type)AICS.ideaType=d.type;
  if(d.type)setIdeaType(d.type);
  var fields=AICS_STEP_DATA.idea.fields;
  for(var i=0;i<fields.length;i++){var k=fields[i].key;var el=document.getElementById('idea_'+k);
    if(el)el.value=(d.fields&&d.fields[k])?d.fields[k]:'';}
  ideaValidate();
}
function ideaValidate(){
  var el=document.getElementById('idea_topic');
  var ok=!!(el&&el.value.trim());
  var btn=document.getElementById('ideaContinueBtn');
  if(btn)btn.disabled=!ok;
}
function ideaContinue(){
  if(!AICS.ideaType)AICS.ideaType='1';
  var fields={};
  var defs=AICS_STEP_DATA.idea.fields;
  for(var i=0;i<defs.length;i++){var k=defs[i].key;var el=document.getElementById('idea_'+k);
    if(el&&el.value.trim())fields[k]=el.value.trim();}
  if(!fields.topic){showToast('ဇာတ်လမ်းအကြောင်း အနည်းဆုံး ဖြည့်ပါ','error');return;}
  AICS.flow.setData('idea',{type:AICS.ideaType,fields:fields});
  AICS.flow.complete('idea');
  AICS.flow.activate('character');
  renderAll();
}
`;
  },
};
