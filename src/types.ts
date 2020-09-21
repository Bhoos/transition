export type Reducer<S, A> = (state: S, action: A | Array<A>) => S;


export type TransitionResult = {
  start: (onComplete: () => void) => void;
}

export type Transition<V, R> = (driver: V, toValue: R) => TransitionResult;
export type MapState<S, R> = (state: S, prevState: S) => R;
