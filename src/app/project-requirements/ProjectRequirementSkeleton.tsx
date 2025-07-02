import { Card } from "@/components/ui/card";

export const ProjectRequirementSkeleton = () => {
    return (
        <Card className="p-4">
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        <div className="h-6 w-12 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-6 w-12 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-6 w-12 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>
            </div>
        </Card>
    );
}; 