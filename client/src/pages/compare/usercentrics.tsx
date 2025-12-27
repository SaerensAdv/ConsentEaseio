import ComparisonLayout from "@/components/ComparisonLayout";
import { getCompetitorBySlug } from "@/data/competitors";

export default function CompareUsercentrics() {
  const competitor = getCompetitorBySlug("usercentrics");
  if (!competitor) return null;
  return <ComparisonLayout competitor={competitor} />;
}
