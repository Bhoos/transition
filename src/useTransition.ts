import { useEffect, useRef } from 'react';
import { Controller } from './Controller';

import { MapState, Transition } from './types';

export function createTransitionHook<S, A>(controller: Controller<S, A>) {
  return function useTransition<V, R>(transition: Transition<V, R>, driver: V, mapState: MapState<S, R>) {
    useEffect(() => {
      // Do not initialize prevValue, as transition needs to run on mount as well
      let prevValue: R;

      function callback(state: S, prevState: S): void {
        const next = mapState(state, prevState);
        if (next === undefined) {
          return null;
        }
        if (next === null || next === prevValue) return;
        prevValue = next;

        // Start the animation
        const transitionAnim = transition(driver, next);
        if (transitionAnim) {
          controller.setup(transitionAnim);
        }
      }

      // Check if the animation needs to run on mount
      callback(controller.getState(), controller.getPrevState());

      return controller.registerTransition(callback);
    }, [mapState]);
  };
}
