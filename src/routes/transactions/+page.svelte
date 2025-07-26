<script>
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let transactions = $state(data.transactions);
	let groups = $state(data.groups);
	let categories = $state(data.categories);
	let cards = $state(data.cards);

	let open = $state(false);
	let searchQuery = $state('');

	let selectedGroupId = $state(null);
	let selectedCategory = $state(null);

	// Form data state
	let formData = $state({
		date: '',
		description: '',
		amount: '',
		cardId: null
	});

	let filteredCategories = $derived(() => {
		return categories.filter((category) => category.group_id === selectedGroupId);
	});

	// Simple search function to filter transactions
	function getFilteredTransactions() {
		if (!searchQuery.trim()) {
			return transactions;
		}

		const query = searchQuery.toLowerCase().trim();
		return transactions.filter((transaction) => {
			// Search in description
			const desc = transaction.description || '';
			if (desc.toLowerCase().includes(query)) return true;

			// Search in group name
			const groupName = transaction.group_id?.name || '';
			if (groupName.toLowerCase().includes(query)) return true;

			// Search in category name
			const categoryName = transaction.category_id?.name || '';
			if (categoryName.toLowerCase().includes(query)) return true;

			// Search in card name
			const cardName = transaction.card_id?.name || '';
			if (cardName.toLowerCase().includes(query)) return true;

			// Search in amount
			const amount = transaction.amount?.toString() || '';
			if (amount.includes(query)) return true;

			return false;
		});
	}

	let isGroupSelected = $derived(selectedGroupId !== null);

	$effect(() => {
		const filtered = filteredCategories();

		if (filtered.length > 0) {
			selectedCategory = filtered[0].id;
		} else {
			selectedCategory = null;
		}
	});

	// Track the last processed transaction ID to prevent infinite loops
	let lastProcessedTransactionId = $state(null);

	// Handle form success/error states
	$effect(() => {
		if (form?.success && form?.transaction) {
			// Only process if we haven't already processed this transaction
			if (form.transaction.id !== lastProcessedTransactionId) {
				// Reset form and close modal on success
				resetForm();
				open = false;

				// Transform the transaction to match the expected format with nested objects
				const selectedGroup = groups.find((g) => g.id === form.transaction.group_id);
				const selectedCategoryObj = categories.find((c) => c.id === form.transaction.category_id);
				const selectedCard = cards.find((c) => c.id === form.transaction.card_id);

				const transformedTransaction = {
					...form.transaction,
					group_id: selectedGroup ? { id: selectedGroup.id, name: selectedGroup.name } : null,
					category_id: selectedCategoryObj
						? {
								id: selectedCategoryObj.id,
								group_id: selectedCategoryObj.group_id,
								name: selectedCategoryObj.name
							}
						: null,
					card_id: selectedCard ? { id: selectedCard.id, name: selectedCard.name } : null
				};

				// Add the transformed transaction to the start of the local state
				// This provides immediate UI feedback without requiring a page reload
				// Since we display latest transactions first, new ones go at the beginning
				transactions = [transformedTransaction, ...transactions];

				// Remember that we processed this transaction
				lastProcessedTransactionId = form.transaction.id;
			}
		}
	});

	function resetForm() {
		formData = {
			date: '',
			description: '',
			amount: '',
			cardId: null
		};
		selectedGroupId = null;
		selectedCategory = null;
	}

	function handleCancel() {
		resetForm();
		open = false;
	}

	// Function to format date to M/D/YYYY
	function formatDate(date) {
		// Parse the date string directly to avoid timezone issues
		const [year, month, day] = date.split('-');
		return `${parseInt(month)}/${parseInt(day)}/${year}`;
	}
</script>

