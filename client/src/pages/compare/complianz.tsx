import ComparisonLayout from "@/components/ComparisonLayout";
import { getCompetitorBySlug } from "@/data/competitors";

export default function CompareComplianz() {
  const competitor = getCompetitorBySlug("complianz");
  if (!competitor) return null;
  return <ComparisonLayout competitor={competitor} />;
}
