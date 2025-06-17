import { collection, doc, getDoc, getDocs, query, where, orderBy, limit, startAfter, setDoc, addDoc, deleteDoc, updateDoc, Firestore } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ========== Type Definitions ==========

/**
 * All supported product categories
 */
export type ProductCategory = 'garages' | 'gazebos' | 'porches' | 'oak-beams' | 'oak-flooring' | 'special-deals';

/**
 * All supported configuration option types
 */
export type ConfigOptionType = 'select' | 'slider' | 'radio' | 'checkbox' | 'dimensions' | 'area';

/**
 * Base interface for all configuration options
 */
export interface ConfigOption {
  id: string;
  label: string;
  type: ConfigOptionType;
  defaultValue: any;
  dataAiHint?: string;
  perBay?: boolean;
  unit?: string;
}

/**
 * Interface for select and radio configuration options
 */
export interface SelectConfigOption extends ConfigOption {
  type: 'select' | 'radio';
  options: {
    value: string;
    label: string;
    image?: string;
    dataAiHint?: string;
    priceAdjustment?: number;
  }[];
}

/**
 * Interface for slider configuration options
 */
export interface SliderConfigOption extends ConfigOption {
  type: 'slider';
  min: number;
  max: number;
  step: number;
  unit?: string;
}

/**
 * Interface for checkbox configuration options
 */
export interface CheckboxConfigOption extends ConfigOption {
  type: 'checkbox';
  priceAdjustment?: number;
}

/**
 * Interface for dimensions configuration options
 */
export interface DimensionsConfigOption extends ConfigOption {
  type: 'dimensions';
  unit: string;
  defaultValue: {
    length: number;
    width: number;
    thickness: number;
  };
}

/**
 * Interface for area configuration options
 */
export interface AreaConfigOption extends ConfigOption {
  type: 'area';
  unit: string;
  defaultValue: {
    length: number;
    width: number;
    area?: number;
  };
}

/**
 * Union type of all configuration option types
 */
export type AnyConfigOption = 
  | SelectConfigOption 
  | SliderConfigOption 
  | CheckboxConfigOption
  | DimensionsConfigOption
  | AreaConfigOption;

/**
 * Product configuration for a specific category
 */
export interface CategoryConfig {
  title: string;
  description?: string;
  options: AnyConfigOption[];
  image?: string;
  dataAiHint?: string;
  calculationStrategy: 'fixed' | 'configurable' | 'volume' | 'area';
}

/**
 * Base product interface for all products
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  images: string[];
  featuredImage?: string;
  isActive: boolean;
  isConfigurable: boolean;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Configurable product with options
 */
export interface ConfigurableProduct extends Product {
  isConfigurable: true;
  basePrice: number;
  options: Record<string, any>;
}

/**
 * Configuration state for a product
 */
export interface ConfigState {
  [key: string]: any;
}

/**
 * Interface for search parameters
 */
export interface ProductSearchParams {
  category?: ProductCategory;
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  sortBy?: 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'newest' | 'oldest';
  limit?: number;
  startAfter?: any;
  isActive?: boolean;
  isConfigurable?: boolean;
}

// ========== Product Configuration Definitions ==========

/**
 * Garage configuration options
 */
export const garageConfig: CategoryConfig = {
  title: "Configure Your Garage",
  description: "Customize your oak frame garage with the options below.",
  calculationStrategy: 'configurable',
  options: [
    {
      id: 'bays',
      label: 'Number of Bays (Added from Left)',
      type: 'slider',
      min: 1,
      max: 4,
      step: 1,
      defaultValue: [2]
    } as SliderConfigOption,
    {
      id: 'beamSize',
      label: 'Structural Beam Sizes',
      type: 'select',
      options: [
        { value: '6x6', label: '6 inch x 6 inch', priceAdjustment: 0 },
        { value: '7x7', label: '7 inch x 7 inch', priceAdjustment: 200 },
        { value: '8x8', label: '8 inch x 8 inch', priceAdjustment: 450 }
      ],
      defaultValue: '6x6'
    } as SelectConfigOption,
    {
      id: 'trussType',
      label: 'Truss Type',
      type: 'radio',
      options: [
        { value: 'curved', label: 'Curved', image: '/images/config/truss-curved.jpg', dataAiHint: 'curved oak truss', priceAdjustment: 0 },
        { value: 'straight', label: 'Straight', image: '/images/config/truss-straight.jpg', dataAiHint: 'straight oak truss', priceAdjustment: 0 }
      ],
      defaultValue: 'curved'
    } as SelectConfigOption,
    {
      id: 'baySize',
      label: 'Size Per Bay',
      type: 'select',
      options: [
        { value: 'standard', label: 'Standard (e.g., 3m wide)', priceAdjustment: 0 },
        { value: 'large', label: 'Large (e.g., 3.5m wide)', priceAdjustment: 0 }
      ],
      defaultValue: 'standard'
    } as SelectConfigOption,
    {
      id: 'catSlide',
      label: 'Include Cat Slide Roof? (Applies to all bays)',
      type: 'checkbox',
      defaultValue: false,
      priceAdjustment: 150
    } as CheckboxConfigOption
  ]
};

