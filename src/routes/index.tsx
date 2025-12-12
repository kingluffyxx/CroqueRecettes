import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { auth } from "../lib/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PenLine, Globe, Users, Quote, ChefHat, Star } from "lucide-react";

const getSession = createServerFn().handler(async ({ request }) => {
  const session = await auth.api.getSession({ headers: request.headers });
  return session;
});

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const session = await getSession();
    if (session) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: HomePage,
});

function HomePage() {
  const features = [
    {
      icon: PenLine,
      title: "Création de recettes",
      description: "Publiez vos propres recettes facilement.",
    },
    {
      icon: Globe,
      title: "Accès instantané",
      description: "Consultez vos recettes partout, à tout moment.",
    },
    {
      icon: Users,
      title: "Communauté",
      description:
        "Partagez vos astuces et découvrez celles des autres cuisiniers.",
    },
  ];

  const testimonials = [
    {
      quote: "Recettes simples et délicieuses, site très intuitif !",
      author: "Alice L.",
      job: "Développeuse",
      initials: "AL",
    },
    {
      quote: "Idéal pour trouver des idées et partager ses astuces.",
      author: "Bob M.",
      job: "Designer",
      initials: "BM",
    },
    {
      quote: "Super pratique et une vraie communauté de passionnés !",
      author: "Caroline D.",
      job: "Chef de projet",
      initials: "CD",
    },
  ];

  const previewImages = [
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1493770348161-369560ae357d?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&h=300&fit=crop",
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-orange-50 to-white">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <Badge variant="secondary" className="mb-4">
              <ChefHat className="w-3 h-3 mr-1" />
              +1000 recettes partagées
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Découvrez des recettes{" "}
              <span className="text-orange-600">simples et savoureuses</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Partagez vos plats préférés et explorez des idées gourmandes en
              quelques minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" asChild>
                <Link to="/recettes">Voir les recettes</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/auth/register">Créer un compte</Link>
              </Button>
            </div>
          </div>
          <div className="flex-1">
            <img
              src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=400&fit=crop"
              alt="Délicieux plats cuisinés"
              className="rounded-2xl shadow-2xl transform hover:scale-105 transition duration-500"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Pourquoi CroqueRecettes ?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Une plateforme pensée pour les passionnés de cuisine
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md"
              >
                <CardHeader>
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <feature.icon className="w-8 h-8 text-orange-600" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto text-center">
          <Badge variant="outline" className="mb-4">
            <Star className="w-3 h-3 mr-1" />
            Aperçu
          </Badge>
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Interface Simple et Intuitive
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Concentrez-vous sur vos recettes grâce à notre design épuré et sans
            distractions.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {previewImages.map((src, index) => (
              <Card
                key={index}
                className="overflow-hidden border-0 shadow-xl hover:scale-105 transition duration-500 p-0"
              >
                <img
                  src={src}
                  alt={`Aperçu ${index + 1}`}
                  className="w-full aspect-[4/3] object-cover"
                />
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Ce que disent nos utilisateurs
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="relative hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <CardHeader>
                  <Quote className="w-8 h-8 text-orange-200 absolute top-4 right-4" />
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-orange-100 text-orange-600">
                        {testimonial.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">
                        {testimonial.author}
                      </CardTitle>
                      <CardDescription>{testimonial.job}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground italic">
                    "{testimonial.quote}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-orange-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à partager vos recettes ?
          </h2>
          <p className="text-lg mb-8 text-orange-100">
            Inscrivez-vous gratuitement et commencez à cuisiner avec la
            communauté.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="bg-white text-orange-600 hover:bg-orange-50"
            asChild
          >
            <Link to="/auth/register">Commencer maintenant</Link>
          </Button>
        </div>
      </section>

      <Separator />

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto text-center">
          <p>
            &copy; {new Date().getFullYear()} CroqueRecettes. Tous droits
            réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
