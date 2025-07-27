<script>
	let { children } = $props();
	import '../app.css';
</script>

<div class="bg-sage flex flex-col flex-1 min-h-screen text-deep-green">
	<nav class="flex items-center justify-between gap-12 pt-6 px-6">
		<a href="/" class="text-2xl font-bold">untitled budget app</a>
		<div class="flex gap-6">
			<a href="/dashboard">dashboard</a>
			<a href="/transactions">transactions</a>
			<a href="/wishlist">wishlist</a>
		</div>
	</nav>
	<div class="flex flex-col pt-12 items-center justify-center">
		{@render children()}
	</div>
</div>
