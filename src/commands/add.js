import { loadConfig } from '../lib/config.js';
import { printHeader } from '../lib/ui.js';
import { addProfileFlow } from '../lib/profile-flow.js';

/**
 * Add a new profile
 * Delegates to addProfileFlow for the interactive flow
 */
export async function addCommand() {
  printHeader();
  const config = loadConfig();
  await addProfileFlow(config);
}
