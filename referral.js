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
                    `<span>${referralLink}</span>`;
					
            }
            friendsDiv.style.display = "block";
			alert('Referral System Will Work Soon');
        } else {
            friendsDiv.style.display = "none";
        }
    });
}