import { component$, useSignal } from '@builder.io/qwik';  
import * as Icons from '~/components/icons/qwik';  

type Tab = {  
  id: string;  
  label: string;  
  icon: keyof typeof Icons; // Reference the icon by its name  
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

  return (  
    <div class="p-6 max-w-3xl mx-auto">  
      {/* Tabs */}  
      <div class="relative flex items-center justify-between pb-0.5 border-b border-gray-300">  
        {/* Gradient for the "bleed down" effect */}  
        <div  
          class="absolute -bottom-4 left-0 h-6 bg-gradient-to-b from-blue-400 to-transparent w-full transition-all duration-300"  
          style={{  
            width: `${100 / tabs.length}%`,  
            transform: `translateX(${tabs.findIndex((tab) => tab.id === activeTab.value) * 100}%)`,  
          }}  
        ></div>  

        {/* Active Tab Indicator */}  
        <div  
          class="absolute bottom-0 left-0 h-10 bg-blue-500 rounded-lg transition-all duration-300"  
          style={{  
            width: `${100 / tabs.length}%`,  
            transform: `translateX(${tabs.findIndex((tab) => tab.id === activeTab.value) * 100}%)`,  
          }}  
        ></div>  

        {/* Tab Buttons */}  
        {tabs.map((tab) => {  
          const Icon = Icons[tab.icon]; // Dynamically resolve the icon component  
          const isActive = activeTab.value === tab.id; // Check if the tab is active  
          return (  
            <button  
              key={tab.id}  
              onClick$={() => (activeTab.value = tab.id)}  
              class={`relative z-10 flex items-center justify-center w-full py-2 px-4 text-sm font-medium ${  
                isActive ? 'text-white' : 'text-gray-500'  
              } transition-all duration-300`}  
            >  
              {/* Render the icon */}  
              <Icon  
                class="w-5 h-5 mr-2"  
                color={isActive ? 'white' : 'black'} // Explicitly set the fill color  
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