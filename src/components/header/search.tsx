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

  const handleOutsideClick = $((event: MouseEvent) => {
    // If we clicked outside the search box ref, close the search
    if (!searchContainerRef.value?.contains(event.target as Node)) {
      updateSearchState(false);
    }
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
               backdrop-blur-sm
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
        onAnimationEnd$={() => {
          isSearchOpen.value && inputRef.value?.focus();
        }}
        onClick$={handleOutsideClick}
      >
        <div 
          ref={searchContainerRef}
          class="max-w-2xl mx-auto w-full md:p-10 mt-10 md:mt-[5%] 2xl:mt-[10%]
                transform transition-transform duration-300 ease-out"
        >
              <div class="relative flex items-center mx-4 md:mx-auto">
                <input
                  ref={inputRef}
                  bind:value={searchValue}
                  onKeyDown$={handleKeyDown}
                  class="peer w-full h-12 md:h-14
                        px-4 md:px-8
                        rounded-lg md:rounded-xl
                        shadow-lg hover:shadow-xl
                        placeholder-transparent 
                        backdrop-blur-md bg-white/50 dark:bg-black/50
                        border border-text 
                        text-base md:text-lg
                        focus:border-2 focus:border-primary focus:outline-none
                        transition-all duration-200"
                  placeholder="Search"
                  type="text"
                  aria-label="Search input"
                />
                <label
                  class="pointer-events-none absolute transition-all
                        top-1/2 -translate-y-1/2
                        left-4 md:left-7 peer-active-input:left-3 md:peer-active-input:left-6
                        text-sm md:text-base
                        peer-active-input:top-2 md:peer-active-input:top-2.5
                        peer-active-input:text-[10px] md:peer-active-input:text-[11px]"
                >
                  Search
                </label>
                <button
                  onClick$={() => updateSearchState(false)}
                  class="absolute right-2 md:right-4 
                        p-1.5 md:p-2
                        hover:bg-gray-200 dark:hover:bg-gray-800 
                        rounded-full
                        transition-colors duration-200"
                  aria-label="Close search"
                >
                  <Cancel class="h-3 w-3 md:h-4 md:w-4" color="var(--text-color)" />
                </button>
              </div>

              <div class="mt-3 md:mt-4">
                <ListContainer 
                  items={filteredItems.value}
                  onItemClick$={$(async (item) => {
                    await updateSearchState(true, searchValue.value);
                    const url = new URL(
                      location.url.protocol + location.url.host + 
                      `/timetable?TODO=${encodeURIComponent(item.label)}`
                    );
                    await navigate(url);
                  })}
                  listStyle="max-h-[calc(100vh-200px)] md:h-[60vh] md:max-h-min"
                />
              </div>
        </div>
      </div>
    </div>
  );
});