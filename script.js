'use strict'

class FilmsFinder {
	#api = 'http://www.omdbapi.com/?apikey=2163e12a';
	#url = null;

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

	get filmsDetails() {
		return this.wrap.querySelector('.films-details');
	}

	getRequest(url) {
		return new Promise((resolve, reject) => {
			const request = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHttp');

			request.open('GET', url);
			request.responseType = 'json';

			request.addEventListener('readystatechange', () => {
				if (request.readyState === 4 && request.status === 200) {
					resolve(request.response);
				}

				if (request.readyState < 4 && request.status >= 400) {
					reject(request.status);
				}
			});

			request.send();
		})
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
			this.#url = `${this.#api}&s=${formData.title}&type=${formData.type}&page=1`;

			this.firstInput.value = '';
			this.filmCards.innerHTML = '';
			this.filmsDetails.innerHTML = '';
		}

		if (!isFormValid) return;

		this.getListFilms(this.#url);
	}

	getListFilms(url) {
		this.getRequest(url)
			.then(res => {
				if (res.Response === 'True') {
					this.renderFilmsCard(res.Search);
				};

				if (res.Response === 'False') {
					this.filmCards.innerHTML = `<div class="film-cards__not-found">${res.Error}</div>`;
				}
			})
			.catch(err => console.error(err));
	}

	getPoster(dataPoster) {
		return (dataPoster === 'N/A') ? 'img/poster-missing.jpg' : dataPoster;
	}

	renderFilmsCard(dataFilms) {
		const cards = dataFilms
			.map(film => {
				return `<div class="film-card" data-id="${film.imdbID}">
							<div class="film-card__poster">
								<img src="${this.getPoster(film.Poster)}" alt="poster">
							</div>
							<span class="film-card__type">${film.Type}</span>
							<h2 class="film-card__title">${film.Title}</h2>
							<span class="film-card__year">${film.Year}</span>
							<button class="film-card__details">Details</button>
						</div>`
			})
			.join('');

		this.filmCards.insertAdjacentHTML('afterBegin', `<h2 class="film-cards__title">Films:</h2>`);
		this.filmCards.insertAdjacentHTML('beforeEnd', `<div class="film-cards__wrap">${cards}</div>`);

		this.filmCards.addEventListener('click', this.showDetailsFilm.bind(this));
	}

	showDetailsFilm(e) {
		const btnDetails = e.target.closest('.film-card__details');

		if (btnDetails) {
			const id = btnDetails.parentElement.dataset.id;

			this.#url = `${this.#api}&i=${id}`;

			this.getRequest(this.#url)
				.then(res => {
					this.renderDetailsCardFilm(res);
				})
				.catch(err => console.error(err));
		}
	}

	renderDetailsCardFilm(dataFilm) {
		const str = `<h2 class="films-details__title">Film info:</h2>
					<div class="film-details">
						<div class="film-details__poster">
							<img src="${this.getPoster(dataFilm.Poster)}" alt="poster">
						</div>
						<div class="film-details__title-wrap">
							<span class="film-details__title">Title:</span>
							<span class="film-details__description">${dataFilm.Title}</span>
						</div>
						<div class="film-details__title-wrap">
							<span class="film-details__title">Released:</span>
							<span class="film-details__description">${dataFilm.Released}</span>
						</div>
						<div class="film-details__title-wrap">
							<span class="film-details__title">Genre:</span>
							<span class="film-details__description">${dataFilm.Genre}</span>
						</div>
						<div class="film-details__title-wrap">
							<span class="film-details__title">Country:</span>
							<span class="film-details__description">${dataFilm.Country}</span>
						</div>
						<div class="film-details__title-wrap">
							<span class="film-details__title">Director:</span>
							<span class="film-details__description">${dataFilm.Director}</span>
						</div>
						<div class="film-details__title-wrap">
							<span class="film-details__title">Writer:</span>
							<span class="film-details__description">${dataFilm.Writer}</span>
						</div>
						<div class="film-details__title-wrap">
							<span class="film-details__title">Actors:</span>
							<span class="film-details__description">${dataFilm.Actors}</span>
						</div>
						<div class="film-details__title-wrap">
							<span class="film-details__title">Awards:</span>
							<span class="film-details__description">${dataFilm.Awards}</span>
						</div>
					</div>`;

		this.filmsDetails.innerHTML = str;
	}

	init() {
		this.getRequest(this.#api)
			.then(() => {
				this.formSearch.addEventListener('submit', this.getDataSearch.bind(this));
				this.firstInput.addEventListener('input', () => this.firstInput.style.outline = null);
			})
			.catch(err => {
				document.body.innerHTML = `<div class="error">Error ${err}:(</div>`;
			});
	}
}

new FilmsFinder().init();