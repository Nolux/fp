<script lang="ts">
  import { _ } from "svelte-i18n";
  import "../app.css";
  import favicon from "$lib/assets/favicon.svg";
  import { authClient } from "$lib/client";
  import { goto, invalidateAll } from "$app/navigation";
  import type { User, Session } from "@prisma/client";

  let {
    children,
    data,
  }: { children: any; data: { user: User; session: Session } } = $props();

  const user = $derived(data.user);
  const session = $derived(data.session);

  $inspect("user", user);
  $inspect("session", session);
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

{#if user}
  <p>Logged in as {user.name}</p>
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
{@render children?.()}
