import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function CampaignDetailsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-6 w-32 mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Skeleton className="h-5 w-20" />
              </div>

              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>

            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-4 mb-6">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>

                <div>
                  <Skeleton className="h-5 w-32 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>

                <Skeleton className="h-px w-full" />

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between mb-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>

              <div className="flex items-center justify-between mt-6">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader className="pb-4">
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="py-8 flex flex-col items-center justify-center">
                <Skeleton className="h-16 w-16 rounded-full mb-4" />
                <Skeleton className="h-5 w-48 mb-2" />
                <Skeleton className="h-4 w-64 mb-6" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
