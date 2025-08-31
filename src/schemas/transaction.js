const { z } = require('zod');


const transactionSchema = z.object({
transactionId: z.string().min(1),
amount: z.number().finite().positive(),
currency: z.string().length(3),
timestamp: z.string().datetime(),
posId: z.string().min(1),
method: z.enum(['CARD', 'CASH', 'UPI']),
cardLast4: z.string().regex(/^\d{4}$/).optional(),
location: z
.object({ lat: z.number().min(-90).max(90), lon: z.number().min(-180).max(180) })
.optional(),
metadata: z.record(z.any()).optional()
}).superRefine((data, ctx) => {
if (data.method === 'CARD' && !data.cardLast4) {
ctx.addIssue({
code: z.ZodIssueCode.custom,
message: 'cardLast4 is required when method=CARD'
});
}
});


module.exports = { transactionSchema };