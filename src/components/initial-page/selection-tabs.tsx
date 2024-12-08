import { component$, useSignal, useComputed$ } from '@builder.io/qwik';    
import * as Icons from '~/components/icons/qwik';    
import styles from "./selection-tabs.module.css";  

type Tab = {    
  id: string;    
  label: string;    
  icon: keyof typeof Icons;  
};    

type TabContent = {    
  [key: string]: string;    
};    

export default component$(() => {    
  const activeTab = useSignal('stopnja');    

  const tabs: Tab[] = [    
    { id: 'stopnja', label: 'Stopnja', icon: 'Direction' },    
    { id: 'profesorji', label: 'Profesorji', icon: 'Professors' },    
    { id: 'predavalnice', label: 'Predavalnice', icon: 'Classrooms' },    
    { id: 'predmeti', label: 'Predmeti', icon: 'Subjects' },    
  ];    

  const tabContent: TabContent = {    
    stopnja: 'Vsebina za Stopnja-Letnik-Program.',    
    profesorji: 'Vsebina za Profesorji.',    
    predavalnice: 'Vsebina za Predavalnice.',    
    predmeti: 'Vsebina za Predmeti.',    
  };    

  const activeIndex = useComputed$(() =>   
    tabs.findIndex((tab) => tab.id === activeTab.value)  
  );  

  return (    
    <div class="p-6 max-w-3xl mx-auto">    
      {/* Tabs */}    
      <div class="relative flex items-center justify-between pb-0.5 border-b border-gray-300">      
        {/* Light effect position container - slower transition */}    
        <div      
          class="absolute bottom-0 left-0 pointer-events-none"    
          style={{    
            width: `${100 / tabs.length}%`,    
            transform: `translateX(${activeIndex.value * 100}%)`,  
            height: '40px',  
            zIndex: 10,  
            transition: 'transform 4000ms ease-in-out'  
          }}      
        >  
          {/* Animated light effect */}  
          <div   
            class={styles["animate-light-warp"]}  
            style={{  
              position: 'absolute',  
              inset: 0,  
              background: `    
                radial-gradient(ellipse at center bottom, rgba(59, 130, 246, 0.8), rgba(59, 130, 246, 0.4) 50%, rgba(59, 130, 246, 0) 100%)    
              `,    
              filter: 'blur(10px)',  
            }}  
          />  
        </div>  

        {/* Active tab indicator - faster transition */}  
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
              onClick$={() => (activeTab.value = tab.id)}    
              class={`relative z-10 flex items-center justify-center w-full py-2 px-4 text-sm font-medium ${    
                isActive ? 'text-white' : 'text-gray-500'    
              } transition-all duration-300`}    
            >    
              <Icon    
                class="w-5 h-5 mr-2"    
                color={isActive ? 'white' : 'black'}  
              />    
              <span>{tab.label}</span>    
            </button>    
          );    
        })}    
      </div>    

      {/* Tab Content */}    
      <div    
        class="mt-4 p-4 bg-gray-100 rounded-lg shadow-md transition-all duration-500"    
        key={activeTab.value}    
      >    
        <p class="text-gray-700">{tabContent[activeTab.value]}</p>    
      </div>    
    </div>    
  );    
});  