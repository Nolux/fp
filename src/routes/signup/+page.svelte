<script lang="ts">
  import { _ } from "svelte-i18n";
</script>

<div>
  <a href="/signup/email">{$_("common.signup_with_email")}</a>
  <a href="/signup/magicLink">{$_("common.signup_with_magic_link")}</a>
</div>
