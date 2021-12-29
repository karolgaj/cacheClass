// @ts-nocheck
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {merge, Observable, Subject} from "rxjs";
import {map, mergeMap, shareReplay, take, takeUntil} from "rxjs/operators";
import {Response, User} from "./data.model";

const CACHE_SIZE = 1;

class CacheState<T> {
  private cache$: Observable<T> | null = null;
  private reload$ = new Subject<void>();
  private reloads$ = this.reload$.pipe(mergeMap(() => this.getDataOneTime()));
  private data$: Observable<T>

  constructor(private cachedMethod: () => Observable<T>, private cacheSize = CACHE_SIZE) {
    this.data$ = merge(this.getDataOneTime(), this.reloads$);
  }

  public getData(fresh = false): Observable<T> {
    if (fresh) {
      this.data$ = merge(this.getDataOneTime(), this.reloads$);
    }
    return this.data$;
  }

  private get data(): Observable<T> {
    if (!this.cache$) {
      return this.cachedMethod().pipe(takeUntil(this.reload$), shareReplay(this.cacheSize));
    }

    return this.cache$;
  }

  public reload(): void {
    this.reload$.next();
    this.cache$ = null;
  }

  private getDataOneTime(): Observable<T> {
    return this.data.pipe(take(1));
  }
}

function CacheStateDecorator() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalFunc = descriptor.value;

    descriptor.value = function(this, args: any) {
      this.reload$ = new Subject<void>();
      this.reloads$ = this.reload$.pipe(mergeMap(() => this.getDataOneTime()));

      this.data = (): Observable<User> => {
        if (!this.cache$) {
          const result = originalFunc.apply(this, args);
          return result.pipe(takeUntil(this.reload$), shareReplay(this.cacheSize));
        }

        return this.cache$;
      };

      this.getDataOneTime = (): Observable<User> => {
        return this.data().pipe(take(1));
      };

      this.data$ = merge(this.getDataOneTime(), this.reloads$);

      this.reload = (): void => {
        this.reload$.next();
        this.cache$ = null;
      }
    }
  };
}


@Injectable({providedIn: 'root'})
export class DataService {
  private readonly apiUrl = 'https://randomuser.me/api/';
  public data$!: Observable<User>;
  public reload!: () => void;

  constructor(private httpClient: HttpClient) {
    this.getDataFromServer();
  }

  @CacheStateDecorator()
  private getDataFromServer(): Observable<User> {
    return this.httpClient.get<Response>(this.apiUrl).pipe(map((data: Response) => data?.results[0]));
  }
}
