<script lang="ts">
  import { _ } from "svelte-i18n";

  import { authClient } from "$lib/client";

  let { email, password } = $state({ email: "", password: "" });

  const handleSubmit = async (event: Event) => {
    event.preventDefault();
    await authClient.signIn.email({
      email,
      password,
      callbackURL: "/",
    });
  };
</script>

<div>
  <h1 class="capitalize">{$_("common.login")}</h1>
  <form onsubmit={handleSubmit}>
    <input type="email" bind:value={email} placeholder={$_("common.email")} />
    <input
      type="password"
      bind:value={password}
      placeholder={$_("common.password")}
    />
    <button type="submit">{$_("common.login")}</button>
  </form>
</div>
