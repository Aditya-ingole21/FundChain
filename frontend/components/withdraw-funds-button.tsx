"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { getContract } from "@/lib/contract"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, ArrowLeftRight, Loader2 } from "lucide-react"

export default function RefundButton({ campaignId, provider, account, contribution, onSuccess }: { campaignId: string; provider: any; account: string; contribution: number; onSuccess?: () => void }) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleRefund = async () => {
    try {
      setIsLoading(true)
      const signer = await provider.getSigner()
      const contract = await getContract(signer)

      const tx = await contract.refund(campaignId)

      toast({
        title: "Transaction submitted",
        description: "Your refund transaction has been submitted",
      })

      await tx.wait()

      toast({
        title: "Refund processed",
        description: "You have successfully received a refund from this campaign",
      })

      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Error processing refund:", error)
      toast({
        title: "Error processing refund",
        description: error instanceof Error ? error.message : "An error occurred while processing your refund",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2 p-3 rounded-md bg-amber-50 text-amber-700">
        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
        <p className="text-sm">
          Campaign ended without reaching its target. You can request a refund of your contribution ({contribution}{" "}
          ETH).
        </p>
      </div>
      <motion.div whileTap={{ scale: 0.98 }}>
        <Button onClick={handleRefund} className="w-full gap-2" variant="outline" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <ArrowLeftRight className="h-4 w-4" />
              Request Refund
            </>
          )}
        </Button>
      </motion.div>
    </div>
  )
}
