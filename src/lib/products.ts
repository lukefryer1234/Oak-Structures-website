import type { Product, GaragePricingParams, ProductOption } from '@/types';

const defaultGaragePricingParams: GaragePricingParams = {
  bayPrice: 1500, // Cost per bay
  catSlidePricePerBay: 150,
  beamSizePrices: { // Cost per bay for this beam size
    "6x6": 0,
    "7x7": 200,
    "8x8": 450,
  },
  trussPrices: { // One-off cost for truss type
    "curved": 0,
    "straight": 0, 
  },
  baySizeMultipliers: { // Overall price multiplier
    "standard": 1.0,
    "large": 1.1,
  }
};

export const mockProducts: Product[] = [
  {
    id: 'garages',
    name: 'Garages',
    description: 'High-quality oak garages, built to last. Fully customizable options available, from number of bays to truss types and beam sizes.',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/swiftcart-bsbrc.firebasestorage.app/o/gallerry%2FGarages%2FWhatsApp%20Image%202025-04-11%20at%207.58.48%20PM%20(1).jpeg?alt=media&token=5394f0c7-1f89-429f-a53f-2e27018b455b',
    basePrice: 8000, 
    options: [
      {
        id: 'numBays',
        name: 'Number of Bays',
        type: 'slider',
        min: 1,
        max: 4,
        step: 1,
        defaultValue: 2,
        unit: 'Bays',
      },
      {
        id: 'beamSize',
        name: 'Structural Beam Sizes',
        type: 'select',
        defaultValue: '6x6',
        values: [
          { label: '6 inch x 6 inch', value: '6x6' },
          { label: '7 inch x 7 inch', value: '7x7' },
          { label: '8 inch x 8 inch', value: '8x8' },
        ],
      },
      {
        id: 'baySize', // Changed from 'sizePerBay' to 'baySize' to match usage
        name: 'Width Per Bay', 
        type: 'select',
        defaultValue: 'standard',
        values: [
          { label: 'Standard (e.g., 3m wide)', value: 'standard' },
          { label: 'Large (e.g., 3.5m wide)', value: 'large' },
        ],
      },
      {
        id: 'trussType',
        name: 'Truss Type',
        type: 'radio',
        defaultValue: 'curved',
        values: [
          { label: 'Curved', value: 'curved', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/swiftcart-bsbrc.firebasestorage.app/o/King%20truss.jpeg?alt=media&token=dd61eb30-4156-4585-b0b2-cbc2332da42c', priceModifier: 0 },
          { label: 'Straight', value: 'straight', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/swiftcart-bsbrc.firebasestorage.app/o/King%20truss%202.jpeg?alt=media&token=6c2364e4-3ebe-4c4c-885d-24b9d60cadf2', priceModifier: 0 },
        ],
      },
      {
        id: 'catSlide',
        name: 'Include Cat Slide Roof?',
        description: '(Applies to all bays)', 
        type: 'checkbox',
        checkboxLabel: 'Yes, include cat slide roof',
        defaultValue: false,
      },
    ],
    garagePricingParams: defaultGaragePricingParams,
  },
  {
    id: 'gazebos',
    name: 'Gazebos',
    description: 'Elegant oak gazebos to enhance your garden space. Perfect for outdoor relaxation.',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/swiftcart-bsbrc.firebasestorage.app/o/gallerry%2FGazebo\'s%2FWhatsApp%20Image%202025-04-15%20at%209.57.50%20PM%20(5).jpeg?alt=media&token=ea0de540-3066-4629-98b8-a0184e992c8d',
    basePrice: 7000, // Updated base price for 1-bay gazebo
    options: [
      {
        id: 'numBays',
        name: 'Number of Bays',
        type: 'slider',
        min: 1,
        max: 4, // Updated to 4 bays
        step: 1,
        defaultValue: 1,
        unit: 'Bays',
      },
      {
        id: 'legType',
        name: 'Leg Type',
        type: 'select',
        defaultValue: 'full_height',
        values: [
          { label: 'Full Height Legs', value: 'full_height', priceModifier: 0 },
          { label: 'Half Height Legs (for dwarf walls)', value: 'half_height', priceModifier: -100 },
        ],
      },
      {
        id: 'sizeType', 
        name: 'Size Type', 
        type: 'select',
        defaultValue: '3mx3m',
        values: [
          { label: '3m x 3m', value: '3mx3m', priceModifier: 0 },
          { label: '4m x 3m', value: '4mx3m', priceModifier: 300 },
          { label: '4m x 4m', value: '4mx4m', priceModifier: 500 },
        ],
      },
      {
        id: 'trussType',
        name: 'Truss Type',
        type: 'radio',
        defaultValue: 'curved',
        values: [
          { label: 'Curved', value: 'curved', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/swiftcart-bsbrc.firebasestorage.app/o/King%20truss.jpeg?alt=media&token=dd61eb30-4156-4585-b0b2-cbc2332da42c', priceModifier: 50 },
          { label: 'Straight', value: 'straight', imageUrl: 'https://firebasestorage.googleapis.com/v0/b/swiftcart-bsbrc.firebasestorage.app/o/King%20truss%202.jpeg?alt=media&token=6c2364e4-3ebe-4c4c-885d-24b9d60cadf2', priceModifier: 0 },
        ],
      },
    ],
  },
  {
    id: 'porches',
    name: 'Porches',
    description: 'Design a welcoming entrance to your home with our customizable oak porches. Choose from various styles, sizes, and finishes to create the perfect addition to your property.',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/swiftcart-bsbrc.firebasestorage.app/o/gallerry%2FPorches%2FWhatsApp%20Image%202025-04-16%20at%202.05.48%20PM%20(2).jpeg?alt=media&token=0dd459d1-9c1e-4065-bd0f-ea2c4fa0e8e6',
    basePrice: 2500, 
    options: [
      {
        id: 'porchSize',
        name: 'Porch Size',
        type: 'select',
        defaultValue: 'medium',
        values: [
          { label: 'Small (1.5m x 1m)', value: 'small', priceModifier: 0 },
          { label: 'Medium (2m x 1.5m)', value: 'medium', priceModifier: 250 },
          { label: 'Large (2.5m x 1.5m)', value: 'large', priceModifier: 500 },
        ],
      },
      {
        id: 'roofStyle',
        name: 'Roof Style',
        type: 'radio',
        defaultValue: 'gabled',
        values: [
          { label: 'Gabled', value: 'gabled', priceModifier: 0, imageUrl: 'https://placehold.co/150x100.png' },
          { label: 'Hipped', value: 'hipped', priceModifier: 200, imageUrl: 'https://placehold.co/150x100.png' },
        ],
      },
      {
        id: 'legStyle',
        name: 'Leg Style',
        type: 'radio',
        defaultValue: 'square',
        values: [
          { label: 'Square', value: 'square', priceModifier: 0, imageUrl: 'https://placehold.co/150x100.png' },
          { label: 'Turned', value: 'turned', priceModifier: 150, imageUrl: 'https://placehold.co/150x100.png' },
        ],
      },
      {
        id: 'sideInfills',
        name: 'Side Infills',
        type: 'select',
        defaultValue: 'none',
        values: [
          { label: 'None (Open Sides)', value: 'none', priceModifier: 0 },
          { label: 'Half Height Solid Oak', value: 'half_solid', priceModifier: 400 },
          { label: 'Full Height Solid Oak', value: 'full_solid', priceModifier: 700 },
        ],
      },
      {
        id: 'includeGlazing',
        name: 'Include Glazing?',
        type: 'checkbox',
        checkboxLabel: 'Yes',
        defaultValue: false,
        priceModifier: 350, 
      },
    ],
  },
  {
    id: 'oak-beams',
    name: 'Oak Beams',
    description: 'Structural and decorative oak beams, cut to your specifications.',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/swiftcart-bsbrc.firebasestorage.app/o/gallerry%2FBeams%2Freclaimedbeam.jpeg?alt=media&token=8f879894-7c21-490c-b3fd-9d60bed1201d',
    basePrice: 0, 
    options: [
      {
        id: 'oakType',
        name: 'Oak Type',
        type: 'select',
        defaultValue: 'green_oak',
        values: [
          { label: 'Green Oak', value: 'green_oak', priceModifier: 0 },
          { label: 'Air Dried Oak', value: 'air_dried_oak', priceModifier: 20 }, 
        ],
      },
      {
        id: 'lengthCm',
        name: 'Length (cm)',
        type: 'number_input', 
        defaultValue: 200,
        unit: 'cm',
        min: 50, 
        max: 1000,
        step: 1,
      },
      {
        id: 'widthCm',
        name: 'Width (cm)',
        type: 'number_input',
        defaultValue: 15,
        unit: 'cm',
        min: 5,
        max: 50,
        step: 1,
      },
      {
        id: 'thicknessCm',
        name: 'Thickness (cm)',
        type: 'number_input',
        defaultValue: 15,
        unit: 'cm',
        min: 5,
        max: 50,
        step: 1,
      },
    ] as ProductOption[], 
  },
  {
    id: 'oak-flooring',
    name: 'Oak Flooring',
    description: 'Durable and timeless solid oak flooring for a premium finish.',
    imageUrl: 'https://firebasestorage.googleapis.com/v0/b/swiftcart-bsbrc.firebasestorage.app/o/gallerry%2FFlooring%2Fflooringreclaimed.jpeg?alt=media&token=ed10cf8e-ed84-41e1-a690-7719cb3b7dc2',
    basePrice: 50, 
    options: [
      {
        id: 'area', 
        name: 'Area (sq meters)',
        type: 'slider',
        min: 5,
        max: 100,
        step: 1,
        defaultValue: 20,
        unit: 'm²',
      },
      {
        id: 'grade',
        name: 'Grade',
        type: 'select',
        defaultValue: 'rustic',
        values: [
          { label: 'Rustic', value: 'rustic' },
          { label: 'Prime', value: 'prime', priceModifier: 20 }, 
        ],
      },
      {
        id: 'width',
        name: 'Board Width',
        type: 'radio',
        defaultValue: '150mm',
        values: [
          { label: '150mm', value: '150mm', imageUrl: 'https://placehold.co/150x100.png' },
          { label: '200mm', value: '200mm', priceModifier: 10, imageUrl: 'https://placehold.co/150x100.png' }, 
        ],
      },
    ],
  },
  {
    id: 'special-deals',
    name: 'Special Deals',
    description: 'Special offers and discounted oak products will be available soon!',
    imageUrl: 'https://placehold.co/600x400.png',
    basePrice: 0, 
    options: [ 
       {
        id: 'offer_info',
        name: 'Information',
        type: 'select',
        defaultValue: 'view_deals',
        values: [
          { label: 'See active promotions below.', value: 'view_deals' },
        ],
      },
    ],
  },
];

export const mockFeaturedDeals: Product[] = [
  {
    id: 'pre-configured-double-garage',
    name: 'Pre-Configured Double Garage',
    description: 'Limited time offer on our popular 2-bay garage. Includes standard roofing and joinery. Fixed configuration.',
    imageUrl: 'https://placehold.co/200x150.png',
    basePrice: 10500, 
    options: [ 
      {
        id:'deal_info',
        name: 'Deal Specification',
        type: 'select', 
        defaultValue: '2bay_tile_roof',
        values: [
            {label: '2 Bay, Tiled Roof, Standard Beams', value: '2bay_tile_roof'}
        ]
      }
    ],
  },
  {
    id: 'garden-gazebo-kit',
    name: 'Garden Gazebo Kit (3m x 3m)',
    description: 'Easy-to-assemble 3m x 3m oak gazebo kit. Perfect DIY project. Includes all necessary timbers and basic plans.',
    imageUrl: 'https://placehold.co/200x150.png',
    basePrice: 2850, 
    options: [
      {
        id:'kit_info',
        name: 'Kit Contents',
        type: 'select', 
        defaultValue: 'standard_kit',
        values: [
            {label: 'Standard 3m x 3m Kit', value: 'standard_kit'}
        ]
      }
    ],
  },
];


export const getProductById = (id: string): Product | undefined => {
  const allProducts = [...mockProducts, ...mockFeaturedDeals];
  return allProducts.find(p => p.id === id);
};
