import { component$ } from '@builder.io/qwik';
import { type  DocumentHead } from '@builder.io/qwik-city';
import StudentIDForm from '~/components/initial-page/student-ID-form';
import SelectionTabs from '~/components/initial-page/selection-tabs/index';
import { CPUVisualization } from '~/components/initial-page/cpu-visualization/index';

export { useFormLoader }  from '~/components/initial-page/student-ID-form';

export const head: DocumentHead = {
  title: "FRI timetable",
  meta: [
    {
      name: "description",
      content: "Select a view for how FRI timetable will be displayed",
    },
  ],
};

export default component$(() => {

  return (
    <div class="m-4 md:mx-12">
      <StudentIDForm />
      <div class="md:h-12"></div>
      <SelectionTabs/>
      <CPUVisualization   
        particleSpeed={0.001}  
        rootCount={20}  
        primaryColor="#de3626" // Does not accept var, since this is not CSS  
        />
    </div>
  );
});
