"use client"

import { useState } from "react"
import { ethers } from "ethers"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getContract } from "@/lib/contract"
import { useToast } from "@/hooks/use-toast"
import { CircleDollarSign, Loader2 } from "lucide-react"

export default function FundCampaignForm({ campaignId, provider, account, onSuccess }) {
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!amount || Number.parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to fund",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      const signer = await provider.getSigner()
      const contract = await getContract(signer)

      const amountInWei = ethers.parseEther(amount)

      const tx = await contract.fundCampaign(campaignId, {
        value: amountInWei,
      })

      toast({
        title: "Transaction submitted",
        description: "Your funding transaction has been submitted",
      })

      await tx.wait()

      toast({
        title: "Campaign funded",
        description: `You have successfully funded ${amount} ETH to this campaign`,
      })

      setAmount("")
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Error funding campaign:", error)
      toast({
        title: "Error funding campaign",
        description: error.message || "An error occurred while funding the campaign",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount" className="flex items-center gap-2">
          <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          Amount to Fund (ETH)
        </Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <motion.div whileTap={{ scale: 0.98 }}>
        <Button type="submit" className="w-full gap-2" disabled={isLoading || !account}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CircleDollarSign className="h-4 w-4" />
              Fund Campaign
            </>
          )}
        </Button>
      </motion.div>
    </form>
  )
}
