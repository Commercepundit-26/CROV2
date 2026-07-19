import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function IssueSummary({ issue }: { issue: any }) {
  const isHigh = issue.severity === 'high';
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg text-[#0A66C2]">{issue.ai?.title || issue.title}</CardTitle>
          <Badge variant={isHigh ? "destructive" : "secondary"}>
            {(issue.severity || 'medium').toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-2">{issue.ai?.description || issue.description}</p>
        <div className="bg-gray-50 p-3 rounded-md border mt-3 text-sm">
          <strong>Recommendation:</strong> {issue.ai?.recommendation || "Needs review."}
        </div>
      </CardContent>
    </Card>
  );
}
