// referral.js
export function initializeReferral() {
    document.getElementById("friends").style.display = "none";

    document.getElementById("showFriendsButton").addEventListener("click", function() {
        const friendsDiv = document.getElementById("friends");
        if (friendsDiv.style.display === "none" || !friendsDiv.style.display) {
            const telegramId = localStorage.getItem("telegramId");
            if (telegramId) {
                const referralLink = `https://t.me/TheMineCryptoBot?start=${telegramId}`;
                document.getElementById("referralLinkPlaceholder").innerHTML = 
                    `<a href="${referralLink}" target="_blank">Click here to get your referral link!</a>`;
            }
            friendsDiv.style.display = "block";
        } else {
            friendsDiv.style.display = "none";
        }
    });
}