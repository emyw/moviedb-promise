import { isObject, isString, merge, omit } from 'lodash'
import PromiseThrottle from 'promise-throttle'
import { HttpMethod, AuthenticationToken, RequestParams, SessionRequestParams, SessionResponse } from './types'
import * as types from './request-types'

export class MovieDb {
  private apiKey: string
  private token: AuthenticationToken
  private queue: PromiseThrottle
  public baseUrl: string
  public sessionId: string

  constructor(apiKey: string, baseUrl: string = 'https://api.themoviedb.org/3/', requestsPerSecondLimit: number = 50) {
    this.apiKey = apiKey
    this.baseUrl = baseUrl
    this.queue = new PromiseThrottle({
      requestsPerSecond: requestsPerSecondLimit,
      promiseImplementation: Promise,
    })
  }

  /**
   * Gets an api token using an api key
   *
   * @returns {Promise}
   */
  async requestToken(): Promise<AuthenticationToken> {
    if (!this.token || Date.now() > new Date(this.token.expires_at).getTime()) {
      this.token = await this.makeRequest(HttpMethod.Get, 'authentication/token/new')
    }

    return this.token
  }

  /**
   * Gets the session id
   */
  async retrieveSession(): Promise<string> {
    const token = await this.requestToken()
    const request: SessionRequestParams = {
      request_token: token.request_token,
    }

    const res: SessionResponse = await this.makeRequest(HttpMethod.Get, 'authentication/session/new', request)

    this.sessionId = res.session_id

    return this.sessionId
  }

  /**
   * Compiles the endpoint based on the params
   */
  private getEndpoint(endpoint: string, params: RequestParams = {}): string {
    return Object.keys(params).reduce((compiled, key) => {
      return compiled.replace(`:${key}`, params[key])
    }, endpoint)
  }

  /**
   * Normalizes a request into a RequestParams object
   */
  private normalizeParams(endpoint: string, params: string | number | RequestParams = {}): RequestParams {
    if (isObject(params)) {
      return params
    }

    const matches = endpoint.match(/:[a-z]*/g) || []

    if (matches.length === 1) {
      return matches.reduce((obj, match) => {
        obj[match.slice(1)] = params

        return obj
      }, {})
    }

    return {}
  }

  /**
   * Compiles the data/query data to send with the request
   */
  private getParams(endpoint: string, params: RequestParams = {}): RequestParams {
    // Merge default parameters with the ones passed in
    const compiledParams: RequestParams = merge(
      {
        api_key: this.apiKey,
        ...(this.sessionId && { session_id: this.sessionId }),
      },
      params,
    )

    // Some endpoints have an optional account_id parameter (when there's a session).
    // If it's not included, assume we want the current user's id,
    // which is setting it to '{account_id}'
    if (endpoint.includes(':id') && !compiledParams.id && this.sessionId) {
      compiledParams.id = '{account_id}'
    }

    return compiledParams
  }

  /**
   * Performs the request to the server
   */
  private makeRequest(
    method: HttpMethod,
    endpoint: string,
    params: string | number | RequestParams = {},
    fetchOptions: RequestInit = {},
  ): Promise<any> {
    const normalizedParams: RequestParams = this.normalizeParams(endpoint, params)

    // Get the full query/data object
    const fullQuery: RequestParams = this.getParams(endpoint, normalizedParams)

    // Get the params that are needed for the endpoint
    // to remove from the data/params of the request
    const omittedProps = [...(endpoint.match(/:[a-z]*/gi) ?? [])].map((prop) => prop.slice(1))

    // Prepare the query
    const query = omit(fullQuery, omittedProps)

    let url = this.baseUrl + this.getEndpoint(endpoint, fullQuery)
    if (method === HttpMethod.Get) {
        url += '?' + new URLSearchParams(query).toString()
    }
    const options: RequestInit = {
        method,
        ...(method !== HttpMethod.Get && { body: JSON.stringify(query) }),
        ...fetchOptions,
    }

    return this.queue.add(async () => await (await fetch(url, options)).json())
  }

  private parseSearchParams(params: string | types.SearchRequest): types.SearchRequest {
    if (isString(params)) {
      return { query: params }
    }

    return params
  }

  configuration(fetchOptions?: RequestInit): Promise<types.ConfigurationResponse> {
    return this.makeRequest(HttpMethod.Get, 'configuration', null, fetchOptions)
  }

