import {Injectable} from '@angular/core';
import {HttpClient, HttpContext, HttpEvent, HttpHeaders, HttpParams} from '@angular/common/http';
import {merge, Observable, Subject} from "rxjs";
import {map, mergeMap, shareReplay, take, takeUntil} from "rxjs/operators";
import {Response, User} from "./data.model";

export interface CacheableObservable<T> extends Observable<T> {
  clear: () => void;
  reload: () => void;
}

interface CacheableParameters { reloadable: boolean, bufferSize?: number }
function Cacheable({ reloadable = false, bufferSize = 1 }: CacheableParameters = { reloadable:false, bufferSize: 1 }) {
  return function (target: any, propertyKey: string, descriptor: any) {
    const originalFunc = descriptor.value;

    Object.defineProperty(descriptor, 'reload$', {
      value: new Subject<void>()
    });

    Object.defineProperty(descriptor, 'getDataOneTime', {
      value: () => descriptor.data().pipe(take(1))
    });

    Object.defineProperty(descriptor, 'reloads$',{
      value: descriptor.reload$.pipe(mergeMap(() => descriptor.getDataOneTime()))
    })

    descriptor.value = function(this, args: any) {
      descriptor.data = () => {
        if (!descriptor.cache$) {
          const result = originalFunc.apply(this, Array.isArray(args) ? args : [args]);
          descriptor.cache$ = result.pipe(takeUntil(descriptor.reload$), shareReplay(bufferSize));
        }
        return descriptor.cache$;
      };

      descriptor.data$ = merge(descriptor.getDataOneTime(), descriptor.reloads$);

      descriptor.data$.reload = reloadable ? () => {
          descriptor.cache$ = null;
          descriptor.reload$.next();
      } : () => console.error('To use reload function in Cacheable decorator, set reloadable property to true in place of use of @Cacheable decorator');

      descriptor.data$.clear = () => {
        descriptor.cache$ = null;
      };

      return descriptor.data$
    }
  };
}

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