/**
 * Gazebo configuration options
 */
export const gazeboConfig: CategoryConfig = {
  title: "Configure Your Gazebo",
  description: "Customize your oak frame gazebo with the options below.",
  calculationStrategy: 'configurable',
  options: [
    {
      id: 'size',
      label: 'Gazebo Size',
      type: 'select',
      options: [
        { value: 'small', label: 'Small (2m x 2m)', priceAdjustment: -500 },
        { value: 'medium', label: 'Medium (3m x 3m)', priceAdjustment: 0 },
        { value: 'large', label: 'Large (4m x 4m)', priceAdjustment: 800 }
      ],
      defaultValue: 'medium'
    } as SelectConfigOption,
    {
      id: 'roofStyle',
      label: 'Roof Style',
      type: 'radio',
      options: [
        { value: 'pitched', label: 'Pitched', image: '/images/config/roof-pitched.jpg', dataAiHint: 'pitched gazebo roof', priceAdjustment: 0 },
        { value: 'hipped', label: 'Hipped', image: '/images/config/roof-hipped.jpg', dataAiHint: 'hipped gazebo roof', priceAdjustment: 300 }
      ],
      defaultValue: 'pitched'
    } as SelectConfigOption,
    {
      id: 'sides',
      label: 'Number of Enclosed Sides',
      type: 'slider',
      min: 0,
      max: 4,
      step: 1,
      defaultValue: [0]
    } as SliderConfigOption,
    {
      id: 'floor',
      label: 'Include Floor',
      type: 'checkbox',
      defaultValue: false,
      priceAdjustment: 450
    } as CheckboxConfigOption
  ]
};

/**
 * Porch configuration options
 */
export const porchConfig: CategoryConfig = {
  title: "Configure Your Porch",
  description: "Customize your oak frame porch with the options below.",
  calculationStrategy: 'configurable',
  options: [
    {
      id: 'trussType',
      label: 'Truss Type',
      type: 'radio',
      options: [
        { value: 'curved', label: 'Curved', image: '/images/config/truss-curved.jpg', dataAiHint: 'curved oak truss', priceAdjustment: 0 },
        { value: 'straight', label: 'Straight', image: '/images/config/truss-straight.jpg', dataAiHint: 'straight oak truss', priceAdjustment: 0 }
      ],
      defaultValue: 'curved'
    } as SelectConfigOption,
    {
      id: 'legType',
      label: 'Leg Type',
      type: 'select',
      options: [
        { value: 'floor', label: 'Legs to Floor', priceAdjustment: 150 },
        { value: 'wall', label: 'Legs to Wall', priceAdjustment: 0 }
      ],
      defaultValue: 'floor'
    } as SelectConfigOption,
    {
      id: 'sizeType',
      label: 'Size Type',
      type: 'select',
      options: [
        { value: 'narrow', label: 'Narrow (e.g., 1.5m Wide)', priceAdjustment: -200 },
        { value: 'standard', label: 'Standard (e.g., 2m Wide)', priceAdjustment: 0 },
        { value: 'wide', label: 'Wide (e.g., 2.5m Wide)', priceAdjustment: 400 }
      ],
      defaultValue: 'standard'
    } as SelectConfigOption
  ]
};

/**
 * Oak beams configuration options
 */
