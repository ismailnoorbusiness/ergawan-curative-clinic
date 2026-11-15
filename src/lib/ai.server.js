import { openaiCompatibleText } from "@tanstack/ai-openai/compatible";

// Creates an OpenAI-compatible model adapter for server-side AI requests.
// The supplied service client provides the configured gateway connection.
export const gatewayModel = (serviceClient, model = "automatic") => {
  const { baseURL, token, headers } = serviceClient.asServiceRole.aiGateway.connection();
  return openaiCompatibleText(model, { name: "clinic-ai", baseURL, apiKey: token, defaultHeaders: headers });
};