document.addEventListener('DOMContentLoaded', function() {
  const toggleButton = document.getElementById('toggle-button');
  const statusText = document.getElementById('status-text');
  const credentialsForm = document.getElementById('credentials-form');
  const usernameInput = document.getElementById('username');
  const tokenInput = document.getElementById('token');

  chrome.storage.local.get(['isExtensionOn', 'githubUsername', 'githubToken'], function(data) {
    if (data.isExtensionOn) {
      toggleButton.classList.add('on');
      statusText.textContent = 'ON';
    } else {
      toggleButton.classList.remove('on');
      statusText.textContent = 'OFF';
    }

    if (data.githubUsername) {
      usernameInput.value = data.githubUsername;
    }

    if (data.githubToken) {
      tokenInput.value = data.githubToken;
    }
  });

  toggleButton.addEventListener('click', function() {
    chrome.storage.local.get('isExtensionOn', function(data) {
      const isExtensionOn = !data.isExtensionOn;
      chrome.storage.local.set({ isExtensionOn: isExtensionOn }, function() {
        if (isExtensionOn) {
          toggleButton.classList.add('on');
          statusText.textContent = 'ON';
        } else {
          toggleButton.classList.remove('on');
          statusText.textContent = 'OFF';
        }
      });
    });
  });

  credentialsForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const githubUsername = usernameInput.value;
    const githubToken = tokenInput.value;
    chrome.storage.local.set({
      githubUsername: githubUsername,
      githubToken: githubToken
    }, function() {
      alert('Credentials saved successfully!');
    });
  });
});
