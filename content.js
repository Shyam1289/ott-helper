const host = window.location.hostname;

function injectRating(element, rating) {
    if (element.parentElement.querySelector('.imdb-rating-tag')) return;

    const badge = document.createElement('span');
    badge.className = 'imdb-rating-tag';
    
    // Common styles for both sites
    badge.style.cssText = `
        background: #f5c518; 
        color: #000; 
        padding: 2px 6px; 
        border-radius: 4px; 
        font-weight: bold; 
        font-size: 12px;
        z-index: 9999;
    `;
    badge.innerHTML = `⭐ ${rating}`;

    if (host.includes('hotstar.com')) {
        // Hotstar specific: Position it absolutely so it floats over the absolute img
        badge.style.position = "absolute";
        badge.style.top = "5px";
        badge.style.left = "5px";
        element.insertAdjacentElement('afterend', badge);
    } else {
        // Prime/Default: Append inside the link or container
        element.style.position = "relative";
        element.appendChild(badge);
    }
}

const findAndProcess = () => {
    if (!chrome.runtime?.id) return;

    // Combined selectors for both sites
    const selectors = 'img.rQ_gfJEdoJGvLVb_rKLtL, img[class^="rQ_"], a.ot2LqE';
    const elements = document.querySelectorAll(selectors);

    elements.forEach(el => {
        if (el.dataset.processed === "done") return;

        let movieName = ""; // Changed from const to let

        if (host.includes('hotstar.com')) {
            movieName = el.alt || el.getAttribute('aria-label') || "";
        } else if (host.includes('amazon') || host.includes('primevideo')) {
            movieName = el.innerText;
        }

        if (movieName && movieName.trim().length > 1) {
            // Clean common junk
            const cleanedName = movieName.split('[')[0].split('(')[0].trim();
            el.dataset.processed = "done";

            chrome.runtime.sendMessage({type: "FETCH_RATING", title: cleanedName}, (response) => {
                if (chrome.runtime.lastError) return;
                
                if (response?.rating && response.rating !== "N/A") {
                    injectRating(el, response.rating);
                }
            });
        }
    });
};

setInterval(findAndProcess, 1500);