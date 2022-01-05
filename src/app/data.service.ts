import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {merge, Observable, Subject} from "rxjs";
import {map, mergeMap, shareReplay, take, takeUntil} from "rxjs/operators";
import {Response, User} from "./data.model";

declare global {
  interface CacheableObservable<T> extends Observable<T> {
    reload: () => void;
  }
}


function Cacheable(properties = {reloadable: false, bufferSize: 1 }) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalFunc = descriptor.value;

    Object.defineProperty(target, 'reload$', {
      value: new Subject<void>()
    });

    Object.defineProperty(target, 'getDataOneTime', {
      value: () => target.data().pipe(take(1))
    });

    Object.defineProperty(target, 'reloads$',{
      value: target.reload$.pipe(mergeMap(() => target.getDataOneTime()))
    })

    descriptor.value = function(this, args: any) {
      if (!target.data) {
        target.data = () => {
          if (!target.cache$) {
            const result = originalFunc.apply(this, args);
            target.cache$ = properties.reloadable
              ? result.pipe(takeUntil(target.reload$), shareReplay(properties.bufferSize))
              : result.pipe(shareReplay(properties.bufferSize));
          }
          return target.cache$;
        };
      }

      if (!target.data$) {
        target.data$ = properties.reloadable ? merge(target.getDataOneTime(), target.reloads$) : target.getDataOneTime();
      }

      // @ts-ignore
      this[`${propertyKey}Reload`] = (): void => {
        target.cache$ = null;
        target.reload$.next();
      }

      return target.data$
    }
  };
}

@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly apiUrl = 'https://randomuser.me/api/';
  public randomUserReload!: () => void;

  constructor(private httpClient: HttpClient) {}

  @Cacheable({reloadable: true, bufferSize: 1})
  public randomUser(): Observable<User> {
    return this.httpClient.get<Response>(this.apiUrl).pipe(map((data: Response) => data?.results[0]));
  }
}
