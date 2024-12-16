import { $, component$, useSignal, useTask$, useOnWindow } from '@builder.io/qwik';
import { useLocation, useNavigate } from '@builder.io/qwik-city';
import { Search, Cancel } from '../icons/qwik';
import styles from './search.module.css';
import ListContainer from '../initial-page/selection-tabs/list-container';
import { tabDemoContent } from '../initial-page/selection-tabs';

export default component$(() => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isSearchOpen = useSignal(location.url.searchParams.get('search') === 'true');
  const searchValue = useSignal(location.url.searchParams.get('q') || '');
  const debouncedValue = useSignal(searchValue.value);

  const triggerSearchRef = useSignal<HTMLButtonElement>();
  const inputRef = useSignal<HTMLInputElement>();
  const searchContainerRef = useSignal<HTMLDivElement>();
  const filteredItems = useSignal(tabDemoContent["subjects"]);
  const DEBOUNCE_DELAY = 300;
  const CLICK_PADDING = 70;

const updateSearchState = $((open: boolean, query?: string) => {
    isSearchOpen.value = open;
    const params = new URLSearchParams(location.url.searchParams);
    
    if (open) {
      params.set('search', 'true');
    } else {
      params.delete('search');
    }

    if (query) {
      params.set('q', query);
    } else {
      params.delete('q');
      searchValue.value = '';
      debouncedValue.value = '';
    }

    navigate(`?${params.toString()}`);
  });

  useTask$(({ track }) => {  
    const url = track(() => location.url);  
    const isOpen = url.searchParams.get('search') === 'true';
    const query = url.searchParams.get('q') || '';

    isSearchOpen.value = isOpen;
    searchValue.value = query;
  });  

  useTask$(({ track }) => {
    const value = track(() => searchValue.value);
    filteredItems.value = tabDemoContent["subjects"].filter(
      item => item.label.toLowerCase().includes(value.toLowerCase())
    );
  });

  useOnWindow('keydown', $((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault();
      updateSearchState(true);
    } else if (e.key === 'Escape' && isSearchOpen.value) {
      updateSearchState(false);
    }
  }));    

  useTask$(({ track, cleanup }) => {
    const value = track(() => searchValue.value);
    
    const timeoutId = setTimeout(() => {
      if (isSearchOpen.value) {
        updateSearchState(true, value);
      }
    }, DEBOUNCE_DELAY);

    cleanup(() => clearTimeout(timeoutId));
  });

  const handleKeyDown = $(async (e: KeyboardEvent) => {
    if (e.key === 'Enter' && isSearchOpen.value && filteredItems.value.length === 1) {
      e.preventDefault();
      await updateSearchState(true, searchValue.value);
      const url = new URL(location.url.protocol + location.url.host + `/timetable?TODO=${encodeURIComponent(filteredItems.value[0].label)}`)
      await navigate(url);
    }
  });

  const handleOutsideClick = $((e: PointerEvent) => {
    const rect = searchContainerRef.value?.getBoundingClientRect();
    if (!rect) return;

    const { clientX: x, clientY: y } = e;
    const inBounds = x >= (rect.left - CLICK_PADDING) && 
                    x <= (rect.right + CLICK_PADDING) && 
                    y >= (rect.top - CLICK_PADDING) && 
                    y <= (rect.bottom + CLICK_PADDING);

    if (!inBounds) updateSearchState(false);
  });

  return (
    <div class="relative">
      <button
        ref={triggerSearchRef}
        onClick$={() => updateSearchState(true)}
        class="group flex items-center gap-2 rounded-full py-2
               transition-all duration-300
               text-sm md:text-base
               border-solid border-[1px] border-text bg-transparent px-5 pt-[13px] pb-2.5 
               backdrop-blur-[3px] dark:backdrop-blur-[2px]
               hover:border-primary
               focus:border-2 focus:border-primary focus:outline-none"
        aria-label="Open search"
      >
        <span class="font-medium pr-2">Search</span>
        <Search class="h-5 w-5" color="var(--primary-color)" />
      </button>

      { /* Full page search */ }
      <div 
        class={`fixed inset-0 z-50
          backdrop-blur bg-white/30 dark:bg-black/30
          transition-all duration-300 ${isSearchOpen.value ? styles.searchOverlayEnter : styles.searchOverlayExit}`}
        onClick$={handleOutsideClick}
        onAnimationEnd$={() => {
          isSearchOpen.value && inputRef.value?.focus();
        }}
      >
        <div 
          ref={searchContainerRef}
          class="absolute left-1/2 top-[20%] w-full max-w-xl -translate-x-1/2
                transform transition-transform duration-300 ease-out"
        >
          <div class="mx-4 relative">
            <div class="relative flex items-center">
              <input
                ref={inputRef}
                bind:value={searchValue}
                onKeyDown$={handleKeyDown}
                class="peer h-14 px-8 w-full rounded-xl
                        shadow-lg hover:shadow-xl
                        placeholder-transparent bg-transparent backdrop-blur-[3rem]
                        border border-text 
                        focus:border-2 focus:border-primary focus:outline-none"
                placeholder="Search"
                type="text"
                aria-label="Search input"
              />
              <label
                class="pointer-events-none absolute transition-all left-7
                  text-sm md:text-base
                  peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:-translate-x-2
                  peer-focus:top-2.5 peer-focus:text-[11px]
                  peer-[&:not(:placeholder-shown)]:top-2.5 peer-[&:not(:placeholder-shown)]:text-[11px] peer-[&:not(:placeholder-shown)]:-translate-y-1/2 peer-[&:not(:placeholder-shown)]:-translate-x-2"
              >
                Search
              </label>
              <button
                onClick$={() => updateSearchState(false)}
                class="absolute right-4 p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full"
                aria-label="Close search"
              >
                <Cancel class="h-4 w-4" color="var(--text-color)" />
              </button>
            </div>

            <div class="mt-4">
              <ListContainer 
                items={filteredItems.value}
                onItemClick$={$(async (item) => {
                  await updateSearchState(true, searchValue.value);
                  const url = new URL(location.url.protocol + location.url.host + `/timetable?TODO=${encodeURIComponent(item.label)}`)
                  await navigate(url);
                })}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});