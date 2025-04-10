"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { getContract } from "@/lib/contract"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, Loader2 } from "lucide-react"

export default function CompleteCampaignButton({ campaignId, provider, account, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleComplete = async () => {
    try {
      setIsLoading(true)
      const signer = await provider.getSigner()
      const contract = await getContract(signer)

      const tx = await contract.completeCampaign(campaignId)

      toast({
        title: "Transaction submitted",
        description: "Your completion transaction has been submitted",
      })

      await tx.wait()

      toast({
        title: "Campaign completed",
        description: "You have successfully marked this campaign as completed",
      })

      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Error completing campaign:", error)
      toast({
        title: "Error completing campaign",
        description: error.message || "An error occurred while completing the campaign",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">Mark this campaign as completed after withdrawing funds.</p>
      <motion.div whileTap={{ scale: 0.98 }}>
        <Button onClick={handleComplete} className="w-full gap-2" variant="outline" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              Complete Campaign
            </>
          )}
        </Button>
      </motion.div>
    </div>
  )
}
