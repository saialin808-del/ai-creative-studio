// AI Creative Studio — Studio Service (Phase 3c — unified text generation)
import { getCMSData, buildSystemPrompt } from './cms';
import { callGeminiText } from './ai';

async function generateStudio(env, { studio, type, idea, plan, apiKey, model }) {
  if (!studio) throw new Error('missing_studio');
  if (!idea || !String(idea).trim()) throw new Error('missing_idea');
  const c = await getCMSData(env, studio, plan, type);
  const system = c ? buildSystemPrompt(c) : '';
  const output = await callGeminiText(env, {
    model: model || 'gemini-3.6-flash',
    system: system,
    prompt: String(idea).trim(),
    apiKey: apiKey,
  });
  return { studio, type, plan, output };
}

export { generateStudio };
