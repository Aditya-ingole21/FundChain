"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ethers } from "ethers"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ConnectWallet from "@/components/connect-wallet"
import { getContract } from "@/lib/contract"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Calendar, CircleDollarSign, FileText, Loader2, PenLine } from "lucide-react"
import Link from "next/link"

export default function CreateCampaign() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [target, setTarget] = useState("")
  const [deadline, setDeadline] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [account, setAccount] = useState(null)
  const [provider, setProvider] = useState(null)
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
        } catch (error) {
          console.error("Error initializing:", error)
        }
      }
    }

    init()
  }, [])

  const handleAccountChange = (newAccount) => {
    setAccount(newAccount)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!account) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create a campaign",
        variant: "destructive",
      })
      return
    }

    if (!name || !description || !target || !deadline) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const signer = await provider.getSigner()
      const contract = await getContract(signer)

      const targetInWei = ethers.parseEther(target)
      const deadlineInDays = Number.parseInt(deadline)

      const tx = await contract.createCampaign(name, description, targetInWei, deadlineInDays)

      toast({
        title: "Transaction submitted",
        description: "Your campaign creation transaction has been submitted",
      })

      await tx.wait()

      toast({
        title: "Campaign created",
        description: "Your campaign has been created successfully",
      })

      router.push("/")
    } catch (error) {
      console.error("Error creating campaign:", error)
      toast({
        title: "Error creating campaign",
        description: error.message || "An error occurred while creating the campaign",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const nextTab = () => {
    if (activeTab === "details") {
      if (!name || !description) {
        toast({
          title: "Missing information",
          description: "Please fill in all fields before proceeding",
          variant: "destructive",
        })
        return
      }
      setActiveTab("funding")
    }
  }

  const prevTab = () => {
    if (activeTab === "funding") {
      setActiveTab("details")
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Link href="/" className="inline-flex items-center text-sm mb-8 hover:text-primary transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to campaigns
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card className="max-w-2xl mx-auto border shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Create a Campaign</CardTitle>
            <CardDescription>Start a new crowdfunding campaign on FundChain</CardDescription>
          </CardHeader>

          {!account ? (
            <CardContent className="text-center py-10">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mb-6 mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10"
              >
                <CircleDollarSign className="h-10 w-10 text-primary" />
              </motion.div>
              <h3 className="text-xl font-medium mb-2">Connect Your Wallet</h3>
              <p className="mb-6 text-muted-foreground">You need to connect your wallet to create a campaign</p>
              <ConnectWallet account={account} onAccountChange={handleAccountChange} buttonText="Connect Wallet" />
            </CardContent>
          ) : (
            <>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-8">
                    <TabsTrigger value="details" className="gap-2">
                      <PenLine className="h-4 w-4" />
                      Campaign Details
                    </TabsTrigger>
                    <TabsTrigger value="funding" className="gap-2">
                      <CircleDollarSign className="h-4 w-4" />
                      Funding Goals
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4 mt-0">
                    <div className="space-y-2">
                      <Label htmlFor="name">Campaign Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter a catchy name for your campaign"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your campaign in detail. What are you raising funds for? Why should people support you?"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={6}
                        required
                        className="resize-none transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="pt-4 text-right">
                      <Button onClick={nextTab} className="gap-2">
                        Next Step
                        <ArrowLeft className="h-4 w-4 rotate-180" />
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="funding" className="space-y-4 mt-0">
                    <div className="space-y-2">
                      <Label htmlFor="target" className="flex items-center gap-2">
                        <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                        Funding Target (ETH)
                      </Label>
                      <Input
                        id="target"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        required
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      />
                      <p className="text-xs text-muted-foreground">Set the amount of ETH you need to raise</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deadline" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        Campaign Duration (days)
                      </Label>
                      <Input
                        id="deadline"
                        type="number"
                        min="1"
                        placeholder="30"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        required
                        className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                      />
                      <p className="text-xs text-muted-foreground">How many days will your campaign run for?</p>
                    </div>
                    <div className="pt-4 flex justify-between">
                      <Button variant="outline" onClick={prevTab} className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Previous Step
                      </Button>
                      <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          "Create Campaign"
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4 border-t bg-muted/50 px-6 py-4">
                <div className="flex items-start space-x-2 text-sm text-muted-foreground">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Your campaign will be publicly visible on the blockchain. Make sure all information is accurate.
                  </span>
                </div>
              </CardFooter>
            </>
          )}
        </Card>
      </motion.div>
    </div>
  )
}
