// @ts-nocheck
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {merge, Observable, Subject} from "rxjs";
import {map, mergeMap, shareReplay, switchMap, take, takeUntil, tap} from "rxjs/operators";
import {Response, User} from "./data.model";

const CACHE_SIZE = 1;

function CacheStateDecorator() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalFunc = descriptor.value;

    descriptor.value = function(this, args: any) {
      this.reload$ = new Subject<void>();
      this.reloads$ = this.reload$.pipe(mergeMap(() => this.getDataOneTime()));

      this.data = (): Observable<User> => {
        if (!this.cache$) {
          const result = originalFunc.apply(this, args);
          this.cache$ = result.pipe(takeUntil(this.reload$), shareReplay(CACHE_SIZE));
        }
        return this.cache$;
      };

      this.getDataOneTime = (): Observable<User> => {
        return this.data().pipe(take(1));
      };

      this.data$ = merge(this.getDataOneTime(), this.reloads$);

      this.reload = (): void => {
        this.cache$ = null;
        this.reload$.next();
      }

      return this.data$
    }
  };
}


@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly apiUrl = 'https://randomuser.me/api/';
  public reload!: () => void;

  constructor(private httpClient: HttpClient) {}

  @CacheStateDecorator()
  public getDataFromServer(): Observable<User> {
    return this.httpClient.get<Response>(this.apiUrl).pipe(map((data: Response) => data?.results[0]));
  }
}
