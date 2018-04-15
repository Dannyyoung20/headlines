// News.org BASE URL
const BASE_URL = 'https://newsapi.org/v2';

// News.org API_KEY
const API_KEY = 'b469ef7c0a514ca296a15947c9cbc2ee';

// IndexedDB Version Number
const IDB_VERSION = 1;

/**
 * A simple Headline News Class
 *
 */

class HeadlineNews {
  constructor() {
    var countries = [
      'ae',
      'ar',
      'at',
      'au',
      'be',
      'bg',
      'br',
      'ca',
      'ch',
      'cn',
      'co',
      'cu',
      'cz',
      'de',
      'eg',
      'fr',
      'gb',
      'gr',
      'hk',
      'hu',
      'id',
      'ie',
      'il',
      'it',
      'jp',
      'kr',
      'lt',
      'lv',
      'ma',
      'mx',
      'my',
      'ng',
      'nl',
      'no',
      'nz',
      'ph',
      'pl',
      'pt',
      'ro',
      'rs',
      'ru',
      'sa',
      'se',
      'sg',
      'si',
      'sk',
      'th',
      'tr',
      'tw',
      'ua',
      'us',
      've',
      'za',
    ];

    this.populateCountryForm(countries);
    this.registerServiceWorker();
    this.openDB();
    this.getNewsHeadlineFromCountry('us');
    this.showStoredHeadlines();
  }

  /**
   * Function used to register the service worker
   */
  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('../../sw.js')
        .then(function() {
          console.log('Service Worker Registered');
        })
        .catch(error => {
          console.log('Service worker registraton failed', error);
        });
    }
  }

  /**
   * Function to init the IndexedDB
   */

  openDB() {
    var dbPromise = idb.open('headlines-store', 1, function(db) {
      var store = db.createObjectStore('headlines', {
        keyPath: 'publishedAt',
      });

      store.createIndex('by-date', 'publishedAt');
    });

    return dbPromise;
  }

  /**
   * Check if the user is Online
   */

  checkNetworkStatus() {
    return window.addEventListener('online', function(e) {}, false);
  }

  /**
   *  Function to make the fetch request to
   * News.org api via a source
   * @param {string} source
   */

  getNewsHeadlineFromSource(source) {
    const url = `${BASE_URL}/top-headlines?sources=${source}&apiKey=${API_KEY}`;
    return fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.status != 'ok') return;
        hn.storeDataIntoIDB(data);
      });
  }

  /**
   *  Function to make the fetch request to
   * News.org api via a country
   * @param {string} country
   */

  getNewsHeadlineFromCountry(country) {
    const url = `${BASE_URL}/top-headlines?country=${country}&apiKey=${API_KEY}`;
    return fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.status != 'ok') return;
        hn.storeDataIntoIDB(data);
      });
  }

  /**
   * Function to store the news recieved into
   * the IndexedDB Store
   * @param {*} news
   */

  storeDataIntoIDB(news) {
    var headlines = news.articles;
    return this.openDB().then(function(db) {
      if (!db) return;

      // Prepping the store for write opertaion
      var tx = db.transaction('headlines', 'readwrite');
      var store = tx.objectStore('headlines');

      //Looping through each array of headlines
      headlines.forEach(function(headline) {
        store.put(headline);
      });

      store
        .index('by-date')
        .openCursor(null, 'prev')
        .then(function(cursor) {
          return cursor.advance(20);
        })
        .then(function deletePosts(cursor) {
          if (!cursor) return;
          cursor.delete();
          return cursor.continue().then(deletePosts);
        });

      hn.showPostInPage(news.articles);
    });
  }

  /**
   * Function to show the various articles
   * in the homepage screen
   *
   * @param {array} articles
   */

  showPostInPage(articles) {
    var pageContent = '';
    var count = 1;
    var headlines = articles.forEach(headline => {
      pageContent += `<div class="item-${count}">
                <a class="card" href="${headline.url}" target="_blank">
                    <div class="thumb" style="background-image: url(${headline.urlToImage});"></div>
                    <article>
                        <h1>${headline.title}</h1>
                        <span>${headline.description}</span>
                        <b>Source: ${headline.source.name}</b>
                    </article>
                </a>
            </div>`;
      count++;
      document.querySelector('.band').innerHTML = pageContent;
    });
  }
  /**
   * Function to retrieve the cached Headline when network is down
   *
   */
  showStoredHeadlines() {
    return this.openDB().then(function(db) {
      if (!db) return;
      if (hn.checkNetworkStatus()) return;

      var index = db
        .transaction('headlines', 'readonly')
        .objectStore('headlines')
        .index('by-date');

      return index.getAll().then(posts => {
        hn.showPostInPage(posts.reverse());
      });
    });
  }

  /**
   * Populate the contry select form in the homepage
   *
   * @param {array} countries
   */

  populateCountryForm(countries) {
    var countryOption = '';
    countries.forEach(country => {
      countryOption += `<option>${country}</option>`;
    });
    document
      .querySelector('#country-options')
      .insertAdjacentHTML('beforeend', countryOption);
  }
}

var hn = new HeadlineNews();
