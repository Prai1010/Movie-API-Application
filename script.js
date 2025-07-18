// script2.js — Handles search, genre filtering, pagination

document.addEventListener('DOMContentLoaded', () => {
    const apiKey = '978fc3f8'; // Replace with your OMDb API key
  
    const form = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const yearInput = document.getElementById('year-input');
    const resultsContainer = document.getElementById('movie-results');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageNumber = document.getElementById('page-number');
    const clearFiltersBtn = document.getElementById('clear-filters');
    const genreContainer = document.getElementById('genre-buttons');
  
    let currentPage = 1;
    let currentTitle = '';
    let currentYear = '';
    let selectedGenres = [];
    let totalResults = 0;
  
    // Genre list
    const genreList = [
      "Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Romance", "Thriller",
      "Animation", "Crime", "Fantasy", "Adventure", "Mystery", "Biography",
      "War", "Western", "History", "Family", "Documentary"
    ];
  
    // Render genre buttons dynamically
    genreList.forEach(genre => {
      const btn = document.createElement('button');
      btn.textContent = genre;
      btn.className = 'genre-btn bg-grayish text-white px-3 py-1 rounded-full hover:bg-neon hover:text-black transition';
      btn.dataset.genre = genre;
  
      btn.addEventListener('click', () => {
        const genreValue = btn.dataset.genre;
  
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
  
    // Clear filters
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
  
    // Submit search
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      currentTitle = searchInput.value.trim();
      currentYear = yearInput.value.trim();
      currentPage = 1;
      fetchMovies();
    });
  
    // Pagination
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
  
    async function fetchMovies() {
      if (!currentTitle) {
        resultsContainer.innerHTML = '<p class="text-white text-center">Please enter a movie title.</p>';
        return;
      }
  
      resultsContainer.innerHTML = '<p class="text-center text-white">Loading...</p>';
      const url = `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(currentTitle)}&page=${currentPage}${currentYear ? `&y=${currentYear}` : ''}`;
  
      try {
        const res = await fetch(url);
        const data = await res.json();
  
        if (data.Response === 'True') {
          totalResults = parseInt(data.totalResults);
          const movies = data.Search;
          const detailedMovies = [];
  
          for (const movie of movies) {
            const detailRes = await fetch(`https://www.omdbapi.com/?apikey=${apiKey}&i=${movie.imdbID}`);
            const full = await detailRes.json();
  
            if (
              selectedGenres.length === 0 ||
              selectedGenres.some(g => full.Genre.toLowerCase().includes(g.toLowerCase()))
            ) {
              detailedMovies.push(full);
            }
          }
  
          resultsContainer.innerHTML = '';
  
          if (detailedMovies.length === 0) {
            resultsContainer.innerHTML = `<p class="text-center text-white">No movies found for selected genres.</p>`;
            nextBtn.disabled = true;
            return;
          }
  
          detailedMovies.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'bg-[#111] text-white p-4 rounded-lg shadow-md';
            card.innerHTML = `
              <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/200x300?text=No+Image'}" class="w-full h-auto mb-3 rounded">
              <h3 class="text-lg font-semibold">${movie.Title} (${movie.Year})</h3>
              <p class="text-sm">${movie.Genre}</p>
              <p class="text-xs mt-2 line-clamp-3">${movie.Plot}</p>
            `;
            resultsContainer.appendChild(card);
          });
  
          pageNumber.textContent = `Page ${currentPage}`;
          prevBtn.disabled = currentPage === 1;
          nextBtn.disabled = currentPage * 10 >= totalResults;
        } else {
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