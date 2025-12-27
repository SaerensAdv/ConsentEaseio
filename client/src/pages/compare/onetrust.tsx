import ComparisonLayout from "@/components/ComparisonLayout";
import { getCompetitorBySlug } from "@/data/competitors";

export default function CompareOneTrust() {
  const competitor = getCompetitorBySlug("onetrust");
  if (!competitor) return null;
  return <ComparisonLayout competitor={competitor} />;
}
