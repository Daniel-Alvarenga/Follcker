async function processFollowers(username, token) {
  const followers = document.querySelectorAll(".d-table.table-fixed");
  console.log("Processando seguidores, total:", followers.length);
  for (const follower of followers) {
    const userLink = follower.querySelector('a[data-hovercard-type="user"]');

    if (userLink) {
      const userToCheck = userLink.getAttribute("href").substring(1);

      const isBackFollower = await isFollower(userToCheck, username, token);

      const status = isBackFollower ? "(follows you)" : "";

      const statusElement = document.createElement("span");
      statusElement.textContent = status;
      statusElement.style.fontSize = "small";
      statusElement.style.color = "gray";
      statusElement.alt = "Follcker";
      statusElement.className = "follcker-element";

      const receivBlock = follower.querySelector(
        "div.d-table-cell.col-2.v-align-top.text-right"
      );
      if (receivBlock) {
        receivBlock.appendChild(statusElement);
      }
    }
  }
}

function removeElements() {
  const elements = document.querySelectorAll("span.follcker-element");

  console.log(`Limpando elementos já colocados: ${elements.length}`);

  elements.forEach((element, index) => {
    element.remove();
  });
}

browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "removeElements") {
    removeElements();
  } else if (request.action === "load") {
    trackFollowers();
  }
});

async function isFollower(userToCheck, username, token) {
  try {
    const isFollower = await consultFollowStat(userToCheck, username, token);
    return isFollower;
  } catch (error) {
    console.error("Error:", error);
    return false;
  }
}

async function consultFollowStat(userToCheck, username, token) {
  let page = 1;
  let followers = [];

  while (true) {
    const response = await fetch(
      `https://api.github.com/users/${username}/followers?page=${page}`,
      {
        headers: {
          Authorization: `token ${token}`,
        },
      }
    );
    const data = await response.json();

    if (data.length === 0) break;

    followers = followers.concat(data);
    page++;
  }

  return followers.some((follower) => follower.login === userToCheck);
}

function trackFollowers() {
  browser.storage.local.get(["githubUsername", "githubToken"], function (data) {
    const username = data.githubUsername;
    const token = data.githubToken;

    if (!username || !token) {
      return;
    } else {
      browser.storage.local.get("isExtensionOn", function (data) {
        removeElements();

        if (data.isExtensionOn == true) {
          processFollowers(username, token);
        }
      });
    }
  });
}

trackFollowers();

browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "on") {
    trackFollowers();
  }
});

function trackURLChange() {
  let lastURL = window.location.href;

  new MutationObserver(() => {
    const currentURL = window.location.href;
    if (lastURL !== currentURL) {
      console.log('Mudança de página');
      lastURL = currentURL;
      
      trackFollowers();
    }
  }).observe(document, { subtree: true, childList: true });

  window.addEventListener("popstate", () => {
    const currentURL = window.location.href;
    if (lastURL !== currentURL) {
      console.log('Mudança de página');
      lastURL = currentURL;
      
      trackFollowers();
    }
  });
}

trackURLChange();
