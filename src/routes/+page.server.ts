import type { PageServerLoad } from './$types';
import { supabase } from '../lib/supabaseClient';

type Transaction = {
	id: number;
	date: string;
	description: string;
	amount: number;
	group_id: number;
	category_id: number;
};

export const load: PageServerLoad = async () => {
	const { data, error } = await supabase.from('transactions').select<'transactions', Transaction>();

	if (error) {
		console.error('Error loading transactions:', error.message);
		return { transactions: [] };
	}

	return {
		transactions: data ?? []
	};
};
