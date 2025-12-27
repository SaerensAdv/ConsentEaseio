import ComparisonLayout from "@/components/ComparisonLayout";
import { getCompetitorBySlug } from "@/data/competitors";

export default function CompareCookieFirst() {
  const competitor = getCompetitorBySlug("cookiefirst");
  if (!competitor) return null;
  return <ComparisonLayout competitor={competitor} />;
}
