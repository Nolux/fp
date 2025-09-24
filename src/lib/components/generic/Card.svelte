<script lang="ts">
  let {
    children,
    cols,
    rows,
    color,
    className,
  }: {
    children: any;
    cols?: string;
    rows?: string;
    className?: string;
    color?: string;
  } = $props();
</script>

<div
  class={`border-3 border-${color} shadow-xl shadow-${color || "slate-500"} rounded-xl p-4 ${cols ? `col-span-${cols}` : ""} ${rows ? `row-span-${rows}` : ""} ${className ? className : ""}`}
>
  {@render children?.()}
</div>
