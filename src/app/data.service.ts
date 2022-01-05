// @ts-nocheck
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {merge, Observable, Subject} from "rxjs";
import {map, mergeMap, shareReplay, switchMap, take, takeUntil, tap} from "rxjs/operators";
import {Response, User} from "./data.model";

function CacheStateDecorator(properties = { cacheSize: 1 }) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalFunc = descriptor.value;

    descriptor.value = function(this, args: any) {
      descriptor.reload$ = new Subject<void>();
      descriptor.reloads$ = descriptor.reload$.pipe(mergeMap(() => descriptor.getDataOneTime()));

      descriptor.data = () => {
        if (!descriptor.cache$) {
          const result = originalFunc.apply(this, args);
          descriptor.cache$ = result.pipe(takeUntil(descriptor.reload$), shareReplay(properties.cacheSize));
        }
        return descriptor.cache$;
      };

      descriptor.getDataOneTime = () => {
        return descriptor.data().pipe(take(1));
      };

      descriptor.data$ = merge(descriptor.getDataOneTime(), descriptor.reloads$);

      this[propertyKey]['reload'] = (): void => {
        descriptor.cache$ = null;
        descriptor.reload$.next();
      }

      return descriptor.data$
    }
  };
}


@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly apiUrl = 'https://randomuser.me/api/';

  constructor(private httpClient: HttpClient) {}

  @CacheStateDecorator()
  public randomUser(): Observable<User> {
    return this.httpClient.get<Response>(this.apiUrl).pipe(map((data: Response) => data?.results[0]));
  }
}
