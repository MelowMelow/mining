// referral.js
export function initializeReferral() {
    document.getElementById("friends").style.display = "none";

    function generateTelegramReferralLink(botUsername) {
        const telegramId = localStorage.getItem("telegramId");
        return telegramId ? `https://t.me/${botUsername}?start=${telegramId}` : null;
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            alert("Link copied to clipboard!");
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    }

    window.copyToClipboard = copyToClipboard;

    document.getElementById("showFriendsButton").addEventListener("click", function() {
        const friendsDiv = document.getElementById("friends");
        if (friendsDiv.style.display === "none" || !friendsDiv.style.display) {
            const referralLink = generateTelegramReferralLink("TheMineCryptoBot");
            if (referralLink) {
                document.getElementById("referralLinkPlaceholder").innerHTML = 
                    `<a href="#" onclick="event.preventDefault(); copyToClipboard('${referralLink}')">Click to copy referral link</a>`;
                friendsDiv.style.display = "block";
            }
        } else {
            friendsDiv.style.display = "none";
        }
    });
}