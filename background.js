const TMDB_KEY = "__TMDB_KEY__";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "FETCH_RATING") {
    const movieTitle = request.title.trim();

    (async () => {
      try {
        // 1. Check Cache
        const cache = await chrome.storage.local.get([movieTitle]);
        if (cache[movieTitle]) {
          sendResponse({ rating: cache[movieTitle] });
          return;
        }

        // 2. Search for the movie
        const searchRes = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(movieTitle)}`);
        const searchData = await searchRes.json();

        if (searchData.results && searchData.results.length > 0) {
          const movieId = searchData.results[0].id;

          // 3. Get Details + External IDs (crucial for getting the imdb_id)
          const detailRes = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_KEY}`);
          const movieDetails = await detailRes.json();
          
          const imdbId = movieDetails.imdb_id;

          if (!imdbId) {
            sendResponse({ error: "No IMDb ID found for this movie" });
            return;
          }

          // 4. Fetch and Search the TSV file
          const tsvUrl = chrome.runtime.getURL('ratings.tsv'); // Assuming it's in your extension folder
          const tsvRes = await fetch(tsvUrl);
          const tsvText = await tsvRes.text();

          const lines = tsvText.split('\n');
          let finalRating = "N/A";

          for (const line of lines) {
            const [id, rating] = line.split('\t'); // Split by Tab
            if (id === imdbId) {
              finalRating = rating.trim();
              break;
            }
          }

          // 5. Cache and Send Response
          await chrome.storage.local.set({ [movieTitle]: finalRating });
          sendResponse({ rating: finalRating });

        } else {
          sendResponse({ error: "Movie not found" });
        }
      } catch (error) {
        console.error("Fetch Error:", error);
        sendResponse({ error: "Failed to fetch data" });
      }
    })();

    return true; 
  }
});