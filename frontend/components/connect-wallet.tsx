"use client"

import { useState } from "react"
import { ethers } from "ethers"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Wallet } from "lucide-react"

interface ConnectWalletProps {
  account: string | null;
  onAccountChange: (address: string | null) => void;
  buttonText?: string;
  size?: "default" | "sm" | "lg";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export default function ConnectWallet({
  account,
  onAccountChange,
  buttonText = "Connect Wallet",
  size = "default",
  variant = "default",
}: ConnectWalletProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const { toast } = useToast()

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast({
        title: "Wallet not found",
        description: "Please install MetaMask or another Ethereum wallet",
        variant: "destructive",
      })
      return
    }

    try {
      setIsConnecting(true)
      const provider = new ethers.BrowserProvider(window.ethereum)
      await provider.send("eth_requestAccounts", [])

      const accounts = await provider.listAccounts()
      if (accounts.length > 0) {
        onAccountChange(accounts[0].address)

        toast({
          title: "Wallet connected",
          description: "Your wallet has been connected successfully",
        })
      }
    } catch (error) {
      console.error("Error connecting wallet:", error)
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    onAccountChange(null)
    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected",
    })
  }

  if (account) {
    return (
      <Button variant="outline" size={size} onClick={disconnectWallet} className="gap-2 group">
        <div className="h-2 w-2 rounded-full bg-green-500 group-hover:bg-red-500 transition-colors"></div>
        {account.slice(0, 6)}...{account.slice(-4)}
      </Button>
    )
  }

  return (
    <motion.div whileTap={{ scale: 0.98 }}>
      <Button onClick={connectWallet} disabled={isConnecting} size={size} variant={variant} className="gap-2">
        {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
        {isConnecting ? "Connecting..." : buttonText}
      </Button>
    </motion.div>
  )
}
