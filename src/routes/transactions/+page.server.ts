import type { PageServerLoad } from '../$types';
import { supabase } from '../../lib/supabaseClient';
import type { QueryData } from '@supabase/supabase-js';

export const load: PageServerLoad = async () => {
	const transactionsQuery = supabase.from('transactions').select(`
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
    `);

	const groupsQuery = supabase.from('groups').select(`
        id,
        name
    `);

	const categoriesQuery = supabase.from('categories').select(`
        id,
        group_id,
        name
    `);

	const [transactionsResult, groupsResult, categoriesResult] = await Promise.all([
		transactionsQuery,
		groupsQuery,
		categoriesQuery
	]);

	type Transaction = QueryData<typeof transactionsQuery>[number];
	type Group = QueryData<typeof groupsQuery>[number];
	type Category = QueryData<typeof categoriesQuery>[number];

	if (transactionsResult.error) {
		console.error('Transactions error:', transactionsResult.error);
		throw transactionsResult.error;
	}

	if (groupsResult.error) {
		console.error('Groups error:', groupsResult.error);
		throw groupsResult.error;
	}

	if (categoriesResult.error) {
		console.error('Categories error:', categoriesResult.error);
		throw categoriesResult.error;
	}

	const transactions: Transaction[] = transactionsResult.data || [];
	const groups: Group[] = groupsResult.data || [];
	const categories: Category[] = categoriesResult.data || [];

	return {
		transactions,
		groups,
		categories
	};
};
