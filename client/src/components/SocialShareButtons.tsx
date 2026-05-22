import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Share2, Copy, Check } from "lucide-react";
import { SiFacebook, SiX, SiPinterest, SiLinkedin, SiWhatsapp } from "react-icons/si";
import { useState } from "react";

interface SocialShareButtonsProps {
  url?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  compact?: boolean;
}

export function SocialShareButtons({ 
  url, 
  title, 
  description = "", 
  imageUrl,
  compact = false
}: SocialShareButtonsProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}${imageUrl ? `&media=${encodeURIComponent(imageUrl)}` : ""}`,
    linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    if (typeof window === "undefined") return;
    
    const width = 600;
    const height = 400;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    
    window.open(
      shareLinks[platform],
      "share",
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  };

  const handleCopy = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      toast({
        title: "Copy unavailable",
        description: "Clipboard access not available. Please copy the URL manually.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copied",
        description: "Product link has been copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Copy failed",
        description: "Could not copy link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: shareUrl,
        });
      } catch {
      }
    }
  };

  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" data-testid="button-share">
            <Share2 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => handleShare("facebook")} className="gap-2 cursor-pointer">
            <SiFacebook className="h-4 w-4 text-blue-600" />
            Facebook
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare("twitter")} className="gap-2 cursor-pointer">
            <SiX className="h-4 w-4" />
            X (Twitter)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare("pinterest")} className="gap-2 cursor-pointer">
            <SiPinterest className="h-4 w-4 text-red-600" />
            Pinterest
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare("linkedin")} className="gap-2 cursor-pointer">
            <SiLinkedin className="h-4 w-4 text-blue-700" />
            LinkedIn
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleShare("whatsapp")} className="gap-2 cursor-pointer">
            <SiWhatsapp className="h-4 w-4 text-green-600" />
            WhatsApp
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopy} className="gap-2 cursor-pointer">
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy Link"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Share2 className="h-4 w-4" />
        <span>Share this product</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => handleShare("facebook")}
          data-testid="button-share-facebook"
        >
          <SiFacebook className="h-4 w-4 text-blue-600" />
          Facebook
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => handleShare("twitter")}
          data-testid="button-share-twitter"
        >
          <SiX className="h-4 w-4" />
          X
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => handleShare("pinterest")}
          data-testid="button-share-pinterest"
        >
          <SiPinterest className="h-4 w-4 text-red-600" />
          Pinterest
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => handleShare("whatsapp")}
          data-testid="button-share-whatsapp"
        >
          <SiWhatsapp className="h-4 w-4 text-green-600" />
          WhatsApp
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleCopy}
          data-testid="button-copy-link"
        >
          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy"}
        </Button>
        {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleNativeShare}
            data-testid="button-native-share"
          >
            <Share2 className="h-4 w-4" />
            More
          </Button>
        )}
      </div>
    </div>
  );
}
