import { useContext, useState, useEffect, useRef } from 'react';
import TransitionContext from './TransitionContext';

export default function useTransitionState(mapState, getInitialState) {
  let _dev_ref;
  if (process.env.NODE_ENV !== 'production') {
    _dev_ref = useRef(new Error());
  }

  const controller = useContext(TransitionContext);
  const [result, setResult] = useState(() => getInitialState ? getInitialState(controller.getState()) : mapState(
    controller.getState(),
    controller.getPrevState()
  ));

  const ref = useRef();
  if (!ref.current) {
    ref.current = { setup: 0 };
    if (__DEV__) {
      ref.current._dev = new Error();
    }
  }

  useEffect(() => {
    function callback(nextState, prevState) {
      const v = mapState(nextState, prevState);
      if (__DEV__) {
        if (v === undefined) {
          console.warn('You forgot to return a state from mapState callback in `useTransitionState`. You can return null if the local state hasn\'t changed.');
          console.error(ref.current._dev);
        }
      }

      if (v === null || v === undefined) return;

      // Avoiding shallow equal check here, since that would have been done by the mapState callback
      if (ref.current.value !== v) {
        ref.current.value = v;
        ref.current.setup += 1;
        const cnt = controller.onSetup();
        // if (__DEV__) {
        //   console.log(`[Controller/${controller.id}] transitionState.useEffect (${cnt}) setup`, mapState.name);
        // }
        setResult(v);
      }
    }

    // Also increase on first mount
    if (ref.current.value === undefined) {
      ref.current.value = result;
      ref.current.setup += 1;
      const cnt = controller.onSetup();
      // if (__DEV__) {
      //   console.log(`[Controller/${controller.id}] transitionState.useEffect (${cnt}) setup first`, mapState.name);
      // }
    } else {
      // Run a callback once since mapState has changed
      callback(controller.getState(), controller.getPrevState());
    }

    const unsub = controller.registerListener(callback);

    return () => {
      unsub();
      // console.log(`[Controller/${controller.id}] transitionState.useEffect unsub`, mapState.name);
      if (ref.current.setup) {
        ref.current.setup -= 1;
        controller.onComplete();
      }
    }
    // This useEffect hook initializes the ref value with the initial result
    // hence it is intentionally not dependent on result and IT SHOULD NOT BE
  }, [mapState]);

  useEffect(() => {
    if (ref.current.setup) {
      ref.current.setup -= 1;
      controller.onComplete();
    }
    // if (__DEV__) {
    //   console.log(`[Controller/${controller.id}] transitionState.useEffect () (setup=${ref.current.setup})complete`, mapState.name);
    // }
  }, [result]);

  return result;
}
