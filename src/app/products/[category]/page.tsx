"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import { useParams } from "next/navigation"

export default function CategoryPage() {
  const params = useParams()
  const category = params.category as string

  const categoryName = category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  const products = [
    {
      name: "Classic Oak Garage",
      description: "A timeless single-bay oak garage.",
      image: "/images/garage-category.jpg",
    },
    {
      name: "Two-Bay Oak Garage",
      description: "A spacious two-bay oak garage with a traditional design.",
      image: "/images/featured-deal-1.jpg",
    },
    {
      name: "Modern Oak Garage",
      description: "A sleek and modern oak garage with clean lines.",
      image: "/images/garage-category.jpg",
    },
  ]

  return (
    <div>
      <section className="bg-muted py-12 md:py-24">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center">{categoryName}</h1>
          <p className="mt-4 text-lg text-center text-muted-foreground">
            Browse our selection of high-quality oak {category.toLowerCase()}.
          </p>
        </div>
      </section>
      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <Card key={product.name}>
                <Image
                  src={product.image}
                  alt={product.name}
                  width={400}
                  height={300}
                  className="rounded-t-lg object-cover"
                />
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold">{product.name}</h3>
                  <p className="mt-2 text-muted-foreground">{product.description}</p>
                  <Button variant="outline" className="mt-4">
                    View Product <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