export const oakBeamsConfig: CategoryConfig = {
  title: "Configure Your Oak Beams",
  description: "Customize your oak beams with the options below.",
  calculationStrategy: 'volume',
  options: [
    {
      id: 'oakType',
      label: 'Oak Type',
      type: 'select',
      options: [
        { value: 'reclaimed', label: 'Reclaimed Oak', priceAdjustment: 0 },
        { value: 'kilned', label: 'Kiln Dried Oak', priceAdjustment: 0 },
        { value: 'green', label: 'Green Oak', priceAdjustment: 0 }
      ],
      defaultValue: 'green'
    } as SelectConfigOption,
    {
      id: 'dimensions',
      label: 'Dimensions (cm)',
      type: 'dimensions',
      unit: 'cm',
      defaultValue: { length: 200, width: 15, thickness: 15 }
    } as DimensionsConfigOption
  ]
};

/**
 * Oak flooring configuration options
 */
export const oakFlooringConfig: CategoryConfig = {
  title: "Configure Your Oak Flooring",
  description: "Customize your oak flooring with the options below.",
  calculationStrategy: 'area',
  options: [
    {
      id: 'flooringType',
      label: 'Flooring Type',
      type: 'select',
      options: [
        { value: 'solid', label: 'Solid Oak', priceAdjustment: 20 },
        { value: 'engineered', label: 'Engineered Oak', priceAdjustment: 0 }
      ],
      defaultValue: 'engineered'
    } as SelectConfigOption,
    {
      id: 'finish',
      label: 'Finish',
      type: 'select',
      options: [
        { value: 'natural', label: 'Natural', priceAdjustment: 0 },
        { value: 'lacquered', label: 'Lacquered', priceAdjustment: 5 },
        { value: 'oiled', label: 'Oiled', priceAdjustment: 7 }
      ],
      defaultValue: 'natural'
    } as SelectConfigOption,
    {
      id: 'area',
      label: 'Area (m²)',
      type: 'area',
      unit: 'm²',
      defaultValue: { length: 5, width: 5, area: 25 }
    } as AreaConfigOption
  ]
};

/**
 * Map of category IDs to their configuration options
 */
export const categoryConfigs: Record<ProductCategory, CategoryConfig> = {
  'garages': garageConfig,
  'gazebos': gazeboConfig,
  'porches': porchConfig,
  'oak-beams': oakBeamsConfig,
  'oak-flooring': oakFlooringConfig,
  'special-deals': {
    title: "Special Deals",
    description: "Limited time offers on our oak products.",
    calculationStrategy: 'fixed',
    options: []
  }
};

// ========== Price Calculation Functions ==========

/**
 * Unit prices for oak beam calculations
 */
const oakBeamUnitPrices = {
  reclaimed: 1200, // £ per cubic meter
  kilned: 1000,    // £ per cubic meter
  green: 800       // £ per cubic meter
};

/**
 * Unit prices for oak flooring calculations
 */
const oakFlooringUnitPrices = {
  solid: 75,      // £ per square meter
  engineered: 65  // £ per square meter
};

/**
 * Calculate the price for a garage based on configuration
 */
export function calculateGaragePrice(config: ConfigState): number {
  const bays = config.bays?.[0] || 1;
  const basePrice = 8000; // Base price for a single bay
  let totalPrice = basePrice;

  // Add price for additional bays
  totalPrice += (bays - 1) * 1500;

  // Add cat slide cost if selected
  if (config.catSlide) {
    totalPrice += 150 * bays;
  }

  // Beam size adjustments
  let beamSizeCost = 0;
  switch (config.beamSize) {
    case '7x7':
      beamSizeCost = 200;
      break;
    case '8x8':
      beamSizeCost = 450;
      break;
    default: // 6x6
      beamSizeCost = 0;
  }
  totalPrice += beamSizeCost;

  // Bay size adjustments
  if (config.baySize === 'large') {
    totalPrice += 300 * bays;
  }

  return totalPrice;
}

/**
 * Calculate the price for a gazebo based on configuration
 */
export function calculateGazeboPrice(config: ConfigState): number {
  // Base price for a medium gazebo
  let totalPrice = 5000;

  // Size adjustments
  switch (config.size) {
    case 'small':
      totalPrice -= 500;
      break;
    case 'large':
      totalPrice += 800;
      break;
    default: // medium
      break;
  }

  // Roof style adjustments
  if (config.roofStyle === 'hipped') {
    totalPrice += 300;
  }

  // Enclosed sides adjustments
  const sides = config.sides?.[0] || 0;
  totalPrice += sides * 250; // Each enclosed side costs £250

  // Floor adjustment
  if (config.floor) {
    totalPrice += 450;
  }

  return totalPrice;
}

