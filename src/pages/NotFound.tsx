import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const PAGE_TITLE = "الصفحة غير موجودة | منصة الطالب العبقري";
const PAGE_DESC =
  "الصفحة التي تبحث عنها غير متوفرة على منصة الطالب العبقري. عُد إلى الصفحة الرئيسية لمتابعة الدروس والتحديات.";

const setMeta = (selector: string, attr: string, value: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    const [, key, name] = selector.match(/\[(\w+)="([^"]+)"\]/) || [];
    if (key && name) el.setAttribute(key, name);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
};

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    const prevTitle = document.title;
    document.title = PAGE_TITLE;
    setMeta('meta[name="description"]', "content", PAGE_DESC);
    setMeta('meta[property="og:title"]', "content", PAGE_TITLE);
    setMeta('meta[property="og:description"]', "content", PAGE_DESC);
    setMeta('meta[name="twitter:title"]', "content", PAGE_TITLE);
    setMeta('meta[name="twitter:description"]', "content", PAGE_DESC);
    return () => {
      document.title = prevTitle;
    };
  }, [location.pathname]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-foreground">عذراً، الصفحة غير موجودة</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          العودة إلى الصفحة الرئيسية
        </a>
      </div>
    </main>
  );
};

export default NotFound;
