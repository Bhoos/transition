import { Reducer, MapState, TransitionResult } from './types';


export class Controller<S, A> {
  private state: S;
  private prevState: S;
  private readonly reducer: Reducer<S, A>;

  private running: number = 0;

  private transitions: MapState<S, any>[] = [];
  private stateListeners: MapState<S, any>[] = [];

  private readonly queue: Array<A> = [];

  constructor(initialState: S, reducer: Reducer<S, A>, backLogThreshold: number = 5) {
    this.state = initialState;
    this.prevState = initialState;
    this.reducer = reducer;
  }

  registerListener<R>(callback: MapState<S, R>) {
    this.stateListeners.push(callback);

    return () => {
      const idx = this.stateListeners.indexOf(callback);
      if (idx >= 0) {
        this.stateListeners.splice(idx, 1);
      }
    };
  }

  registerTransition<R>(callback: MapState<S, R>) {
    this.transitions.push(callback);

    return () => {
      // this.transitions = this.transitions.filter(t => t !== transition);
      const idx = this.transitions.indexOf(callback);
      if (idx >= 0) {
        this.transitions.splice(idx, 1);
      }
    };
  }

  setup<R>(transitionAnim: TransitionResult) {
    this.running += 1;
    transitionAnim.start(() => {
      this.running -= 1;
      if (this.running === 0) {
        this.completeTransition();
      }
    });
  }

  dispatch = (action: A) => {
    if (this.running > 0) {
      this.queue.push(action);
      return;
    }

    this.internalDispatch(action);
  }

  private internalDispatch(action: A | Array<A>) {
    const nextState = this.reducer(this.state, action);
    if (nextState === this.state) {
      // highly unlikely, an action should change the state
      return;
    }

    // Perform dispatch updates
    this.prevState = this.state;
    this.state = nextState;

    // Perform state updates
    this.stateListeners.forEach(callback => callback(this.state, this.prevState));

    // Perform all transitions
    this.transitions.forEach(callback => callback(this.state, this.prevState));

    // There might be instances, when the state update didn't trigger any transition
    if (this.running === 0) this.completeTransition();
  }

  private completeTransition() {
    if (this.prevState !== this.state) {
      this.prevState = this.state;
      // No more transitions remaining, settle down to a stable state
      // which will basically hide the components that are not required any more
      this.stateListeners.forEach(callback => callback(this.state, this.state));
    }

    // If there are more actions continue with that
    if (this.queue.length > 0) {
      // If the queue is too long, then dispatch all actions
      // TODO: There should be some way to detect if we want to do a batch operation
      const action = this.queue.shift();
      this.internalDispatch(action);
    }
  }

  getState() {
    return this.state;
  }

  getPrevState() {
    return this.prevState;
  }
}
