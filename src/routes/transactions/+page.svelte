<script>
	let { data } = $props();

	let transactions = $state(data.transactions);
	let groups = $state(data.groups);
	let categories = $state(data.categories);

	let open = $state(true);

	let selectedGroupId = $state(null);
	let selectedCategory = $state(null);

	let filteredCategories = $derived(() => {
		return categories.filter((category) => category.group_id === selectedGroupId);
	});

	let isGroupSelected = $derived(selectedGroupId !== null);

	$effect(() => {
		const filtered = filteredCategories();
		if (filtered.length > 0 && selectedCategory == null) {
			selectedCategory = filtered[0].id;
		}
	});
</script>

<div class="flex flex-1 flex-col">
	<div class="flex flex-1 justify-between">
		<input type="text" class="border p-1" placeholder="search..." />
		<button
			class="px-3 bg-deep-green/50 text-sage border-1 border-deep-green hover:bg-deep-green transform duration-200 ease-in-out"
			onclick={(open = !open)}>add</button
		>
	</div>

	<table class="table-auto mt-6">
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
			{#each transactions as transaction}
				<tr class="border text-center">
					<td class="border-r px-6 py-1">{transaction.date}</td>
					<td class="border-r px-6 py-1 text-left">{transaction.description}</td>
					<td class="border-r px-6 py-1">{transaction.group_id?.name}</td>
					<td class="border-r px-6 py-1">{transaction.category_id?.name}</td>
					<td class="border-r px-6 py-1">${transaction.amount}</td>
					<td class="border-r px-6 py-1">{transaction.card_id?.name}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<!-- modal -->
{#if open}
	<div role="dialog" aria-modal="true" aria-labelledby="dialog-title" class="relative z-10">
		<div aria-hidden="true" class="fixed inset-0 bg-deep-green/75 transition-opacity"></div>

		<div class="fixed inset-0 z-10 w-screen overflow-y-auto">
			<div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
				<div
					class="relative transform overflow-hidden bg-sage text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
				>
					<div class="bg-sage px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
						<div class="mt-3 text-center">
							<h2 class="text-deep-green font-bold text-3xl text-center">add a transaction</h2>
							<div class="flex flex-col gap-2 mt-6 items-center">
								<input class="border border-deep-green px-2 py-1" type="date" />
								<input
									class="border border-deep-green px-2 py-1"
									type="text"
									placeholder="description"
								/>
								<select class="border border-deep-green px-2 py-1" bind:value={selectedGroupId}>
									<option value={null}>select a group...</option>
									{#each groups as group}
										<option value={group.id}>{group.name}</option>
									{/each}
								</select>
								{#if !isGroupSelected}
									<select
										class="border border-deep-green px-2 py-1 text-deep-green/50 bg-deep-green/15"
										disabled
									>
										<option value="">select a category...</option>
									</select>
								{:else}
									<select class="border border-deep-green px-2 py-1" bind:value={selectedCategory}>
										{#each filteredCategories() as category}
											<option value={category.id}>{category.name}</option>
										{/each}
									</select>
								{/if}
								<input
									class="border border-deep-green px-2 py-1"
									type="text"
									placeholder="amount"
								/>
								<input class="border border-deep-green px-2 py-1" type="text" placeholder="card" />
							</div>
						</div>
					</div>
					<div class="bg-sage px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
						<button
							type="button"
							class="inline-flex w-full justify-center bg-deep-green px-3 py-2 text-sm font-semibold text-sage shadow-xs hover:bg-deep-green/90 sm:ml-3 sm:w-auto"
							>add</button
						>
						<button
							type="button"
							class="mt-3 inline-flex w-full justify-center bg-deep-green/33 px-3 py-2 text-sm font-semibold text-deep-green sm:mt-0 sm:w-auto hover:bg-deep-green/50"
							onclick={(open = !open)}>cancel</button
						>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
