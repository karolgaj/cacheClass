import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {merge, Observable, Subject} from "rxjs";
import {map, mergeMap, shareReplay, take, takeUntil} from "rxjs/operators";
import {Response, User} from "./data.model";

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

      if (reloadable) {
        Object.defineProperty(this, `${propertyKey}Reload`,{
          value: () => {
            descriptor.cache$ = null;
            descriptor.reload$.next();
          },
          writable: true
        })
      }

      Object.defineProperty(this, `${propertyKey}Clear`,{
        value: () => {
          descriptor.cache$ = null;
        },
        writable: true
      })

      return descriptor.data$
    }
  };
}

@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly apiUrl = 'https://randomuser.me/api/';

  constructor(private httpClient: HttpClient) {}

  @Cacheable()
  public randomUser(): Observable<User> {
    return this.httpClient.get<Response>(this.apiUrl).pipe(map((data: Response) => data?.results[0]));
  }

  @Cacheable({ reloadable: true })
  public randomUser1(): Observable<User> {
    return this.httpClient.get<Response>(this.apiUrl).pipe(map((data: Response) => data?.results[0]));
  }
}
