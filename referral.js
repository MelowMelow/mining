// referral.js
export function initializeReferral() {
    document.getElementById("friends").style.display = "none";

    function copyToClipboard(text) {
        // Create temporary textarea
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed'; // Avoid scrolling
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        
        try {
            // Try modern clipboard API first
            navigator.clipboard.writeText(text)
                .then(() => alert("Link copied to clipboard!"))
                .catch(() => {
                    // Fallback to older method
                    textarea.select();
                    document.execCommand('copy');
                    alert("Link copied to clipboard!");
                });
        } catch (err) {
            // If all else fails, show the link to manually copy
            alert("Please copy this link: " + text);
        } finally {
            // Clean up
            document.body.removeChild(textarea);
        }
    }

    window.copyToClipboard = copyToClipboard;

    document.getElementById("showFriendsButton").addEventListener("click", function() {
        const friendsDiv = document.getElementById("friends");
        if (friendsDiv.style.display === "none" || !friendsDiv.style.display) {
            const telegramId = localStorage.getItem("telegramId");
            if (telegramId) {
                const referralLink = `https://t.me/TheMineCryptoBot?start=${telegramId}`;
                document.getElementById("referralLinkPlaceholder").innerHTML = 
                    `<a href="#" onclick="event.preventDefault(); copyToClipboard('${referralLink}')">Click to copy referral link</a>`;
            }
            friendsDiv.style.display = "block";
        } else {
            friendsDiv.style.display = "none";
        }
    });
}