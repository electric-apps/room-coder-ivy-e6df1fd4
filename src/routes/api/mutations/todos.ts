import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/db";
import { todos } from "@/db/schema";
import { generateTxId, parseDates } from "@/db/utils";
import { todoInsertSchema } from "@/db/zod-schemas";

export const Route = createFileRoute("/api/mutations/todos")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const raw = parseDates(await request.json());
				const parsed = todoInsertSchema.safeParse(raw);
				if (!parsed.success) {
					return Response.json(
						{ error: "Invalid input", issues: parsed.error.issues },
						{ status: 400 },
					);
				}
				const body = parsed.data;
				let txid = 0;
				await db.transaction(async (tx) => {
					await tx.insert(todos).values({
						id: body.id,
						title: body.title,
						completed: body.completed ?? false,
						created_at: body.created_at,
						updated_at: body.updated_at,
					});
					txid = await generateTxId(tx);
				});
				return Response.json({ txid });
			},
		},
	},
});
