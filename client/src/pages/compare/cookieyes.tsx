import ComparisonLayout from "@/components/ComparisonLayout";
import { getCompetitorBySlug } from "@/data/competitors";

export default function CompareCookieYes() {
  const competitor = getCompetitorBySlug("cookieyes");
  if (!competitor) return null;
  return <ComparisonLayout competitor={competitor} />;
}
