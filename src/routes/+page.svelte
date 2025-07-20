<script>
	let { data } = $props();
</script>

<h1>hey there this is the dashboard page!</h1>

<ul>
	{#each data.transactions as transaction}
		#1
		<li>{transaction.description}</li>
	{/each}
</ul>
