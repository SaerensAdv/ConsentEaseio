import ComparisonLayout from "@/components/ComparisonLayout";
import { getCompetitorBySlug } from "@/data/competitors";

export default function CompareCookieScript() {
  const competitor = getCompetitorBySlug("cookie-script");
  if (!competitor) return null;
  return <ComparisonLayout competitor={competitor} />;
}
