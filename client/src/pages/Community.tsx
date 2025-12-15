import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { 
  BookOpen, 
  Newspaper, 
  Trophy, 
  Users,
  Clock,
  ArrowRight,
  Search,
  Leaf
} from "lucide-react";

const blogPosts = [
  {
    id: 1,
    title: "10 Simple Ways to Reduce Your Carbon Footprint at Home",
    excerpt: "Small changes in your daily routine can make a big difference for the planet. Here are practical tips to get started.",
    category: "Guides",
    readTime: "5 min read",
    date: "Dec 10, 2024",
    image: null,
  },
  {
    id: 2,
    title: "The Rise of Sustainable Fashion: What You Need to Know",
    excerpt: "Discover how the fashion industry is transforming and what to look for when shopping for eco-friendly clothing.",
    category: "News",
    readTime: "7 min read",
    date: "Dec 8, 2024",
    image: null,
  },
  {
    id: 3,
    title: "Success Story: How One Seller Built a Zero-Waste Business",
    excerpt: "Meet Sarah from EcoBasics, who turned her passion for sustainability into a thriving business on GreenMart.",
    category: "Stories",
    readTime: "6 min read",
    date: "Dec 5, 2024",
    image: null,
  },
  {
    id: 4,
    title: "Understanding Sustainability Certifications",
    excerpt: "From Fair Trade to Organic, learn what these labels mean and how to identify truly sustainable products.",
    category: "Guides",
    readTime: "8 min read",
    date: "Dec 3, 2024",
    image: null,
  },
  {
    id: 5,
    title: "2024 Trends in Eco-Friendly Home Products",
    excerpt: "Discover the latest innovations in sustainable home goods that are making green living easier than ever.",
    category: "News",
    readTime: "5 min read",
    date: "Dec 1, 2024",
    image: null,
  },
  {
    id: 6,
    title: "Community Challenge: Plastic-Free January",
    excerpt: "Join thousands of eco-warriors in our annual challenge to eliminate single-use plastics from your life.",
    category: "Challenges",
    readTime: "3 min read",
    date: "Nov 28, 2024",
    image: null,
  },
];

