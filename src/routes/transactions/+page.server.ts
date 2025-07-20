import type { PageServerLoad } from '../$types';
import { supabase } from '../../lib/supabaseClient';
import type { QueryData } from '@supabase/supabase-js';

export const load: PageServerLoad = async () => {
	const transactionsWithCategoriesQuery = supabase.from('transactions').select(`
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

	type TransactionWithRelations = QueryData<typeof transactionsWithCategoriesQuery>[number];

	const { data, error } = await transactionsWithCategoriesQuery;

	if (error) {
		console.error(error);
		throw error;
	}

	const transactions: TransactionWithRelations[] = data || [];

	return {
		transactions
	};
};
