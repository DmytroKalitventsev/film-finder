'use strict'

class FilmsFinder {
	#api = 'https://www.omdbapi.com/?apikey=2163e12a';
	#urlSearch = null;
	#urlDescr = null;
	#currentPage = 1;

	constructor() { }

	get wrap() {
		return document.querySelector('.wrapper')
	}

	get formSearch() {
		return document.forms.filmsSearch;
	}

	get dataSearchFilms() {
		return this.formSearch.filmsData.elements;
	}

	get firstInput() {
		return this.dataSearchFilms[0];
	}

	get filmCards() {
		return this.wrap.querySelector('.film-cards');
	}

	get filmInfo() {
		return this.wrap.querySelector('.film-info');
	}

	getRequest(url) {
		return fetch(url)
			.then(response => {
				if (!response.ok) {
					throw response.status;
				}

				return response.json();
			});
	}

	getDataSearch(e) {
		e.preventDefault();

		const formData = {};
		let isFormValid = true;

		for (const input of this.dataSearchFilms) {
			const value = input.value.trim();

			if (!value) {
				isFormValid = false;
				this.firstInput.style.outline = '2px solid #ff0000';
				return;
			}

			formData[input.name] = value;
		}

		if (!isFormValid) return;

		this.#urlSearch = `${this.#api}&s=${formData.title}&type=${formData.type}`;
		this.#currentPage = 1;

		this.getListFilms(this.#urlSearch);
	}

	getListFilms(url) {
		this.getRequest(url)
			.then(response => {
				this.filmCards.innerHTML = '';
				this.filmInfo.innerHTML = '';

				if (response.Response === 'False') {
					throw response.Error;
				}

				this.renderFilmsCard(response.Search);
				this.renderBtnPagination(response.totalResults, this.#currentPage);
			})
			.catch(error => {
				this.filmCards.innerHTML = `<div class="film-cards__not-found">${error}</div>`;
			});
	}

	getPoster(dataPoster) {
		return new Promise((resolve, reject) => {
			const img = new Image();

			img.onload = () => {
				resolve(dataPoster);
			};

			img.onerror = () => {
				reject('img/poster-missing.jpg');
			};

			if (dataPoster === 'N/A') {
				reject('img/poster-missing.jpg');
			}

			img.src = dataPoster;
		})
			.catch(error => {
				console.error(error);
				return 'img/poster-missing.jpg';
			});
	}

	sliceText(text) {
		const maxLetter = 5;
		const words = text.split(' ');

		if (words.length > maxLetter) {
			text = words.slice(0, maxLetter).join(' ') + "...";
		}

		return text;
	}

	renderFilmsCard(dataFilms) {
		const cards = dataFilms
			.map(film => {
				const year = (film.Year.length === 5) ? film.Year.slice(0, -1) : film.Year;

				return this.getPoster(film.Poster)
					.then(posterUrl => {
						return `<li class="film-card" data-id="${film.imdbID}">
								<div class="film-card__poster">
									<img src="${posterUrl}" alt="poster">
								</div>
								<span class="film-card__type">${film.Type}</span>
								<h2 class="film-card__title">${this.sliceText(film.Title)}</h2>
								<span class="film-card__year">${year}</span>
								<button class="film-card__details">Details</button>
							</li>`;
					});
			});

		Promise.all(cards).then(results => {
			const elements = `<h2 class="film-cards__title">Films:</h2>
								<ul class="film-cards__list">${results.join('')}</ul>`;

			this.filmCards.insertAdjacentHTML('afterBegin', elements);

			if (dataFilms.length === 1) {
				this.filmCards.querySelector('.film-cards__list').style.gridTemplateColumns = 'repeat(auto-fit, minmax(250px, 400px))';
			}
		});
	}

	renderBtnPagination(totalFilms, currentPage) {
		const totalPages = Math.ceil(totalFilms / 10);
		const maxVisiblePages = 5;

		let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
		let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

		let buttons = '';

		startPage = Math.max(1, endPage - maxVisiblePages + 1);

		if (currentPage > 1) {
			buttons += `<button class="pagination__first-page" data-page="1">&#60;&#60;</button>`;
		}

		for (let pageLength = startPage; pageLength <= endPage; pageLength++) {
			const activeButton = (currentPage === pageLength) ? 'pagination__numb_active' : '';

			buttons += `<button class="pagination__numb ${activeButton}">${pageLength}</button>`;
		}

		if (currentPage < totalPages) {
			buttons += `<button class="pagination__last-page" data-page="${totalPages}">&#62;&#62;</button>`;
		}

		const elements = `<div class="pagination">${buttons}</div>`;

		this.filmCards.insertAdjacentHTML('beforeEnd', elements);
	}

	changePage(e) {
		const t = e.target;
		const firstPage = t.closest('.pagination__first-page');
		const lastPage = t.closest('.pagination__last-page');

		if (t.closest('.pagination__numb')) {
			this.#currentPage = +t.innerText;

			this.getListFilms(`${this.#urlSearch}&page=${this.#currentPage}`);
		}

		if (firstPage || lastPage) {
			this.#currentPage = +t.dataset.page;

			this.getListFilms(`${this.#urlSearch}&page=${this.#currentPage}`);

			if (firstPage) {
				const next = firstPage.nextElementSibling;
				next.classList.add('pagination__numb_active');
			}

			if (lastPage) {
				const prev = lastPage.previousElementSibling;
				prev.classList.add('pagination__numb_active');
			}
		}
	}

	showDetailsFilm(e) {
		const btnDetails = e.target.closest('.film-card__details');

		if (btnDetails) {
			const id = btnDetails.parentElement.dataset.id;

			this.#urlDescr = `${this.#api}&i=${id}`;

			this.getRequest(this.#urlDescr)
				.then(response => {
					if (response.Response === 'False') {
						throw response.Error;
					}

					this.renderDetailsCardFilm(response);
				})
				.catch(error => {
					this.filmInfo.innerHTML = `<div class="film-info__not-found">${error}</div>`;
				});
		}
	}

	renderDetailsCardFilm(dataFilm) {
		const excludedTitle = [
			'Poster', 'BoxOffice', 'DVD', 'Language', 'Metascore', 'Plot',
			'Production', 'Rated', 'Ratings', 'Response', 'Runtime', 'totalSeasons',
			'Type', 'Website', 'Year', 'imdbID', 'imdbRating', 'imdbVotes',
		];
		let items = '';

		for (const title in dataFilm) {
			const descr = dataFilm[title];

			if (!excludedTitle.includes(title) && descr != 'N/A') {
				items += `<li class="film-details__item">
							<span class="film-details__title">${title}</span>
							<span class="film-details__description">${descr}</span>
						</li>`;
			}
		}

		this.getPoster(dataFilm.Poster)
			.then(posterUrl => {
				return `<h2 class="film-info__title">Film info:</h2>
							<div class="film-details">
								<div class="film-details__poster">
									<img src="${posterUrl}" alt="poster">
								</div>
								<ul class="film-details__list">${items}</ul>
							</div>`;
			})
			.then(results => {
				this.filmInfo.innerHTML = results;
			});
	}

	init() {
		this.getRequest(this.#api)
			.then(() => {
				this.formSearch.addEventListener('submit', this.getDataSearch.bind(this));
				this.firstInput.addEventListener('input', () => this.firstInput.style.outline = null);

				this.filmCards.addEventListener('click', this.showDetailsFilm.bind(this));
				this.filmCards.addEventListener('click', this.changePage.bind(this));
			})
			.catch(error => {
				document.body.innerHTML = `<div class="error">Error ${error} :(</div>`;
			});
	}
}

new FilmsFinder().init();