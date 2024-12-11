import { component$, useContext } from "@builder.io/qwik";    
import { Mode } from "~/lib/state/mode";

export default component$(() => {  
  const mode = useContext(Mode);  

  return (    
    <footer class="fixed bottom-0 w-full shadow-lg mx-auto px-4 py-6 invisible md:visible">    
      <div class="text-center text-sm">  
        <p class="flex justify-center items-center gap-1"> {/* Added items-center and gap-1 */}  
          Made with <span class="text-primary">♥</span> for <a href="https://fri.uni-lj.si/en" target="_blank">FRI</a> © {new Date().getFullYear()}
          <span class="mx-2">|</span>    
          <a href="https://github.com/mk2376/fri-timetable"   
             target="_blank"   
             class="flex items-center"> {/* Added flex and items-center */}  
            { /* eslint-disable-next-line qwik/jsx-img */ }  
            <img   
              src={"/media/" + (mode.isDarkTheme.value ? "github-mark-white.svg" : "github-mark.svg")}   
              class="h-4 max-w-fit"  
              alt="GitHub" // Added for accessibility  
            />  
          </a>  
        </p>    
      </div>    
    </footer>    
  );    
});  