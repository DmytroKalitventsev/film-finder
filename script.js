'use strict'

class FilmsFinder {
	#api = 'http://www.omdbapi.com/?apikey=2163e12a';
	#urlSearch = null;
	#urlDescr = null;

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
			this.#urlSearch = `${this.#api}&s=${formData.title}&type=${formData.type}&page=1`;

			this.firstInput.value = '';
			this.filmCards.innerHTML = '';
			this.filmInfo.innerHTML = '';
		}

		if (!isFormValid) return;

		this.getListFilms(this.#urlSearch);
	}

	getListFilms(url) {
		this.getRequest(url)
			.then(res => {
				if (res.Response === 'True') {
					this.renderFilmsCard(res.Search);
					this.renderBtnPagination(res.totalResults);
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
				const year = (film.Year.length === 5) ? film.Year.slice(0, -1) : film.Year;

				return `<li class="film-card" data-id="${film.imdbID}">
							<div class="film-card__poster">
								<img src="${this.getPoster(film.Poster)}" alt="poster">
							</div>
							<span class="film-card__type">${film.Type}</span>
							<h2 class="film-card__title">${film.Title}</h2>
							<span class="film-card__year">${year}</span>
							<button class="film-card__details">Details</button>
						</li>`;
			})
			.join('');

		const elements = `<h2 class="film-cards__title">Films:</h2>
						<ul class="film-cards__list">${cards}</ul>`;

		this.filmCards.insertAdjacentHTML('afterBegin', elements);

		if (dataFilms.length === 1) {
			this.filmCards.querySelector('.film-cards__list').style.gridTemplateColumns = 'repeat(auto-fit, minmax(250px, 400px))';
		}
	}

	renderBtnPagination(countFilms) {
		if (countFilms <= 10) return;

		console.log(countFilms);
	}

	showDetailsFilm(e) {
		const btnDetails = e.target.closest('.film-card__details');

		if (btnDetails) {
			const id = btnDetails.parentElement.dataset.id;

			this.#urlDescr = `${this.#api}&i=${id}`;

			this.getRequest(this.#urlDescr)
				.then(res => {
					this.renderDetailsCardFilm(res);
				})
				.catch(err => console.error(err));
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

		const elements = `<h2 class="film-info__title">Film info:</h2>
						<div class="film-details">
							<div class="film-details__poster">
								<img src="${this.getPoster(dataFilm.Poster)}" alt="poster">
							</div>
							<ul class="film-details__list">${items}</ul>
						</div>`;

		this.filmInfo.innerHTML = elements;
	}

	init() {
		this.getRequest(this.#api)
			.then(() => {
				this.formSearch.addEventListener('submit', this.getDataSearch.bind(this));
				this.firstInput.addEventListener('input', () => this.firstInput.style.outline = null);
				this.filmCards.addEventListener('click', this.showDetailsFilm.bind(this));
			})
			.catch(err => {
				document.body.innerHTML = `<div class="error">Error ${err} :(</div>`;
			});
	}
}

new FilmsFinder().init();