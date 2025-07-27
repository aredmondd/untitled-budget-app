import type { PageServerLoad } from './$types';
import { supabase } from '../../lib/supabaseClient';
import type { QueryData } from '@supabase/supabase-js';
import { USER_ID } from '$env/static/private';

export const load: PageServerLoad = async () => {
	// Get all transactions with their related data
	const transactionsQuery = supabase
		.from('transactions')
		.select(
			`
			id,
			date,
			description,
			amount,
			created_at,
			group_id (
				id,
				name
			),
			category_id (
				id,
				name,
				group_id
			),
			card_id (
				id,
				name
			)
		`
		)
		.eq('user_id', USER_ID)
		.order('date', { ascending: false });

	const [transactionsResult] = await Promise.all([transactionsQuery]);

	type Transaction = QueryData<typeof transactionsQuery>[number];

	if (transactionsResult.error) {
		throw transactionsResult.error;
	}

	const transactions: Transaction[] = transactionsResult.data || [];

	// Process transactions to get unique months and create pivot data
	const monthsSet = new Set<string>();
	const pivotData: Record<string, Record<string, Record<string, number>>> = {};

	transactions.forEach((transaction) => {
		const date = new Date(transaction.date);
		const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
		const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
		
		monthsSet.add(monthKey);

		const groupName = (transaction.group_id as any)?.name || 'Unknown Group';
		const categoryName = (transaction.category_id as any)?.name || 'Unknown Category';
		const amount = transaction.amount || 0;

		// Initialize nested structure if it doesn't exist
		if (!pivotData[groupName]) {
			pivotData[groupName] = {};
		}
		if (!pivotData[groupName][categoryName]) {
			pivotData[groupName][categoryName] = {};
		}
		if (!pivotData[groupName][categoryName][monthKey]) {
			pivotData[groupName][categoryName][monthKey] = 0;
		}

		// Add amount to the pivot data
		pivotData[groupName][categoryName][monthKey] += amount;
	});

	// Convert months set to sorted array with display names (most recent first)
	const months = Array.from(monthsSet)
		.sort((a, b) => b.localeCompare(a)) // Sort in descending order
		.map((monthKey) => {
			const [year, month] = monthKey.split('-');
			const date = new Date(parseInt(year), parseInt(month) - 1);
			return {
				key: monthKey,
				name: date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
			};
		});

	return {
		transactions,
		pivotData,
		months
	};
};
