import { component$ } from '@builder.io/qwik';
import { type  DocumentHead } from '@builder.io/qwik-city';
import StudentIDForm from '~/components/initial-page/student-ID-form';
import SelectionTabs from '~/components/initial-page/selection-tabs'

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
    <div class="m-12">
      <StudentIDForm />
      <div class="h-12"></div>
      <SelectionTabs />
    </div>
  );
});
