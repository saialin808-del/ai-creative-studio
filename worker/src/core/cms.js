// AI Creative Studio — CMS Engine / Workflow Controller
// CMS is selected by Studio + Workflow Feature + Tab + Plan + Type.

const CMS_WORKFLOW = {
  STORY:       { studio: 'story',  feature: 'story_generator', tab: 'story',          step: 'generate' },
  STORYVIDEO:  { studio: 'story',  feature: 'director_plan',   tab: 'director',       step: 'plan' },
  CONTENT:     { studio: 'content',feature: 'content_generator',tab: 'content',        step: 'generate' },
  CONTENTVIDEO:{ studio: 'content',feature: 'video_plan',      tab: 'video',          step: 'plan' },
  IMAGE:       { studio: 'image',  feature: 'image_prompt',    tab: 'create',         step: 'prompt' },
  IMAGEAD:    { studio: 'image',  feature: 'ad_image_prompt', tab: 'ad',             step: 'prompt' },
  VOICE:      { studio: 'voice',  feature: 'audio_tools',     tab: 'audio_tools',    step: 'transcribe' },
  SHOPCONTENT:{ studio: 'shop',   feature: 'product_content', tab: 'product_content', step: 'generate' },
  SHOPVIDEO:  { studio: 'shop',   feature: 'shop_video',      tab: 'video',          step: 'plan' },
};

function workflowFor(studioKey) {
  const key = String(studioKey || '').toUpperCase();
  return CMS_WORKFLOW[key] || {
    studio: String(studioKey || '').toLowerCase(),
    feature: String(studioKey || '').toLowerCase(),
    tab: String(studioKey || '').toLowerCase(),
    step: 'generate',
  };
}

async function getCMSData(env, studio, plan, type, workflow = {}) {
  const key = String(studio || '').toUpperCase();
  const wf = workflowFor(key);
  const wantedFeature = workflow.feature || wf.feature;
  const wantedTab = workflow.tab || wf.tab;
  const wantedStep = workflow.step || wf.step;

  // Prefer the new workflow-aware columns. If a partially migrated DB is used,
  // gracefully fall back to the legacy Studio/Plan/Type lookup.
  try {
    const { results } = await env.DB.prepare(
      'SELECT * FROM cms_prompts WHERE lower(studio)=lower(?) AND lower(plan)=lower(?) AND type=? ' +
      'AND (status IS NULL OR upper(status)=\'ACTIVE\') ' +
      'AND (feature=? OR feature IS NULL OR feature=\'\') ' +
      'AND (tab=? OR tab IS NULL OR tab=\'\') ORDER BY version DESC, id DESC LIMIT 1'
    ).bind(key, plan, type, wantedFeature, wantedTab).all();
    return results && results.length ? results[0] : null;
  } catch (e) {
    // Legacy schema fallback for databases that have not run migration 012 yet.
    const { results } = await env.DB.prepare(
      'SELECT * FROM cms_prompts WHERE lower(studio)=lower(?) AND lower(plan)=lower(?) AND type=? ORDER BY id DESC LIMIT 1'
    ).bind(key, plan, type).all();
    return results && results.length ? results[0] : null;
  }
}

function buildSystemPrompt(c, context = {}) {
  if (!c) return '';
  const sections = [
    ['ROLE', c.core],
    ['MEMORY', c.memory],
    ['KNOWLEDGE', c.knowledge],
    ['WORKFLOW', c.workflow],
    ['TEMPLATE', c.template],
    ['PROMPT RULE', c.prompt],
    ['QUALITY CHECK', c.quality_check],
    ['FINAL OUTPUT', c.final_output],
  ];

  const metadata = [];
  if (c.studio) metadata.push('CMS STUDIO: ' + c.studio);
  if (c.feature) metadata.push('CMS FEATURE: ' + c.feature);
  if (c.tab) metadata.push('CMS TAB: ' + c.tab);
  if (c.step) metadata.push('CMS STEP: ' + c.step);
  if (c.version) metadata.push('CMS VERSION: ' + c.version);
  if (context && context.previousOutput) metadata.push('PREVIOUS WORKFLOW OUTPUT IS PROVIDED BY THE USER CONTEXT. Preserve continuity where appropriate.');

  const blocks = [];
  if (metadata.length) blocks.push('WORKFLOW CONTEXT:\n' + metadata.join('\n'));
  blocks.push(...sections
    .filter(([label, val]) => val && String(val).trim())
    .map(([label, val]) => label + ':\n' + String(val).trim()));
  return blocks.join('\n\n');
}

export { CMS_WORKFLOW, workflowFor, getCMSData, buildSystemPrompt };