const challenges = [
  {
    id: 1,
    title: "Zero Waste Week",
    description: "Reduce your waste to zero for 7 days and earn 500 eco-points!",
    participants: 2847,
    daysLeft: 5,
    reward: "10% off your next order",
  },
  {
    id: 2,
    title: "Plastic-Free January",
    description: "Commit to eliminating single-use plastics for the entire month.",
    participants: 5234,
    daysLeft: 20,
    reward: "Free carbon offset",
  },
  {
    id: 3,
    title: "Local Shopping Challenge",
    description: "Support local sustainable sellers and reduce shipping emissions.",
    participants: 1562,
    daysLeft: 12,
    reward: "Exclusive badge",
  },
];

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Guides":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    case "News":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
    case "Stories":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
    case "Challenges":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export default function Community() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-12 bg-gradient-to-br from-primary/10 via-emerald-500/5 to-background">
          <div className="container px-4">
            <div className="max-w-2xl">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Eco Community Hub
              </h1>
              <p className="text-lg text-muted-foreground mb-6">
                Learn, share, and grow with fellow eco-conscious consumers. 
                Discover tips, stories, and challenges to live more sustainably.
              </p>
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search articles..."
                  className="pl-10"
                  data-testid="input-community-search"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="container px-4">
            <Tabs defaultValue="all" className="space-y-8">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <TabsList>
                  <TabsTrigger value="all" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    All
                  </TabsTrigger>
                  <TabsTrigger value="guides" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Guides
                  </TabsTrigger>
                  <TabsTrigger value="news" className="gap-2">
                    <Newspaper className="h-4 w-4" />
                    News
                  </TabsTrigger>
                  <TabsTrigger value="stories" className="gap-2">
                    <Users className="h-4 w-4" />
                    Stories
                  </TabsTrigger>
                  <TabsTrigger value="challenges" className="gap-2">
                    <Trophy className="h-4 w-4" />
                    Challenges
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="space-y-8">
                {/* Featured Challenges */}
                <div>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    Active Challenges
                  </h2>
                  <div className="grid md:grid-cols-3 gap-4">
                    {challenges.map((challenge) => (
                      <Card key={challenge.id} className="hover-elevate">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-0">
                              Challenge
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {challenge.daysLeft} days left
                            </span>
                          </div>
                          <h3 className="font-semibold text-lg mb-2">{challenge.title}</h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {challenge.description}
                          </p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Users className="h-4 w-4" />
                              {challenge.participants.toLocaleString()} joined
                            </span>
                            <span className="text-primary font-medium">
                              {challenge.reward}
                            </span>
                          </div>
                        </CardContent>
                        <CardFooter className="pt-0">
                          <Button className="w-full" variant="outline">
                            Join Challenge
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Articles */}
                <div>
                  <h2 className="text-xl font-bold mb-4">Latest Articles</h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogPosts.map((post) => (
                      <Card key={post.id} className="hover-elevate overflow-hidden">
                        <div className="aspect-video bg-gradient-to-br from-primary/20 to-emerald-500/10 flex items-center justify-center">
                          <Leaf className="h-12 w-12 text-primary/40" />
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={`${getCategoryColor(post.category)} border-0 text-xs`}>
                              {post.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {post.readTime}
                            </span>
                          </div>
                          <h3 className="font-semibold mb-2 line-clamp-2">{post.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">{post.date}</span>
                            <Button variant="ghost" size="sm" className="gap-1">
                              Read More
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="guides">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {blogPosts
                    .filter((p) => p.category === "Guides")
                    .map((post) => (
                      <Card key={post.id} className="hover-elevate overflow-hidden">
                        <div className="aspect-video bg-gradient-to-br from-blue-500/20 to-primary/10 flex items-center justify-center">
                          <BookOpen className="h-12 w-12 text-blue-500/40" />
                        </div>
                        <CardContent className="p-4">
                          <Badge className={`${getCategoryColor(post.category)} border-0 text-xs mb-2`}>
                            {post.category}
                          </Badge>
                          <h3 className="font-semibold mb-2">{post.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {post.excerpt}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="news">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {blogPosts
                    .filter((p) => p.category === "News")
                    .map((post) => (
                      <Card key={post.id} className="hover-elevate overflow-hidden">
                        <div className="aspect-video bg-gradient-to-br from-purple-500/20 to-primary/10 flex items-center justify-center">
                          <Newspaper className="h-12 w-12 text-purple-500/40" />
                        </div>
                        <CardContent className="p-4">
                          <Badge className={`${getCategoryColor(post.category)} border-0 text-xs mb-2`}>
                            {post.category}
                          </Badge>
                          <h3 className="font-semibold mb-2">{post.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {post.excerpt}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="stories">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {blogPosts
                    .filter((p) => p.category === "Stories")
                    .map((post) => (
                      <Card key={post.id} className="hover-elevate overflow-hidden">
                        <div className="aspect-video bg-gradient-to-br from-green-500/20 to-primary/10 flex items-center justify-center">
                          <Users className="h-12 w-12 text-green-500/40" />
                        </div>
                        <CardContent className="p-4">
                          <Badge className={`${getCategoryColor(post.category)} border-0 text-xs mb-2`}>
                            {post.category}
                          </Badge>
                          <h3 className="font-semibold mb-2">{post.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {post.excerpt}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="challenges">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {challenges.map((challenge) => (
                    <Card key={challenge.id} className="hover-elevate">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-0">
                            Challenge
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {challenge.daysLeft} days left
                          </span>
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{challenge.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {challenge.description}
                        </p>
                        <div className="flex items-center justify-between text-sm mb-4">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Users className="h-4 w-4" />
                            {challenge.participants.toLocaleString()} joined
                          </span>
                          <span className="text-primary font-medium">
                            {challenge.reward}
                          </span>
                        </div>
                        <Button className="w-full">Join Challenge</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
