import { component$, Slot, type QRL } from '@builder.io/qwik';
import { ArrowLeft } from '~/components/icons/qwik';  
import styles from "./list-container.module.css";

interface ListContainerProps {
  showBackButton?: boolean;
  onBackClick$?: QRL<() => void>;
}

export default component$<ListContainerProps>(({ 
  showBackButton = false, 
  onBackClick$ 
}) => {
  return (
    <div class="relative w-full md:min-w-96 md:w-auto" 
      style="transform: scaleX(-1)"
    >
      {/* Back Button */}
      {showBackButton && (
        <button class="z-10 absolute p-2 right-0 top-1"
          onClick$={onBackClick$}
        >
          <ArrowLeft class="w-5 h-5 fill-accent hover:fill-accent-hover" />
        </button>
      )}

      {/* List with fade effect */}
      <div class={`relative h-[calc(100vh-220px-40px-56px)] md:max-h-[50rem] overflow-y-auto ${styles["mask-fade"]}`} >
        <ul class="pl-6 my-14" style="transform: scaleX(-1)">
          <Slot />
        </ul>
      </div>
    </div>
  );
});