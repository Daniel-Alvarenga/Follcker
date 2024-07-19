document.addEventListener("DOMContentLoaded", function () {
  const toggleButton = document.getElementById("toggle-button");
  const sucessMessage = document.getElementById("saved");
  const saveButton = document.getElementById("save-button");
  const statusText = document.getElementById("status-text");
  const credentialsForm = document.getElementById("credentials-form");
  const usernameInput = document.getElementById("username");
  const tokenInput = document.getElementById("token");

  browser.storage.local.get(
    ["isExtensionOn", "githubUsername", "githubToken"],
    function (data) {
      if (data.isExtensionOn) {
        toggleButton.classList.add("on");
        statusText.textContent = "ON";
      } else {
        toggleButton.classList.remove("on");
        statusText.textContent = "OFF";
      }

      if (data.githubUsername) {
        usernameInput.value = data.githubUsername;
      }

      if (data.githubToken) {
        tokenInput.value = data.githubToken;
      }
    }
  );

  toggleButton.addEventListener("click", function () {
    browser.storage.local.get("isExtensionOn", function (data) {
      const isExtensionOn = !data.isExtensionOn;
      browser.storage.local.set({ isExtensionOn: isExtensionOn }, function () {
        if (isExtensionOn) {
          toggleButton.classList.add("on");
          statusText.textContent = "ON";

          browser.runtime.sendMessage({ action: "on" });
        } else {
          toggleButton.classList.remove("on");
          statusText.textContent = "OFF";

          browser.runtime.sendMessage({ action: "off" });
        }
      });
    });
  });

  credentialsForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const githubUsername = usernameInput.value;
    const githubToken = tokenInput.value;
    browser.storage.local.set(
      {
        githubUsername: githubUsername,
        githubToken: githubToken,
      },
      function () {
        saveButton.style.display = 'none';
        sucessMessage.style.display = 'flex';
      }
    );
  });
});
