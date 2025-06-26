
import Image from "next/image"

export default function AboutPage() {
  return (
    <div>
      <section className="bg-muted py-12 md:py-24">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center">About Oak Structures</h1>
          <p className="mt-4 text-lg text-center text-muted-foreground">
            Learn more about our company, our values, and our commitment to quality craftsmanship.
          </p>
        </div>
      </section>
      <section className="py-12 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold">Our Story</h2>
              <p className="mt-4 text-muted-foreground">
                Oak Structures was founded with a passion for creating beautiful and durable oak buildings. We believe
                in the timeless appeal of natural materials and traditional craftsmanship. Our team of skilled artisans
                and designers work closely with clients to bring their vision to life, whether it's a classic garage, a
                charming gazebo, or a welcoming porch.
              </p>
              <p className="mt-4 text-muted-foreground">
                We are committed to using sustainably sourced oak and environmentally friendly practices. Our goal is to
                create structures that not only enhance your property but also stand the test of time.
              </p>
            </div>
            <div>
              <Image
                src="/images/featured-deal-2.jpg"
                alt="Our Workshop"
                width={600}
                height={400}
                className="rounded-lg object-cover"
              />
            </div>
          </div>
        </div>
      </section>
      <section className="bg-muted py-12 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center">Our Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            <div className="text-center">
              <h3 className="text-xl font-bold">Quality</h3>
              <p className="mt-2 text-muted-foreground">
                We use only the finest materials and traditional techniques to ensure the highest quality craftsmanship.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold">Sustainability</h3>
              <p className="mt-2 text-muted-foreground">
                We are committed to using sustainably sourced oak and environmentally friendly practices.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold">Customer Satisfaction</h3>
              <p className="mt-2 text-muted-foreground">
                We work closely with our clients to ensure their complete satisfaction with every project.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