/**
 * Calculate the price for a porch based on configuration
 */
export function calculatePorchPrice(config: ConfigState): number {
  // Base price for a standard porch
  let totalPrice = 3500;

  // Leg type adjustments
  if (config.legType === 'floor') {
    totalPrice += 150;
  }

  // Size type adjustments
  switch (config.sizeType) {
    case 'narrow':
      totalPrice -= 200;
      break;
    case 'wide':
      totalPrice += 400;
      break;
    default: // standard
      break;
  }

  return totalPrice;
}

/**
 * Calculate the price for oak beams based on configuration
 */
export function calculateOakBeamsPrice(config: ConfigState): number {
  // Get dimensions
  const { length, width, thickness } = config.dimensions || { length: 200, width: 15, thickness: 15 };
  
  // Calculate volume in cubic meters
  const volumeInCubicCm = length * width * thickness;
  const volumeInCubicMeters = volumeInCubicCm / 1000000; // Convert from cubic cm to cubic meters
  
  // Get unit price based on oak type
  const oakType = config.oakType || 'green';
  const unitPrice = oakBeamUnitPrices[oakType as keyof typeof oakBeamUnitPrices];
  
  // Calculate total price
  return Math.round(volumeInCubicMeters * unitPrice);
}

/**
 * Calculate the price for oak flooring based on configuration
 */
export function calculateOakFlooringPrice(config: ConfigState): number {
  // Get area
  const { area } = config.area || { area: 25 };
  
  // Get unit price based on flooring type
  const flooringType = config.flooringType || 'engineered';
  const unitPrice = oakFlooringUnitPrices[flooringType as keyof typeof oakFlooringUnitPrices];
  
  // Calculate base price
  let totalPrice = area * unitPrice;
  
  // Add finish adjustments
  switch (config.finish) {
    case 'lacquered':
      totalPrice += area * 5; // £5 extra per square meter
      break;
    case 'oiled':
      totalPrice += area * 7; // £7 extra per square meter
      break;
    default: // natural
      break;
  }
  
  return Math.round(totalPrice);
}

/**
 * Calculate the price for a product based on its category and configuration
 */
export function calculateProductPrice(category: ProductCategory, config: ConfigState): number {
  switch (category) {
    case 'garages':
      return calculateGaragePrice(config);
    case 'gazebos':
      return calculateGazeboPrice(config);
    case 'porches':
      return calculatePorchPrice(config);
    case 'oak-beams':
      return calculateOakBeamsPrice(config);
    case 'oak-flooring':
      return calculateOakFlooringPrice(config);
    default:
      return 0;
  }
}

// ========== Product Retrieval Functions ==========

/**
 * Retrieve a single product by ID
 * @param productId The ID of the product to retrieve
 * @returns The product or null if not found
 */
export async function getProductById(productId: string): Promise<Product | null> {
  try {
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);
    
    if (productSnap.exists()) {
      const productData = productSnap.data();
      return {
        id: productSnap.id,
        ...productData,
        createdAt: productData.createdAt?.toDate(),
        updatedAt: productData.updatedAt?.toDate()
      } as Product;
    }
    
    return null;
  } catch (error) {
    console.error('Error retrieving product:', error);
    return null;
  }
}

/**
 * Search for products based on provided parameters
 * @param params Search parameters
 * @returns An array of products matching the search criteria
 */
