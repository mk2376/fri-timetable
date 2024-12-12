import { component$, useContext } from "@builder.io/qwik";
import { Link } from '@builder.io/qwik-city';
import ThemeSwitcher from "./theme-switcher";
import { Mode } from "~/lib/state/mode";

export default component$(() => {
  const mode = useContext(Mode);

  return (
    <nav>
      <header class="h-24 flex justify-between items-center pr-6">
        <Link href="/" class="h-full max-w-fit">
          <img width="900" height="323" src={"/media/" + (mode.isDarkTheme.value ? "FRI_logo_eng_dark.png" : "FRI_logo_eng.png")} class="py-4 px-6 h-full max-w-fit backdrop-blur-xl" />
        </Link>
        <ThemeSwitcher />
      </header>
    </nav>
  );
});
