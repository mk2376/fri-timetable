import { component$ } from '@builder.io/qwik';
import { type  DocumentHead } from '@builder.io/qwik-city';
import StudentIDForm from '~/components/initial-page/student-ID-form';

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
    <StudentIDForm>

    </StudentIDForm>

  );
});
