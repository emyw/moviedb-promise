import { AuthenticationToken, RequestParams } from './types';
import * as types from './request-types';
export declare class MovieDb {
    private apiKey;
    private token;
    private queue;
    baseUrl: string;
    sessionId: string;
    constructor(apiKey: string, baseUrl?: string, requestsPerSecondLimit?: number);
    /**
     * Gets an api token using an api key
     *
     * @returns {Promise}
     */
    requestToken(): Promise<AuthenticationToken>;
    /**
     * Gets the session id
     */
    retrieveSession(): Promise<string>;
    /**
     * Compiles the endpoint based on the params
     */
    private getEndpoint;
    /**
     * Normalizes a request into a RequestParams object
     */
    private normalizeParams;
    /**
     * Compiles the data/query data to send with the request
     */
    private getParams;
    /**
     * Performs the request to the server
     */
    private makeRequest;
    private parseSearchParams;
    configuration(fetchOptions?: RequestInit): Promise<types.ConfigurationResponse>;
    countries(fetchOptions?: RequestInit): Promise<types.CountriesResponse>;
    jobs(fetchOptions?: RequestInit): Promise<Array<types.Job>>;
    languages(fetchOptions?: RequestInit): Promise<Array<types.Language>>;
    primaryTranslations(fetchOptions?: RequestInit): Promise<Array<string>>;
    timezones(fetchOptions?: RequestInit): Promise<Array<types.Timezone>>;
    find(params?: types.FindRequest, fetchOptions?: RequestInit): Promise<types.FindResponse>;
    searchCompany(params: string | types.SearchRequest, fetchOptions?: RequestInit): Promise<types.SearchCompanyResponse>;
    searchCollection(params: types.SearchRequest, fetchOptions?: RequestInit): Promise<types.SearchCollectionResponse>;
    searchKeyword(params: types.SearchRequest, fetchOptions?: RequestInit): Promise<types.SearchKeywordResponse>;
    searchMovie(params: types.SearchMovieRequest, fetchOptions?: RequestInit): Promise<types.MovieResultsResponse>;
    searchMulti(params: types.SearchMultiRequest, fetchOptions?: RequestInit): Promise<types.SearchMultiResponse>;
    searchPerson(params: types.SearchMultiRequest, fetchOptions?: RequestInit): Promise<types.SearchPersonResponse>;
    searchTv(params: types.SearchTvRequest, fetchOptions?: RequestInit): Promise<types.TvResultsResponse>;
    searchList(params?: string | number | RequestParams, fetchOptions?: RequestInit): Promise<any>;
    collectionInfo(params: string | number | types.CollectionRequest, fetchOptions?: RequestInit): Promise<types.CollectionInfoResponse>;
    collectionImages(params: string | number | types.CollectionRequest, fetchOptions?: RequestInit): Promise<types.CollectionImagesResponse>;
    collectionTranslations(params: string | number | types.CollectionRequest, fetchOptions?: RequestInit): Promise<types.CollectionTranslationsResponse>;
    discoverMovie(params?: types.DiscoverMovieRequest, fetchOptions?: RequestInit): Promise<types.DiscoverMovieResponse>;
    discoverTv(params?: types.DiscoverTvRequest, fetchOptions?: RequestInit): Promise<types.DiscoverTvResponse>;
    trending(params: types.TrendingRequest, fetchOptions?: RequestInit): Promise<types.TrendingResponse>;
    movieInfo(params: string | number | types.IdAppendToResponseRequest, fetchOptions?: RequestInit): Promise<types.MovieResponse>;
    movieAccountStates(params: string | number | types.IdRequestParams, fetchOptions?: RequestInit): Promise<types.MovieAccountStateResponse>;
    movieAlternativeTitles(params: string | number | types.MovieAlternativeTitlesRequest, fetchOptions?: RequestInit): Promise<types.MovieAlternativeTitlesResponse>;
    movieChanges(params: string | number | types.ChangesRequest, fetchOptions?: RequestInit): Promise<types.MovieChangesResponse>;
    movieCredits(params: string | number | types.IdRequestParams, fetchOptions?: RequestInit): Promise<types.CreditsResponse>;
    movieExternalIds(params: string | number | types.IdRequestParams, fetchOptions?: RequestInit): Promise<types.MovieExternalIdsResponse>;
    movieImages(params: string | number | types.MovieImagesRequest, fetchOptions?: RequestInit): Promise<types.MovieImagesResponse>;
    movieKeywords(params: string | number | types.IdRequestParams, fetchOptions?: RequestInit): Promise<types.MovieKeywordResponse>;
    movieReleaseDates(params: string | number | types.IdRequestParams, fetchOptions?: RequestInit): Promise<types.MovieReleaseDatesResponse>;
    movieVideos(params: string | number | types.IdRequestParams, fetchOptions?: RequestInit): Promise<types.VideosResponse>;
    movieWatchProviders(params: string | number | types.IdRequestParams, fetchOptions?: RequestInit): Promise<types.WatchProviderResponse>;
    movieWatchProviderList(params: types.WatchProvidersParams, fetchOptions?: RequestInit): Promise<types.WatchProviderListResponse>;
    movieTranslations(params: string | number | types.IdRequestParams, fetchOptions?: RequestInit): Promise<types.MovieTranslationsResponse>;
    movieRecommendations(params: string | number | types.MovieRecommendationsRequest, fetchOptions?: RequestInit): Promise<types.MovieRecommendationsResponse>;
    movieSimilar(params: string | number | types.IdRequestParams, fetchOptions?: RequestInit): Promise<types.SimilarMovieResponse>;
    movieReviews(params: string | number | types.MovieReviewsRequest, fetchOptions?: RequestInit): Promise<types.MovieReviewsResponse>;
    movieLists(params: string | number | types.MovieListsRequest, fetchOptions?: RequestInit): Promise<types.MovieListsResponse>;
    movieRatingUpdate(params: types.RatingRequest, fetchOptions?: RequestInit): Promise<types.PostResponse>;
    movieRatingDelete(params: string | number | types.IdRequestParams, fetchOptions?: RequestInit): Promise<types.PostResponse>;
    movieLatest(params?: string | RequestParams, fetchOptions?: RequestInit): Promise<types.MovieResponse>;
    movieNowPlaying(params?: types.MovieNowPlayingRequest, fetchOptions?: RequestInit): Promise<types.MovieNowPlayingResponse>;
    moviePopular(params?: types.PopularMoviesRequest, fetchOptions?: RequestInit): Promise<types.PopularMoviesResponse>;
    movieTopRated(params?: types.TopRatedMoviesRequest, fetchOptions?: RequestInit): Promise<types.TopRatedMoviesResponse>;
    upcomingMovies(params: types.UpcomingMoviesRequest, fetchOptions?: RequestInit): Promise<types.UpcomingMoviesResponse>;
    tvInfo(params: string | number | types.IdAppendToResponseRequest, fetchOptions?: RequestInit): Promise<types.ShowResponse>;
    tvAccountStates(params: string | number | types.IdRequestParams, fetchOptions?: RequestInit): Promise<types.ShowAccountStatesResponse>;
    tvAlternativeTitles(params: string | number | types.IdRequestParams, fetchOptions?: RequestInit): Promise<types.ShowAlternativeTitlesResponse>;
    tvChanges(params: string | number | types.ChangesRequest, fetchOptions?: RequestInit): Promise<types.ShowChangesResponse>;
    tvContentRatings(params: string | number | types.IdRequestParams, fetchOptions?: RequestInit): Promise<types.ShowContentRatingResponse>;
    tvCredits(params: string | number | types.IdRequestParams, fetchOptions?: RequestInit): Promise<types.CreditsResponse>;
    tvAggregateCredits(params: string | number | types.IdRequestParams, fetchOptions?: RequestInit): Promise<types.AggregateCreditsResponse>;
    episodeGroups(params: string | number | types.IdRequestParams, fetchOptions?: RequestInit): Promise<types.TvEpisodeGroupsResponse>;
    tvExternalIds(params: string | number | types.IdRequestParams, fetchOptions?: RequestInit): Promise<types.TvExternalIdsResponse>;
    tvImages(params: string | number | types.IdRequestParams, fetchOptions?: RequestInit): Promise<types.TvImagesResponse>;
    tvKeywords(params: string | number | types.IdRequestParams, fetchOptions?: RequestInit): Promise<types.TvKeywordsResponse>;
    tvRecommendations(params: string | number | types.IdPagedRequestParams, fetchOptions?: RequestInit): Promise<types.TvResultsResponse>;
    tvReviews(params: string | number | types.IdPagedRequestParams, fetchOptions?: RequestInit): Promise<types.TvReviewsResponse>;
    tvScreenedTheatrically(params: string | number | types.IdRequestParams, fetchOptions?: RequestInit): Promise<types.TvScreenTheatricallyResponse>;
    tvSimilar(params: string | number | types.IdPagedRequestParams, fetchOptions?: RequestInit): Promise<types.TvSimilarShowsResponse>;
    tvTranslations(params: string | number | types.IdRequestParams, fetchOptions?: RequestInit): Promise<types.TvTranslationsResponse>;
    tvVideos(params: string | number | types.IdRequestParams, fetchOptions?: RequestInit): Promise<types.VideosResponse>;
    tvWatchProviders(params: string | number | types.IdRequestParams, fetchOptions?: RequestInit): Promise<types.WatchProviderResponse>;
    tvWatchProviderList(params: types.WatchProvidersParams, fetchOptions?: RequestInit): Promise<types.WatchProviderListResponse>;
    tvRatingUpdate(params: types.RatingRequest, fetchOptions?: RequestInit): Promise<types.PostResponse>;
    tvRatingDelete(params: string | number | types.IdRequestParams, fetchOptions?: RequestInit): Promise<types.PostResponse>;
    tvLatest(params?: RequestParams, fetchOptions?: RequestInit): Promise<types.ShowResponse>;
    tvAiringToday(params?: types.PagedRequestParams, fetchOptions?: RequestInit): Promise<types.TvResultsResponse>;
    tvOnTheAir(params?: types.PagedRequestParams, fetchOptions?: RequestInit): Promise<types.TvResultsResponse>;
    tvPopular(params?: types.PagedRequestParams, fetchOptions?: RequestInit): Promise<types.TvResultsResponse>;
    tvTopRated(params?: types.PagedRequestParams, fetchOptions?: RequestInit): Promise<types.TvResultsResponse>;
    seasonInfo(params: types.TvSeasonRequest, fetchOptions?: RequestInit): Promise<types.TvSeasonResponse>;
    seasonChanges(params: types.ChangesRequest, fetchOptions?: RequestInit): Promise<types.TvSeasonChangesResponse>;
    seasonAccountStates(params: types.TvSeasonRequest, fetchOptions?: RequestInit): Promise<types.TvSeasonAccountStatesResponse>;
    seasonCredits(params: types.TvSeasonRequest, fetchOptions?: RequestInit): Promise<types.CreditsResponse>;
    seasonAggregateCredits(params: types.TvAggregateCreditsRequest, fetchOptions?: RequestInit): Promise<types.CreditsResponse>;
    seasonExternalIds(params: types.TvSeasonRequest, fetchOptions?: RequestInit): Promise<types.TvSeasonExternalIdsResponse>;
    seasonImages(params: types.TvSeasonRequest, fetchOptions?: RequestInit): Promise<types.TvSeasonImagesResponse>;
    seasonVideos(params: types.TvSeasonRequest, fetchOptions?: RequestInit): Promise<types.VideosResponse>;
    episodeInfo(params: types.EpisodeRequest, fetchOptions?: RequestInit): Promise<types.Episode>;
    episodeChanges(params: string | number | types.ChangesRequest, fetchOptions?: RequestInit): Promise<types.EpisodeChangesResponse>;
    episodeAccountStates(params: types.EpisodeRequest, fetchOptions?: RequestInit): Promise<types.EpisodeAccountStatesResponse>;
    episodeCredits(params: types.EpisodeRequest, fetchOptions?: RequestInit): Promise<types.EpisodeCreditsResponse>;
    episodeExternalIds(params: types.EpisodeRequest, fetchOptions?: RequestInit): Promise<types.EpisodeExternalIdsResponse>;
    episodeImages(params: types.EpisodeRequest, fetchOptions?: RequestInit): Promise<types.EpisodeImagesResponse>;
    episodeTranslations(params: types.EpisodeRequest, fetchOptions?: RequestInit): Promise<types.EpisodeTranslationsResponse>;
    episodeRatingUpdate(params: types.EpisodeRatingRequest, fetchOptions?: RequestInit): Promise<types.PostResponse>;
    episodeRatingDelete(params: types.EpisodeRequest, fetchOptions?: RequestInit): Promise<types.PostResponse>;
    episodeVideos(params: types.EpisodeRequest, fetchOptions?: RequestInit): Promise<types.EpisodeVideosResponse>;
    personInfo(params: string | number | types.IdAppendToResponseRequest, fetchOptions?: RequestInit): Promise<types.Person>;
    personChanges(params: string | number | types.ChangesRequest, fetchOptions?: RequestInit): Promise<types.PersonChangesResponse>;
    personMovieCredits(params: string | number | types.IdRequestParams, fetchOptions?: RequestInit): Promise<types.PersonMovieCreditsResponse>;
    personTvCredits(params: string | number | types.IdRequestParams, fetchOptions?: RequestInit): Promise<types.PersonTvCreditsResponse>;
    personCombinedCredits(params: string | number | types.IdRequestParams, fetchOptions?: RequestInit): Promise<types.PersonCombinedCreditsResponse>;
    personExternalIds(params: string | number | types.IdRequestParams, fetchOptions?: RequestInit): Promise<types.PersonExternalIdsResponse>;
    personImages(params: string | number | types.IdRequestParams, fetchOptions?: RequestInit): Promise<types.PersonImagesResponse>;
    personTaggedImages(params: string | number | types.IdPagedRequestParams, fetchOptions?: RequestInit): Promise<types.PersonTaggedImagesResponse>;
    personTranslations(params: string | number | types.IdRequestParams, fetchOptions?: RequestInit): Promise<types.PersonTranslationsResponse>;
    personLatest(params?: RequestParams, fetchOptions?: RequestInit): Promise<types.Person>;
    personPopular(params?: types.PagedRequestParams, fetchOptions?: RequestInit): Promise<types.PersonPopularResponse>;
    creditInfo(params?: string | number | types.IdRequestParams, fetchOptions?: RequestInit): Promise<types.CreditDetailsResponse>;
    listInfo(params: string | number | types.IdRequestParams, fetchOptions?: RequestInit): Promise<types.ListsDetailResponse>;
    listStatus(params: types.IdRequestParams, fetchOptions?: RequestInit): Promise<types.ListsStatusResponse>;
    createList(params: types.CreateListParams, fetchOptions?: RequestInit): Promise<types.CreateListResponse>;
    createListItem(params: types.CreateListItemParams, fetchOptions?: RequestInit): Promise<types.PostResponse>;
    removeListItem(params: types.CreateListItemParams, fetchOptions?: RequestInit): Promise<types.PostResponse>;
    clearList(params: types.ClearListParams, fetchOptions?: RequestInit): Promise<types.PostResponse>;
    deleteList(params: string | number | types.IdRequestParams, fetchOptions?: RequestInit): Promise<types.PostResponse>;
    genreMovieList(params?: RequestParams, fetchOptions?: RequestInit): Promise<types.GenresResponse>;
    genreTvList(params?: RequestParams, fetchOptions?: RequestInit): Promise<types.GenresResponse>;
    keywordInfo(params?: string | number | types.IdRequestParams, fetchOptions?: RequestInit): Promise<types.KeywordResponse>;
    keywordMovies(params: string | number | types.KeywordMoviesParams, fetchOptions?: RequestInit): Promise<types.MovieResultsResponse>;
    companyInfo(params: string | number | types.IdRequestParams, fetchOptions?: RequestInit): Promise<types.Company>;
    companyAlternativeNames(params: string | number | RequestParams, fetchOptions?: RequestInit): Promise<types.CompanyAlternativeNamesResponse>;
    companyImages(params: string | number | RequestParams, fetchOptions?: RequestInit): Promise<types.CompanyImagesResponse>;
    accountInfo(fetchOptions?: RequestInit): Promise<types.AccountInfoResponse>;
    accountLists(params: string | number | types.IdPagedRequestParams, fetchOptions?: RequestInit): Promise<types.AccountListsResponse>;
    accountFavoriteMovies(params?: string | number | types.AccountMediaRequest, fetchOptions?: RequestInit): Promise<types.MovieResultsResponse>;
    accountFavoriteTv(params?: string | number | types.AccountMediaRequest, fetchOptions?: RequestInit): Promise<types.TvResultsResponse>;
    accountFavoriteUpdate(params: types.MarkAsFavoriteRequest, fetchOptions?: RequestInit): Promise<types.PostResponse>;
    accountRatedMovies(params?: string | number | types.AccountMediaRequest, fetchOptions?: RequestInit): Promise<types.MovieResultsResponse>;
    accountRatedTv(params?: string | number | types.AccountMediaRequest, fetchOptions?: RequestInit): Promise<types.TvResultsResponse>;
    accountRatedTvEpisodes(params?: string | number | types.AccountMediaRequest, fetchOptions?: RequestInit): Promise<types.EpisodeResultsResponse>;
    accountMovieWatchlist(params?: string | number | types.AccountMediaRequest, fetchOptions?: RequestInit): Promise<types.MovieResultsResponse>;
    accountTvWatchlist(params?: string | number | types.AccountMediaRequest, fetchOptions?: RequestInit): Promise<types.TvResultsResponse>;
    accountWatchlistUpdate(params: types.AccountWatchlistRequest, fetchOptions?: RequestInit): Promise<types.PostResponse>;
    changedMovies(params?: types.ChangesRequest, fetchOptions?: RequestInit): Promise<types.ChangesResponse>;
    changedTvs(params?: types.ChangesRequest, fetchOptions?: RequestInit): Promise<types.ChangesResponse>;
    changedPeople(params?: types.ChangesRequest, fetchOptions?: RequestInit): Promise<types.ChangesResponse>;
    movieCertifications(fetchOptions?: RequestInit): Promise<types.CertificationsResponse>;
    tvCertifications(fetchOptions?: RequestInit): Promise<types.CertificationsResponse>;
    networkInfo(params: string | number | types.IdRequestParams, fetchOptions?: RequestInit): Promise<types.NetworkResponse>;
    networkAlternativeNames(params: string | number | types.IdRequestParams, fetchOptions?: RequestInit): Promise<types.CompanyAlternativeNamesResponse>;
    networkImages(params: string | number | types.IdRequestParams, fetchOptions?: RequestInit): Promise<types.CompanyImagesResponse>;
    review(params: string | number | types.IdRequestParams, fetchOptions?: RequestInit): Promise<types.Review>;
    episodeGroup(params: string | number | types.IdRequestParams, fetchOptions?: RequestInit): Promise<types.EpisodeGroupResponse>;
}
//# sourceMappingURL=moviedb.d.ts.map