  countries(fetchOptions?: RequestInit): Promise<types.CountriesResponse> {
    return this.makeRequest(HttpMethod.Get, 'configuration/countries', null, fetchOptions)
  }

  jobs(fetchOptions?: RequestInit): Promise<Array<types.Job>> {
    return this.makeRequest(HttpMethod.Get, 'configuration/jobs', null, fetchOptions)
  }

  languages(fetchOptions?: RequestInit): Promise<Array<types.Language>> {
    return this.makeRequest(HttpMethod.Get, 'configuration/languages', null, fetchOptions)
  }

  primaryTranslations(fetchOptions?: RequestInit): Promise<Array<string>> {
    return this.makeRequest(HttpMethod.Get, 'configuration/primary_translations', null, fetchOptions)
  }

  timezones(fetchOptions?: RequestInit): Promise<Array<types.Timezone>> {
    return this.makeRequest(HttpMethod.Get, 'configuration/timezones', null, fetchOptions)
  }

  find(params?: types.FindRequest, fetchOptions?: RequestInit): Promise<types.FindResponse> {
    return this.makeRequest(HttpMethod.Get, 'find/:id', params, fetchOptions)
  }

  searchCompany(
    params: string | types.SearchRequest,
    fetchOptions?: RequestInit,
  ): Promise<types.SearchCompanyResponse> {
    return this.makeRequest(HttpMethod.Get, 'search/company', this.parseSearchParams(params), fetchOptions)
  }

  searchCollection(
    params: types.SearchRequest,
    fetchOptions?: RequestInit,
  ): Promise<types.SearchCollectionResponse> {
    return this.makeRequest(HttpMethod.Get, 'search/collection', this.parseSearchParams(params), fetchOptions)
  }

  searchKeyword(params: types.SearchRequest, fetchOptions?: RequestInit): Promise<types.SearchKeywordResponse> {
    return this.makeRequest(HttpMethod.Get, 'search/keyword', this.parseSearchParams(params), fetchOptions)
  }

  searchMovie(params: types.SearchMovieRequest, fetchOptions?: RequestInit): Promise<types.MovieResultsResponse> {
    return this.makeRequest(HttpMethod.Get, 'search/movie', this.parseSearchParams(params), fetchOptions)
  }

  searchMulti(params: types.SearchMultiRequest, fetchOptions?: RequestInit): Promise<types.SearchMultiResponse> {
    return this.makeRequest(HttpMethod.Get, 'search/multi', this.parseSearchParams(params), fetchOptions)
  }

  searchPerson(
    params: types.SearchMultiRequest,
    fetchOptions?: RequestInit,
  ): Promise<types.SearchPersonResponse> {
    return this.makeRequest(HttpMethod.Get, 'search/person', this.parseSearchParams(params), fetchOptions)
  }

  searchTv(params: types.SearchTvRequest, fetchOptions?: RequestInit): Promise<types.TvResultsResponse> {
    return this.makeRequest(HttpMethod.Get, 'search/tv', this.parseSearchParams(params), fetchOptions)
  }

  // Doesn't exist in documentation, may be deprecated
  searchList(params?: string | number | RequestParams, fetchOptions?: RequestInit): Promise<any> {
    return this.makeRequest(HttpMethod.Get, 'search/list', params, fetchOptions)
  }

  collectionInfo(
    params: string | number | types.CollectionRequest,
    fetchOptions?: RequestInit,
  ): Promise<types.CollectionInfoResponse> {
    return this.makeRequest(HttpMethod.Get, 'collection/:id', params, fetchOptions)
  }

  collectionImages(
    params: string | number | types.CollectionRequest,
    fetchOptions?: RequestInit,
  ): Promise<types.CollectionImagesResponse> {
    return this.makeRequest(HttpMethod.Get, 'collection/:id/images', params, fetchOptions)
  }

  collectionTranslations(
    params: string | number | types.CollectionRequest,
    fetchOptions?: RequestInit,
  ): Promise<types.CollectionTranslationsResponse> {
    return this.makeRequest(HttpMethod.Get, 'collection/:id/translations', params, fetchOptions)
  }

  discoverMovie(
    params?: types.DiscoverMovieRequest,
    fetchOptions?: RequestInit,
  ): Promise<types.DiscoverMovieResponse> {
    return this.makeRequest(HttpMethod.Get, 'discover/movie', params, fetchOptions)
  }

