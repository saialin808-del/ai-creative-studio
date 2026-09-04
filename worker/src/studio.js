// AI Creative Studio — Studio Service (Phase 3d — text + image)
import { getCMSData, buildSystemPrompt } from './cms';
import { callGeminiText, callGeminiImage } from './ai';

const IMAGE_STUDIOS = ['IMAGE'];

async function generateImage(env, { studio, type, idea, plan, apiKey }) {
  if (!idea || !String(idea).trim()) throw new Error('missing_idea');
  const c = await getCMSData(env, studio, plan, type);
  const system = c ? buildSystemPrompt(c) : '';
  const prompt = system ? (system + '\n\n' + String(idea).trim()) : String(idea).trim();
  const img = await callGeminiImage(env, { model: 'gemini-3.1-flash-image', prompt, apiKey });
  return { studio, type, plan, data: img.data, mimeType: img.mimeType };
}

async function generateStudio(env, opts) {
  if (IMAGE_STUDIOS.includes(String(opts.studio).toUpperCase())) {
    return generateImage(env, opts);
  }
  if (!opts.studio) throw new Error('missing_studio');
  if (!opts.idea || !String(opts.idea).trim()) throw new Error('missing_idea');
  const c = await getCMSData(env, opts.studio, opts.plan, opts.type);
  const system = c ? buildSystemPrompt(c) : '';
  const output = await callGeminiText(env, {
    model: opts.model || 'gemini-3.6-flash',
    system: system,
    prompt: String(opts.idea).trim(),
    apiKey: opts.apiKey,
  });
  return { studio: opts.studio, type: opts.type, plan: opts.plan, output };
}

export { generateStudio };
