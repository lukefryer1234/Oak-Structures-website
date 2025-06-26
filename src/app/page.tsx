
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"

export default function Home() {
  return (
    <main className="flex-1">
      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center">Our Product Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            <Link href="/products/garages/configure">
              <Card className="group">
                <Image
                  src="/images/garage-category.jpg"
                  alt="Garages"
                  width={400}
                  height={300}
                  className="rounded-t-lg object-cover group-hover:opacity-75 transition-opacity"
                />
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold">Garages</h3>
                </CardContent>
              </Card>
            </Link>
            <Link href="/products/gazebos/configure">
              <Card className="group">
                <Image
                  src="/images/gazebo-category.jpg"
                  alt="Gazebos"
                  width={400}
                  height={300}
                  className="rounded-t-lg object-cover group-hover:opacity-75 transition-opacity"
                />
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold">Gazebos</h3>
                </CardContent>
              </Card>
            </Link>
            <Link href="/products/porches/configure">
              <Card className="group">
                <Image
                  src="/images/porch-category.jpg"
                  alt="Porches"
                  width={400}
                  height={300}
                  className="rounded-t-lg object-cover group-hover:opacity-75 transition-opacity"
                />
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold">Porches</h3>
                </CardContent>
              </Card>
            </Link>
            <Link href="/products/oak-beams/configure">
              <Card className="group">
                <Image
                  src="/images/beams-category.jpg"
                  alt="Oak Beams"
                  width={400}
                  height={300}
                  className="rounded-t-lg object-cover group-hover:opacity-75 transition-opacity"
                />
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold">Oak Beams</h3>
                </CardContent>
              </Card>
            </Link>
            <Link href="/products/oak-flooring/configure">
              <Card className="group">
                <Image
                  src="/images/flooring-category.jpg"
                  alt="Oak Flooring"
                  width={400}
                  height={300}
                  className="rounded-t-lg object-cover group-hover:opacity-75 transition-opacity"
                />
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold">Oak Flooring</h3>
                </CardContent>
              </Card>
            </Link>
            <Link href="/products/special-deals/configure">
              <Card className="group">
                <Image
                  src="/images/special-deals-category.jpg"
                  alt="Special Deals"
                  width={400}
                  height={300}
                  className="rounded-t-lg object-cover group-hover:opacity-75 transition-opacity"
                />
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold">Special Deals</h3>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
