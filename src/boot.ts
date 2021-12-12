import * as log from 'std/log';
import { Intents } from 'harmony';
import { BodocordClient } from './structures/BodocordClient.ts';
import { getConfig } from './util/configUtil.ts';

interface EnvironmentVariables {
  BC_CONFIG: string;
  BC_TOKEN: string;
}

/**
 * Get the necessary environment variables
 * 
 * Requires `allow-env` for `BC_CONFIG` and `BC_TOKEN`
 */
const getEnv = function getNecessaryEnvironmentVariables(): EnvironmentVariables {
  const BC_CONFIG = Deno.env.get('BC_CONFIG');
  if(typeof BC_CONFIG !== 'string') {
    throw new Error('Specify the config file path to environment variable \"BC_CONFIG\".');
  }
  
  const BC_TOKEN = Deno.env.get('BC_TOKEN');
  if(typeof BC_TOKEN !== 'string') {
    throw new Error('Specify the client\'s token to environment variable \"BC_TOKEN\".');
  }

  return {
    BC_CONFIG,
    BC_TOKEN
  };
}

const boot = async function bootBot() {
  // Get token
  const { BC_CONFIG, BC_TOKEN } = getEnv();

  // Get config
  const config = getConfig(BC_CONFIG);

  // Setup config
  await log.setup(config.logConfig);

  // Create client
  const client = new BodocordClient(log.getLogger('Client'));

  // Connect gateway
  client.connect(BC_TOKEN, Intents.None);
}