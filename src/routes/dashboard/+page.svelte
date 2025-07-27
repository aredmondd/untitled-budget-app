<script>
	let { data } = $props();

	let { pivotData, months } = data;
	let selectedMonth = $state(months.length > 0 ? months[0].key : null);

	// Get data for the selected month
	function getMonthData() {
		if (!selectedMonth) return {};

		const monthData = {};

		// Process pivot data for the selected month
		Object.keys(pivotData).forEach((groupName) => {
			monthData[groupName] = {};
			Object.keys(pivotData[groupName]).forEach((categoryName) => {
				const amount = pivotData[groupName][categoryName][selectedMonth] || 0;
				if (amount !== 0) {
					monthData[groupName][categoryName] = amount;
				}
			});
		});

		return monthData;
	}

	// Calculate group totals for the selected month
	function getGroupTotal(groupName) {
		const monthData = getMonthData();
		if (!monthData[groupName]) return 0;

		return Object.values(monthData[groupName]).reduce((sum, amount) => sum + amount, 0);
	}

	// Get the display name for the selected month
	function getSelectedMonthName() {
		const month = months.find((m) => m.key === selectedMonth);
		return month ? month.name : '';
	}

	// Get income vs expenses data for the selected month
	function getIncomeVsExpenses() {
		if (!selectedMonth) return { income: 0, expenses: 0 };

		let income = 0;
		let expenses = 0;

		Object.keys(pivotData).forEach((groupName) => {
			Object.keys(pivotData[groupName]).forEach((categoryName) => {
				const amount = pivotData[groupName][categoryName][selectedMonth] || 0;
				if (groupName.toLowerCase() === 'income') {
					income += amount;
				} else {
					expenses += amount;
				}
			});
		});

		return { income, expenses };
	}

	// Format currency
	function formatCurrency(amount) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format(amount);
	}
</script>

<div class="flex flex-1 flex-col p-6">
	<!-- Month Selection Buttons -->
	<div class="mb-6">
		<div class="flex flex-wrap gap-2">
			{#each months as month}
				<button
					class={`px-4 py-2 rounded border transition-colors duration-200 ${
						selectedMonth === month.key
							? 'bg-deep-green text-sage border-deep-green'
							: 'bg-sage text-deep-green border-deep-green hover:bg-deep-green/10'
					}`}
					onclick={() => (selectedMonth = month.key)}
				>
					{month.name}
				</button>
			{/each}
		</div>
	</div>

	<!-- Tables Container -->
	{#if selectedMonth}
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<!-- Income vs Expenses Table -->
			<div class="bg-sage rounded-lg shadow-lg overflow-hidden border border-deep-green/20">
				<div class="bg-deep-green/33 px-6 py-4">
					<h2 class="text-xl font-semibold text-deep-green">
						{getSelectedMonthName()} Overview
					</h2>
				</div>
				<div class="p-6">
					<table class="w-full">
						<tbody class="space-y-2">
							<tr class="border-b border-deep-green/20">
								<td class="py-3 text-deep-green font-semibold">Total Income</td>
								<td class="py-3 text-right text-deep-green font-bold">
									{formatCurrency(getIncomeVsExpenses().income)}
								</td>
							</tr>
							<tr class="border-b border-deep-green/20">
								<td class="py-3 text-deep-green font-semibold">Total Expenses</td>
								<td class="py-3 text-right text-deep-green font-bold">
									{formatCurrency(getIncomeVsExpenses().expenses)}
								</td>
							</tr>
							<tr class="border-t-2 border-deep-green/50">
								<td class="py-3 text-deep-green font-bold text-lg">Net Income</td>
								<td class="py-3 text-right font-bold text-lg {(getIncomeVsExpenses().income - getIncomeVsExpenses().expenses) >= 0 ? 'text-deep-green' : 'text-red-600'}">
									{formatCurrency(getIncomeVsExpenses().income - getIncomeVsExpenses().expenses)}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			<!-- Detailed Pivot Table -->
			<div class="bg-sage rounded-lg shadow-lg overflow-hidden border border-deep-green/20">
				<div class="bg-deep-green/33 px-6 py-4">
					<h2 class="text-xl font-semibold text-deep-green">
						{getSelectedMonthName()} Details
					</h2>
				</div>

			<div class="overflow-x-auto">
				<table class="w-full">
					<thead class="bg-deep-green/20">
						<tr>
							<th class="px-6 py-3 text-left text-deep-green font-semibold">Group</th>
							<th class="px-6 py-3 text-left text-deep-green font-semibold">Category</th>
							<th class="px-6 py-3 text-right text-deep-green font-semibold">Amount</th>
						</tr>
					</thead>
					<tbody>
						{#each Object.keys(getMonthData()) as groupName}
							{@const groupData = getMonthData()[groupName]}
							{@const groupTotal = getGroupTotal(groupName)}
							{@const hasCategories = Object.keys(groupData).length > 0}

							{#if hasCategories}
								<!-- Group Header Row -->
								<tr class="bg-deep-green/20 border-t-2 border-deep-green/33">
									<td class="px-6 py-3 font-bold text-deep-green" colspan="2">
										{groupName}
									</td>
									<td class="px-6 py-3 text-right font-bold text-deep-green">
										{formatCurrency(groupTotal)}
									</td>
								</tr>

								<!-- Category Rows -->
								{#each Object.entries(groupData) as [categoryName, amount]}
									<tr class="border-b border-deep-green/10 hover:bg-deep-green/5">
										<td class="px-6 py-3 text-deep-green/50"></td>
										<td class="px-6 py-3 text-deep-green pl-8">
											{categoryName}
										</td>
										<td class="px-6 py-3 text-right text-deep-green">
											{formatCurrency(amount)}
										</td>
									</tr>
								{/each}
							{/if}
						{/each}

						{#if Object.keys(getMonthData()).length === 0}
							<tr>
								<td colspan="3" class="px-6 py-8 text-center text-deep-green/50">
									No transactions found for {getSelectedMonthName()}
								</td>
							</tr>
						{/if}
					</tbody>
				</table>
				</div>
			</div>
		</div>
	{:else}
		<div class="bg-white rounded-lg shadow-lg p-8 text-center">
			<p class="text-gray-500 text-lg">No transaction data available</p>
		</div>
	{/if}
</div>

<style>
	/* Custom scrollbar for the table */
	.overflow-x-auto::-webkit-scrollbar {
		height: 8px;
	}

	.overflow-x-auto::-webkit-scrollbar-track {
		background: #f1f1f1;
		border-radius: 4px;
	}

	.overflow-x-auto::-webkit-scrollbar-thumb {
		background: #c1c1c1;
		border-radius: 4px;
	}

	.overflow-x-auto::-webkit-scrollbar-thumb:hover {
		background: #a1a1a1;
	}
</style>
