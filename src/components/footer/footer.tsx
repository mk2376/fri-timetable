import { component$, useContext } from "@builder.io/qwik";      
import { Mode } from "~/lib/state/mode";
import GithubLogoLight from "~/media/github-mark.svg";
import GithubLogoDark from "~/media/github-mark-white.svg";
  
export default component$(() => {    
  const mode = useContext(Mode);    
  
  const GithubLogo = mode.isLightTheme.value ? GithubLogoLight: GithubLogoDark;

  return (      
    <footer class="fixed bottom-0 w-full shadow-lg mx-auto px-4 py-4 z-20 invisible md:visible">      
      <div class="flex justify-center items-center text-center text-sm">    
        <div class="flex items-center gap-1 p-2 backdrop-blur-sm w-fit">  
          <span>Made with <span class="text-primary">♥</span> for <a href="https://fri.uni-lj.si/en" target="_blank">FRI</a> © {new Date().getFullYear()}</span>  
          <span class="mx-2">|</span>      
          <a href="https://github.com/mk2376/fri-timetable"     
            target="_blank"  
            class="flex items-center"
          >
            <img
              width={16}
              height={16}
              src={GithubLogo}
              class="h-4 w-4"
              alt="Github"
            />    
          </a>    
        </div>      
      </div>      
    </footer>      
  );      
});    