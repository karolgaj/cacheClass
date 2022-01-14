import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Response, User } from '../models/data.model';
import { Cacheable, CacheableObservable } from '../cacheable.decorator';

@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly apiUrl = 'https://randomuser.me/api/';

  constructor(private httpClient: HttpClient) {}

  @Cacheable()
  public randomUser() {
    return this.httpClient.get<Response>(this.apiUrl).pipe(map((data: Response) => data?.results[0])) as CacheableObservable<User>;
  }

  @Cacheable({ reloadable: true })
  public randomUser1() {
    return this.httpClient.get<Response>(this.apiUrl).pipe(map((data: Response) => data?.results[0])) as CacheableObservable<User>;
  }
}
