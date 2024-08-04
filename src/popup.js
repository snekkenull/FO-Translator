document.addEventListener('DOMContentLoaded', function() {
  const translateBtn = document.getElementById('translateBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const sourceText = document.getElementById('sourceText');
  const srcLang = document.getElementById('srcLang');
  const tagLang = document.getElementById('tagLang');
  const outputFirst = document.getElementById('outputFirst');
  const reflectionText = document.getElementById('reflectionText');
  const outputSec = document.getElementById('outputSec');
  const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

  // Load default language values
  browserAPI.storage.sync.get(['srcLang', 'tagLang']).then(function(result) {
    srcLang.value = result.srcLang || 'auto';
    tagLang.value = result.tagLang || 'en';
  });

  translateBtn.addEventListener('click', async function() {
    const text = sourceText.value;
    const source = srcLang.value;
    const target = tagLang.value;

    if (!text || !source || !target) {
      alert('Please fill in all fields');
      return;
    }

    outputFirst.textContent = 'Translating...';
    reflectionText.textContent = 'Thinking...';
    outputSec.textContent = 'Improving...';

    try {
      const result = await browserAPI.runtime.sendMessage({
        action: 'translate',
        text,
        source,
        target
      });

      outputFirst.textContent = result.first;
      reflectionText.textContent = result.reflection;
      outputSec.textContent = result.second;
    } catch (error) {
      console.error('Translation error:', error);
      outputFirst.textContent = 'Error: ' + error.message;
    }
  });

  settingsBtn.addEventListener('click', function() {
    browserAPI.runtime.openOptionsPage();
  });
});