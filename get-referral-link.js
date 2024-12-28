function generateTelegramReferralLink(botUsername) {
    // Get the Telegram ID from localStorage
    const telegramId = localStorage.getItem("telegramId");

    if (!telegramId) {
        console.error("Telegram ID not found in localStorage.");
        return null; // Or handle the case where the Telegram ID isn't set
    }

    // Generate the referral link
    const referralLink = `https://t.me/${botUsername}?start=${telegramId}`;
    return referralLink;
}

// Display the referral link in a specific element
function showReferralLinkInFriendsSection(botUsername) {
    const referralLink = generateTelegramReferralLink(botUsername);

    if (!referralLink) {
        return; // Exit if the referral link couldn't be generated
    }

    // Select the "friends" element
    const friendsElement = document.getElementById("friends");

    // Create an anchor element for the referral link
    const linkElement = document.createElement("a");
    linkElement.href = referralLink;
    linkElement.textContent = "Click here to share your referral link!";
    linkElement.target = "_blank"; // Optional: Open the link in a new tab

    // Append the referral link to the friends section
    friendsElement.appendChild(linkElement);
	const friendsDiv = document.getElementById("friends");
    friendsDiv.style.display = "block"; // Make the frame visible
}

// Example usage
const botUsername = "TheMineCryptoBot"; // Replace with your bot's username
showReferralLinkInFriendsSection(botUsername);
