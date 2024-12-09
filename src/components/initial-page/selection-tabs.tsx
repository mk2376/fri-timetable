import { component$, useSignal, useComputed$, useTask$ } from '@builder.io/qwik';  
import { useNavigate, useLocation } from '@builder.io/qwik-city';  
import * as Icons from '~/components/icons/qwik';  
import styles from "./selection-tabs.module.css";  

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
  const activeTab = useSignal(location.url.searchParams.get('tab') || 'level'); // Default to 'level'  
  const listPath = useSignal(location.url.searchParams.get('listPath') || ''); // Track the current list path  

  const tabs: Tab[] = [  
    { id: 'level', label: 'Level of study', icon: 'Direction' },  
    { id: 'teachers', label: 'Teachers', icon: 'Professors' },  
    { id: 'classrooms', label: 'Classrooms', icon: 'Classrooms' },  
    { id: 'subjects', label: 'Subjects', icon: 'Subjects' },  
  ];  

  const tabContent: TabContent = {  
    level: [  
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
    <div class="p-6 max-w-3xl mx-auto">  
      {/* Tabs */}  
      <div class="relative flex items-center justify-between pb-0.5 border-b shadow-xl rounded-lg border-gray-300">  
        {/* Light effect position container */}  
        <div  
          class="absolute bottom-0 left-0 pointer-events-none"  
          style={{  
            width: `${100 / tabs.length}%`,  
            transform: `translateX(${activeIndex.value * 100}%)`,  
            height: '40px',  
            zIndex: 10,  
            transition: 'transform 4000ms ease-in-out',  
          }}  
        >  
          {/* Animated light effect */}  
          <div class={styles["animate-light-warp"]}  
            style={{  
              position: "absolute",  
              inset: 0,  
              background: "radial-gradient(ellipse at center bottom, rgba(59, 130, 246, 0.8), rgba(59, 130, 246, 0.4) 50%, rgba(59, 130, 246, 0) 100%)",  
              filter: "blur(10px)",  
            }}  
          />  
        </div>  

        {/* Active tab indicator */}
        <div  
          class="absolute bottom-0 left-0 h-10 bg-blue-500 rounded-lg transition-all duration-300 ease-in-out z-0"  
          style={{  
            width: `${100 / tabs.length}%`,  
            transform: `translateX(${activeIndex.value * 100}%)`,  
          }}  
        />  

        {/* Tab Buttons */}  
        {tabs.map((tab) => {  
          const Icon = Icons[tab.icon];  
          const isActive = activeTab.value === tab.id;  

          return (  
            <button  
              key={tab.id}  
              onClick$={() => {  
                activeTab.value = tab.id;  
                listPath.value = ''; // Reset to the root list  
                navigate(`?tab=${tab.id}&listPath=`); // Update the URL  
              }}  
              class={`relative z-10 flex items-center justify-center w-full py-2 px-4 text-sm font-medium ${  
                isActive ? 'text-white font-bold' : 'text-gray-500'  
              }`}  
            >  
              <Icon class="w-5 h-5 mr-2" color={isActive ? 'white' : 'black'} />  
              <span>{tab.label}</span>  
            </button>  
          );  
        })}  
      </div>  


      {/* Nested List */}    
      <div class="mt-4 bg-gray-100 rounded-lg shadow-lg relative">    
        {/* Back Button */}  
        {listPath.value && (  
          <button  
            class="absolute p-2 text-blue-500 hover:text-blue-600 z-20"   
            onClick$={() => {    
              const newPath = listPath.value.split('/').slice(0, -1).join('/'); // Go up one level    
              listPath.value = newPath;    
              navigate(`?tab=${activeTab.value}&listPath=${newPath}`); // Update the URL    
            }}  
          >    
            <Icons.ArrowLeft class="w-5 h-5 hover:fill-gray-500" />    
          </button>    
        )}    

        {/* Add a wrapper div for the fading effect */}  
        <div class={`relative max-h-[30rem] overflow-y-auto z-10 ${styles["mask-fade"]}`}>  
          <ul class="p-6">    
            {currentList.value.map((item) => (    
              <li key={item.id} class="m-2">    
                <button  
                  class="text-blue-500 flex items-center justify-between text-left rounded-lg bg-gray-200 hover:bg-blue-100 shadow-md p-4"      
                  onClick$={() => {  
                    const newPath = listPath.value ? `${listPath.value}/${item.id}` : item.id;    

                    if (item.children) { // Nested list  
                      listPath.value = newPath;      
                      navigate(`?tab=${activeTab.value}&listPath=${newPath}`); // Update the URL      
                    } else { // Leaf  
                      navigate(`/timetable?${activeTab.value}=${newPath}`); // Redirect to timetable  
                    }  
                  }}  
                >    
                  <span>{item.label}</span>    
                  {item.children && (      
                    <Icons.Tree class="ml-4 w-7 h-7 -my-10 flex-shrink-0 fill-blue-500" /> // Indicator for nested lists      
                  )}  
                </button>       
              </li>    
            ))}    
          </ul>    
        </div>  
      </div>     
    </div>  
  );  
});  