export async function searchProducts(params: ProductSearchParams): Promise<Product[]> {
  try {
    const { 
      category, 
      query, 
      minPrice, 
      maxPrice, 
      tags, 
      sortBy = 'newest', 
      limit: resultLimit = 20, 
      startAfter: lastDoc = null, 
      isActive = true, 
      isConfigurable 
    } = params;
    
    // Start building the query
    let q = collection(db, 'products');
    let queryConstraints: any[] = [];
    
    // Add filters
    if (category) {
      queryConstraints.push(where('category', '==', category));
    }
    
    if (isActive !== undefined) {
      queryConstraints.push(where('isActive', '==', isActive));
    }
    
    if (isConfigurable !== undefined) {
      queryConstraints.push(where('isConfigurable', '==', isConfigurable));
    }
    
    if (minPrice !== undefined) {
      queryConstraints.push(where('price', '>=', minPrice));
    }
    
    if (maxPrice !== undefined) {
      queryConstraints.push(where('price', '<=', maxPrice));
    }
    
    // Add sorting
    switch (sortBy) {
      case 'price_asc':
        queryConstraints.push(orderBy('price', 'asc'));
        break;
      case 'price_desc':
        queryConstraints.push(orderBy('price', 'desc'));
        break;
      case 'name_asc':
        queryConstraints.push(orderBy('name', 'asc'));
        break;
      case 'name_desc':
        queryConstraints.push(orderBy('name', 'desc'));
        break;
      case 'oldest':
        queryConstraints.push(orderBy('createdAt', 'asc'));
        break;
      default: // newest
        queryConstraints.push(orderBy('createdAt', 'desc'));
        break;
    }
    
    // Add pagination
    if (lastDoc) {
      queryConstraints.push(startAfter(lastDoc));
    }
    
    queryConstraints.push(limit(resultLimit));
    
    // Execute the query
    const productsQuery = query(q, ...queryConstraints);
    const querySnapshot = await getDocs(productsQuery);
    
    // Process results
    let products: Product[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      products.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as Product);
    });
    
    // Filter by tags and query (if provided) - doing this in memory as Firestore doesn't support array contains any with other queries
    if (tags && tags.length > 0) {
      products = products.filter(product => {
        if (!product.tags) return false;
        return tags.some(tag => product.tags?.includes(tag));
      });
    }
    
    if (query) {
      const lowerQuery = query.toLowerCase();
      products = products.filter(product => 
        product.name.toLowerCase().includes(lowerQuery) || 
        product.description.toLowerCase().includes(lowerQuery)
      );
    }
    
    return products;
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}

/**
 * Retrieve products by category
 * @param category The category of products to retrieve
 * @param limit The maximum number of products to retrieve
 * @returns An array of products in the specified category
 */
export async function getProductsByCategory(category: ProductCategory, limit: number = 20): Promise<Product[]> {
  return searchProducts({ category, limit });
}

/**
 * Retrieve featured products
 * @param limit The maximum number of products to retrieve
 * @returns An array of featured products
 */
export async function getFeaturedProducts(limit: number = 6): Promise<Product[]> {
  try {
    const featuredQuery = query(
      collection(db, 'products'),
      where('isActive', '==', true),
      where('featured', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limit)
    );
    
    const querySnapshot = await getDocs(featuredQuery);
    
    let products: Product[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      products.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as Product);
    });
    
    return products;
  } catch (error) {
    console.error('Error retrieving featured products:', error);
    return [];
  }
}

// ========== Configuration Storage Functions ==========

/**
 * Get the default configuration for a product category
 * @param category The product category
 * @returns The default configuration for the category
 */
export function getDefaultConfiguration(category: ProductCategory): ConfigState {
  const config = categoryConfigs[category];
  if (!config) return {};
  
  const defaultConfig: ConfigState = {};
  config.options.forEach(option => {
    defaultConfig[option.id] = option.defaultValue;
  });
  
  return defaultConfig;
}

/**
 * Save a product configuration to Firestore
 * @param userId The user ID
 * @param category The product category
 * @param config The product configuration
 * @param name Optional name for the saved configuration
 * @returns The ID of the saved configuration
 */
export async function saveConfiguration(
  userId: string,
  category: ProductCategory,
  config: ConfigState,
  name: string = 'My Configuration'
): Promise<string | null> {
  try {
    // Calculate the price based on the configuration
    const price = calculateProductPrice(category, config);
    
    const savedConfig = {
      userId,
      category,
      config,
      price,
      name,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Add to Firestore
    const docRef = doc(collection(db, 'savedConfigurations'));
    await setDoc(docRef, savedConfig);
    
    return docRef.id;
  } catch (error) {
    console.error('Error saving configuration:', error);
    return null;
  }
}

/**
 * Get all saved configurations for a user
 * @param userId The user ID
 * @returns An array of saved configurations
 */
export async function getSavedConfigurations(userId: string): Promise<any[]> {
  try {
    const savedConfigsQuery = query(
      collection(db, 'savedConfigurations'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(savedConfigsQuery);
    
    let savedConfigs: any[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      savedConfigs.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      });
    });
    
    return savedConfigs;
  } catch (error) {
    console.error('Error retrieving saved configurations:', error);
    return [];
  }
}

