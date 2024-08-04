const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'translate') {
    handleTranslation(request.text, request.source, request.target)
      .then(sendResponse)
      .catch((error) => {
        sendResponse({ error: error.message });
      });
    return true; // Indicates that the response is sent asynchronously
  }
});

async function handleTranslation(text, source, target) {
  const settings = await browserAPI.storage.sync.get(['apiBaseUrl', 'apiKey', 'model', 'firstPrompt', 'reflectionPrompt', 'secondPrompt']);

  const firstOutput = await getCompletion(settings, settings.firstPrompt, { source_text: text, source_lang: source, target_lang: target });
  const reflectionOutput = await getCompletion(settings, settings.reflectionPrompt, { source_text: text, source_lang: source, target_lang: target, translation_1: firstOutput });
  const secondOutput = await getCompletion(settings, settings.secondPrompt, { source_text: text, source_lang: source, target_lang: target, translation_1: firstOutput, reflection: reflectionOutput });

  return {
    first: firstOutput,
    reflection: reflectionOutput,
    second: secondOutput
  };
}

async function getCompletion(settings, prompt, variables) {

  if (!prompt) {
    throw new Error('Prompt is missing');
  }

  const fullPrompt = replaceVariables(prompt, variables);

  const response = await fetch(`${settings.apiBaseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify({
      model: settings.model,
      messages: [{ role: 'user', content: fullPrompt }]
    })
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

function replaceVariables(text, variables) {
  if (typeof text !== 'string') {
    return ''; // Return an empty string or some default value
  }
  return text.replace(/{(\w+)}/g, (match, key) => {
    if (variables.hasOwnProperty(key)) {
      return variables[key];
    }
    return match; // Return the original placeholder if the variable is not found
  });
}