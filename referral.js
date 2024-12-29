// referral.js
export function initializeReferral() {
    // Initial hide
    const friendsDiv = document.getElementById("friends");
    if (friendsDiv) {
        friendsDiv.style.display = "none";
    }

    // Separate functions for clarity
    function generateTelegramReferralLink() {
        const telegramId = localStorage.getItem("telegramId");
        if (!telegramId) return null;
        return `https://t.me/TheMineCryptoBot?start=${telegramId}`;
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text)
            .then(() => alert("Link copied to clipboard!"))
            .catch(err => console.error('Failed to copy:', err));
    }

    // Make copy function globally available
    window.copyToClipboard = copyToClipboard;

    // Button click handler
    const showFriendsButton = document.getElementById("showFriendsButton");
    if (showFriendsButton) {
        showFriendsButton.addEventListener("click", function() {
            const friendsDiv = document.getElementById("friends");
            const placeholderDiv = document.getElementById("referralLinkPlaceholder");
            
            if (!friendsDiv || !placeholderDiv) {
                console.error("Required elements not found");
                return;
            }

            if (friendsDiv.style.display === "none" || !friendsDiv.style.display) {
                // Generate link
                const referralLink = generateTelegramReferralLink();
                
                // Update placeholder with link
                if (referralLink) {
                    placeholderDiv.innerHTML = `
                        <a href="#" onclick="event.preventDefault(); 
                        copyToClipboard('${referralLink}')">
                            Click to copy your referral link
                        </a>`;
                }
                
                // Show the div
                friendsDiv.style.display = "block";
            } else {
                // Hide the div
                friendsDiv.style.display = "none";
            }
        });
    }
}