<div class="flex flex-1 flex-col">
	<div class="flex flex-1 justify-between">
		<input type="text" class="border p-1" placeholder="search..." bind:value={searchQuery} />
		<button
			class="px-3 bg-deep-green/50 text-sage border-1 border-deep-green hover:bg-deep-green transform duration-200 ease-in-out"
			onclick={() => (open = !open)}>add</button
		>
	</div>

	<table class="table-fixed mt-6 max-w-6xl min-w-6xl mb-24">
		<thead class="bg-deep-green/33">
			<tr class="border text-center">
				<th scope="col" class="border-r px-6 py-1 text-xl">Date</th>
				<th scope="col" class="border-r px-6 py-1 text-xl">Description</th>
				<th scope="col" class="border-r px-6 py-1 text-xl">Group</th>
				<th scope="col" class="border-r px-6 py-1 text-xl">Category</th>
				<th scope="col" class="border-r px-6 py-1 text-xl">Amount</th>
				<th scope="col" class="border-r px-6 py-1 text-xl">Card</th>
				<th scope="col" class="border-r px-6 py-1 text-xl">Delete</th>
			</tr>
		</thead>
		<tbody>
			{#each getFilteredTransactions() as transaction}
				<tr
					class={transaction.group_id?.name == 'income'
						? 'border text-center bg-deep-green/10'
						: 'border text-center'}
				>
					<td class="border-r px-6 py-1">{formatDate(transaction.date)}</td>
					<td class="border-r px-6 py-1 text-left">{transaction.description}</td>
					<td class="border-r px-6 py-1">{transaction.group_id?.name}</td>
					<td class="border-r px-6 py-1">{transaction.category_id?.name}</td>
					<td class="border-r px-6 py-1">${transaction.amount}</td>
					<td class="border-r px-6 py-1">{transaction.card_id?.name}</td>
					<td class="border-r px-6 py-1">
						<form
							method="POST"
							action="?/delete"
							use:enhance={() => {
								return async ({ result, update }) => {
									await update();
									// Remove from local state on successful delete
									if (result.type === 'success') {
										transactions = transactions.filter((t) => t.id !== transaction.id);
									}
								};
							}}
						>
							<input type="hidden" name="id" value={transaction.id} />
							<button type="submit" class="text-deep-green p-1">
								<i class="material-icons">delete</i>
							</button>
						</form>
					</td>
				</tr>
			{/each}
			{#if getFilteredTransactions().length === 0}
				<tr class="border text-center">
					<td colspan="7" class="border-r px-6 py-1 text-left">No results found.</td>
				</tr>
			{/if}
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
					<form
						method="POST"
						action="?/create"
						use:enhance={() => {
							return async ({ result, update }) => {
								await update();
							};
						}}
					>
						<div class="bg-sage px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
							<div class="mt-3 text-center">
								<h2 class="text-deep-green font-bold text-3xl text-center">add a transaction</h2>

								<!-- Display error message if there is one -->
								{#if form?.error}
									<div class="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mt-4">
										{form.error}
									</div>
								{/if}

								<div class="flex flex-col gap-2 mt-6 mx-24">
									<!-- Hidden inputs to send the selected group and category IDs -->
									<input type="hidden" name="groupId" value={selectedGroupId} />
									<input type="hidden" name="categoryId" value={selectedCategory} />

									<input
										class="border border-deep-green px-2 py-1"
										type="date"
										name="date"
										bind:value={formData.date}
										required
									/>
									<input
										class="border border-deep-green px-2 py-1"
										type="text"
										name="description"
										placeholder="description"
										bind:value={formData.description}
										required
									/>
									<select
										class="border border-deep-green px-2 py-1"
										bind:value={selectedGroupId}
										required
									>
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
										<select
											class="border border-deep-green px-2 py-1"
											bind:value={selectedCategory}
											required
										>
											{#each filteredCategories() as category}
												<option value={category.id}>{category.name}</option>
											{/each}
										</select>
									{/if}
									<input
										class="border border-deep-green px-2 py-1"
										type="number"
										step="0.01"
										name="amount"
										placeholder="amount"
										bind:value={formData.amount}
										required
									/>
									<select
										class="border border-deep-green px-2 py-1"
										name="cardId"
										bind:value={formData.cardId}
										required
									>
										<option value={null}>select a card...</option>
										{#each cards as card}
											<option value={card.id}>{card.name}</option>
										{/each}
									</select>
								</div>
							</div>
						</div>
						<div class="bg-sage px-4 py-3 flex items-center justify-center gap-4 mt-6">
							<button
								type="submit"
								class="inline-flex w-full justify-center bg-deep-green px-3 py-1 text-sm font-semibold text-sage shadow-xs hover:bg-deep-green/90 sm:ml-3 sm:w-auto"
								>add</button
							>
							<button
								type="button"
								class="mt-3 inline-flex w-full justify-center bg-deep-green/33 px-3 py-1 text-sm font-semibold text-deep-green sm:mt-0 sm:w-auto hover:bg-deep-green/50"
								onclick={handleCancel}>cancel</button
							>
						</div>
					</form>
				</div>
			</div>
		</div>
	</div>
{/if}