  discoverTv(params?: types.DiscoverTvRequest, fetchOptions?: RequestInit): Promise<types.DiscoverTvResponse> {
    return this.makeRequest(HttpMethod.Get, 'discover/tv', params, fetchOptions)
  }

  trending(params: types.TrendingRequest, fetchOptions?: RequestInit): Promise<types.TrendingResponse> {
    return this.makeRequest(HttpMethod.Get, 'trending/:media_type/:time_window', params, fetchOptions)
  }

  movieInfo(
    params: string | number | types.IdAppendToResponseRequest,
    fetchOptions?: RequestInit,
  ): Promise<types.MovieResponse> {
    return this.makeRequest(HttpMethod.Get, 'movie/:id', params, fetchOptions)
  }

  movieAccountStates(
    params: string | number | types.IdRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.MovieAccountStateResponse> {
    return this.makeRequest(HttpMethod.Get, 'movie/:id/account_states', params, fetchOptions)
  }

  movieAlternativeTitles(
    params: string | number | types.MovieAlternativeTitlesRequest,
    fetchOptions?: RequestInit,
  ): Promise<types.MovieAlternativeTitlesResponse> {
    return this.makeRequest(HttpMethod.Get, 'movie/:id/alternative_titles', params, fetchOptions)
  }

  movieChanges(
    params: string | number | types.ChangesRequest,
    fetchOptions?: RequestInit,
  ): Promise<types.MovieChangesResponse> {
    return this.makeRequest(HttpMethod.Get, 'movie/:id/changes', params, fetchOptions)
  }

  movieCredits(
    params: string | number | types.IdRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.CreditsResponse> {
    return this.makeRequest(HttpMethod.Get, 'movie/:id/credits', params, fetchOptions)
  }

  movieExternalIds(
    params: string | number | types.IdRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.MovieExternalIdsResponse> {
    return this.makeRequest(HttpMethod.Get, 'movie/:id/external_ids', params, fetchOptions)
  }

  movieImages(
    params: string | number | types.MovieImagesRequest,
    fetchOptions?: RequestInit,
  ): Promise<types.MovieImagesResponse> {
    return this.makeRequest(HttpMethod.Get, 'movie/:id/images', params, fetchOptions)
  }

  movieKeywords(
    params: string | number | types.IdRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.MovieKeywordResponse> {
    return this.makeRequest(HttpMethod.Get, 'movie/:id/keywords', params, fetchOptions)
  }

  movieReleaseDates(
    params: string | number | types.IdRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.MovieReleaseDatesResponse> {
    return this.makeRequest(HttpMethod.Get, 'movie/:id/release_dates', params, fetchOptions)
  }

  movieVideos(
    params: string | number | types.IdRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.VideosResponse> {
    return this.makeRequest(HttpMethod.Get, 'movie/:id/videos', params, fetchOptions)
  }

  movieWatchProviders(
    params: string | number | types.IdRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.WatchProviderResponse> {
    return this.makeRequest(HttpMethod.Get, 'movie/:id/watch/providers', params, fetchOptions)
  }

  movieWatchProviderList(
    params: types.WatchProvidersParams,
    fetchOptions?: RequestInit,
  ): Promise<types.WatchProviderListResponse> {
    return this.makeRequest(HttpMethod.Get, 'watch/providers/movie', params, fetchOptions)
  }

  movieTranslations(
    params: string | number | types.IdRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.MovieTranslationsResponse> {
    return this.makeRequest(HttpMethod.Get, 'movie/:id/translations', params, fetchOptions)
  }

  movieRecommendations(
    params: string | number | types.MovieRecommendationsRequest,
    fetchOptions?: RequestInit,
  ): Promise<types.MovieRecommendationsResponse> {
    return this.makeRequest(HttpMethod.Get, 'movie/:id/recommendations', params, fetchOptions)
  }

  movieSimilar(
    params: string | number | types.IdRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.SimilarMovieResponse> {
    return this.makeRequest(HttpMethod.Get, 'movie/:id/similar', params, fetchOptions)
  }

  movieReviews(
    params: string | number | types.MovieReviewsRequest,
    fetchOptions?: RequestInit,
  ): Promise<types.MovieReviewsResponse> {
    return this.makeRequest(HttpMethod.Get, 'movie/:id/reviews', params, fetchOptions)
  }

  movieLists(
    params: string | number | types.MovieListsRequest,
    fetchOptions?: RequestInit,
  ): Promise<types.MovieListsResponse> {
    return this.makeRequest(HttpMethod.Get, 'movie/:id/lists', params, fetchOptions)
  }

  movieRatingUpdate(params: types.RatingRequest, fetchOptions?: RequestInit): Promise<types.PostResponse> {
    return this.makeRequest(HttpMethod.Post, 'movie/:id/rating', params, fetchOptions)
  }

  movieRatingDelete(
    params: string | number | types.IdRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.PostResponse> {
    return this.makeRequest(HttpMethod.Delete, 'movie/:id/rating', params, fetchOptions)
  }

  movieLatest(params?: string | RequestParams, fetchOptions?: RequestInit): Promise<types.MovieResponse> {
    return this.makeRequest(
      HttpMethod.Get,
      'movie/latest',
      isString(params) ? { language: params } : params,
      fetchOptions,
    )
  }

  movieNowPlaying(
    params?: types.MovieNowPlayingRequest,
    fetchOptions?: RequestInit,
  ): Promise<types.MovieNowPlayingResponse> {
    return this.makeRequest(HttpMethod.Get, 'movie/now_playing', params, fetchOptions)
  }

  moviePopular(
    params?: types.PopularMoviesRequest,
    fetchOptions?: RequestInit,
  ): Promise<types.PopularMoviesResponse> {
    return this.makeRequest(HttpMethod.Get, 'movie/popular', params, fetchOptions)
  }

  movieTopRated(
    params?: types.TopRatedMoviesRequest,
    fetchOptions?: RequestInit,
  ): Promise<types.TopRatedMoviesResponse> {
    return this.makeRequest(HttpMethod.Get, 'movie/top_rated', params, fetchOptions)
  }

  upcomingMovies(
    params: types.UpcomingMoviesRequest,
    fetchOptions?: RequestInit,
  ): Promise<types.UpcomingMoviesResponse> {
    return this.makeRequest(HttpMethod.Get, 'movie/upcoming', params, fetchOptions)
  }

  tvInfo(
    params: string | number | types.IdAppendToResponseRequest,
    fetchOptions?: RequestInit,
  ): Promise<types.ShowResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id', params, fetchOptions)
  }

  tvAccountStates(
    params: string | number | types.IdRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.ShowAccountStatesResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/account_states', params, fetchOptions)
  }

  tvAlternativeTitles(
    params: string | number | types.IdRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.ShowAlternativeTitlesResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/alternative_titles', params, fetchOptions)
  }

  tvChanges(
    params: string | number | types.ChangesRequest,
    fetchOptions?: RequestInit,
  ): Promise<types.ShowChangesResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/changes', params, fetchOptions)
  }

  tvContentRatings(
    params: string | number | types.IdRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.ShowContentRatingResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/content_ratings', params, fetchOptions)
  }

  tvCredits(
    params: string | number | types.IdRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.CreditsResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/credits', params, fetchOptions)
  }
  tvAggregateCredits(
    params: string | number | types.IdRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.AggregateCreditsResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/aggregate_credits', params, fetchOptions)
  }
  episodeGroups(
    params: string | number | types.IdRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.TvEpisodeGroupsResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/episode_groups', params, fetchOptions)
  }

  tvExternalIds(
    params: string | number | types.IdRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.TvExternalIdsResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/external_ids', params, fetchOptions)
  }

  tvImages(
    params: string | number | types.IdRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.TvImagesResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/images', params, fetchOptions)
  }

  tvKeywords(
    params: string | number | types.IdRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.TvKeywordsResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/keywords', params, fetchOptions)
  }

  tvRecommendations(
    params: string | number | types.IdPagedRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.TvResultsResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/recommendations', params, fetchOptions)
  }

  tvReviews(
    params: string | number | types.IdPagedRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.TvReviewsResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/reviews', params, fetchOptions)
  }

  tvScreenedTheatrically(
    params: string | number | types.IdRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.TvScreenTheatricallyResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/screened_theatrically', params, fetchOptions)
  }

  tvSimilar(
    params: string | number | types.IdPagedRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.TvSimilarShowsResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/similar', params, fetchOptions)
  }

  tvTranslations(
    params: string | number | types.IdRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.TvTranslationsResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/translations', params, fetchOptions)
  }

  tvVideos(
    params: string | number | types.IdRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.VideosResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/videos', params, fetchOptions)
  }

  tvWatchProviders(
    params: string | number | types.IdRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.WatchProviderResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/watch/providers', params, fetchOptions)
  }

  tvWatchProviderList(
    params: types.WatchProvidersParams,
    fetchOptions?: RequestInit,
  ): Promise<types.WatchProviderListResponse> {
    return this.makeRequest(HttpMethod.Get, 'watch/providers/tv', params, fetchOptions)
  }

  tvRatingUpdate(params: types.RatingRequest, fetchOptions?: RequestInit): Promise<types.PostResponse> {
    return this.makeRequest(HttpMethod.Post, 'tv/:id/rating', params, fetchOptions)
  }

  tvRatingDelete(
    params: string | number | types.IdRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.PostResponse> {
    return this.makeRequest(HttpMethod.Delete, 'tv/:id/rating', params, fetchOptions)
  }

  tvLatest(params?: RequestParams, fetchOptions?: RequestInit): Promise<types.ShowResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/latest', params, fetchOptions)
  }

  tvAiringToday(params?: types.PagedRequestParams, fetchOptions?: RequestInit): Promise<types.TvResultsResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/airing_today', params, fetchOptions)
  }

  tvOnTheAir(params?: types.PagedRequestParams, fetchOptions?: RequestInit): Promise<types.TvResultsResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/on_the_air', params, fetchOptions)
  }

  tvPopular(params?: types.PagedRequestParams, fetchOptions?: RequestInit): Promise<types.TvResultsResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/popular', params, fetchOptions)
  }

  tvTopRated(params?: types.PagedRequestParams, fetchOptions?: RequestInit): Promise<types.TvResultsResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/top_rated', params, fetchOptions)
  }

  seasonInfo(params: types.TvSeasonRequest, fetchOptions?: RequestInit): Promise<types.TvSeasonResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/season/:season_number', params, fetchOptions)
  }

  seasonChanges(
    params: types.ChangesRequest,
    fetchOptions?: RequestInit,
  ): Promise<types.TvSeasonChangesResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/season/:id/changes', params, fetchOptions)
  }

  seasonAccountStates(
    params: types.TvSeasonRequest,
    fetchOptions?: RequestInit,
  ): Promise<types.TvSeasonAccountStatesResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/season/:season_number/account_states', params, fetchOptions)
  }

  seasonCredits(params: types.TvSeasonRequest, fetchOptions?: RequestInit): Promise<types.CreditsResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/season/:season_number/credits', params, fetchOptions)
  }

