export interface ItunesTrackMetadata {
  albumImageUrl: string | null;
  artist: string;
  itunesTrackId: string;
  itunesUrl: string;
  title: string;
}

export interface ItunesSearchResponse {
  items: ItunesTrackMetadata[];
}
