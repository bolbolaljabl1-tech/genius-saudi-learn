import { defineTool } from "@lovable.dev/mcp-js";
import { PLAN_PRICES } from "@/lib/payment-config";

export default defineTool({
  name: "list_subscription_plans",
  title: "List subscription plans",
  description:
    "Return the available subscription plans for منصة الطالب العبقري with price in SAR and duration.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const plans = Object.entries(PLAN_PRICES).map(([id, p]) => ({
      id,
      label: p.label,
      price_sar: p.price,
      period: p.period,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(plans, null, 2) }],
      structuredContent: { plans },
    };
  },
});
