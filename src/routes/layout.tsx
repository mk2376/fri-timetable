import { component$, Slot, useStyles$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import type { RequestHandler } from "@builder.io/qwik-city";

import Header from "~/components/header/header";
import Footer from "~/components/footer/footer";

import styles from "./styles.css?inline";
import { InitPlatformContext } from "~/lib/state/platform";
import { InitModeContext } from "~/lib/state/mode";

export const onGet: RequestHandler = async ({ cacheControl }) => {
  // Control caching for this request for best performance and to reduce hosting costs:
  // https://qwik.dev/docs/caching/
  cacheControl({
    // Always serve a cached response by default, up to a week stale
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    // Max once every 5 seconds, revalidate on the server to get a fresh version of this page
    maxAge: 5,
  });
};

export const useServerTimeLoader = routeLoader$(() => {
  return {
    date: new Date().toISOString(),
  };
});

export default component$(() => {
  // This has to be initialized in parent
  InitModeContext()

  useStyles$(styles);

  // This has to be initialized in parent
  InitPlatformContext()

  return (
    <div class="flex flex-col min-h-screen">
      <Header />
      <main class="flex-grow">
        <Slot />
      </main>
      <Footer />
    </div>
  );
});
