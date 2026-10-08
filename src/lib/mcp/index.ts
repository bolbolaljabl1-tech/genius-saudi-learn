import { defineMcp, auth } from "@lovable.dev/mcp-js";
import getPlatformInfo from "./tools/get-platform-info";

// Require OAuth: only tokens issued by this project's auth server are accepted.
const SUPABASE_ISSUER = "https://kjubpaflsffnioixbfec.supabase.co/auth/v1";

export default defineMcp({
  name: "genius-student-mcp",
  title: "منصة الطالب العبقري MCP",
  version: "0.1.0",
  instructions:
    "Tools for منصة الطالب العبقري, the free Arabic learning platform for primary and middle school students. Use `get_platform_info` for a platform overview.",
  auth: auth.oauth.issuer({
    issuer: SUPABASE_ISSUER,
    acceptedAudiences: ["authenticated"],
    resourceName: "منصة الطالب العبقري MCP",
  }),
  tools: [getPlatformInfo],
});
