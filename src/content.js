let floatingIcon = null;
let floatingBox = null;
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
document.addEventListener('mouseup', handleTextSelection);

function handleTextSelection() {
  const selectedText = window.getSelection().toString().trim();

  if (selectedText) {
    showFloatingIcon(selectedText);
  } else {
    removeFloatingElements();
  }
}

function showFloatingIcon(selectedText) {
  removeFloatingElements();

  floatingIcon = document.createElement('div');
  floatingIcon.innerHTML = '🌐';
  floatingIcon.style.cssText = `
      position: fixed;
      cursor: pointer;
      background-color: #4a90e2;
      color: white;
      padding: 5px;
      border-radius: 50%;
      z-index: 2147483647;
      font-size: 20px;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
  `;

  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  floatingIcon.style.left = `${rect.right + 5}px`;
  floatingIcon.style.top = `${rect.top - 30}px`;

  // using mousedown event to keep the selection
  floatingIcon.addEventListener('mousedown', (event) => {
      event.preventDefault(); // stop default behavior
      event.stopPropagation(); // stop event propagation

      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      selection.removeAllRanges(); // clear previous selection
      selection.addRange(range); // reset the selection
  });

  // using mouseup event to trigger translation
  floatingIcon.addEventListener('mouseup', (event) => {
      event.stopPropagation(); // stop the selection
      translateSelectedText(selectedText); // call the translation function
  });

  document.body.appendChild(floatingIcon);
}


function translateSelectedText(text) {
  console.log('Translating text:', text);
  browserAPI.storage.sync.get(['srcLang', 'tagLang'], function(settings) {
    const source = settings?.srcLang || 'auto';
    const target = settings?.tagLang || 'en';

    showFloatingBox('Translating...', text);

    browserAPI.runtime.sendMessage({
      action: 'translate',
      text: text,
      source: source,
      target: target
    }, (response) => {
      if (response.error) {
        updateFloatingBox(`Error: ${response.error}`);
      } else {
        updateFloatingBox(response.second); // Display the final translation
      }
    });
  });
}

function showFloatingBox(content) {
  console.log('Showing floating box');
  removeFloatingElements();

  floatingBox = document.createElement('div');
  floatingBox.style.cssText = `
    position: fixed;
    background-color: white;
    color: black;
    border: 1px solid #ccc;
    padding: 10px;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    z-index: 2147483647;
    max-width: 300px;
    word-wrap: break-word;
  `;

  floatingBox.textContent = content;

  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  // Position the floating box near the selected text
  const left = Math.min(rect.left, window.innerWidth - 300); // Ensure the box doesn't exceed window width
  const top = rect.bottom + 5;

  floatingBox.style.left = `${left}px`;
  floatingBox.style.top = `${top}px`;

  document.body.appendChild(floatingBox);

  // Close the floating box when clicking outside of it
  document.addEventListener('mousedown', closeFloatingBox);
}

function updateFloatingBox(content) {
  if (floatingBox) {
    floatingBox.textContent = content;
  }
}

function closeFloatingBox(event) {
  if (floatingBox && !floatingBox.contains(event.target) && (!floatingIcon || !floatingIcon.contains(event.target))) {
    removeFloatingElements();
    document.removeEventListener('mousedown', closeFloatingBox);
  }
}

function removeFloatingElements() {
  if (floatingIcon) {
    floatingIcon.remove();
    floatingIcon = null;
  }
  if (floatingBox) {
    floatingBox.remove();
    floatingBox = null;
  }
}