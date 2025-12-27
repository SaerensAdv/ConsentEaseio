import ComparisonLayout from "@/components/ComparisonLayout";
import { getCompetitorBySlug } from "@/data/competitors";

export default function CompareCookiebot() {
  const competitor = getCompetitorBySlug("cookiebot");
  if (!competitor) return null;
  return <ComparisonLayout competitor={competitor} />;
}
