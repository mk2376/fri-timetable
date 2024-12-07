import { component$, useStore } from '@builder.io/qwik';

// Define the type for the timetable  
type Timetable = {  
  [day: string]: {  
    [time: string]: string; // Maps time slots to subjects  
  };  
};  

// Define the type for the store  
type Store = {  
  timetable: Timetable;  
  date: string;  
};  

export default component$(() => {
  const store = useStore<Store>({  
    timetable: {
      'Monday': { '9:00 AM': 'Math', '10:00 AM': 'Science' },
      'Tuesday': { '9:00 AM': 'History', '10:00 AM': 'Art' },
    },
    date: '',
  });

  return (
    <div class="p-4">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold">Timetable</h1>
        <input
          type="date"
          value={store.date}
          onInput$={(e: any) => (store.date = e.target.value)}
          class="border border-gray-300 rounded px-4 py-2"
        />
      </div>
      <div class="overflow-auto">
        <table class="table-auto border-collapse border border-gray-300 w-full">
          <thead class="sticky top-0 bg-gray-200">
            <tr>
              <th class="border border-gray-300 px-4 py-2">Day/Time</th>
              {Object.keys(store.timetable.Monday).map((time) => (
                <th key={time} class="border border-gray-300 px-4 py-2">
                  {time}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.keys(store.timetable).map((day) => (
              <tr key={day}>
                <td class="sticky left-0 bg-gray-200 border border-gray-300 px-4 py-2">
                  {day}
                </td>
                {Object.values(store.timetable[day]).map((subject, index) => (
                  <td key={index} class="border border-gray-300 px-4 py-2">
                    {subject}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});