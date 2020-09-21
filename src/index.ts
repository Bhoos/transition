import React, { ComponentType } from 'react';
import { Controller } from './Controller';
import { createTransitionStateHook } from './useTransitionState';
import { createTransitionHook } from './useTransition';

import { Reducer, MapState } from './types';

export function createTransitionLibrary<S, A>(initialState: S, reducer: Reducer<S, A>) {
  const controller = new Controller(initialState, reducer);

  const useTransitionState = createTransitionStateHook(controller);

  return {
    dispatch: controller.dispatch,

    useTransitionState: useTransitionState,

    useTransition: createTransitionHook(controller),

    useDispatch: () => controller.dispatch,

    withVisibility: (visibilityCheck: MapState<S, boolean>) => {
      return <P = {}>(Component: ComponentType<P>) => {
        return (props: P) => {
          const visible = useTransitionState(visibilityCheck);
          if (!visible) return null;
          return React.createElement(Component, props);
        };
      };
    }
  };
}
