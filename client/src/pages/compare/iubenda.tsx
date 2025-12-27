import ComparisonLayout from "@/components/ComparisonLayout";
import { getCompetitorBySlug } from "@/data/competitors";

export default function CompareIubenda() {
  const competitor = getCompetitorBySlug("iubenda");
  if (!competitor) return null;
  return <ComparisonLayout competitor={competitor} />;
}
