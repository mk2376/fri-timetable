import { component$ } from "@builder.io/qwik";

export default component$(() => {
  return (
    <header class="flex justify-between items-center bg-blue-600 text-white p-4">
      <div class="text-xl font-bold">FRI</div>
      <button class="bg-white text-blue-600 px-4 py-2 rounded">Login</button>
    </header>
  );
});
