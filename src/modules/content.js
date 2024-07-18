const followers = document.querySelectorAll('.d-table.table-fixed');
// console.log("Seguindo: " + followers.length);

followers.forEach(follower => {
    const userLink = follower.querySelector('a[data-hovercard-type="user"]');
    
    const username = userLink.getAttribute('href').substring(1);
    // console.log(username);

    if (userLink) {
        browser.runtime.sendMessage({action: "checkFollowerStatus", username: username}, function(response) {
            const status = response.isFollower ? 'Follows you' : 'Doesn\'t follow you';
            
            const statusElement = document.createElement('span');
            
            statusElement.textContent = status;
            statusElement.style.fontSize = 'small';
            statusElement.style.color = 'gray';
            statusElement.alt = 'Follower Tracker';

            const receivBlock = follower.querySelector('div.d-table-cell.col-9.v-align-top.pr-3');
            if (receivBlock) {
                receivBlock.appendChild(statusElement);
            }
        });
    }
});

observer.observe(document, { childList: true, subtree: true });
