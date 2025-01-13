import { component$, useContext } from "@builder.io/qwik";
import { Link } from '@builder.io/qwik-city';
import ThemeSwitcher from "./theme-switcher";
import { Mode } from "~/lib/state/mode";
import Search from "./search";
import LogoLight from "~/media/FRI_logo_eng.png?jsx";
import LogoDark from "~/media/FRI_logo_eng_dark.png?jsx";

export default component$(() => {
  const mode = useContext(Mode);

  return (
    <nav>
      <header class="h-16 md:h-24 flex justify-between items-center pr-2 md:pr-6 gap-2 md:gap-6">
        <Link href="/" class="h-full max-w-fit" aria-label="Home">
          {mode.isLightTheme.value ? (
            <LogoLight
              class="p-2 md:p-4 h-full max-w-fit backdrop-blur-sm rounded-br-xl"
              alt="FRI logo"
              loading="eager"
            />
          ) : (
            <LogoDark
              class="p-2 md:p-4 h-full max-w-fit backdrop-blur-sm rounded-br-xl"
              alt="FRI logo"
              loading="eager"
            />
           )
          }
        </Link>
        <div class="flex items-center gap-2 md:gap-6">
          <Search />
          <ThemeSwitcher />
        </div>
      </header>
    </nav>
  );
});