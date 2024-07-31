document.addEventListener('DOMContentLoaded', function() {
  const apiBaseUrl = document.getElementById('apiBaseUrl');
  const apiKey = document.getElementById('apiKey');
  const model = document.getElementById('model');
  const srcLang = document.getElementById('srcLang');
  const tagLang = document.getElementById('tagLang');
  const firstPrompt = document.getElementById('firstPrompt');
  const reflectionPrompt = document.getElementById('reflectionPrompt');
  const secondPrompt = document.getElementById('secondPrompt');
  const saveBtn = document.getElementById('saveBtn');
  const resetBtn = document.getElementById('resetBtn');

  // Load saved settings
  chrome.storage.sync.get(['apiBaseUrl', 'apiKey', 'model', 'srcLang', 'tagLang', 'firstPrompt', 'reflectionPrompt', 'secondPrompt'], function(result) {
    apiBaseUrl.value = result.apiBaseUrl || 'https://api.openai.com';
    apiKey.value = result.apiKey || 'sk-12345';
    model.value = result.model || 'gpt-3.5-turbo';
    srcLang.value = result.srcLang || 'auto';
    tagLang.value = result.tagLang || 'English';
    firstPrompt.value = result.firstPrompt || 'You are an expert linguist, specializing in translation from {src_lang} to {tag_lang},  please provide the {tag_lang} translation for this text. \
Do not provide any explanations or text apart from the translation.\n \
{src_lang}: {source_text}\n \
{tag_lang}: ';
    reflectionPrompt.value = result.reflectionPrompt || 'You are an expert linguist specializing in translation from {src_lang} to {tag_lang}. \
You will be provided with a source text and its translation and your goal is to improve the translation. \
Your task is to carefully read a source text and a translation from {src_lang} to {tag_lang}, and then give constructive criticism and helpful suggestions to improve the translation. \
The source text and initial translation, delimited by XML tags <SOURCE_TEXT></SOURCE_TEXT> and <TRANSLATION></TRANSLATION>, are as follows:\n \
<SOURCE_TEXT>\n \
{source_text}\n \
</SOURCE_TEXT>\n \
<TRANSLATION>\n \
{output_first}\n \
</TRANSLATION>\n \
When writing suggestions, pay attention to whether there are ways to improve the translation\'s \n \
(i) accuracy (by correcting errors of addition, mistranslation, omission, or untranslated text),\n \
(ii) fluency (by applying {tag_lang} grammar, spelling and punctuation rules, and ensuring there are no unnecessary repetitions),\n \
(iii) style (by ensuring the translations reflect the style of the source text and take into account any cultural context),\n \
(iv) terminology (by ensuring terminology use is consistent and reflects the source text domain; and by only ensuring you use equivalent idioms {tag_lang}).\n \
Write a list of specific, helpful and constructive suggestions for improving the translation.\
Each suggestion should address one specific part of the translation.\
Output only the suggestions and nothing else.';
    secondPrompt.value = result.secondPrompt || 'You are an expert linguist, specializing in translation editing from {src_lang} to {tag_lang}. \
Your task is to carefully read, then edit, a translation from {src_lang} to {tag_lang}, taking into account a list of expert suggestions and constructive criticisms. \
The source text, the initial translation, and the expert linguist suggestions are delimited by XML tags <SOURCE_TEXT></SOURCE_TEXT>, <TRANSLATION></TRANSLATION> and <EXPERT_SUGGESTIONS></EXPERT_SUGGESTIONS> \
as follows: \n \
<SOURCE_TEXT>\n \
{source_text}\n \
</SOURCE_TEXT>\n \
<TRANSLATION>\n \
{output_first}\n \
</TRANSLATION>\n \
<EXPERT_SUGGESTIONS>\n \
{output_reflection}\n \
</EXPERT_SUGGESTIONS>\n \
Please take into account the expert suggestions when editing the translation. Edit the translation by ensuring:\n \
(i) accuracy (by correcting errors of addition, mistranslation, omission, or untranslated text),\n \
(ii) fluency (by applying {tag_lang} grammar, spelling and punctuation rules and ensuring there are no unnecessary repetitions), \n \
(iii) style (by ensuring the translations reflect the style of the source text)\n \
(iv) terminology (inappropriate for context, inconsistent use), or\n \
(v) other errors.\n \
Output only the new translation and nothing else.';
  });

  saveBtn.addEventListener('click', function() {
    chrome.storage.sync.set({
      apiBaseUrl: apiBaseUrl.value,
      apiKey: apiKey.value,
      model: model.value,
      srcLang: srcLang.value,
      tagLang: tagLang.value,
      firstPrompt: firstPrompt.value,
      reflectionPrompt: reflectionPrompt.value,
      secondPrompt: secondPrompt.value
    }, function() {
      alert('Settings saved');
    });
  });

  resetBtn.addEventListener('click', function() {
    apiBaseUrl.value = 'https://api.openai.com';
    apiKey.value = 'sk-12345';
    model.value = 'gpt-3.5-turbo';
    srcLang.value = 'auto';
    tagLang.value = 'English';
    firstPrompt.value = 'You are an expert linguist, specializing in translation from {src_lang} to {tag_lang},  please provide the {tag_lang} translation for this text. \
Do not provide any explanations or text apart from the translation.\n \
{src_lang}: {source_text}\n \
{tag_lang}: ';
    reflectionPrompt.value = 'You are an expert linguist specializing in translation from {src_lang} to {tag_lang}. \
You will be provided with a source text and its translation and your goal is to improve the translation. \
Your task is to carefully read a source text and a translation from {src_lang} to {tag_lang}, and then give constructive criticism and helpful suggestions to improve the translation. \
The source text and initial translation, delimited by XML tags <SOURCE_TEXT></SOURCE_TEXT> and <TRANSLATION></TRANSLATION>, are as follows:\n \
<SOURCE_TEXT>\n \
{source_text}\n \
</SOURCE_TEXT>\n \
<TRANSLATION>\n \
{output_first}\n \
</TRANSLATION>\n \
When writing suggestions, pay attention to whether there are ways to improve the translation\'s \n \
(i) accuracy (by correcting errors of addition, mistranslation, omission, or untranslated text),\n \
(ii) fluency (by applying {tag_lang} grammar, spelling and punctuation rules, and ensuring there are no unnecessary repetitions),\n \
(iii) style (by ensuring the translations reflect the style of the source text and take into account any cultural context),\n \
(iv) terminology (by ensuring terminology use is consistent and reflects the source text domain; and by only ensuring you use equivalent idioms {tag_lang}).\n \
Write a list of specific, helpful and constructive suggestions for improving the translation.\
Each suggestion should address one specific part of the translation.\
Output only the suggestions and nothing else.';
    secondPrompt.value = 'You are an expert linguist, specializing in translation editing from {src_lang} to {tag_lang}. \
Your task is to carefully read, then edit, a translation from {src_lang} to {tag_lang}, taking into account a list of expert suggestions and constructive criticisms. \
The source text, the initial translation, and the expert linguist suggestions are delimited by XML tags <SOURCE_TEXT></SOURCE_TEXT>, <TRANSLATION></TRANSLATION> and <EXPERT_SUGGESTIONS></EXPERT_SUGGESTIONS> \
as follows: \n \
<SOURCE_TEXT>\n \
{source_text}\n \
</SOURCE_TEXT>\n \
<TRANSLATION>\n \
{output_first}\n \
</TRANSLATION>\n \
<EXPERT_SUGGESTIONS>\n \
{output_reflection}\n \
</EXPERT_SUGGESTIONS>\n \
Please take into account the expert suggestions when editing the translation. Edit the translation by ensuring:\n \
(i) accuracy (by correcting errors of addition, mistranslation, omission, or untranslated text),\n \
(ii) fluency (by applying {tag_lang} grammar, spelling and punctuation rules and ensuring there are no unnecessary repetitions), \n \
(iii) style (by ensuring the translations reflect the style of the source text)\n \
(iv) terminology (inappropriate for context, inconsistent use), or\n \
(v) other errors.\n \
Output only the new translation and nothing else.';
  });
});
