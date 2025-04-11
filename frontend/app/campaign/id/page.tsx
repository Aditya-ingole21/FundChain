"use client"

import { useEffect, useState } from "react"

// Extend the Window interface to include the ethereum property
declare global {
  interface Window {
    ethereum?: any;
  }
}
import { useRouter } from "next/navigation"
import { ethers } from "ethers"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import ConnectWallet from "@/components/connect-wallet"
import FundCampaignForm from "@/components/fund-campaign-form"
import WithdrawFundsButton from "@/components/withdraw-funds-button"
import RefundButton from "@/components/refund-button"
import CompleteCampaignButton from "@/components/complete-campaign-button"
import CampaignDetailsSkeleton from "@/components/campaign-details-skeleton"
import { getContract } from "@/lib/contract"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  Calendar,
  CircleDollarSign,
  Clock,
  ExternalLink,
  Heart,
  Info,
  Share2,
  Target,
  User,
} from "lucide-react"
import Link from "next/link"

interface CampaignDetailsProps {
  params: {
    id: string;
  };
}

export default function CampaignDetails({ params }: CampaignDetailsProps) {
  const { id } = params
  interface Campaign {
    id: number;
    creator: string;
    name: string;
    description: string;
    target: string;
    targetWei: string;
    deadline: string;
    deadlineTimestamp: number;
    amountRaised: string;
    amountRaisedWei: string;
    amountWithdrawn: string;
    amountRefunded: string;
    completed: boolean;
    isExpired: boolean;
    progress: number;
    timeLeft: string;
  }

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [userContribution, setUserContribution] = useState("0")
  const [progressValue, setProgressValue] = useState(0)
  const [activeTab, setActiveTab] = useState("details")

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum)
          setProvider(provider)

          const accounts = await provider.listAccounts()
          if (accounts.length > 0) {
            setAccount(accounts[0].address)
          }

          await fetchCampaignDetails(provider, accounts.length > 0 ? accounts[0].address : null)
        } catch (error) {
          console.error("Error initializing:", error)
        }
      }
    }

    init()
  }, [id])

  useEffect(() => {
    if (campaign) {
      // Animate progress bar
      const timer = setTimeout(() => {
        setProgressValue(campaign.progress)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [campaign])

  const fetchCampaignDetails = async (provider: ethers.BrowserProvider, userAddress: string | null) => {
    try {
      setIsLoading(true)
      const contract = await getContract(provider)

      const campaignData = await contract.campaigns(id)

      // Format campaign data
      const formattedCampaign = {
        id: Number(id),
        creator: campaignData.CampaignCreator,
        name: campaignData.CampaignName,
        description: campaignData.CampaignDescription,
        target: ethers.formatEther(campaignData.CampaignTarget),
        targetWei: campaignData.CampaignTarget,
        deadline: new Date(Number(campaignData.CampaignDeadline) * 1000).toLocaleDateString(),
        deadlineTimestamp: Number(campaignData.CampaignDeadline),
        amountRaised: ethers.formatEther(campaignData.CampaignAmountRaised),
        amountRaisedWei: campaignData.CampaignAmountRaised,
        amountWithdrawn: ethers.formatEther(campaignData.CampaignAmountWithdrawn),
        amountRefunded: ethers.formatEther(campaignData.CampaignAmountRefunded),
        completed: campaignData.CampaignCompleted,
        isExpired: Number(campaignData.CampaignDeadline) < Math.floor(Date.now() / 1000),
        progress: (Number(campaignData.CampaignAmountRaised) / Number(campaignData.CampaignTarget)) * 100,
        timeLeft: calculateTimeLeft(Number(campaignData.CampaignDeadline)),
      }

      setCampaign(formattedCampaign)

      // Get user contribution if connected
      if (userAddress) {
        const contribution = await contract.contributions(userAddress)
        setUserContribution(ethers.formatEther(contribution))
      }
    } catch (error) {
      console.error("Error fetching campaign details:", error)
      toast({
        title: "Error",
        description: "Failed to load campaign details",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const calculateTimeLeft = (deadlineTimestamp: number) => {
    const now = Math.floor(Date.now() / 1000)
    if (now >= deadlineTimestamp) return "Ended"

    const secondsLeft = deadlineTimestamp - now
    const days = Math.floor(secondsLeft / 86400)
    const hours = Math.floor((secondsLeft % 86400) / 3600)

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} left`
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} left`
    return "Less than an hour left"
  }

  const handleAccountChange = async (newAccount: string) => {
    setAccount(newAccount)
    if (provider && newAccount) {
      await fetchCampaignDetails(provider, newAccount)
    }
  }

  const handleFundingSuccess = async () => {
    if (provider) {
      if (provider) {
        if (provider) {
          await fetchCampaignDetails(provider, account)
        }
      }
    }
  }

  const handleActionSuccess = async () => {
    if (provider) {
      await fetchCampaignDetails(provider, account)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `FundChain: ${campaign?.name}`,
          text: `Check out this campaign: ${campaign?.name}`,
          url: window.location.href,
        })
        .catch((err) => {
          console.error("Error sharing:", err)
        })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied",
        description: "Campaign link copied to clipboard",
      })
    }
  }

  if (isLoading) {
    return <CampaignDetailsSkeleton />
  }

  if (!campaign) {
    return (
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <Info className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Campaign not found</h2>
            <p className="text-muted-foreground mb-4">The campaign you're looking for doesn't exist</p>
            <Button onClick={() => router.push("/")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Card>
        </motion.div>
      </div>
    )
  }

  const isCreator = account && account.toLowerCase() === campaign.creator.toLowerCase()
  const canWithdraw = isCreator && campaign.isExpired && campaign.progress >= 100 && !campaign.completed
  const canComplete = isCreator && campaign.isExpired && campaign.progress >= 100 && !campaign.completed
  const canRefund = account && campaign.isExpired && campaign.progress < 100 && Number(userContribution) > 0

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/" className="inline-flex items-center text-sm mb-8 hover:text-primary transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to campaigns
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2">
          <Card className="overflow-hidden border shadow-md">
            <CardHeader className="pb-4">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {campaign.completed ? (
                  <Badge variant="success" className="animate-pulse">
                    Completed
                  </Badge>
                ) : campaign.isExpired ? (
                  campaign.progress >= 100 ? (
                    <Badge variant="success">Successful</Badge>
                  ) : (
                    <Badge variant="destructive">Ended</Badge>
                  )
                ) : (
                  <Badge variant="default" className="bg-primary">
                    Active
                  </Badge>
                )}

                {isCreator && (
                  <Badge variant="outline" className="ml-auto">
                    You created this
                  </Badge>
                )}
              </div>

              <CardTitle className="text-2xl">{campaign.name}</CardTitle>
              <CardDescription className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                Created by {campaign.creator.slice(0, 6)}...{campaign.creator.slice(-4)}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="details" className="gap-2">
                    <Info className="h-4 w-4" />
                    Details
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="gap-2">
                    <Clock className="h-4 w-4" />
                    Status & Timeline
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-6 mt-0">
                  <div>
                    <h3 className="font-medium mb-3">About this campaign</h3>
                    <p className="text-muted-foreground whitespace-pre-line">{campaign.description}</p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Target className="h-4 w-4 mr-1" />
                        Target
                      </div>
                      <p className="font-medium text-lg">{campaign.target} ETH</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-1" />
                        Deadline
                      </div>
                      <p className="font-medium">{campaign.deadline}</p>
                      {campaign.isExpired ? (
                        <span className="text-sm text-destructive">Campaign ended</span>
                      ) : (
                        <span className="text-sm text-green-600">{campaign.timeLeft}</span>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="space-y-6 mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Campaign Progress</h3>
                      <span className="text-sm font-medium">{campaign.progress.toFixed(2)}%</span>
                    </div>
                    <Progress value={progressValue} className="h-3" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{campaign.amountRaised} ETH raised</span>
                      <span>Goal: {campaign.target} ETH</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-medium">Campaign Status</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span>Created</span>
                        </div>
                        <span className="text-sm text-muted-foreground">Active</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-2 w-2 rounded-full ${campaign.progress >= 100 ? "bg-green-500" : campaign.isExpired ? "bg-red-500" : "bg-amber-500"}`}
                          ></div>
                          <span>Funding Goal</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {campaign.progress >= 100 ? "Reached" : campaign.isExpired ? "Not Reached" : "In Progress"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-2 w-2 rounded-full ${campaign.completed ? "bg-green-500" : "bg-gray-300"}`}
                          ></div>
                          <span>Completed</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{campaign.completed ? "Yes" : "No"}</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex items-center justify-between mt-6">
                <Button variant="outline" size="sm" className="gap-2" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
                <a
                  href={`https://etherscan.io/address/${campaign.creator}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
                >
                  View on Etherscan
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={account ? "connected" : "disconnected"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border shadow-md sticky top-4">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Campaign Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  {!account ? (
                    <div className="text-center py-6">
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="mb-4 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
                      >
                        <CircleDollarSign className="h-8 w-8 text-primary" />
                      </motion.div>
                      <p className="mb-4 text-muted-foreground">Connect your wallet to interact with this campaign</p>
                      <ConnectWallet
                        account={account}
                        onAccountChange={handleAccountChange}
                        buttonText="Connect Wallet"
                      />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {!campaign.isExpired && !campaign.completed && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2, duration: 0.5 }}
                        >
                          <FundCampaignForm
                            campaignId={campaign.id}
                            provider={provider}
                            account={account}
                            onSuccess={handleFundingSuccess}
                          />
                        </motion.div>
                      )}

                      {canWithdraw && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3, duration: 0.5 }}
                        >
                          <WithdrawFundsButton
                            campaignId={campaign.id}
                            provider={provider}
                            account={account}
                            contribution={campaign.amountRaisedWei}
                            onSuccess={handleActionSuccess}
                          />
                        </motion.div>
                      )}

                      {canComplete && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4, duration: 0.5 }}
                        >
                          <CompleteCampaignButton
                            campaignId={campaign.id}
                            provider={provider}
                            account={account}
                            onSuccess={handleActionSuccess}
                          />
                        </motion.div>
                      )}

                      {canRefund && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4, duration: 0.5 }}
                        >
                          <RefundButton
                            campaignId={campaign.id}
                            provider={provider}
                            account={account}
                            contribution={userContribution}
                            onSuccess={handleActionSuccess}
                          />
                        </motion.div>
                      )}

                      {Number(userContribution) > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5, duration: 0.5 }}
                          className="flex items-center gap-2 p-3 rounded-md bg-primary/10"
                        >
                          <Heart className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm font-medium">Your contribution</p>
                            <p className="text-lg font-bold">{userContribution} ETH</p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
