import { component$, useContext } from "@builder.io/qwik";
import { Link } from '@builder.io/qwik-city';
import ThemeSwitcher from "./theme-switcher";
import { Mode } from "~/lib/state/mode";
import Search from "./search";

export default component$(() => {
  const mode = useContext(Mode);

  return (
    <nav>
      <header class="h-24 flex justify-between items-center pr-6 gap-6">
        <Link href="/" class="h-full max-w-fit">
          <img 
            width="900" 
            height="323" 
            src={"/media/" + (mode.isDarkTheme.value ? "FRI_logo_eng_dark.png" : "FRI_logo_eng.png")} 
            class="p-4 h-full max-w-fit backdrop-blur rounded-br-xl"
          />
        </Link>
        <div class="flex items-center gap-6"> {/* Added container for right-side elements */}
          <Search />
          <ThemeSwitcher />
        </div>
      </header>
    </nav>
  );
});