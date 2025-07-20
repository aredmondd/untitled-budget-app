export type Group = {
	id: number;
	name: string;
};

export type Category = {
	id: number;
	group_id: number;
	name: string;
};

export type Card = {
	id: number;
	name: string;
};

export type TransactionWithRelations = {
	id: number;
	date: string;
	description: string;
	amount: number;
	group_id: Group | null;
	category_id: Category | null;
	card_id: Card | null;
};
