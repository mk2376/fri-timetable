import { $, useVisibleTask$, createContextId, type QRL, type Signal, useContextProvider } from '@builder.io/qwik';
import { useLocalStorage } from 'qwik-localstorage';
  
function useIsDarkMode() {
  const { data, set } = useLocalStorage<boolean>("isDarkMode", true);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(() => data.value);
    document.body.classList.replace(data.value ? 'light': 'dark', data.value ? 'dark': 'light')
    console.log("isDarkMode", data.value)
  })

  const switchMode = $(() => {
    set(!data.value)
  });

  const setMode = $((mode: boolean) => {
    set(mode)
  });

  return { isDarkMode: data, switchMode, setMode }
}

export const Mode = createContextId<{ isDarkTheme: Signal<boolean | null>, switchMode: QRL<() => void> }>('mode');

export function InitModeContext() {
  const { isDarkMode, switchMode } = useIsDarkMode()
  useContextProvider(Mode, { isDarkTheme: isDarkMode, switchMode: switchMode });
}