import type { PageServerLoad, Actions } from './$types';
import { supabase } from '../../lib/supabaseClient';
import type { QueryData } from '@supabase/supabase-js';
import { fail, redirect } from '@sveltejs/kit';
import { USER_ID } from '$env/static/private';

export const load: PageServerLoad = async () => {
	const wishlistQuery = supabase
		.from('wishlist')
		.select(
			`
			id,
			created_at,
            price,
            name,
            link,
            user_id
		`
		)
		.eq('user_id', USER_ID)
		.order('created_at', { ascending: false });

	const [wishlistResult] = await Promise.all([wishlistQuery]);

	type WishlistItem = QueryData<typeof wishlistQuery>[number];

	if (wishlistResult.error) {
		throw wishlistResult.error;
	}

	const wishlist: WishlistItem[] = wishlistResult.data || [];

	return {
		wishlist
	};
};

// Form Actions - These handle form submissions
export const actions: Actions = {
	// The 'create' action handles creating new wishlist items
	create: async ({ request }: { request: Request }) => {
		// Get form data from the request
		const formData = await request.formData();

		// Extract individual fields from FormData
		const name = formData.get('name') as string;
		const link = formData.get('link') as string;
		const price = formData.get('price') as string;

		// Basic validation
		if (!name) {
			return fail(400, {
				error: 'Name is required',
				name,
				link,
				price
			});
		}

		// Insert into Supabase
		const { data, error } = await supabase
			.from('wishlist')
			.insert([
				{
					name,
					link: link || null,
					price: price ? parseFloat(price) : null,
					user_id: USER_ID
				}
			])
			.select();

		console.error(error);

		// Handle database errors
		if (error) {
			return fail(500, {
				error: 'Failed to create wishlist item. Please try again.',
				name,
				link,
				price
			});
		}

		// Success! Return success with the created item
		return {
			success: true,
			wishlistItem: data && data.length > 0 ? data[0] : null
		};
	},

	delete: async ({ request }: { request: Request }) => {
		// Get form data from the request
		const formData = await request.formData();

		// Extract individual fields from FormData
		const id = formData.get('id');

		// Basic validation
		if (!id) {
			return fail(400, {
				error: 'Wishlist item ID is required',
				id
			});
		}

		// Delete from Supabase
		const { error } = await supabase.from('wishlist').delete().eq('id', id).eq('user_id', USER_ID);

		// Handle database errors
		if (error) {
			return fail(500, {
				error: 'Failed to delete wishlist item. Please try again.',
				id
			});
		}

		// Success! Return success
		return {
			success: true
		};
	}
};
