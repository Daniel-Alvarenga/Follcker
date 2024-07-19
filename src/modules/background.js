const followers = document.querySelectorAll('.d-table.table-fixed');

async function processFollowers(username, token) {
    for (const follower of followers) {
        const userLink = follower.querySelector('a[data-hovercard-type="user"]');

        if (userLink) {
            const userToCheck = userLink.getAttribute('href').substring(1);

            const isBackFollower = await isFollower(userToCheck, username, token);

            const status = isBackFollower ? 'Follows you' : 'Doesn\'t follow you';

            const statusElement = document.createElement('span');
            statusElement.textContent = status;
            statusElement.style.fontSize = 'small';
            statusElement.style.color = 'gray';
            statusElement.alt = 'Follower Tracker';

            const receivBlock = follower.querySelector('div.d-table-cell.col-9.v-align-top.pr-3');
            if (receivBlock) {
                receivBlock.appendChild(statusElement);
            }
        }
    }
}

async function isFollower(userToCheck, username, token){
    try {
        const isFollower = await consultFollowStat(userToCheck, username, token);
        return isFollower;
    } catch (error) {
        console.error('Error:', error);
        return false;
    }
}

async function consultFollowStat(userToCheck, username, token) {
    let page = 1;
    let followers = [];

    while (true) {
        const response = await fetch(`https://api.github.com/users/${username}/followers?page=${page}`, {
            headers: {
                'Authorization': `token ${token}`
            }
        });
        const data = await response.json();

        if (data.length === 0) break;

        followers = followers.concat(data);
        page++;
    }

    return followers.some(follower => follower.login === userToCheck);
}

chrome.storage.local.get(['githubUsername', 'githubToken'], function(data) {
    console.log('Storage data retrieved:', data);
    var isExtensionOn = false;

    chrome.storage.local.get('isExtensionOn', function(data) {
        isExtensionOn = data.isExtensionOn;
    });

    const username = data.githubUsername;
    const token = data.githubToken;

    if (!username || !token) {
        console.log('GitHub credentials not found.');
        return;
    } else {
        console.log('Extensão ativa:', isExtensionOn);
        console.log('GitHub Username:', username);
        console.log('GitHub Token:', token);

        processFollowers(username, token);
    }
});