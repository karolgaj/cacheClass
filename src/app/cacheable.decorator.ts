import { merge, Observable, Subject } from 'rxjs';
import { mergeMap, shareReplay, take, takeUntil } from 'rxjs/operators';

export const REGISTRY_MAP = new Map<string, Clearable>();

export interface Clearable {
  clear: () => void;
}

export interface CacheableObservable<T> extends Clearable, Observable<T> {
  reload: () => void;
}

interface CacheableParameters {
  reloadable: boolean;
  bufferSize?: number;
}

export function Cacheable(
  { reloadable = false, bufferSize = 1 }: CacheableParameters = {
    reloadable: false,
    bufferSize: 1,
  }
) {
  return function (target: any, propertyKey: string, descriptor: any) {
    const originalFunc = descriptor.value;

    descriptor.value = function (this, args: any) {
      const paramCheckSum = btoa(`${propertyKey}${JSON.stringify(args)}`);

      if (!descriptor[paramCheckSum]) {
        descriptor[paramCheckSum] = {};

        Object.defineProperty(descriptor[paramCheckSum], 'reload$', {
          value: new Subject<void>(),
        });

        Object.defineProperty(descriptor[paramCheckSum], 'getDataOneTime', {
          value: () => descriptor[paramCheckSum].data().pipe(take(1)),
        });

        Object.defineProperty(descriptor[paramCheckSum], 'reloads$', {
          value: descriptor[paramCheckSum].reload$.pipe(mergeMap(() => descriptor[paramCheckSum].getDataOneTime())),
        });
      }

      descriptor[paramCheckSum].data = () => {
        if (!descriptor[paramCheckSum].cache$) {
          const result = originalFunc.apply(this, Array.isArray(args) ? args : [args]);
          descriptor[paramCheckSum].cache$ = result.pipe(takeUntil(descriptor[paramCheckSum].reload$), shareReplay(bufferSize));
        }
        return descriptor[paramCheckSum].cache$;
      };

      descriptor[paramCheckSum].data$ = merge(descriptor[paramCheckSum].getDataOneTime(), descriptor[paramCheckSum].reloads$);

      descriptor[paramCheckSum].data$.reload = reloadable
        ? () => {
            descriptor[paramCheckSum].cache$ = null;
            descriptor[paramCheckSum].reload$.next();
          }
        : () => {
          throw new Error(
            'To use reload function in Cacheable decorator, set reloadable property to true in place of use of @Cacheable decorator'
          )
        };

      descriptor[paramCheckSum].data$.clear = () => {
        descriptor[paramCheckSum].cache$ = null;
      };

      REGISTRY_MAP.set(`${propertyKey}-${paramCheckSum}`, descriptor[paramCheckSum].data$);
      return descriptor[paramCheckSum].data$;
    };
  };
}
