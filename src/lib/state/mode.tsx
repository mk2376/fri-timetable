import { $, useVisibleTask$, createContextId, type QRL, type Signal, useContextProvider } from '@builder.io/qwik';
import { useLocalStorage } from 'qwik-localstorage';
  
function useIsLightMode() {
  const { data, set } = useLocalStorage<boolean>("isLightMode", false);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(() => data.value);
    document.body.classList.replace(data.value ? 'dark': 'light', data.value ? 'light': 'dark')
    console.log("isLightMode", data.value)
  })

  const switchMode = $(() => {
    set(!data.value)
  });

  const setMode = $((mode: boolean) => {
    set(mode)
  });

  return { isLightMode: data, switchMode, setMode }
}

export const Mode = createContextId<{ isLightTheme: Signal<boolean | null>, switchMode: QRL<() => void> }>('mode');

export function InitModeContext() {
  const { isLightMode: isLightMode, switchMode } = useIsLightMode()
  useContextProvider(Mode, { isLightTheme: isLightMode, switchMode: switchMode });
}