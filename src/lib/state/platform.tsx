import { $, createContextId, Signal, useContextProvider, useOnWindow, useSignal } from "@builder.io/qwik";

function useIsMobilePlatform() {
  const isMobile = useSignal(false);

  // Function to check and update the isMobile signal  
  const updateIsMobile = $(() => {  
    isMobile.value = window.innerWidth < 768;
    console.log('isMobile updated:', isMobile.value);  
  });

  useOnWindow('resize', updateIsMobile);
  useOnWindow('DOMContentLoaded', updateIsMobile);

  return isMobile
}

export const Platform = createContextId<{ isMobile: Signal<boolean | null> }>('platform');

export function InitPlatformContext() {
  const isMobile = useIsMobilePlatform()
  useContextProvider(Platform, { isMobile: isMobile } );
}