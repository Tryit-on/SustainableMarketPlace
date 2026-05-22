import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Users, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { Challenge } from "@shared/schema";

const ARTICLES = [
  {
    slug: "what-does-plastic-free-mean",
    title: "What Does 'Plastic-Free' Actually Mean?",
    description: "Not all plastic-free claims are equal. We break down which certifications verify the claim and what to watch for.",
    readMinutes: 5,
    category: "Certifications",
  },
  {
    slug: "how-sustainability-scores-work",
    title: "How GreenMart Sustainability Scores Work",
    description: "Every product on GreenMart has a score computed from six verified dimensions. Here's the full methodology.",
    readMinutes: 6,
    category: "Transparency",
  },
  {
    slug: "carbon-footprint-home-personal-care",
    title: "The Carbon Footprint of Your Bathroom Cabinet",
    description: "A typical household's personal care products produce 45–90 kg CO₂e/year. See where the emissions come from.",
    readMinutes: 8,
    category: "Carbon",
  },
  {
    slug: "zero-waste-beginner-guide",
    title: "Zero-Waste at Home: A Practical Starting Point",
    description: "You don't need to replace everything at once. Start with the five highest-impact swaps in your home.",
    readMinutes: 7,
    category: "Beginner Guide",
  },
  {
    slug: "greenwashing-red-flags",
    title: "Seven Greenwashing Red Flags to Spot Immediately",
    description: "Vague language like 'eco-friendly' and 'sustainable' means nothing without proof. Here's what to look for instead.",
    readMinutes: 5,
    category: "Consumer Education",
  },
  {
    slug: "compostable-vs-biodegradable",
    title: "Compostable vs Biodegradable: Not the Same Thing",
    description: "'Biodegradable' has no regulatory definition in the UK. 'Compostable' does. Here's why the difference matters.",
    readMinutes: 4,
    category: "Certifications",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Certifications: "bg-blue-100 text-blue-700",
  Transparency: "bg-purple-100 text-purple-700",
  Carbon: "bg-amber-100 text-amber-700",
  "Beginner Guide": "bg-green-100 text-green-700",
  "Consumer Education": "bg-red-100 text-red-700",
};

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const join = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/challenges/${challenge.id}/join`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to join");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/challenges"] });
      toast({ title: `Joined "${challenge.title}"` });
    },
    onError: () => toast({ title: "Could not join challenge", variant: "destructive" }),
  });

  const isParticipant = (challenge as any).isParticipant;
  const participantCount = (challenge as any).participantCount ?? 0;
  const endDate = challenge.endDate ? new Date(challenge.endDate) : null;
  const daysLeft = endDate ? Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <Card className="h-full">
      <CardContent className="p-5 flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold">{challenge.title}</h3>
          {daysLeft !== null && (
            <Badge variant="outline" className="text-xs flex-shrink-0 ml-2">
              <Clock className="h-3 w-3 mr-1" />
              {daysLeft > 0 ? `${daysLeft}d left` : "Ended"}
            </Badge>
          )}
        </div>

        {challenge.description && (
          <p className="text-sm text-muted-foreground mb-4 flex-1">{challenge.description}</p>
        )}

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            {participantCount} participants
          </div>
          {!isParticipant ? (
            <Button
              size="sm"
              disabled={!user || join.isPending || (daysLeft !== null && daysLeft <= 0)}
              onClick={() => join.mutate()}
            >
              {join.isPending ? "Joining..." : "Join challenge"}
            </Button>
          ) : (
            <div className="flex items-center gap-1 text-sm text-emerald-600 font-medium">
              <CheckCircle2 className="h-4 w-4" /> Joined
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Learn() {
  const { data: challenges } = useQuery<Challenge[]>({
    queryKey: ["/api/challenges"],
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900 py-14">
        <div className="container px-4 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-sm px-3 py-1 rounded-full mb-4">
            <Leaf className="h-4 w-4" />
            No fluff. Just evidence.
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Learn</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Practical guides on zero-waste living, certification literacy, and carbon transparency.
            Written without vague environmental claims.
          </p>
        </div>
      </section>

      <main className="flex-1 container px-4 max-w-5xl mx-auto py-12 space-y-14">
        {/* Challenges */}
        {challenges && challenges.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Active Challenges</h2>
              <Badge variant="secondary">{challenges.length} running</Badge>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {challenges.map((c) => <ChallengeCard key={c.id} challenge={c} />)}
            </div>
          </section>
        )}

        {/* Articles */}
        <section>
          <h2 className="text-xl font-semibold mb-6">Articles & Guides</h2>
          <div className="space-y-4">
            {ARTICLES.map((article) => (
              <Card key={article.slug} className="hover-elevate group">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Badge className={`${CATEGORY_COLORS[article.category] ?? "bg-muted text-muted-foreground"} border-0 text-xs`}>
                          {article.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 inline mr-1" />{article.readMinutes} min read
                        </span>
                      </div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">{article.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{article.description}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-sm text-muted-foreground text-center mt-6">
            More articles coming soon. Articles are sourced from peer-reviewed research and UK regulatory guidance.
          </p>
        </section>

        {/* Replace section */}
        <section className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-semibold mb-3">Ready to make a swap?</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Browse our replacement guides for every single-use plastic item in your home. Each guide links directly to verified products.
          </p>
          <Button asChild size="lg">
            <Link href="/replace">
              Browse replacement guides <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </section>
      </main>
      <Footer />
    </div>
  );
}
