import { component$, useContext } from "@builder.io/qwik";
import { Link } from '@builder.io/qwik-city';
import ThemeSwitcher from "./theme-switcher";
import { Mode } from "~/lib/state/mode";

export default component$(() => {
  const mode = useContext(Mode);

  return (
    <nav>
      <header class="h-24 flex justify-between items-center bg-accent text-white py-2 px-6">
        <Link href="/" class="h-full max-w-fit">
          { /* eslint-disable-next-line qwik/jsx-img */}
          <img src={"/media/" + (mode.isDarkTheme.value ? "FRI_logo_eng_dark.png" : "FRI_logo_eng.png")} class="h-full max-w-fit" />
        </Link>
        <ThemeSwitcher />
      </header>
    </nav>
  );
});
