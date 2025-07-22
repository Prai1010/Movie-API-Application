document.addEventListener('DOMContentLoaded', () => {
  const apiKey = '978fc3f8';

  // Grabbing all the DOM elements we’ll need
  const form = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const yearInput = document.getElementById('year-input');
  const resultsContainer = document.getElementById('movie-results');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const pageNumber = document.getElementById('page-number');
  const clearFiltersBtn = document.getElementById('clear-filters');
  const genreContainer = document.getElementById('genre-buttons');

  // These are the main states that control filtering + pagination
  let currentPage = 1;
  let currentTitle = '';
  let currentYear = '';
  let selectedGenres = [];
  let totalResults = 0;

  // Just listing some common genres — not pulling from API
  const genreList = [
    "Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Romance", "Thriller",
    "Animation", "Crime", "Fantasy", "Adventure", "Mystery", "Biography",
    "War", "Western", "History", "Family", "Documentary"
  ];

  // Create and attach all the genre filter buttons
  genreList.forEach(genre => {
    const btn = document.createElement('button');
    btn.textContent = genre;
    btn.className = 'genre-btn bg-grayish text-white px-3 py-1 rounded-full hover:bg-neon hover:text-black transition';
    btn.dataset.genre = genre;

    btn.addEventListener('click', () => {
      const genreValue = btn.dataset.genre;

      // Toggle logic — allow max 3 genres at once
      if (selectedGenres.includes(genreValue)) {
        selectedGenres = selectedGenres.filter(g => g !== genreValue);
        btn.classList.remove('bg-neon', 'text-black');
        btn.classList.add('bg-grayish', 'text-white');
      } else {
        if (selectedGenres.length < 3) {
          selectedGenres.push(genreValue);
          btn.classList.remove('bg-grayish', 'text-white');
          btn.classList.add('bg-neon', 'text-black');
        }
      }

      currentPage = 1;
      fetchMovies();
    });

    genreContainer.appendChild(btn);
  });

  // When user clears the filters, reset everything
  clearFiltersBtn.addEventListener('click', () => {
    selectedGenres = [];
    currentYear = '';
    yearInput.value = '';
    document.querySelectorAll('.genre-btn').forEach(btn => {
      btn.classList.remove('bg-neon', 'text-black');
      btn.classList.add('bg-grayish', 'text-white');
    });
    currentPage = 1;
    fetchMovies();
  });

  // When the form is submitted, trigger the fetch
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    currentTitle = searchInput.value.trim();
    currentYear = yearInput.value.trim();
    currentPage = 1;
    fetchMovies();
  });

  // Pagination buttons
  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      fetchMovies();
    }
  });

  nextBtn.addEventListener('click', () => {
    currentPage++;
    fetchMovies();
  });

  // Main function to fetch + render movies
  async function fetchMovies() {
    if (!currentTitle) {
      resultsContainer.innerHTML = '<p class="text-white text-center">Please enter a movie title.</p>';
      return;
    }

    // Loading message while we wait for data
    resultsContainer.innerHTML = '<p class="text-center text-white">Loading...</p>';

    const url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(currentTitle)}&page=${currentPage}${currentYear ? `&y=${currentYear}` : ''}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (data.Response === 'True') {
        totalResults = parseInt(data.totalResults);
        const movies = data.Search;
        const detailedMovies = [];

        // For each movie, fetch more detailed info by IMDb ID
        for (const movie of movies) {
          const detailRes = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${movie.imdbID}`);
          const full = await detailRes.json();

          // Only show movies that match selected genres (if any)
          if (
            selectedGenres.length === 0 ||
            selectedGenres.some(g => full.Genre.toLowerCase().includes(g.toLowerCase()))
          ) {
            detailedMovies.push(full);
          }
        }

        resultsContainer.innerHTML = '';

        // If no results match genre filter, show message
        if (detailedMovies.length === 0) {
          resultsContainer.innerHTML = `<p class="text-center text-white">No movies found for selected genres.</p>`;
          nextBtn.disabled = true;
          return;
        }

        // Create movie cards
        detailedMovies.forEach(movie => {
          const card = document.createElement('div');
          card.className = 'bg-[#111] text-white p-4 rounded-lg shadow-md';
          card.innerHTML = `
            <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/200x300?text=No+Image'}" class="w-full h-auto mb-3 rounded">
            <h3 class="text-lg font-semibold">${movie.Title} (${movie.Year})</h3>
            <p class="text-sm mb-1"><strong>Genre:</strong> ${movie.Genre}</p>
            <p class="text-sm mb-1"><strong>Director:</strong> ${movie.Director}</p>
            <p class="text-sm mb-1"><strong>Actors:</strong> ${movie.Actors}</p>
            <p class="text-sm mb-1"><strong>IMDB Rating:</strong> ${movie.imdbRating}</p>
            <p class="text-xs mt-2 line-clamp-4">${movie.Plot}</p>
          `;
          resultsContainer.appendChild(card);
        });

        // Update pagination
        pageNumber.textContent = `Page ${currentPage}`;
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage * 10 >= totalResults;

      } else {
        // If no results found (bad search term, etc.)
        resultsContainer.innerHTML = `<p class="text-center text-white">No results found.</p>`;
        prevBtn.disabled = true;
        nextBtn.disabled = true;
      }
    } catch (err) {
      console.error(err);
      resultsContainer.innerHTML = '<p class="text-red-500 text-center">Error fetching data.</p>';
    }
  }
});
