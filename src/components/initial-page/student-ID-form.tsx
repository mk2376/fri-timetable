import { $, component$, type QRL } from '@builder.io/qwik';
import { routeLoader$, useNavigate } from '@builder.io/qwik-city';
import { formAction$, useForm, valiForm$, clearError, setValue, validate, type InitialValues, type SubmitHandler } from '@modular-forms/qwik';
import styles from "./student-ID-form.module.css";
import * as v from 'valibot';

const StudentIDSchema = v.object({
  studentID: v.pipe(
    v.string(),
    v.nonEmpty('Please enter your student ID.'),
    v.digits("ID should consist only of numbers"),
    v.length(8, 'Your student ID must have 8 numbers.'),
  ),
});

type StudentIDForm = v.InferInput<typeof StudentIDSchema>;

// Reexported in src/routes/index.tsx
// eslint-disable-next-line qwik/loader-location
export const useFormLoader = routeLoader$<InitialValues<StudentIDForm>>(() => ({
  studentID: '',
}));

export const useFormAction = formAction$<StudentIDForm>(() => {
  // Runs on server
}, valiForm$(StudentIDSchema));

export default component$(() => {
  // useStylesScoped$(scoped)

  const navigate = useNavigate();

  const [studentIDForm, { Form, Field}] = useForm<StudentIDForm>({
    loader: useFormLoader(),
    action: useFormAction(),
    validate: valiForm$(StudentIDSchema),
  });

  const handleSubmit: QRL<SubmitHandler<StudentIDForm>> = $((values) => {
    // Runs on client
    console.log(values);

     // Redirect to a different page after successful validation  
    navigate(`/timetable?studentID=${values.studentID}`); // Replace '/timetable' with your desired route  
  });
 
  return (
    <div class="relative h-20 flex items-center justify-center md:items-start">
      <Form onSubmit$={handleSubmit} >
        <Field name="studentID">
          {(field, props) => {
            const isValid = !studentIDForm.invalid && field.value?.length == 8; // Check if the input is valid  

            //console.log("isValid", isValid)

            return (
              <div class="relative w-full md:w-[22rem]">
                <div class="relative">
                  <input
                    {...props}
                    class="peer h-full w-full rounded-[7px] border border-text bg-transparent px-3 pt-[13px] pb-2.5 pr-20
                      text-sm md:text-base text-text placeholder-transparent
                      focus:border-2 focus:border-primary focus:outline-none"
                    type="studentID"
                    placeholder="Student ID" // Required for peer-placeholder to work
                    required
                    maxLength={8}
                    inputMode="numeric" // Mobile keyboard
                    onInput$={(e: any) => {
                      // Sanitize input and update the form state  
                      const value = e.target.value

                      //console.log(value)

                      const sanitizedValue = value.replace(/[^0-9]/g, ""); // Remove non-numeric characters  
                      e.target.value = sanitizedValue;
                      setValue(studentIDForm, 'studentID', sanitizedValue) // Update the form state with the sanitized value
                      
                      if (sanitizedValue == "") {
                        clearError(studentIDForm, 'studentID')
                        console.log("onInput clearError")
                        return
                      }

                      validate(studentIDForm)
                    }}
                    onFocusOut$={(e: any) => {
                      const value = e.target.value
                      if (value == "") {
                        clearError(studentIDForm, 'studentID')
                        console.log("onFocusOut clearError")
                        return
                      }
                    }}
                    onKeyDown$={(e) => {
                      // Allow only numeric keys, backspace, delete, arrow keys, and tab
                      if (
                        !(
                          (e.key >= "0" && e.key <= "9") || // Allow numbers
                          e.key === "Backspace" || // Allow backspace
                          e.key === "Delete" || // Allow delete
                          e.key === "ArrowLeft" || // Allow left arrow
                          e.key === "ArrowRight" || // Allow right arrow
                          e.key === "Tab" || // Allow tab
                          e.key === "Enter" // Allow Enter
                        )
                      ) {
                        e.preventDefault(); // Block all other keys
                      }
                    }}
                  />
                  <label
                    class="pointer-events-none absolute text-text transition-all
                      left-5
                      text-sm md:text-base
                      peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:-translate-x-3
                      peer-placeholder-shown:text-text
                      peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-primary
                      peer-valid:top-2 peer-valid:text-[10px] peer-valid:-translate-y-1/2 peer-valid:-translate-x-3"
                  >
                    Student ID
                  </label>
                  <button
                    class={`absolute right-1.5 top-1/2 -translate-y-1/2 z-10 rounded py-2 px-4 text-xs md:text-sm font-bold uppercase text-white shadow-md transition-all hover:shadow-lg focus:opacity-85 active:opacity-85
                        ${isValid ? styles["animated-border"] : 'bg-primary'
                      }`} type="submit"
                  >
                    Show timetable
                  </button>
                </div>
                {field.error && (
                  <div class="absolute left-0 mt-1 text-xs md:text-base text-primary">  
                    {field.error}  
                  </div>  
                )}
              </div>
            )
          }}
        </Field>
      </Form>
    </div>
  );
});
