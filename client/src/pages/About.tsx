import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { 
  Leaf, 
  Users, 
  Globe2, 
  Shield, 
  TreePine, 
  Recycle,
  Heart,
  Target,
  ArrowRight
} from "lucide-react";

const values = [
  {
    icon: Leaf,
    title: "Sustainability First",
    description: "Every product on our platform is vetted for environmental impact and ethical sourcing.",
  },
  {
    icon: Shield,
    title: "Verified Sellers",
    description: "We verify all sellers to ensure they meet our strict sustainability and quality standards.",
  },
  {
    icon: Globe2,
    title: "Carbon Neutral",
    description: "We offset 100% of shipping emissions and work with carbon-neutral delivery partners.",
  },
  {
    icon: Heart,
    title: "Community Driven",
    description: "Built for and by eco-conscious consumers who want to make a positive impact.",
  },
];

const impactStats = [
  { value: "50,000+", label: "Sustainable Products" },
  { value: "2,000+", label: "Verified Sellers" },
  { value: "500,000+", label: "Happy Customers" },
  { value: "1M+ kg", label: "CO2 Offset" },
];

const team = [
  { name: "Sarah Chen", role: "Founder & CEO", image: null },
  { name: "Marcus Green", role: "Head of Sustainability", image: null },
  { name: "Emma Wilson", role: "Community Director", image: null },
  { name: "David Park", role: "CTO", image: null },
];

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-20 bg-gradient-to-br from-primary/10 via-emerald-500/5 to-background">
          <div className="container px-4 text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-6">
              Building a <span className="text-primary">Sustainable</span> Future,<br />
              One Purchase at a Time
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              GreenMart connects eco-conscious consumers with verified sustainable 
              products and ethical sellers from around the world.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/shop">
                  Start Shopping
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/become-seller">Become a Seller</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16">
          <div className="container px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">Our Mission</h2>
                <p className="text-muted-foreground mb-4">
                  We believe that sustainable living shouldn't be hard. That's why we created 
                  GreenMart – a marketplace where every product is carefully curated for its 
                  environmental and ethical impact.
                </p>
                <p className="text-muted-foreground mb-4">
                  Our mission is to make sustainable shopping the easy choice, empowering 
                  consumers to vote with their wallets for a healthier planet.
                </p>
                <p className="text-muted-foreground">
                  We work directly with sellers to verify their sustainability practices, 
                  offset all shipping emissions, and provide transparent information about 
                  every product's environmental footprint.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <TreePine className="h-10 w-10 mx-auto mb-3 text-primary" />
                    <p className="text-2xl font-bold">2M+</p>
                    <p className="text-sm text-muted-foreground">Trees Planted</p>
                  </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <Recycle className="h-10 w-10 mx-auto mb-3 text-primary" />
                    <p className="text-2xl font-bold">100K+</p>
                    <p className="text-sm text-muted-foreground">Tons CO2 Saved</p>
                  </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <Users className="h-10 w-10 mx-auto mb-3 text-primary" />
                    <p className="text-2xl font-bold">500K+</p>
                    <p className="text-sm text-muted-foreground">Customers</p>
                  </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <Globe2 className="h-10 w-10 mx-auto mb-3 text-primary" />
                    <p className="text-2xl font-bold">150+</p>
                    <p className="text-sm text-muted-foreground">Countries</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-muted/50">
          <div className="container px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Our Values</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything we do is guided by our commitment to sustainability, 
                transparency, and community.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <Card key={index} className="hover-elevate">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <value.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-16">
          <div className="container px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Meet the Team</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Passionate people working together to make sustainable living accessible to everyone.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {team.map((member, index) => (
                <div key={index} className="text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <h3 className="font-medium">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Join the Sustainable Shopping Movement
            </h2>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
              Together, we can make a difference. Start shopping sustainably today 
              or become a verified seller on our platform.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/shop">Shop Now</Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10" asChild>
                <Link href="/become-seller">Become a Seller</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
