export interface ZipCode {
  'post code': string;
  country: string;
  'country abbreviation': string;
  places?: PlacesEntity[] | null;
}

export interface PlacesEntity {
  'place name': string;
  longitude: string;
  state: string;
  'state abbreviation': string;
  latitude: string;
}
