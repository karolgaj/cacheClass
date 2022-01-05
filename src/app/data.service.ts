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

interface CacheableParameters { reloadable: boolean, bufferSize?: number }
function Cacheable({ reloadable = false, bufferSize = 1 }: CacheableParameters ) {
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
      target.data = () => {
        if (!target.cache$) {
          const result = originalFunc.apply(this, Array.isArray(args) ? args : [args]);
          target.cache$ = result.pipe(takeUntil(target.reload$), shareReplay(bufferSize));
        }
        return target.cache$;
      };

      target.data$ = merge(target.getDataOneTime(), target.reloads$);

      if (reloadable) {
        Object.defineProperty(this, `${propertyKey}Reload`,{
          value: () => {
            target.cache$ = null;
            target.reload$.next();
          },
          writable: true
        })
      }

      Object.defineProperty(this, `${propertyKey}Clear`,{
        value: () => {
          target.cache$ = null;
        },
        writable: true
      })

      return target.data$
    }
  };
}

@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly apiUrl = 'https://randomuser.me/api/';
  public randomUserReload!: () => void;
  public randomUserClear!: () => void;

  constructor(private httpClient: HttpClient) {}

  @Cacheable({ reloadable: true })
  public randomUser(): Observable<User> {
    return this.httpClient.get<Response>(this.apiUrl).pipe(map((data: Response) => data?.results[0]));
  }
}
