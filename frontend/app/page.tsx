"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ethers } from "ethers"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import CampaignCard from "@/components/campaign-card"
import ConnectWallet from "@/components/connect-wallet"
import CampaignSkeleton from "@/components/campaign-skeleton"
import { getContract } from "@/lib/contract"
import { ArrowRight, Plus, Sparkles } from "lucide-react"

interface Campaign {
  id: string
  creator: string
  name: string
  description: string
  target: string
  deadline: string
  amountRaised: string
  completed: boolean
  rawDeadline: number
}

export default function Home() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)

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

          await fetchCampaigns(provider)
        } catch (error) {
          console.error("Error initializing:", error)
        }
      }
    }

    init()
  }, [])

  const fetchCampaigns = async (provider: ethers.BrowserProvider) => {
    try {
      setIsLoading(true)
      const contract = await getContract(provider)
      const campaignCount = await contract.campaignCount()

      const campaignsData = []
      for (let i = 1; i <= campaignCount; i++) {
        const campaign = await contract.campaigns(i)
        campaignsData.push({
          id: i.toString(),
          creator: campaign.CampaignCreator,
          name: campaign.CampaignName,
          description: campaign.CampaignDescription,
          target: ethers.formatEther(campaign.CampaignTarget),
          deadline: new Date(Number(campaign.CampaignDeadline) * 1000).toLocaleDateString(),
          amountRaised: ethers.formatEther(campaign.CampaignAmountRaised),
          completed: campaign.CampaignCompleted,
          rawDeadline: Number(campaign.CampaignDeadline),
        })
      }

      setCampaigns(campaignsData)
    } catch (error) {
      console.error("Error fetching campaigns:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccountChange = (newAccount: string | null) => {
    setAccount(newAccount)
    if (provider) {
      fetchCampaigns(provider)
    }
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary/5 py-20">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.6),transparent)]"></div>
        <div className="container relative mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-4 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
            >
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              Decentralized Crowdfunding
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl"
            >
              Fund<span className="text-primary">Chain</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mb-8 text-lg text-muted-foreground"
            >
              Transparent, secure, and decentralized crowdfunding platform powered by blockchain technology.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              {account ? (
                <Link href="/create">
                  <Button size="lg" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Campaign
                  </Button>
                </Link>
              ) : (
                <ConnectWallet
                  account={account}
                  onAccountChange={handleAccountChange}
                  buttonText="Connect Wallet to Start"
                  size="lg"
                />
              )}
              <Button variant="outline" size="lg" asChild>
                <Link href="#campaigns" className="gap-2">
                  Explore Campaigns
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Animated background elements */}
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/20 blur-3xl"></div>
      </section>

      {/* Campaigns Section */}
      <section id="campaigns" className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Active Campaigns</h2>
            <p className="text-muted-foreground mt-1">Discover and support innovative projects</p>
          </div>
          <div className="flex items-center gap-4">
            <ConnectWallet account={account} onAccountChange={handleAccountChange} />
            {account && (
              <Link href="/create">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Campaign
                </Button>
              </Link>
            )}
          </div>
        </div>

        {isLoading ? (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[...Array(6)].map((_, index) => (
              <CampaignSkeleton key={index} />
            ))}
          </motion.div>
        ) : campaigns.length > 0 ? (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} account={account} />
            ))}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="p-8 text-center border-dashed">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No campaigns found</h2>
              <p className="text-muted-foreground mb-6">Be the first to create a crowdfunding campaign!</p>
              {account ? (
                <Link href="/create">
                  <Button>Create Campaign</Button>
                </Link>
              ) : (
                <ConnectWallet
                  account={account}
                  onAccountChange={handleAccountChange}
                  buttonText="Connect Wallet to Create Campaign"
                />
              )}
            </Card>
          </motion.div>
        )}
      </section>
    </div>
  )
}
