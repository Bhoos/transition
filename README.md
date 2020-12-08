# Transition Library
NOTE: Moved v2 to @bhoos/react-kit

## Hooks
* `useTransition`: Register an animation to run based on state changes
* `useTransitionStore`: Get `dispatch` method for registering state changes
* `useTransitionState`: Map transition store values to render values

```typescript
import { createTransitionLibrary } from '@bhoos/transition';

const lib = createTransitionLibrary(0, (state, action: number | Array<number>) => Array.isArray(action) ? action[action.length - 1] : action;


```

function App() {
  return (
    <Transition initialState={} reducer={reducer}>
      {...}
    </Transition>
  );
}
```

## Initiating changes
```javascript
function NextPage() {
  const dispatch = useTransitionStore();
  return <Button onPress={() => dispatch('next-page')} />;
}
```

## Run animations for transitions
```javascript
function extractValue(next, current) {
  if (next === 'page') return 1;
  if (current === 'page') return -1;
  return 0;
}

function Page() {
  const driver = useRef();
  if (!driver.current) driver.current = new Animated.Value(0);
  useTransition(spring, driver.current, extractValue);
  const style = createStyle(driver.current);

  return (
    <Animated.View style={style}>
      {...}
    </Animated.View>
  );
}
```
