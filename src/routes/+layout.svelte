<script>
    let { children } = $props();
    import "../app.css"
</script>

<div class="bg-sage flex flex-col flex-1 min-h-screen">
    <nav class="flex items-center justify-center gap-12 pt-6">
        <a href="/">dashboard</a>
        <a href="/transactions">transactions</a>
        <a href="/settings">settings</a>
    </nav>
    <div class="pt-12 text-center">
        {@render children()}
    </div>
</div>