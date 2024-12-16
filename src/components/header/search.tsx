import { $, component$, useSignal, useTask$, useStore, useOnWindow } from '@builder.io/qwik';
import { useLocation, useNavigate } from '@builder.io/qwik-city';
import { Search, Cancel } from '../icons/qwik';
import styles from './search.module.css'
import ListContainer from '../initial-page/selection-tabs/list-container';
import { tabDemoContent } from '../initial-page/selection-tabs';

export default component$(() => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isSearchOpen = useSignal(location.url.searchParams.get('search') === 'true');
  const searchValue = useSignal(location.url.searchParams.get('q') || '');
  const debouncedValue = useSignal(searchValue.value);
  const inputRef = useSignal<HTMLInputElement>();

  const debounceStore = useStore({
    lastUpdate: 0,
    delay: 2000,
  });

  const updateSearchState = $((open: boolean, query?: string) => {
    isSearchOpen.value = open;

    const params = new URLSearchParams(location.url.searchParams);
    
    if (open) {
      params.set('search', 'true');
      if (query) params.set('q', query);
    } else {
      params.delete('search');
      params.delete('q');
    }

    navigate(`${location.url.pathname}?${params.toString()}`, { replaceState: true });
  });

  useOnWindow('popstate', $(() => {    
    const params = new URLSearchParams(window.location.search);
    const isOpen = params.get('search') === 'true';
    const query = params.get('q') || '';
    
    isSearchOpen.value = isOpen;
    searchValue.value = query;
    debouncedValue.value = query;
  }));  
  
  useOnWindow('keydown', $((e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 'f') {
      e.preventDefault();
      updateSearchState(true);
    } else if (e.key === 'Escape' && isSearchOpen.value) {
      updateSearchState(false);
    }
  }));    

  useTask$(({ track }) => {
    const value = track(() => searchValue.value);
    const currentTime = Date.now();
    
    if (currentTime - debounceStore.lastUpdate >= debounceStore.delay) {
      debouncedValue.value = value;
      debounceStore.lastUpdate = currentTime;
      
      if (isSearchOpen.value && value) {
        updateSearchState(true, value);
      }
    }
  });

  return (
      <div class="relative">
        <button
          onClick$={() => {
            updateSearchState(true);
          }}
          class="group flex items-center gap-2 rounded-full py-2
                 transition-all duration-300
                 text-sm md:text-base placeholder-transparent
                 border-solid border-[1px] border-text bg-transparent px-5 pt-[13px] pb-2.5 backdrop-blur-[3px] dark:backdrop-blur-[2px]
                 focus:border-2 focus:border-primary"
        >
          <span class="font-medium pr-2">Search</span>
          <Search class="h-5 w-5" color="var(--primary-color)" />
        </button>

      {isSearchOpen.value && (
          <div 
            class={`fixed inset-0 z-50 ${styles.searchOverlay}`}
            onClick$={(e: PointerEvent) => {
              if (e.target === e.currentTarget) {
                updateSearchState(false);
              }
            }}
          >
          <div class="absolute left-1/2 top-[20%] w-full max-w-xl -translate-x-1/2
                      transform transition-transform duration-300 ease-out">
            <div class="mx-4 relative">
              <div class="relative flex items-center">
                <input
                  ref={inputRef}
                  bind:value={searchValue}
                  class="h-14 px-8 w-full rounded-xl
                    shadow-lg hover:shadow-xl
                    transition-all duration-300
                    bg-transparent backdrop-blur-[3rem]
                    border border-text focus:border-2 focus:border-primary focus:outline-none"
                  placeholder="Search"
                  type="text"
                />
                <button
                  onClick$={() => {
                    updateSearchState(false);
                  }}
                  class="absolute right-4 p-2"
                >
                  <Cancel class="h-4 w-4" color="var(--text-color)" />
                </button>
              </div>

              <ListContainer 
                items={tabDemoContent["subjects"]}
                onItemClick$={(item) => {
                  navigate(`/timetable?${"TODO"}=${item.label}`);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
});