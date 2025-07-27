<script>
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let wishlist = $state(data.wishlist);

	let open = $state(false);
	let searchQuery = $state('');

	// Form data state
	let formData = $state({
		name: '',
		link: '',
		price: ''
	});

	// Simple search function to filter wishlist items
	function getFilteredWishlist() {
		if (!searchQuery.trim()) {
			return wishlist;
		}

		const query = searchQuery.toLowerCase().trim();
		return wishlist.filter((item) => {
			// Search in name
			const name = item.name || '';
			if (name.toLowerCase().includes(query)) return true;

			// Search in link
			const link = item.link || '';
			if (link.toLowerCase().includes(query)) return true;

			// Search in price
			const priceStr = item.price?.toString() || '';
			if (priceStr.includes(query)) return true;

			return false;
		});
	}

	// Track the last processed wishlist item ID to prevent infinite loops
	let lastProcessedWishlistId = $state(null);

	// Handle form success/error states
	$effect(() => {
		if (form?.success && form?.wishlistItem) {
			// Only process if we haven't already processed this wishlist item
			if (form.wishlistItem.id !== lastProcessedWishlistId) {
				// Reset form and close modal on success
				resetForm();
				open = false;

				// Add the new wishlist item to the start of the local state
				// This provides immediate UI feedback without requiring a page reload
				// Since we display latest items first, new ones go at the beginning
				wishlist = [form.wishlistItem, ...wishlist];

				// Remember that we processed this wishlist item
				lastProcessedWishlistId = form.wishlistItem.id;
			}
		}
	});

	function resetForm() {
		formData = {
			name: '',
			link: '',
			price: ''
		};
	}

	function handleCancel() {
		resetForm();
		open = false;
	}

	// Function to format date to M/D/YYYY
	function formatDate(dateString) {
		const date = new Date(dateString);
		return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
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

	<table class="table-auto mt-6 max-w-3xl min-w-3xl mb-24">
		<thead class="bg-deep-green/33">
			<tr class="border text-center">
				<th scope="col" class="border-r px-6 py-1 text-xl">Date Added</th>
				<th scope="col" class="border-r px-6 py-1 text-xl">Name</th>
				<th scope="col" class="border-r px-6 py-1 text-xl">Price</th>
				<th scope="col" class="border-r px-6 py-1 text-xl">Delete</th>
			</tr>
		</thead>
		<tbody>
			{#each getFilteredWishlist() as item}
				<tr class="border text-center">
					<td class="border-r px-6 py-1">{formatDate(item.created_at)}</td>
					<td class="border-r px-6 py-1 font-semibold break-all">
						{#if item.link}
							<a
								href={item.link}
								class="text-blue-700 underline"
								target="_blank"
								rel="noopener noreferrer">{item.name}</a
							>
						{:else}
							{item.name}
						{/if}
					</td>
					<td class="border-r px-6 py-1"
						>{item.price !== null && item.price !== undefined ? `$${item.price}` : '-'}</td
					>
					<td class="border-r px-6 py-1">
						<form method="POST" action="?/delete" use:enhance>
							<input type="hidden" name="id" value={item.id} />
							<button
								type="submit"
								class="text-deep-green p-1"
								onclick={(e) => {
									if (!confirm('Are you sure you want to delete this wishlist item?')) {
										e.preventDefault();
									}
								}}><i class="material-icons">delete</i></button
							>
						</form>
					</td>
				</tr>
			{/each}
			{#if getFilteredWishlist().length === 0}
				<tr class="border text-center">
					<td colspan="4" class="border-r px-6 py-1 text-left">No wishlist items found.</td>
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
								<h2 class="text-deep-green font-bold text-3xl text-center">add to wishlist</h2>

								<!-- Display error message if there is one -->
								{#if form?.error}
									<div class="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mt-4">
										{form.error}
									</div>
								{/if}

								<div class="flex flex-col gap-2 mt-6 mx-24">
									<input
										class="border border-deep-green px-2 py-1"
										type="text"
										name="name"
										placeholder="item name"
										bind:value={formData.name}
										required
									/>
									<input
										class="border border-deep-green px-2 py-1"
										type="text"
										name="link"
										placeholder="link (optional)"
										bind:value={formData.link}
									/>
									<input
										class="border border-deep-green px-2 py-1"
										type="number"
										step="0.01"
										name="price"
										placeholder="price (optional)"
										bind:value={formData.price}
									/>
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
