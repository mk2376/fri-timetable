import { component$, useContext, useSignal } from '@builder.io/qwik';
import { Sun, Moon } from '../icons/theme-switcher';  
import { Mode } from '~/lib/state/mode';

interface ThemeToggleProps {    
  class?: string;  
}

export default component$<ThemeToggleProps>(({ class: className }) => {     
  const mode = useContext(Mode);
  const hasClicked = useSignal(false);

  // Set initial position based on dark mode state
  const initialPosition = mode.isLightTheme.value ? 'translate-x-0': 'translate-x-9';
  const initialBg = mode.isLightTheme.value ? 'bg-yellow-500': 'bg-accent';

  return (  
    <div class={["relative", className]}>  
      <button 
        class={`w-20 h-11 mb-1 p-0 rounded-full flex items-center backdrop-blur-sm focus:outline-none [box-shadow:0_4px_6px_-1px_var(--text-color)]`}  
        onClick$={() => {
          if (!hasClicked.value) {
            hasClicked.value = true;
          }
          mode.switchMode();
        }}
        value={String(!mode.isLightTheme.value)}
        aria-label="Toggle theme"
      >    
        <div    
          class={[  
            "absolute w-11 h-11 rounded-full flex items-center justify-center left-0 top-0 bottom-0 right-0",    
            hasClicked.value ? [
              "transition duration-1000 transform",
              !mode.isLightTheme.value ? "bg-accent translate-x-9" : "bg-yellow-500 translate-x-0"
            ] : [
              initialBg,
              initialPosition
            ]
          ]}    
        >    
          <div class="w-7 h-7 text-white">  
            {!mode.isLightTheme.value ? <Moon />: <Sun />}  
          </div>  
        </div>    
      </button>    
    </div>  
  );    
});