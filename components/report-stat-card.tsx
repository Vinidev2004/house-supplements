import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface ReportStatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function ReportStatCard({ title, value, icon: Icon, trend, className }: ReportStatCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="mt-1 text-xl font-bold md:text-2xl">{value}</p>
            {trend && (
              <p className={`mt-1 text-xs ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
                {trend.isPositive ? "+" : ""}
                {trend.value}% vs período anterior
              </p>
            )}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 md:h-12 md:w-12">
            <Icon className="h-5 w-5 text-primary md:h-6 md:w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
