import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";
import { todoSelectSchema } from "@/db/zod-schemas";

const VITE_PORT = import.meta.env.VITE_PORT ?? "5173";
const SSR_ORIGIN =
	typeof window !== "undefined"
		? window.location.origin
		: `http://localhost:${VITE_PORT}`;

async function callMutationApi(
	url: string,
	options: RequestInit,
): Promise<number> {
	const res = await fetch(url, options);
	if (!res.ok) {
		const text = await res.text().catch(() => res.statusText);
		throw new Error(`Mutation failed (${res.status}): ${text}`);
	}
	const data = await res.json();
	return data.txid;
}

export const todosCollection = createCollection(
	electricCollectionOptions({
		id: "todos",
		schema: todoSelectSchema,
		getKey: (row) => row.id,
		shapeOptions: {
			url: new URL("/api/todos", SSR_ORIGIN).toString(),
			parser: {
				timestamptz: (date: string) => new Date(date),
			},
		},
		onInsert: async ({ transaction }) => {
			const { modified: newTodo } = transaction.mutations[0];
			const txid = await callMutationApi("/api/mutations/todos", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(newTodo),
			});
			return { txid };
		},
		onUpdate: async ({ transaction }) => {
			const { modified: updated } = transaction.mutations[0];
			const txid = await callMutationApi(`/api/mutations/todos/${updated.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(updated),
			});
			return { txid };
		},
		onDelete: async ({ transaction }) => {
			const { original: deleted } = transaction.mutations[0];
			const txid = await callMutationApi(`/api/mutations/todos/${deleted.id}`, {
				method: "DELETE",
			});
			return { txid };
		},
	}),
);
