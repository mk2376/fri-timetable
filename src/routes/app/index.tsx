import { $, component$, type QRL } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';
import { formAction$, useForm, valiForm$, type InitialValues, type SubmitHandler } from '@modular-forms/qwik';
import * as v from 'valibot';

const StudentIDSchema = v.object({
  studentID: v.pipe(
    v.string(),
    v.nonEmpty('Please enter your student ID.'),
    v.minLength(8, 'Your student ID must have 8 characters.'),
  ),
});

type StudentIDForm = v.InferInput<typeof StudentIDSchema>;

export const useFormLoader = routeLoader$<InitialValues<StudentIDForm>>(() => ({
  studentID: '',
}));

export const useFormAction = formAction$<StudentIDForm>(() => {
  // Runs on server
}, valiForm$(StudentIDSchema));

export default component$(() => {
  const [, { Form, Field}] = useForm<StudentIDForm>({
    loader: useFormLoader(),
    action: useFormAction(),
    validate: valiForm$(StudentIDSchema),
  });

  const handleSubmit: QRL<SubmitHandler<StudentIDForm>> = $((values) => {
    // Runs on client
    console.log(values);
  });
 
  return  <Form onSubmit$={handleSubmit}>
    <Field name="studentID">
        {(field, props) => (
            <div>
              <input {...props} type="studentID" value={field.value} />
              {field.error && <div>{field.error}</div>}
            </div>
          )}
      </Field>
      <button type="submit">Show timetable</button>
  </Form>;
});
