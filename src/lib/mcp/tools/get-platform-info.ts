import { defineTool } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "get_platform_info",
  title: "Get platform info",
  description:
    "Return an overview of منصة الطالب العبقري: name, target stages (ابتدائي/متوسط), and main features.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const info = {
      name: "منصة الطالب العبقري",
      tagline: "المنصة التعليمية الشاملة للمرحلتين الابتدائية والمتوسطة",
      stages: ["ابتدائي", "متوسط"],
      features: [
        "شروحات وملخصات ذكية",
        "اختبارات تفاعلية وتصحيح فوري",
        "حل مسائل الكتاب بالكاميرا",
        "ألعاب العباقرة وتحديات شبكة خلايا النحل",
        "قاعة العباقرة وتتبع النقاط",
      ],
    };
    return {
      content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
      structuredContent: info,
    };
  },
});
