import { component$, useContext} from '@builder.io/qwik';
import { Sun, Moon } from '../icons/theme-switcher';  
import { Mode } from '~/lib/state/mode';

interface ThemeToggleProps {    
  class?: string;  
}

// Inspiration: https://www.creative-tim.com/twcomponents/component/switch-to-darkmode
export default component$<ThemeToggleProps>(({ class: className }) => {     
  const isDarkMode = useContext(Mode);

  return (  
    <div class={["relative", className]}>  
      <button class="w-20 h-10 p-0 rounded-full bg-white flex items-center transition duration-600 focus:outline-none shadow-md"  
        onClick$={isDarkMode.switchMode}
        value={String(isDarkMode.isDarkTheme.value)}
        aria-label="Toggle theme"
      >    
        <div    
          class={[  
            "absolute w-10 h-10 rounded-full transition duration-1000 transform flex items-center justify-center left-0 top-0 bottom-0 right-0 shadow-lg",    
            isDarkMode.isDarkTheme.value
              ? "bg-accent translate-x-10"   
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