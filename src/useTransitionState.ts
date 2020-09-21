import { Context, useContext, useState, useEffect, useRef } from 'react';
import { Controller } from './Controller';

export function createTransitionStateHook<S, A>(controller: Controller<S, A>) {
  return function useTransitionState<R>(mapState: (state: S, prevState: S) => R): R {
    const [result, setResult] = useState(() => mapState(controller.getState(), controller.getPrevState()));

    useEffect(() => {
      let prev = result;

      function cb(state: S, prevState: S) {
        const k = mapState(state, prevState);
        if (k === undefined) {
          console.log('Nothing returned from mapState of useTransitionState. You can return `null` if there is no state update.');
        }

        if (k === null || k === prev) return;
        prev = k;
        setResult(k);
      }

      return controller.registerListener(cb);
    }, [mapState]);

    return result;
  };
}
