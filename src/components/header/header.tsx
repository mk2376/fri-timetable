import { component$, useContext } from "@builder.io/qwik";
import ThemeSwitcher, { Mode } from "./theme-switcher";

export default component$(() => {
  const mode = useContext(Mode);

  return (
    <nav>
      <header class="h-24 flex justify-between items-center bg-accent text-white p-2 pl-4">
        { /* eslint-disable-next-line qwik/jsx-img */ }
        <img src={"/media/" + (mode.isDarkTheme.value ? "FRI_logo_eng_dark.png" : "FRI_logo_eng.png")} class="h-full max-w-fit" />
        <ThemeSwitcher class="m-4" />
      </header>
    </nav>
  );
});
