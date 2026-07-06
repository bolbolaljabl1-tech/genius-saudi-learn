import { defineMcp } from "@lovable.dev/mcp-js";
import getPlatformInfo from "./tools/get-platform-info";
import listSubscriptionPlans from "./tools/list-subscription-plans";

export default defineMcp({
  name: "genius-student-mcp",
  title: "منصة الطالب العبقري MCP",
  version: "0.1.0",
  instructions:
    "Tools for منصة الطالب العبقري, the Arabic learning platform for primary and middle school students. Use `get_platform_info` for a platform overview, and `list_subscription_plans` to fetch available plans and pricing in SAR.",
  tools: [getPlatformInfo, listSubscriptionPlans],
});
