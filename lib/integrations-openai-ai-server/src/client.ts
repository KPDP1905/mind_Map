import OpenAI from "openai";

function createClient(): OpenAI {
  if (!process.env.AI_INTEGRATIONS_OPENAI_BASE_URL) {
    throw new Error(
      "AI_INTEGRATIONS_OPENAI_BASE_URL must be set. Did you forget to provision the OpenAI AI integration?",
    );
  }

  if (!process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
    throw new Error(
      "AI_INTEGRATIONS_OPENAI_API_KEY must be set. Did you forget to provision the OpenAI AI integration?",
    );
  }

  return new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });
}

let _client: OpenAI | null = null;

export const openai = new Proxy({} as OpenAI, {
  get(_target, prop) {
    if (!_client) {
      _client = createClient();
    }
    const val = (_client as any)[prop];
    return typeof val === "function" ? val.bind(_client) : val;
  },
});
