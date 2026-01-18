$(function () {
    $("#includedContent").load("navbar.html");
    $("#Content").load("footer.html");
    renderRobotCards();
});

const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1377087321203150941/iK28JWFiXjPouGOpEVnvhExkIqPdp8H7P7HT5oSJHdpPFOgMsOde9s8fD-xSnyl_MNbQ";

async function handleDownload(robotVersion, teamNumberInputId, statusMessageId, downloadFilePath) {
    const teamNumberInput = document.getElementById(teamNumberInputId);
    const statusMessage = document.getElementById(statusMessageId);
    const teamNumber = teamNumberInput.value.trim();

    statusMessage.textContent = '';
    statusMessage.className = 'status-message';

    if (!teamNumber) {
        statusMessage.textContent = "Please enter a team number before downloading.";
        statusMessage.classList.add("error");
        return;
    }

    const anchor = document.createElement('a');
    anchor.href = downloadFilePath;
    anchor.download = downloadFilePath.split('/').pop();
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    await sendDiscordMessageFromBrowser(teamNumberInputId, statusMessageId, robotVersion);
}

async function sendDiscordMessageFromBrowser(teamNumberInputId, statusMessageId, robotVersion) {
    const teamNumberInput = document.getElementById(teamNumberInputId);
    const statusMessage = document.getElementById(statusMessageId);
    const teamNumber = teamNumberInput.value.trim();

    if (!teamNumber) {
        return;
    }

    const messageContent = `Team ${teamNumber} has downloaded robot version ${robotVersion} on ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}`;

    const payload = {
        content: messageContent
    };

    statusMessage.textContent = "Notifying Discord...";
    statusMessage.classList.remove("error", "success");
    statusMessage.classList.add("loading");

    try {
        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            statusMessage.textContent = `Team ${teamNumber} downloaded robot version ${robotVersion}!`;
            statusMessage.classList.remove("loading", "error");
            statusMessage.classList.add("success");
            teamNumberInput.value = '';
        } else {
            const errorDetails = await response.text();
            statusMessage.textContent = `Failed to send download notification. Status: ${response.status}.`;
            statusMessage.classList.remove("loading", "success");
            statusMessage.classList.add("error");
            console.error("Discord API Error:", response.status, errorDetails);
        }
    } catch (error) {
        statusMessage.textContent = `An error occurred while sending notification.`;
        statusMessage.classList.remove("loading", "success");
        statusMessage.classList.add("error");
        console.error("Fetch operation failed:", error);
    }
}

// Function to dynamically generate the cards from the data
function renderRobotCards() {
    const container = document.getElementById('robot-cards-container');
    container.innerHTML = ''; // Clear container before adding new cards

    robotDesigns.forEach((robot, index) => {
        // Generate the HTML for the image carousel
        const imageCarouselHtml = `
            <div class="image-carousel-container">
                <div class="carousel-images">
                    ${robot.images.map(img => `<img src="${img.src}" alt="${img.alt}" class="carousel-image">`).join('')}
                </div>
                <button class="carousel-nav prev">&#10094;</button>
                <button class="carousel-nav next">&#10095;</button>
            </div>
        `;

        const cardHtml = `
            <div class="main-content-card">
                <div class="image-container">
                    ${imageCarouselHtml}
                </div>
                <div class="content-container">
                    <h2 class="heading-text">${robot.heading}</h2>
                    <div>
                        <label for="${robot.teamNumberInputId}" class="block text-sm font-semibold mb-2">
                            Team Number:
                        </label>
                        <input type="text" id="${robot.teamNumberInputId}" placeholder="e.g. 58590, Allied Algo" class="w-full">
                    </div>
                    <button onclick="handleDownload(${index + 1}, '${robot.teamNumberInputId}', '${robot.statusMessageId}', '${robot.downloadFilePath}')"
                        class="action-button">
                        <svg class="download-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                            <path d="M16 11c-.55 0-1 .45-1 1v4H9v-4c0-.55-.45-1-1-1s-1 .45-1 1v4c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2v-4c0-.55-.45-1-1-1zM12 3L7 8h3v4h4V8h3l-5-5z" />
                        </svg>
                        Download Files
                    </button>
                    <a href="${robot.cadLink}" target="_blank" rel="noopener noreferrer" class="cad-link">
                        View CAD Link
                    </a>
                </div>
            </div>
            <p id="${robot.statusMessageId}" class="status-message"></p>
            ${index < robotDesigns.length - 1 ? '<hr>' : ''}
        `;
        container.insertAdjacentHTML('beforeend', cardHtml);
    });

    initializeImageCarousels();
}

function initializeImageCarousels() {
    document.querySelectorAll('.image-carousel-container').forEach(carouselContainer => {
        const imagesWrapper = carouselContainer.querySelector('.carousel-images');
        const images = imagesWrapper.querySelectorAll('.carousel-image');
        const prevButton = carouselContainer.querySelector('.carousel-nav.prev');
        const nextButton = carouselContainer.querySelector('.carousel-nav.next');
        let currentImageIndex = 0;

        function showImage(index) {
            images.forEach((img, i) => {
                img.style.display = (i === index) ? 'block' : 'none';
            });
        }
            
        prevButton.addEventListener('click', () => {
            currentImageIndex = (currentImageIndex > 0) ? currentImageIndex - 1 : images.length - 1;
            showImage(currentImageIndex);
        });

        nextButton.addEventListener('click', () => {
            currentImageIndex = (currentImageIndex < images.length - 1) ? currentImageIndex + 1 : 0;
            showImage(currentImageIndex);
        });

        // Show the first image on initialization
        showImage(currentImageIndex);
    });
}