// AI Creative Studio — CMS Engine (Phase 3b)
async function getCMSData(env, studio, plan, type) {
  const { results } = await env.DB.prepare(
    'SELECT core, memory, knowledge, workflow, template, prompt, quality_check, final_output ' +
    'FROM cms_prompts WHERE lower(studio)=lower(?) AND lower(plan)=lower(?) AND type=?'
  ).bind(studio, plan, type).all();
  return results && results.length ? results[0] : null;
}

function buildSystemPrompt(c) {
  if (!c) return '';
  const parts = [];
  if (c.core) parts.push(c.core);
  if (c.memory) parts.push(c.memory);
  if (c.knowledge) parts.push(c.knowledge);
  if (c.workflow) parts.push(c.workflow);
  if (c.template) parts.push(c.template);
  if (c.prompt) parts.push('PROMPT RULE:\n' + c.prompt);
  if (c.quality_check) parts.push('QUALITY CHECK:\n' + c.quality_check);
  if (c.final_output) parts.push('FINAL OUTPUT:\n' + c.final_output);
  return parts.join('\n').trim();
}

export { getCMSData, buildSystemPrompt };
