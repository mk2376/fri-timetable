// src/components/list-container/list-container.tsx
import { component$, type QRL } from '@builder.io/qwik';
import { ArrowLeft, Tree } from '~/components/icons/qwik';  
import styles from "./list-container.module.css";
import type { NestedList } from './index'; // Move types to separate file

interface ListContainerProps {
  showBackButton?: boolean;
  onBackClick$?: QRL<() => void>;
  items: NestedList[];
  onItemClick$: QRL<(item: NestedList) => void>;
}

export default component$<ListContainerProps>(({ 
  showBackButton = false, 
  onBackClick$,
  items,
  onItemClick$
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
      <div class={`relative h-[calc(100vh-220px-40px-56px)] md:max-h-[50rem] overflow-y-auto ${styles["mask-fade"]}`}>
        <ul class="pl-6 my-14" style="transform: scaleX(-1)">
          {items.map((item) => (
            <li key={item.id} class="m-2">
              <button
                class="flex items-center justify-between text-left rounded-lg 
                  bg-accent hover:bg-accent-hover shadow-md dark:shadow-white p-4"
                onClick$={() => onItemClick$(item)}
              >
                <span>{item.label}</span>
                {item.children && (
                  <Tree 
                    class="ml-4 w-7 h-7 -my-10 flex-shrink-0 fill-primary" 
                  />
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});