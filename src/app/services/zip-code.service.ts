import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ZipCode } from '../models/zipCode.model';
import { Cacheable } from '../cacheable.decorator';

@Injectable({ providedIn: 'root' })
export class ZipCodeService {
  private readonly apiUrl = 'http://api.zippopotam.us/pl/';

  constructor(private httpClient: HttpClient) {}

  @Cacheable()
  public jokeByType(zipCode: string) {
    return this.httpClient.get<ZipCode>(`${this.apiUrl}${zipCode}`);
  }
}
