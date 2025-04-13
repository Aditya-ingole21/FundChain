"use client"

interface Campaign {
  id: string
  name: string
  description: string
  creator: string
  target: string
  amountRaised: string
  rawDeadline: number
  completed: boolean
}

import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CircleDollarSign, Clock, User } from "lucide-react"

interface CampaignCardProps {
  campaign: Campaign
  account: string | null // Updated to accept null
}

export default function CampaignCard({ campaign, account }: CampaignCardProps) {
  const progress = (Number.parseFloat(campaign.amountRaised) / Number.parseFloat(campaign.target)) * 100
  const isExpired = campaign.rawDeadline < Math.floor(Date.now() / 1000)
  const isCreator = account ? account.toLowerCase() === campaign.creator.toLowerCase() : false

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <motion.div variants={item}>
      <Card className="overflow-hidden h-full border transition-all duration-200 hover:shadow-md hover:border-primary/20 group">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center text-xs text-muted-foreground">
              <User className="h-3 w-3 mr-1" />
              <span className="truncate">
                {campaign.creator.slice(0, 6)}...{campaign.creator.slice(-4)}
                {isCreator && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    You
                  </Badge>
                )}
              </span>
            </div>
            {campaign.completed ? (
              <Badge variant="success" className="text-xs">
                Completed
              </Badge>
            ) : isExpired ? (
              progress >= 100 ? (
                <Badge variant="success" className="text-xs">
                  Successful
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-xs">
                  Ended
                </Badge>
              )
            ) : (
              <Badge variant="default" className="bg-primary text-xs">
                Active
              </Badge>
            )}
          </div>
          <CardTitle className="truncate group-hover:text-primary transition-colors">{campaign.name}</CardTitle>
          <CardDescription className="truncate">{campaign.description.split("\n")[0]}</CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center">
                <CircleDollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                <span>{campaign.target} ETH</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                <span>{isExpired ? "Ended" : "Active"}</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-muted-foreground">{campaign.amountRaised} ETH raised</span>
                <span className="text-xs font-medium">{progress.toFixed(1)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {campaign.completed && (
              <div className="bg-green-50 text-green-700 text-xs p-2 rounded">Campaign completed successfully!</div>
            )}

            {isExpired && !campaign.completed && (
              <div className="text-xs text-muted-foreground">
                Campaign ended {progress >= 100 ? "successfully" : "without reaching target"}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Link href={`/campaign/${campaign.id}`} className="w-full">
            <Button variant="outline" className="w-full group-hover:bg-primary/10 transition-colors">
              View Campaign
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  )
}