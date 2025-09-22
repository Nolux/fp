<script lang="ts">
  import { _ } from "svelte-i18n";

  const { data } = $props();
  const { session, user } = data;
  $inspect(session);
  $inspect(user);
</script>

<div>
  <h1>Protected</h1>
  <p>Hello {user.name}</p>
</div>