/**
 * Get a saved configuration by ID
 * @param configId The configuration ID
 * @returns The saved configuration or null if not found
 */
export async function getSavedConfigurationById(configId: string): Promise<any | null> {
  try {
    const configRef = doc(db, 'savedConfigurations', configId);
    const configSnap = await getDoc(configRef);
    
    if (configSnap.exists()) {
      const data = configSnap.data();
      return {
        id: configSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error retrieving saved configuration:', error);
    return null;
  }
}

/**
 * Delete a saved configuration
 * @param configId The configuration ID
 * @returns True if successful, false otherwise
 */
export async function deleteSavedConfiguration(configId: string): Promise<boolean> {
  try {
    const configRef = doc(db, 'savedConfigurations', configId);
    await deleteDoc(configRef);
    return true;
  } catch (error) {
    console.error('Error deleting saved configuration:', error);
    return false;
  }
}

// ========== Configuration Description Generation ==========

/**
 * Generate a human-readable description for a product configuration
 * @param category The product category
 * @param config The product configuration
 * @returns A human-readable description of the configuration
 */
export function generateConfigurationDescription(category: ProductCategory, config: ConfigState): string {
  const categoryConfig = categoryConfigs[category];
  if (!categoryConfig) return '';
  
  let description = '';
  
  switch (category) {
    case 'garages':
      const bays = config.bays?.[0] || 1;
      description = `${bays} bay oak frame garage`;
      
      if (config.catSlide) {
        description += ' with cat slide roof';
      }
      
      description += `, ${config.beamSize} beams`;
      
      if (config.trussType) {
        description += `, ${config.trussType} trusses`;
      }
      
      if (config.baySize === 'large') {
        description += ', large bay size';
      }
      break;
      
    case 'gazebos':
      description = `${config.size} oak frame gazebo`;
      
      if (config.roofStyle) {
        description += ` with ${config.roofStyle} roof`;
      }
      
      const sides = config.sides?.[0] || 0;
      if (sides > 0) {
        description += `, ${sides} enclosed side${sides > 1 ? 's' : ''}`;
      }
      
      if (config.floor) {
        description += ', with floor';
      }
      break;
      
    case 'porches':
      description = `${config.sizeType} oak frame porch`;
      
      if (config.trussType) {
        description += ` with ${config.trussType} truss`;
      }
      
      if (config.legType) {
        description += `, legs to ${config.legType}`;
      }
      break;
      
    case 'oak-beams':
      const { length, width, thickness } = config.dimensions || { length: 200, width: 15, thickness: 15 };
      description = `${config.oakType} oak beam, ${length}cm × ${width}cm × ${thickness}cm`;
      break;
      
    case 'oak-flooring':
      const { area } = config.area || { area: 25 };
      description = `${config.flooringType} oak flooring, ${area}m²`;
      
      if (config.finish && config.finish !== 'natural') {
        description += `, ${config.finish} finish`;
      }
      break;
      
    default:
      description = 'Custom product configuration';
      break;
  }
  
  return description;
}

// ========== Basket Integration Functions ==========


/**
 * Interface for basket items
 */
export interface BasketItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  price: number;
  configuration?: ConfigState;
  category?: ProductCategory;
  name: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Add a product to the user's basket
 * @param userId The user ID
 * @param productId The product ID
 * @param quantity The quantity to add
 * @param configuration Optional product configuration
 * @param category Optional product category (required if configuration is provided)
 * @returns The ID of the basket item
 */
export async function addToBasket(
  userId: string, 
  productId: string, 
  quantity: number = 1,
  configuration?: ConfigState,
  category?: ProductCategory
): Promise<string | null> {
  try {
    // Get the product details
    const product = await getProductById(productId);
    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }
    
    // Calculate price based on configuration if provided
    let price = product.price;
    let configDesc = '';
    
    if (configuration && category) {
      price = calculateProductPrice(category, configuration);
      configDesc = generateConfigurationDescription(category, configuration);
    }
    
    // Check if this item already exists in the basket (with same productId and configuration)
    let existingItem: BasketItem | null = null;
    
    if (configuration) {
      // For configured products, we need to compare configurations
      const basketQuery = query(
        collection(db, 'basket'),
        where('userId', '==', userId),
        where('productId', '==', productId)
      );
      
      const querySnapshot = await getDocs(basketQuery);
      querySnapshot.forEach((doc) => {
        const item = { id: doc.id, ...doc.data() } as BasketItem;
        const itemConfig = item.configuration || {};
        const areConfigsEqual = JSON.stringify(itemConfig) === JSON.stringify(configuration);
        
        if (areConfigsEqual) {
          existingItem = item;
        }
      });
    } else {
      // For standard products, just check by productId
      const basketQuery = query(
        collection(db, 'basket'),
        where('userId', '==', userId),
        where('productId', '==', productId),
        where('configuration', '==', null)
      );
      
      const querySnapshot = await getDocs(basketQuery);
      if (!querySnapshot.empty) {
        existingItem = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as BasketItem;
      }
    }
    
    if (existingItem) {
      // Update the quantity of the existing item
      const newQuantity = existingItem.quantity + quantity;
      const itemRef = doc(db, 'basket', existingItem.id);
      await updateDoc(itemRef, { 
        quantity: newQuantity,
        updatedAt: new Date()
      });
      
      return existingItem.id;
    } else {
      // Create a new basket item
      const basketItem = {
        userId,
        productId,
        quantity,
        price,
        configuration: configuration || null,
        category: category || null,
        name: configDesc || product.name,
        image: product.featuredImage || (product.images && product.images.length > 0 ? product.images[0] : null),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, 'basket'), basketItem);
      return docRef.id;
    }
  } catch (error) {
    console.error('Error adding to basket:', error);
    return null;
  }
}

