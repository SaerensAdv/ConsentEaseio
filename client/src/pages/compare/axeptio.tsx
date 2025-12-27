import ComparisonLayout from "@/components/ComparisonLayout";
import { getCompetitorBySlug } from "@/data/competitors";

export default function CompareAxeptio() {
  const competitor = getCompetitorBySlug("axeptio");
  if (!competitor) return null;
  return <ComparisonLayout competitor={competitor} />;
}