  seasonAggregateCredits(params: types.TvAggregateCreditsRequest, fetchOptions?: RequestInit): Promise<types.CreditsResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/season/:season_number/aggregate_credits', params, fetchOptions)
  }

  seasonExternalIds(
    params: types.TvSeasonRequest,
    fetchOptions?: RequestInit,
  ): Promise<types.TvSeasonExternalIdsResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/season/:season_number/external_ids', params, fetchOptions)
  }

  seasonImages(params: types.TvSeasonRequest, fetchOptions?: RequestInit): Promise<types.TvSeasonImagesResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/season/:season_number/images', params, fetchOptions)
  }

  seasonVideos(params: types.TvSeasonRequest, fetchOptions?: RequestInit): Promise<types.VideosResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/season/:season_number/videos', params, fetchOptions)
  }

  episodeInfo(params: types.EpisodeRequest, fetchOptions?: RequestInit): Promise<types.Episode> {
    return this.makeRequest(HttpMethod.Get, 'tv/:id/season/:season_number/episode/:episode_number', params, fetchOptions)
  }

  episodeChanges(
    params: string | number | types.ChangesRequest,
    fetchOptions?: RequestInit,
  ): Promise<types.EpisodeChangesResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/episode/:id/changes', params, fetchOptions)
  }

  episodeAccountStates(
    params: types.EpisodeRequest,
    fetchOptions?: RequestInit,
  ): Promise<types.EpisodeAccountStatesResponse> {
    return this.makeRequest(
      HttpMethod.Get,
      'tv/:id/season/:season_number/episode/:episode_number/account_states',
      params,
      fetchOptions,
    )
  }

  episodeCredits(
    params: types.EpisodeRequest,
    fetchOptions?: RequestInit,
  ): Promise<types.EpisodeCreditsResponse> {
    return this.makeRequest(
      HttpMethod.Get,
      'tv/:id/season/:season_number/episode/:episode_number/credits',
      params,
      fetchOptions,
    )
  }

  episodeExternalIds(
    params: types.EpisodeRequest,
    fetchOptions?: RequestInit,
  ): Promise<types.EpisodeExternalIdsResponse> {
    return this.makeRequest(
      HttpMethod.Get,
      'tv/:id/season/:season_number/episode/:episode_number/external_ids',
      params,
      fetchOptions,
    )
  }

  episodeImages(params: types.EpisodeRequest, fetchOptions?: RequestInit): Promise<types.EpisodeImagesResponse> {
    return this.makeRequest(
      HttpMethod.Get,
      'tv/:id/season/:season_number/episode/:episode_number/images',
      params,
      fetchOptions,
    )
  }

  episodeTranslations(
    params: types.EpisodeRequest,
    fetchOptions?: RequestInit,
  ): Promise<types.EpisodeTranslationsResponse> {
    return this.makeRequest(
      HttpMethod.Get,
      'tv/:id/season/:season_number/episode/:episode_number/translations',
      params,
      fetchOptions,
    )
  }

  episodeRatingUpdate(
    params: types.EpisodeRatingRequest,
    fetchOptions?: RequestInit,
  ): Promise<types.PostResponse> {
    return this.makeRequest(
      HttpMethod.Post,
      'tv/:id/season/:season_number/episode/:episode_number/rating',
      params,
      fetchOptions,
    )
  }

  episodeRatingDelete(params: types.EpisodeRequest, fetchOptions?: RequestInit): Promise<types.PostResponse> {
    return this.makeRequest(
      HttpMethod.Delete,
      'tv/:id/season/:season_number/episode/:episode_number/rating',
      params,
      fetchOptions,
    )
  }

  episodeVideos(params: types.EpisodeRequest, fetchOptions?: RequestInit): Promise<types.EpisodeVideosResponse> {
    return this.makeRequest(
      HttpMethod.Get,
      'tv/:id/season/:season_number/episode/:episode_number/translations',
      params,
      fetchOptions,
    )
  }

  personInfo(
    params: string | number | types.IdAppendToResponseRequest,
    fetchOptions?: RequestInit,
  ): Promise<types.Person> {
    return this.makeRequest(HttpMethod.Get, 'person/:id', params, fetchOptions)
  }

  personChanges(
    params: string | number | types.ChangesRequest,
    fetchOptions?: RequestInit,
  ): Promise<types.PersonChangesResponse> {
    return this.makeRequest(HttpMethod.Get, 'person/:id/changes', params, fetchOptions)
  }

  personMovieCredits(
    params: string | number | types.IdRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.PersonMovieCreditsResponse> {
    return this.makeRequest(HttpMethod.Get, 'person/:id/movie_credits', params, fetchOptions)
  }

  personTvCredits(
    params: string | number | types.IdRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.PersonTvCreditsResponse> {
    return this.makeRequest(HttpMethod.Get, 'person/:id/tv_credits', params, fetchOptions)
  }

  personCombinedCredits(
    params: string | number | types.IdRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.PersonCombinedCreditsResponse> {
    return this.makeRequest(HttpMethod.Get, 'person/:id/combined_credits', params, fetchOptions)
  }

  personExternalIds(
    params: string | number | types.IdRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.PersonExternalIdsResponse> {
    return this.makeRequest(HttpMethod.Get, 'person/:id/external_ids', params, fetchOptions)
  }

  personImages(
    params: string | number | types.IdRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.PersonImagesResponse> {
    return this.makeRequest(HttpMethod.Get, 'person/:id/images', params, fetchOptions)
  }

  personTaggedImages(
    params: string | number | types.IdPagedRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.PersonTaggedImagesResponse> {
    return this.makeRequest(HttpMethod.Get, 'person/:id/tagged_images', params, fetchOptions)
  }

  personTranslations(
    params: string | number | types.IdRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.PersonTranslationsResponse> {
    return this.makeRequest(HttpMethod.Get, 'person/:id/translations', params, fetchOptions)
  }

  personLatest(params?: RequestParams, fetchOptions?: RequestInit): Promise<types.Person> {
    return this.makeRequest(HttpMethod.Get, 'person/latest', params, fetchOptions)
  }

  personPopular(
    params?: types.PagedRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.PersonPopularResponse> {
    return this.makeRequest(HttpMethod.Get, 'person/popular', params, fetchOptions)
  }

  creditInfo(
    params?: string | number | types.IdRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.CreditDetailsResponse> {
    return this.makeRequest(HttpMethod.Get, 'credit/:id', params, fetchOptions)
  }

  listInfo(
    params: string | number | types.IdRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.ListsDetailResponse> {
    return this.makeRequest(HttpMethod.Get, 'list/:id', params, fetchOptions)
  }

  listStatus(params: types.IdRequestParams, fetchOptions?: RequestInit): Promise<types.ListsStatusResponse> {
    return this.makeRequest(HttpMethod.Get, 'list/:id/item_status', params, fetchOptions)
  }

  createList(params: types.CreateListParams, fetchOptions?: RequestInit): Promise<types.CreateListResponse> {
    return this.makeRequest(HttpMethod.Post, 'list', params, fetchOptions)
  }

  createListItem(params: types.CreateListItemParams, fetchOptions?: RequestInit): Promise<types.PostResponse> {
    return this.makeRequest(HttpMethod.Post, 'list/:id/add_item', params, fetchOptions)
  }

  removeListItem(params: types.CreateListItemParams, fetchOptions?: RequestInit): Promise<types.PostResponse> {
    return this.makeRequest(HttpMethod.Post, 'list/:id/remove_item', params, fetchOptions)
  }

  clearList(params: types.ClearListParams, fetchOptions?: RequestInit): Promise<types.PostResponse> {
    return this.makeRequest(HttpMethod.Post, 'list/:id/clear', params, fetchOptions)
  }

  deleteList(
    params: string | number | types.IdRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.PostResponse> {
    return this.makeRequest(HttpMethod.Delete, 'list/:id', params, fetchOptions)
  }

  genreMovieList(params?: RequestParams, fetchOptions?: RequestInit): Promise<types.GenresResponse> {
    return this.makeRequest(HttpMethod.Get, 'genre/movie/list', params, fetchOptions)
  }

  genreTvList(params?: RequestParams, fetchOptions?: RequestInit): Promise<types.GenresResponse> {
    return this.makeRequest(HttpMethod.Get, 'genre/tv/list', params, fetchOptions)
  }

  keywordInfo(
    params?: string | number | types.IdRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.KeywordResponse> {
    return this.makeRequest(HttpMethod.Get, 'keyword/:id', params, fetchOptions)
  }

  keywordMovies(
    params: string | number | types.KeywordMoviesParams,
    fetchOptions?: RequestInit,
  ): Promise<types.MovieResultsResponse> {
    return this.makeRequest(HttpMethod.Get, 'keyword/:id/movies', params, fetchOptions)
  }

  companyInfo(
    params: string | number | types.IdRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.Company> {
    return this.makeRequest(HttpMethod.Get, 'company/:id', params, fetchOptions)
  }

  companyAlternativeNames(
    params: string | number | RequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.CompanyAlternativeNamesResponse> {
    return this.makeRequest(HttpMethod.Get, 'company/:id/alternative_names', params, fetchOptions)
  }

  companyImages(
    params: string | number | RequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.CompanyImagesResponse> {
    return this.makeRequest(HttpMethod.Get, 'company/:id/images', params, fetchOptions)
  }

  accountInfo(fetchOptions?: RequestInit): Promise<types.AccountInfoResponse> {
    return this.makeRequest(HttpMethod.Get, 'account', null, fetchOptions)
  }

  accountLists(
    params: string | number | types.IdPagedRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.AccountListsResponse> {
    return this.makeRequest(HttpMethod.Get, 'account/:id/lists', params, fetchOptions)
  }

  accountFavoriteMovies(
    params?: string | number | types.AccountMediaRequest,
    fetchOptions?: RequestInit,
  ): Promise<types.MovieResultsResponse> {
    return this.makeRequest(HttpMethod.Get, 'account/:id/favorite/movies', params, fetchOptions)
  }

  accountFavoriteTv(
    params?: string | number | types.AccountMediaRequest,
    fetchOptions?: RequestInit,
  ): Promise<types.TvResultsResponse> {
    return this.makeRequest(HttpMethod.Get, 'account/:id/favorite/tv', params, fetchOptions)
  }

  accountFavoriteUpdate(
    params: types.MarkAsFavoriteRequest,
    fetchOptions?: RequestInit,
  ): Promise<types.PostResponse> {
    return this.makeRequest(HttpMethod.Post, 'account/:id/favorite', params, fetchOptions)
  }

  accountRatedMovies(
    params?: string | number | types.AccountMediaRequest,
    fetchOptions?: RequestInit,
  ): Promise<types.MovieResultsResponse> {
    return this.makeRequest(HttpMethod.Get, 'account/:id/rated/movies', params, fetchOptions)
  }

  accountRatedTv(
    params?: string | number | types.AccountMediaRequest,
    fetchOptions?: RequestInit,
  ): Promise<types.TvResultsResponse> {
    return this.makeRequest(HttpMethod.Get, 'account/:id/rated/tv', params, fetchOptions)
  }

  accountRatedTvEpisodes(
    params?: string | number | types.AccountMediaRequest,
    fetchOptions?: RequestInit,
  ): Promise<types.EpisodeResultsResponse> {
    return this.makeRequest(HttpMethod.Get, 'account/:id/rated/tv/episodes', params, fetchOptions)
  }

  accountMovieWatchlist(
    params?: string | number | types.AccountMediaRequest,
    fetchOptions?: RequestInit,
  ): Promise<types.MovieResultsResponse> {
    return this.makeRequest(HttpMethod.Get, 'account/:id/watchlist/movies', params, fetchOptions)
  }

  accountTvWatchlist(
    params?: string | number | types.AccountMediaRequest,
    fetchOptions?: RequestInit,
  ): Promise<types.TvResultsResponse> {
    return this.makeRequest(HttpMethod.Get, 'account/:id/watchlist/tv', params, fetchOptions)
  }

  accountWatchlistUpdate(
    params: types.AccountWatchlistRequest,
    fetchOptions?: RequestInit,
  ): Promise<types.PostResponse> {
    return this.makeRequest(HttpMethod.Post, 'account/:id/watchlist', params, fetchOptions)
  }

  changedMovies(params?: types.ChangesRequest, fetchOptions?: RequestInit): Promise<types.ChangesResponse> {
    return this.makeRequest(HttpMethod.Get, 'movie/changes', params, fetchOptions)
  }

  changedTvs(params?: types.ChangesRequest, fetchOptions?: RequestInit): Promise<types.ChangesResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/changes', params, fetchOptions)
  }

  changedPeople(params?: types.ChangesRequest, fetchOptions?: RequestInit): Promise<types.ChangesResponse> {
    return this.makeRequest(HttpMethod.Get, 'person/changes', params, fetchOptions)
  }

  movieCertifications(fetchOptions?: RequestInit): Promise<types.CertificationsResponse> {
    return this.makeRequest(HttpMethod.Get, 'certification/movie/list', null, fetchOptions)
  }

  tvCertifications(fetchOptions?: RequestInit): Promise<types.CertificationsResponse> {
    return this.makeRequest(HttpMethod.Get, 'certification/tv/list', null, fetchOptions)
  }

  networkInfo(
    params: string | number | types.IdRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.NetworkResponse> {
    return this.makeRequest(HttpMethod.Get, 'network/:id', params, fetchOptions)
  }

  networkAlternativeNames(
    params: string | number | types.IdRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.CompanyAlternativeNamesResponse> {
    return this.makeRequest(HttpMethod.Get, 'network/:id/alternative_names', params, fetchOptions)
  }

  networkImages(
    params: string | number | types.IdRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.CompanyImagesResponse> {
    return this.makeRequest(HttpMethod.Get, 'network/:id/images', params, fetchOptions)
  }

  review(params: string | number | types.IdRequestParams, fetchOptions?: RequestInit): Promise<types.Review> {
    return this.makeRequest(HttpMethod.Get, 'review/:id', params, fetchOptions)
  }

  episodeGroup(
    params: string | number | types.IdRequestParams,
    fetchOptions?: RequestInit,
  ): Promise<types.EpisodeGroupResponse> {
    return this.makeRequest(HttpMethod.Get, 'tv/episode_group/:id', params, fetchOptions)
  }
}