/**
 * Update the quantity of a basket item
 * @param basketItemId The basket item ID
 * @param quantity The new quantity
 * @returns True if successful, false otherwise
 */
export async function updateBasketItemQuantity(basketItemId: string, quantity: number): Promise<boolean> {
  try {
    if (quantity <= 0) {
      // Remove the item if quantity is 0 or less
      return removeFromBasket(basketItemId);
    }
    
    const itemRef = doc(db, 'basket', basketItemId);
    await updateDoc(itemRef, { 
      quantity,
      updatedAt: new Date()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating basket item quantity:', error);
    return false;
  }
}

/**
 * Remove an item from the basket
 * @param basketItemId The basket item ID
 * @returns True if successful, false otherwise
 */
export async function removeFromBasket(basketItemId: string): Promise<boolean> {
  try {
    const itemRef = doc(db, 'basket', basketItemId);
    await deleteDoc(itemRef);
    return true;
  } catch (error) {
    console.error('Error removing from basket:', error);
    return false;
  }
}

/**
 * Get all items in a user's basket
 * @param userId The user ID
 * @returns An array of basket items
 */
export async function getBasketItems(userId: string): Promise<BasketItem[]> {
  try {
    const basketQuery = query(
      collection(db, 'basket'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(basketQuery);
    
    let basketItems: BasketItem[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      basketItems.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as BasketItem);
    });
    
    return basketItems;
  } catch (error) {
    console.error('Error retrieving basket items:', error);
    return [];
  }
}

/**
 * Clear all items from a user's basket
 * @param userId The user ID
 * @returns True if successful, false otherwise
 */
export async function clearBasket(userId: string): Promise<boolean> {
  try {
    const basketItems = await getBasketItems(userId);
    
    // If there are no items, return true immediately
    if (basketItems.length === 0) {
      return true;
    }
    
    // Delete each basket item
    const deletePromises = basketItems.map(item => removeFromBasket(item.id));
    const results = await Promise.all(deletePromises);
    
    // Check if all deletions were successful
    return results.every(result => result === true);
  } catch (error) {
    console.error('Error clearing basket:', error);
    return false;
  }
}

/**
 * Calculate the total price of items in a user's basket
 * @param userId The user ID
 * @returns The total price of all items in the basket
 */
export async function getBasketTotal(userId: string): Promise<number> {
  try {
    const basketItems = await getBasketItems(userId);
    return basketItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  } catch (error) {
    console.error('Error calculating basket total:', error);
    return 0;
  }
}
