<script>
	let { data } = $props();
</script>

<table class="table-auto">
	<thead class="bg-deep-green/33">
		<tr class="border text-center">
			<th scope="col" class="border-r px-6 py-1 text-xl">Date</th>
			<th scope="col" class="border-r px-6 py-1 text-xl">Description</th>
			<th scope="col" class="border-r px-6 py-1 text-xl">Group</th>
			<th scope="col" class="border-r px-6 py-1 text-xl">Category</th>
			<th scope="col" class="border-r px-6 py-1 text-xl">Amount</th>
			<th scope="col" class="border-r px-6 py-1 text-xl">Card</th>
		</tr>
	</thead>
	<tbody>
		{#each data.transactions as transaction}
			<tr class="border text-center">
				<td class="border-r px-6 py-1">{transaction.date}</td>
				<td class="border-r px-6 py-1">{transaction.description}</td>
				<td class="border-r px-6 py-1">{transaction.group_id}</td>
				<td class="border-r px-6 py-1">{transaction.category_id}</td>
				<td class="border-r px-6 py-1">${transaction.amount}</td>
				<td class="border-r px-6 py-1">{transaction.card_id}</td>
			</tr>
		{/each}
	</tbody>
</table>
