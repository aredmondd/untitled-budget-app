import type { PageServerLoad, Actions } from '../$types';
import { supabase } from '../../lib/supabaseClient';
import type { QueryData } from '@supabase/supabase-js';
import { fail, redirect } from '@sveltejs/kit';
import { USER_ID } from '$env/static/private';

export const load: PageServerLoad = async () => {
	const transactionsQuery = supabase
		.from('transactions')
		.select(
			`
		id,
		date,
		amount,
		description,
		group_id (
			id,
			name
		),
		category_id (
			id,
			group_id,
			name
		),
		card_id (
			id,
			name
		)
	`
		)
		.eq('user_id', USER_ID)
		.order('date', { ascending: false });

	const groupsQuery = supabase.from('groups').select(`
		id,
		name
	`);

	const categoriesQuery = supabase.from('categories').select(`
		id,
		group_id,
		name
	`);

	const cardQuery = supabase.from('cards').select(`
		id,
		name
	`);

	const [transactionsResult, groupsResult, categoriesResult, cardResult] = await Promise.all([
		transactionsQuery,
		groupsQuery,
		categoriesQuery,
		cardQuery
	]);

	type Transaction = QueryData<typeof transactionsQuery>[number];
	type Group = QueryData<typeof groupsQuery>[number];
	type Category = QueryData<typeof categoriesQuery>[number];
	type Card = QueryData<typeof cardQuery>[number];

	if (transactionsResult.error) {
		throw transactionsResult.error;
	}

	if (groupsResult.error) {
		throw groupsResult.error;
	}

	if (categoriesResult.error) {
		throw categoriesResult.error;
	}

	if (cardResult.error) {
		throw cardResult.error;
	}

	const transactions: Transaction[] = transactionsResult.data || [];
	const groups: Group[] = groupsResult.data || [];
	const categories: Category[] = categoriesResult.data || [];
	const cards: Card[] = cardResult.data || [];

	return {
		transactions,
		groups,
		categories,
		cards
	};
};

// Form Actions - These handle form submissions
export const actions: Actions = {
	// The 'create' action handles creating new transactions
	create: async ({ request }) => {
		// Get form data from the request
		const formData = await request.formData();

		// Extract individual fields from FormData
		const date = formData.get('date') as string;
		const description = formData.get('description') as string;
		const groupId = formData.get('groupId');
		const categoryId = formData.get('categoryId');
		const amount = formData.get('amount') as string;
		const cardId = formData.get('cardId');

		// Basic validation
		if (!date || !description || !amount || !groupId || !categoryId) {
			return fail(400, {
				error: 'Date, description, amount, group, and category are required',
				date,
				description,
				amount,
				groupId,
				categoryId,
				cardId
			});
		}

		// Convert amount to number and validate
		const amountNumber = parseFloat(amount);
		if (isNaN(amountNumber)) {
			return fail(400, {
				error: 'Amount must be a valid number',
				date,
				description,
				amount,
				groupId,
				categoryId,
				cardId
			});
		}

		// Convert string 'null' back to actual null for database (only for optional fields)
		// group_id and category_id are required, so we don't convert them to null
		const processedCardId = cardId === 'null' ? null : cardId;

		// Insert into Supabase
		const { data, error } = await supabase
			.from('transactions')
			.insert([
				{
					date,
					description,
					amount: amountNumber,
					group_id: groupId,
					category_id: categoryId,
					card_id: processedCardId,
					user_id: USER_ID
				}
			])
			.select();

		// Handle database errors
		if (error) {
			return fail(500, {
				error: 'Failed to create transaction. Please try again.',
				date,
				description,
				amount,
				groupId,
				categoryId,
				cardId
			});
		}

		// Success! Return the created transaction

		// You can either redirect or return success
		// For now, we'll return success data
		return {
			success: true,
			transaction: data[0]
		};
	},

	delete: async ({ request }) => {
		// Get form data from the request
		const formData = await request.formData();

		// Extract individual fields from FormData
		const id = formData.get('id');

		// Basic validation
		if (!id) {
			return fail(400, {
				error: 'Transaction ID is required',
				id
			});
		}

		// Delete from Supabase
		const { error } = await supabase
			.from('transactions')
			.delete()
			.eq('id', id)
			.eq('user_id', USER_ID);

		// Handle database errors
		if (error) {
			return fail(500, {
				error: 'Failed to delete transaction. Please try again.',
				id
			});
		}

		// Success! Return success
		return {
			success: true
		};
	}
};
