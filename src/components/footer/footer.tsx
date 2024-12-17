import { component$, useContext } from "@builder.io/qwik";      
import { Mode } from "~/lib/state/mode";  
  
export default component$(() => {    
  const mode = useContext(Mode);    
  
  return (      
    <footer class="fixed bottom-0 w-full shadow-lg mx-auto px-4 py-4 invisible md:visible">      
      <div class="flex justify-center items-center text-center text-sm">    
        <div class="flex items-center gap-1 p-2 backdrop-blur-sm w-fit">  
          <span>Made with <span class="text-primary">♥</span> for <a href="https://fri.uni-lj.si/en" target="_blank">FRI</a> © {new Date().getFullYear()}</span>  
          <span class="mx-2">|</span>      
          <a href="https://github.com/mk2376/fri-timetable"     
            target="_blank"  
            class="flex items-center"
          >
            <img 
              height={16}
              width={16}
              src={"/media/" + (mode.isDarkTheme.value ? "github-mark-white.svg" : "github-mark.svg")}     
              class="h-4 w-4"
              alt="GitHub"  
            />    
          </a>    
        </div>      
      </div>      
    </footer>      
  );      
});    