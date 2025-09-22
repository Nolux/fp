<script lang="ts">
  import { _ } from "svelte-i18n";

  import { authClient } from "$lib/client";
  let { name, email, password } = $state({ name: "", email: "", password: "" });

  const handleSubmit = async (event: Event) => {
    event.preventDefault();
    await authClient.signUp.email({
      name,
      email,
      password,
      callbackURL: "http://localhost:5173/",
    });
  };
</script>

<div>
  <h1 class="capitalize">{$_("common.signup")}</h1>
  <form onsubmit={handleSubmit}>
    <input type="text" bind:value={name} placeholder={$_("common.name")} />
    <input type="email" bind:value={email} placeholder={$_("common.email")} />
    <input
      type="password"
      bind:value={password}
      placeholder={$_("common.password")}
    />
    <button type="submit">Signup</button>
  </form>
</div>
