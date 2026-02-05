import { BehaviorSubject, Observable, map, distinctUntilChanged } from 'rxjs';

export interface StoreState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export class BaseStore<T> {
  private readonly state$ = new BehaviorSubject<StoreState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  readonly data$: Observable<T | null> = this.state$.pipe(
    map((state) => state.data),
    distinctUntilChanged(),
  );

  readonly isLoading$: Observable<boolean> = this.state$.pipe(
    map((state) => state.isLoading),
    distinctUntilChanged(),
  );

  readonly error$: Observable<string | null> = this.state$.pipe(
    map((state) => state.error),
    distinctUntilChanged(),
  );

  protected get state(): StoreState<T> {
    return this.state$.getValue();
  }

  protected setState(partial: Partial<StoreState<T>>): void {
    this.state$.next({ ...this.state, ...partial });
  }

  setLoading(isLoading: boolean): void {
    this.setState({ isLoading, error: null });
  }

  setError(error: string): void {
    this.setState({ error, isLoading: false });
  }

  setData(data: T): void {
    this.setState({ data, isLoading: false, error: null });
  }

  reset(): void {
    this.state$.next({
      data: null,
      isLoading: false,
      error: null,
    });
  }
}
