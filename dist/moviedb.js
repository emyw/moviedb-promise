"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovieDb = void 0;
const lodash_1 = require("lodash");
const promise_throttle_1 = __importDefault(require("promise-throttle"));
const types_1 = require("./types");
class MovieDb {
    apiKey;
    token;
    queue;
    baseUrl;
    sessionId;
    constructor(apiKey, baseUrl = 'https://api.themoviedb.org/3/', requestsPerSecondLimit = 50) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.queue = new promise_throttle_1.default({
            requestsPerSecond: requestsPerSecondLimit,
            promiseImplementation: Promise,
        });
    }
    /**
     * Gets an api token using an api key
     *
     * @returns {Promise}
     */
    async requestToken() {
        if (!this.token || Date.now() > new Date(this.token.expires_at).getTime()) {
            this.token = await this.makeRequest(types_1.HttpMethod.Get, 'authentication/token/new');
        }
        return this.token;
    }
    /**
     * Gets the session id
     */
    async retrieveSession() {
        const token = await this.requestToken();
        const request = {
            request_token: token.request_token,
        };
        const res = await this.makeRequest(types_1.HttpMethod.Get, 'authentication/session/new', request);
        this.sessionId = res.session_id;
        return this.sessionId;
    }
    /**
     * Compiles the endpoint based on the params
     */
    getEndpoint(endpoint, params = {}) {
        return Object.keys(params).reduce((compiled, key) => {
            return compiled.replace(`:${key}`, params[key]);
        }, endpoint);
    }
    /**
     * Normalizes a request into a RequestParams object
     */
    normalizeParams(endpoint, params = {}) {
        if ((0, lodash_1.isObject)(params)) {
            return params;
        }
        const matches = endpoint.match(/:[a-z]*/g) || [];
        if (matches.length === 1) {
            return matches.reduce((obj, match) => {
                obj[match.slice(1)] = params;
                return obj;
            }, {});
        }
        return {};
    }
    /**
     * Compiles the data/query data to send with the request
     */
    getParams(endpoint, params = {}) {
        // Merge default parameters with the ones passed in
        const compiledParams = (0, lodash_1.merge)({
            api_key: this.apiKey,
            ...(this.sessionId && { session_id: this.sessionId }),
        }, params);
        // Some endpoints have an optional account_id parameter (when there's a session).
        // If it's not included, assume we want the current user's id,
        // which is setting it to '{account_id}'
        if (endpoint.includes(':id') && !compiledParams.id && this.sessionId) {
            compiledParams.id = '{account_id}';
        }
        return compiledParams;
    }
    /**
     * Performs the request to the server
     */
    makeRequest(method, endpoint, params = {}, fetchOptions = {}) {
        const normalizedParams = this.normalizeParams(endpoint, params);
        // Get the full query/data object
        const fullQuery = this.getParams(endpoint, normalizedParams);
        // Get the params that are needed for the endpoint
        // to remove from the data/params of the request
        const omittedProps = [...(endpoint.match(/:[a-z]*/gi) ?? [])].map((prop) => prop.slice(1));
        // Prepare the query
        const query = (0, lodash_1.omit)(fullQuery, omittedProps);
        let url = this.baseUrl + this.getEndpoint(endpoint, fullQuery);
        if (method === types_1.HttpMethod.Get) {
            url += '?' + new URLSearchParams(query).toString();
        }
        const options = {
            method,
            ...(method !== types_1.HttpMethod.Get && { body: JSON.stringify(query) }),
            ...fetchOptions,
        };
        return this.queue.add(async () => await (await fetch(url, options)).json());
    }
    parseSearchParams(params) {
        if ((0, lodash_1.isString)(params)) {
            return { query: params };
        }
        return params;
    }
    configuration(fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'configuration', null, fetchOptions);
    }
    countries(fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'configuration/countries', null, fetchOptions);
    }
    jobs(fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'configuration/jobs', null, fetchOptions);
    }
    languages(fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'configuration/languages', null, fetchOptions);
    }
    primaryTranslations(fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'configuration/primary_translations', null, fetchOptions);
    }
    timezones(fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'configuration/timezones', null, fetchOptions);
    }
    find(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'find/:id', params, fetchOptions);
    }
    searchCompany(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'search/company', this.parseSearchParams(params), fetchOptions);
    }
    searchCollection(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'search/collection', this.parseSearchParams(params), fetchOptions);
    }
    searchKeyword(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'search/keyword', this.parseSearchParams(params), fetchOptions);
    }
    searchMovie(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'search/movie', this.parseSearchParams(params), fetchOptions);
    }
    searchMulti(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'search/multi', this.parseSearchParams(params), fetchOptions);
    }
    searchPerson(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'search/person', this.parseSearchParams(params), fetchOptions);
    }
    searchTv(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'search/tv', this.parseSearchParams(params), fetchOptions);
    }
    // Doesn't exist in documentation, may be deprecated
    searchList(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'search/list', params, fetchOptions);
    }
    collectionInfo(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'collection/:id', params, fetchOptions);
    }
    collectionImages(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'collection/:id/images', params, fetchOptions);
    }
    collectionTranslations(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'collection/:id/translations', params, fetchOptions);
    }
    discoverMovie(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'discover/movie', params, fetchOptions);
    }
    discoverTv(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'discover/tv', params, fetchOptions);
    }
    trending(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'trending/:media_type/:time_window', params, fetchOptions);
    }
    movieInfo(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'movie/:id', params, fetchOptions);
    }
    movieAccountStates(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'movie/:id/account_states', params, fetchOptions);
    }
    movieAlternativeTitles(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'movie/:id/alternative_titles', params, fetchOptions);
    }
    movieChanges(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'movie/:id/changes', params, fetchOptions);
    }
    movieCredits(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'movie/:id/credits', params, fetchOptions);
    }
    movieExternalIds(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'movie/:id/external_ids', params, fetchOptions);
    }
    movieImages(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'movie/:id/images', params, fetchOptions);
    }
    movieKeywords(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'movie/:id/keywords', params, fetchOptions);
    }
    movieReleaseDates(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'movie/:id/release_dates', params, fetchOptions);
    }
    movieVideos(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'movie/:id/videos', params, fetchOptions);
    }
    movieWatchProviders(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'movie/:id/watch/providers', params, fetchOptions);
    }
    movieWatchProviderList(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'watch/providers/movie', params, fetchOptions);
    }
    movieTranslations(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'movie/:id/translations', params, fetchOptions);
    }
    movieRecommendations(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'movie/:id/recommendations', params, fetchOptions);
    }
    movieSimilar(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'movie/:id/similar', params, fetchOptions);
    }
    movieReviews(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'movie/:id/reviews', params, fetchOptions);
    }
    movieLists(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'movie/:id/lists', params, fetchOptions);
    }
    movieRatingUpdate(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Post, 'movie/:id/rating', params, fetchOptions);
    }
    movieRatingDelete(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Delete, 'movie/:id/rating', params, fetchOptions);
    }
    movieLatest(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'movie/latest', (0, lodash_1.isString)(params) ? { language: params } : params, fetchOptions);
    }
    movieNowPlaying(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'movie/now_playing', params, fetchOptions);
    }
    moviePopular(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'movie/popular', params, fetchOptions);
    }
    movieTopRated(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'movie/top_rated', params, fetchOptions);
    }
    upcomingMovies(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'movie/upcoming', params, fetchOptions);
    }
    tvInfo(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'tv/:id', params, fetchOptions);
    }
    tvAccountStates(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'tv/:id/account_states', params, fetchOptions);
    }
    tvAlternativeTitles(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'tv/:id/alternative_titles', params, fetchOptions);
    }
    tvChanges(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'tv/:id/changes', params, fetchOptions);
    }
    tvContentRatings(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'tv/:id/content_ratings', params, fetchOptions);
    }
    tvCredits(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'tv/:id/credits', params, fetchOptions);
    }
    tvAggregateCredits(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'tv/:id/aggregate_credits', params, fetchOptions);
    }
    episodeGroups(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'tv/:id/episode_groups', params, fetchOptions);
    }
    tvExternalIds(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'tv/:id/external_ids', params, fetchOptions);
    }
    tvImages(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'tv/:id/images', params, fetchOptions);
    }
    tvKeywords(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'tv/:id/keywords', params, fetchOptions);
    }
    tvRecommendations(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'tv/:id/recommendations', params, fetchOptions);
    }
    tvReviews(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'tv/:id/reviews', params, fetchOptions);
    }
    tvScreenedTheatrically(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'tv/:id/screened_theatrically', params, fetchOptions);
    }
    tvSimilar(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'tv/:id/similar', params, fetchOptions);
    }
    tvTranslations(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'tv/:id/translations', params, fetchOptions);
    }
    tvVideos(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'tv/:id/videos', params, fetchOptions);
    }
    tvWatchProviders(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'tv/:id/watch/providers', params, fetchOptions);
    }
    tvWatchProviderList(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'watch/providers/tv', params, fetchOptions);
    }
    tvRatingUpdate(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Post, 'tv/:id/rating', params, fetchOptions);
    }
    tvRatingDelete(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Delete, 'tv/:id/rating', params, fetchOptions);
    }
    tvLatest(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'tv/latest', params, fetchOptions);
    }
    tvAiringToday(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'tv/airing_today', params, fetchOptions);
    }
    tvOnTheAir(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'tv/on_the_air', params, fetchOptions);
    }
    tvPopular(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'tv/popular', params, fetchOptions);
    }
    tvTopRated(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'tv/top_rated', params, fetchOptions);
    }
    seasonInfo(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'tv/:id/season/:season_number', params, fetchOptions);
    }
    seasonChanges(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'tv/season/:id/changes', params, fetchOptions);
    }
    seasonAccountStates(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'tv/:id/season/:season_number/account_states', params, fetchOptions);
    }
    seasonCredits(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'tv/:id/season/:season_number/credits', params, fetchOptions);
    }
    seasonAggregateCredits(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'tv/:id/season/:season_number/aggregate_credits', params, fetchOptions);
    }
    seasonExternalIds(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'tv/:id/season/:season_number/external_ids', params, fetchOptions);
    }
    seasonImages(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'tv/:id/season/:season_number/images', params, fetchOptions);
    }
    seasonVideos(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'tv/:id/season/:season_number/videos', params, fetchOptions);
    }
    episodeInfo(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'tv/:id/season/:season_number/episode/:episode_number', params, fetchOptions);
    }
    episodeChanges(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'tv/episode/:id/changes', params, fetchOptions);
    }
    episodeAccountStates(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'tv/:id/season/:season_number/episode/:episode_number/account_states', params, fetchOptions);
    }
    episodeCredits(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'tv/:id/season/:season_number/episode/:episode_number/credits', params, fetchOptions);
    }
    episodeExternalIds(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'tv/:id/season/:season_number/episode/:episode_number/external_ids', params, fetchOptions);
    }
    episodeImages(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'tv/:id/season/:season_number/episode/:episode_number/images', params, fetchOptions);
    }
    episodeTranslations(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'tv/:id/season/:season_number/episode/:episode_number/translations', params, fetchOptions);
    }
    episodeRatingUpdate(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Post, 'tv/:id/season/:season_number/episode/:episode_number/rating', params, fetchOptions);
    }
    episodeRatingDelete(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Delete, 'tv/:id/season/:season_number/episode/:episode_number/rating', params, fetchOptions);
    }
    episodeVideos(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'tv/:id/season/:season_number/episode/:episode_number/translations', params, fetchOptions);
    }
    personInfo(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'person/:id', params, fetchOptions);
    }
    personChanges(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'person/:id/changes', params, fetchOptions);
    }
    personMovieCredits(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'person/:id/movie_credits', params, fetchOptions);
    }
    personTvCredits(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'person/:id/tv_credits', params, fetchOptions);
    }
    personCombinedCredits(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'person/:id/combined_credits', params, fetchOptions);
    }
    personExternalIds(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'person/:id/external_ids', params, fetchOptions);
    }
    personImages(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'person/:id/images', params, fetchOptions);
    }
    personTaggedImages(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'person/:id/tagged_images', params, fetchOptions);
    }
    personTranslations(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'person/:id/translations', params, fetchOptions);
    }
    personLatest(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'person/latest', params, fetchOptions);
    }
    personPopular(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'person/popular', params, fetchOptions);
    }
    creditInfo(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'credit/:id', params, fetchOptions);
    }
    listInfo(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'list/:id', params, fetchOptions);
    }
    listStatus(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'list/:id/item_status', params, fetchOptions);
    }
    createList(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Post, 'list', params, fetchOptions);
    }
    createListItem(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Post, 'list/:id/add_item', params, fetchOptions);
    }
    removeListItem(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Post, 'list/:id/remove_item', params, fetchOptions);
    }
    clearList(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Post, 'list/:id/clear', params, fetchOptions);
    }
    deleteList(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Delete, 'list/:id', params, fetchOptions);
    }
    genreMovieList(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'genre/movie/list', params, fetchOptions);
    }
    genreTvList(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'genre/tv/list', params, fetchOptions);
    }
    keywordInfo(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'keyword/:id', params, fetchOptions);
    }
    keywordMovies(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'keyword/:id/movies', params, fetchOptions);
    }
    companyInfo(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'company/:id', params, fetchOptions);
    }
    companyAlternativeNames(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'company/:id/alternative_names', params, fetchOptions);
    }
    companyImages(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'company/:id/images', params, fetchOptions);
    }
    accountInfo(fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'account', null, fetchOptions);
    }
    accountLists(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'account/:id/lists', params, fetchOptions);
    }
    accountFavoriteMovies(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'account/:id/favorite/movies', params, fetchOptions);
    }
    accountFavoriteTv(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'account/:id/favorite/tv', params, fetchOptions);
    }
    accountFavoriteUpdate(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Post, 'account/:id/favorite', params, fetchOptions);
    }
    accountRatedMovies(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'account/:id/rated/movies', params, fetchOptions);
    }
    accountRatedTv(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'account/:id/rated/tv', params, fetchOptions);
    }
    accountRatedTvEpisodes(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'account/:id/rated/tv/episodes', params, fetchOptions);
    }
    accountMovieWatchlist(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'account/:id/watchlist/movies', params, fetchOptions);
    }
    accountTvWatchlist(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'account/:id/watchlist/tv', params, fetchOptions);
    }
    accountWatchlistUpdate(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Post, 'account/:id/watchlist', params, fetchOptions);
    }
    changedMovies(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'movie/changes', params, fetchOptions);
    }
    changedTvs(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'tv/changes', params, fetchOptions);
    }
    changedPeople(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'person/changes', params, fetchOptions);
    }
    movieCertifications(fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'certification/movie/list', null, fetchOptions);
    }
    tvCertifications(fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'certification/tv/list', null, fetchOptions);
    }
    networkInfo(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'network/:id', params, fetchOptions);
    }
    networkAlternativeNames(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'network/:id/alternative_names', params, fetchOptions);
    }
    networkImages(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'network/:id/images', params, fetchOptions);
    }
    review(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'review/:id', params, fetchOptions);
    }
    episodeGroup(params, fetchOptions) {
        return this.makeRequest(types_1.HttpMethod.Get, 'tv/episode_group/:id', params, fetchOptions);
    }
}
exports.MovieDb = MovieDb;
