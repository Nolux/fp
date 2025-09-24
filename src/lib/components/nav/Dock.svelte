<script lang="ts">
  import { _ } from "svelte-i18n";
  import { House, Calendar, Check, CalendarDays } from "@lucide/svelte";
  import { goto } from "$app/navigation";

  let activeTab = $state("home");

  function setActiveTab(tab: string) {
    activeTab = tab;
    goto(`/${tab}`);
  }
</script>

<div
  class="dock dock-xl inset-shadow-sm text-slate-500"
  class:inset-shadow-primary={activeTab === "home"}
  class:inset-shadow-secondary={activeTab === "calendar"}
  class:inset-shadow-warning={activeTab === "chores"}
>
  <button
    class:dock-active={activeTab === "home"}
    class:text-primary={activeTab === "home"}
    onclick={() => setActiveTab("home")}
  >
    <House size={30} />
    <span class="dock-label">{$_("navigation.home")}</span>
  </button>

  <button
    class:dock-active={activeTab === "calendar"}
    class:text-secondary={activeTab === "calendar"}
    onclick={() => setActiveTab("calendar")}
  >
    <CalendarDays size={30} />
    <span class="dock-label">{$_("navigation.calendar")}</span>
  </button>
  <button
    class:dock-active={activeTab === "chores"}
    class:text-warning={activeTab === "chores"}
    onclick={() => setActiveTab("chores")}
  >
    <Check size={30} />
    <span class="dock-label">{$_("navigation.chores")}</span>
  </button>
</div>
