chrome.storage.sync.get(['githubUsername', 'githubToken'], function(data) {
    const username = data.githubUsername;
    const token = data.githubToken;
  
    if (!username || !token) {
        console.log('GitHub credentials not found.');
        return;
    }
});

async function checkFollowerStatus(userToCheck) {
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

browser.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
    if (request.action === "checkFollowerStatus") {
        try {
            const isFollower = await checkFollowerStatus(request.username);
            sendResponse({isFollower});
        } catch (error) {
            console.error('Error:', error);
            sendResponse({isFollower: false});
        }
        return true;
    }
});