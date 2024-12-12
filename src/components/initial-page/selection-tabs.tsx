import { component$, useSignal, useComputed$, useTask$, useContext } from '@builder.io/qwik';  
import { useNavigate, useLocation } from '@builder.io/qwik-city';  
import * as Icons from '~/components/icons/qwik';  
import styles from "./selection-tabs.module.css";  
import { Platform } from '~/lib/state/platform';

type Tab = {  
  id: string;  
  label: string;  
  icon: keyof typeof Icons;  
};  

type NestedList = {  
  id: string;  
  label: string;  
  children?: NestedList[];  
};  

type TabContent = {  
  [key: string]: NestedList[];  
};  

export default component$(() => {  
  const location = useLocation(); // Get the current URL and query parameters  
  const navigate = useNavigate(); // For updating the URL  
  const activeTab = useSignal(location.url.searchParams.get('tab') || 'degree'); // Default to 'level'  
  const listPath = useSignal(location.url.searchParams.get('listPath') || ''); // Track the current list path  

  const platform = useContext(Platform);

  const tabs: Tab[] = [  
    { id: 'degree', label: 'Degree', icon: 'Podium' },  
    { id: 'teachers', label: 'Teachers', icon: 'Professors' },  
    { id: 'classrooms', label: 'Classrooms', icon: 'Classrooms' },  
    { id: 'subjects', label: 'Subjects', icon: 'Subjects' },  
  ];  

  const tabContent: TabContent = {  
    degree: [  
      { id: '1', label: 'prva stopnja: univerzitetni', children: [  
        { id: '1-1', label: 'Second Level 1-1' },  
        { id: '1-2', label: 'Second Level 1-2', children: [  
          { id: '1-2-1', label: 'Third Level 1-2-1' }  
        ] }  
      ] },  
      { id: '2', label: 'prva stopnja: visokošolski' },
      { id: '3', label: 'druga stopnja: magisterski' },  
      { id: '4', label: 'tretja stopnja: doktorski' }  
    ],  
    teachers: [  
      { id: '1', label: 'Bajec, Marko' },  
      { id: '2', label: 'Batagelj, Borut' },  
      { id: '3', label: 'Bohak, Ciril' },  
      { id: '4', label: 'Emeršič, Žiga' },  
      { id: '5', label: 'Demšar, Janez' },  
    ],  
    classrooms: [  
      { id: '1', label: 'P01' },  
      { id: '2', label: 'P02' },  
      { id: '3', label: 'P03' },  
      { id: '4', label: 'P04' },  
      { id: '5', label: 'P05' },  
      { id: '6', label: 'P06' },  
      { id: '7', label: 'P07' },  
      { id: '8', label: 'P08' },  
      { id: '9', label: 'P09' },  
      { id: '10', label: 'P10' },  
      { id: '11', label: 'P11' },  
      { id: '12', label: 'P12' },  
      { id: '13', label: 'P13' },  
      { id: '14', label: 'P14' },  
      { id: '15', label: 'P15' },  
      { id: '16', label: 'PA' },  
      { id: '17', label: 'PR05' },  
      { id: '18', label: 'PR06' },  
      { id: '19', label: 'PR07' },  
      { id: '20', label: 'PR08' },  
      { id: '21', label: 'PR09' },  
      { id: '22', label: 'PR10' },  
      { id: '23', label: 'PR11' },  
    ],  
    subjects: [  
      { id: '1', label: 'Algoritmi in podatkovne strukture 1' },  
      { id: '2', label: 'Človeški vidiki varnosti' },  
      { id: '3', label: 'Digitalno vezje' },  
      { id: '4', label: 'Digitalno načrtovanje' },  
      { id: '5', label: 'Diskratne strukture' },  
      { id: '6', label: 'Ekonomika in podjetništvo' },  
      { id: '7', label: 'Grafično oblikovanje' },  
      { id: '8', label: 'Elektronsko poslovanje' },  
      { id: '9', label: 'Fizika' },  
      { id: '10', label: 'Inteligentni sistemi' },  
    ]  
  };  

  const activeIndex = useComputed$(() =>  
    tabs.findIndex((tab) => tab.id === activeTab.value)  
  );  

  // Get the current list based on the listPath  
  const currentList = useComputed$(() => {  
    const path = listPath.value.split('/').filter(Boolean); // Split the path into levels  
    let list = tabContent[activeTab.value]; // Start with the root list for the active tab  
    for (const id of path) {  
      const item = list.find((item) => item.id === id);  
      if (item && item.children) {  
        list = item.children; // Navigate to the nested list  
      } else {  
        break;  
      }  
    }  
    return list;  
  });  

  // Sync activeTab and listPath with URL changes  
  useTask$(({ track }) => {  
    const url = track(() => location.url);  
    const tabFromUrl = url.searchParams.get('tab');  
    const listPathFromUrl = url.searchParams.get('listPath') || '';  
    if (tabFromUrl && tabFromUrl !== activeTab.value) {  
      activeTab.value = tabFromUrl;  
    }  
    if (listPathFromUrl !== listPath.value) {  
      listPath.value = listPathFromUrl;  
    }  
  });  

  return (  
    <div class="mx-auto md:pl-24">
      {/* Main Container */} 
      <div class="flex flex-col md:flex-row md:space-x-4">  
        {/* Tabs */} 
        <div class={`rounded-lg border-gray-300 backdrop-blur
          flex items-center justify-between md:justify-start md:flex-col
          shadow-top md:shadow-right
          border-t md:border-t-0 md:border-r
          fixed bottom-0 left-0 md:relative
          m-2 w-[calc(100%-16px)] md:w-auto
          h-fit z-10`}
        >
          {/* Light effect position container */}  
          <div  
            class="absolute bottom-0 left-0 pointer-events-none md:top-0 md:left-0"  
            style={{  
              width: platform.isMobile.value
                ? `${100 / tabs.length}%`
                : "100%",
              height: platform.isMobile.value
                ? `100%`
                : `${100 / tabs.length}%`,
              zIndex: 10,  
              transition: "transform 500ms ease-in-out",  
              transform: platform.isMobile.value
                ? `translateX(${activeIndex.value * 100}%)`  
                : `translateY(${activeIndex.value * 100}%)`,  
            }}  
          >  
            {/* Animated light effect */}  
            <div  
              class={`${styles["animate-light-warp"]}`}  
              style={{  
                position: "absolute",  
                inset: 0,  
                background:  
                  "radial-gradient(ellipse at center bottom, rgba(222, 54, 38, 0.8), rgba(222, 54, 38, 0.4) 50%, rgba(222, 54, 38, 0) 100%)",  
                filter: "blur(10px)",  
              }}  
            />  
          </div>  

          {/* Active tab indicator */}
          <div  
            class="absolute bottom-0 left-0 h-10 bg-primary rounded-lg transition-all duration-300 ease-in-out md:top-0 md:left-0 md:h-auto md:w-1"  
            style={{  
              width: platform.isMobile.value
                ? `${100 / tabs.length}%`
                : "100%",  
              height: platform.isMobile.value
                ? "100%"
                : `${100 / tabs.length}%`,  
              transform: platform.isMobile.value
                ? `translateX(${activeIndex.value * 100}%)`
                : `translateY(${activeIndex.value * 100}%)`,  
            }}  
          />  

          {/* Tab Buttons */}  
          {tabs.map((tab) => {  
            const Icon = Icons[tab.icon];  
            const isActive = activeTab.value === tab.id;  

            return (
              <button class={`z-10 relative flex flex-col md:flex-row
                items-center justify-center w-full py-2 px-4 font-medium
                text-xs md:text-base
                ${isActive ? "text-white" : ""}
                md:justify-start md:py-4`}
                key={tab.id}  
                onClick$={() => {
                  activeTab.value = tab.id;  
                  listPath.value = ""; // Reset to the root list  
                  navigate(`?tab=${tab.id}&listPath=`); // Update the URL  
                }}  
              >  
                <Icon class="w-10 h-10 md:w-7 md:h-7
                  m-0.5 md:mr-2"  
                  color={isActive ? "white" : "var(--text-color)"}  
                />  
                <span>{tab.label}</span>  
              </button>  
            );  
          })}  
        </div>  

        {/* Nested List */}  
        <div  
          class="relative
            w-full md:min-w-96 md:w-auto"  
          style="transform: scaleX(-1)"  
        >  
          {/* Back Button */}  
          {listPath.value && (  
            <button
              class="z-10 absolute p-2 right-0 top-1"
              onClick$={() => {  
                const newPath = listPath.value  
                  .split("/")  
                  .slice(0, -1)  
                  .join("/"); // Go up one level
                listPath.value = newPath;  
                navigate(`?tab=${activeTab.value}&listPath=${newPath}`); // Update the URL  
              }}  
            >  
              <Icons.ArrowLeft class="w-5 h-5 fill-accent hover:fill-accent-hover" />  
            </button>  
          )}  

          {/* Add a wrapper div for the fading effect */}  
          <div class={`relative h-[calc(100vh-220px-40px-56px)] md:max-h-[50rem] overflow-y-auto ${styles["mask-fade"]}`}>  
            <ul class="pl-6 my-14" style="transform: scaleX(-1)">  
              {currentList.value.map((item) => (  
                <li key={item.id} class="m-2">  
                  <button  
                    class="flex items-center justify-between text-left rounded-lg bg-accent hover:bg-accent-hover shadow-md dark:shadow-white p-4"  
                    onClick$={() => {  
                      const newPath = listPath.value
                        ? `${listPath.value}/${item.id}`
                        : item.id;  

                      if (item.children) {  
                        // Nested list  
                        listPath.value = newPath;  
                        navigate(  
                          `?tab=${activeTab.value}&listPath=${newPath}`  
                        ); // Update the URL  
                      } else {  
                        // Leaf  
                        navigate(  
                          `/timetable?${activeTab.value}=${newPath}`  
                        ); // Redirect to timetable  
                      }  
                    }}  
                  >  
                    <span>{item.label}</span>
                    {item.children && (
                      <Icons.Tree class="ml-4 w-7 h-7 -my-10 flex-shrink-0 fill-primary" />  
                    )}  
                  </button>  
                </li>  
              ))}  
            </ul>  
          </div>  
        </div>  
      </div>    
    </div>  
  );  
});  