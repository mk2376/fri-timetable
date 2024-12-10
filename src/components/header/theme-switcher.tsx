import { $, component$, useVisibleTask$, createContextId, useContext, type QRL, type Signal } from '@builder.io/qwik';
import { useLocalStorage } from 'qwik-localstorage';
import { Sun, Moon } from '../icons/theme-switcher';  
  
export function useIsDarkMode() {
  const { data, set } = useLocalStorage<boolean>("isDarkMode", true);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    track(() => data.value);
    document.body.classList.replace(data.value ? 'light': 'dark', data.value ? 'dark': 'light')
    console.log("useIsDarkMode", document.documentElement.classList)
  })

  const switchMode = $(() => {
    set(!data.value)
  });

  const setMode = $((mode: boolean) => {
    set(mode)
  });

  return { isDarkMode: data, switchMode, setMode }
}

export const Mode = createContextId<{ isDarkTheme: Signal<boolean | null>, switchMode: QRL<() => void> }>('isDarkMode');

interface ThemeToggleProps {    
  class?: string;  
}

export default component$<ThemeToggleProps>(({ class: className }) => {     

  const isDarkMode = useContext(Mode);

  return (  
    <div class={["relative", className]}>  
      <button class="w-20 h-10 p-0 rounded-full bg-white flex items-center transition duration-600 focus:outline-none shadow-lg"  
        onClick$={isDarkMode.switchMode}
        value={String(isDarkMode.isDarkTheme.value)}
        aria-label="Toggle theme"
      >    
        <div    
          class={[  
            "absolute w-10 h-10 rounded-full transition duration-1000 transform flex items-center justify-center left-0 top-0 bottom-0 right-0 shadow-lg",    
            isDarkMode.isDarkTheme.value
              ? "bg-gray-700 translate-x-10"   
              : "bg-yellow-500 translate-x-0"    
          ]}    
        >    
          <div class="w-6 h-6 text-white">  
            {isDarkMode.isDarkTheme.value ? <Moon /> : <Sun />}  
          </div>  
        </div>    
      </button>    
    </div>  
  );    
});    