<script lang="ts">
  import { authClient } from "$lib/client";

  //const session = authClient.useSession();

  const { data } = $props();
  const { session, user } = data;
  $inspect(session);
  $inspect(user);
</script>

<div></div>
