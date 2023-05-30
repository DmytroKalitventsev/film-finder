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

			this.firstInput.value = '';
		}

		if (!isFormValid) return;

		this.#url = `${this.#api}&s=${formData.title}&type=${formData.type}`;

		this.getRequest(this.#url).then(res => console.log(res));
	}

	renderFilmsCards() {

	}

	init() {
		this.formSearch.addEventListener('submit', this.getDataSearch.bind(this));
		this.firstInput.addEventListener('input', () => this.firstInput.style.outline = null);
	}
}

new FilmsFinder().init();

// document.body.innerHTML = `i<dv class="error">Error ${request.status}:(</div>`;