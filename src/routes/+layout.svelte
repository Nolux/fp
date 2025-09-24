<script lang="ts">
  import { _ } from "svelte-i18n";
  import type { User as UserType, Session } from "@prisma/client";

  import "../app.css";
  import favicon from "$lib/assets/favicon.svg";
  import { authClient } from "$lib/client";
  import { goto } from "$app/navigation";

  import Dock from "$lib/components/nav/Dock.svelte";
  import User from "$lib/components/nav/User.svelte";

  let {
    children,
    data,
  }: { children: any; data: { user: UserType; session: Session } } = $props();

  const userData = $derived(data.user);
  const session = $derived(data.session);

  $inspect("user", userData);
  $inspect("session", session);
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<div>
  <User />
  {#if userData}
    <p>Logged in as {userData.name}</p>
    <button
      class="btn btn-primary"
      onclick={() =>
        authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              console.log("signing out");

              goto("/login", { invalidateAll: true });
            },
          },
        })}>{$_("common.logout")}</button
    >
  {/if}
  <main class="h-[calc(100vh-5rem)]">
    {@render children?.()}
  </main>
  <Dock />
</div>
