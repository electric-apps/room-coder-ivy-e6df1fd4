import { createFileRoute } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { todos } from "@/db/schema";
import { generateTxId, parseDates } from "@/db/utils";
import { todoInsertSchema } from "@/db/zod-schemas";

const todoUpdateSchema = todoInsertSchema
	.pick({ title: true, completed: true })
	.partial();

export const Route = createFileRoute("/api/mutations/todos/$id")({
	server: {
		handlers: {
			PATCH: async ({ request, params }) => {
				const raw = parseDates(await request.json());
				const parsed = todoUpdateSchema.safeParse(raw);
				if (!parsed.success) {
					return Response.json(
						{ error: "Invalid input", issues: parsed.error.issues },
						{ status: 400 },
					);
				}
				const body = parsed.data;
				let txid = 0;
				await db.transaction(async (tx) => {
					await tx
						.update(todos)
						.set({
							...body,
							updated_at: new Date(),
						})
						.where(eq(todos.id, params.id));
					txid = await generateTxId(tx);
				});
				return Response.json({ txid });
			},
			DELETE: async ({ params }) => {
				let txid = 0;
				await db.transaction(async (tx) => {
					await tx.delete(todos).where(eq(todos.id, params.id));
					txid = await generateTxId(tx);
				});
				return Response.json({ txid });
			},
		},
	},
});
