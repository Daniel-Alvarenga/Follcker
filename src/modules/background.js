async function processFollowers(username, token) {
  const followers = document.querySelectorAll(".d-table.table-fixed");
  console.log("Processando...");
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
      statusElement.class = "follcker-element";

      const receivBlock = follower.querySelector(
        "div.d-table-cell.col-2.v-align-top.text-right"
      );
      if (receivBlock) {
        receivBlock.appendChild(statusElement);
      }
    }
  }
}

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
    console.log("Storage data retrieved:", data);

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

browser.runtime.onMessage.addListener(function (request) {
  removeElements();

  if (request.action === "on") {
    trackFollowers();
  }
});

function removeElements() {
  console.log("Limpando elementos já colocados");
  const elements = document.querySelectorAll(".follcker-element");

  elements.forEach((element) => {
    element.remove();
  });
}

trackFollowers();
