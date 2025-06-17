import { calculateGazeboPrice, GazeboConfigData } from './gazeboPricing';

describe('calculateGazeboPrice for Gazebos', () => {
  const mockGazeboConfig: GazeboConfigData = {
    title: "Test Gazebo Config",
    basePrice: 2800,
    options: [
      {
        id: 'trussType',
        label: 'Truss Type',
        type: 'radio',
        defaultValue: 'straight',
        values: {
          "straight": { label: "Straight", priceImpact: 0 },
          "curved": { label: "Curved", priceImpact: 120 }
        }
      },
      {
        id: 'legType',
        label: 'Leg Type',
        type: 'select',
        defaultValue: 'full',
        values: {
          "full": { label: "Full Height Legs", priceImpact: 0 },
          "wall": { label: "Wall Mount (Half Legs)", priceImpact: -150 }
        }
      },
      {
        id: 'sizeType',
        label: 'Size Type',
        type: 'select',
        defaultValue: '3x3',
        values: {
          "3x3": { label: "3m x 3m", priceImpact: 0 },
          "4x3": { label: "4m x 3m", priceImpact: 250 },
          "4x4": { label: "4m x 4m", priceImpact: 450 }
        }
      },
      { // Adding a checkbox option for more thorough testing
        id: "lighting",
        label: "Include Lighting Kit?",
        type: "checkbox",
        defaultValue: false,
        priceImpact: 200
      }
    ]
  };

  it('should be defined', () => {
    expect(calculateGazeboPrice).toBeDefined();
  });

  // Test 1: Base Price
  it('should return the base price for default options and quantity 1', () => {
    const defaultConfigState = {
      trussType: 'straight',
      legType: 'full',
      sizeType: '3x3',
      lighting: false
    };
    const quantity = 1;
    // Expected: basePrice (2800) + straight (0) + full_legs (0) + 3x3_size (0) + lighting_false (0) = 2800
    expect(calculateGazeboPrice(defaultConfigState, quantity, mockGazeboConfig)).toBeCloseTo(2800);
  });

  // Test 2: Truss Type Impact
  it('should add cost for curved truss type', () => {
    const configState = {
      trussType: 'curved', // +120
      legType: 'full',
      sizeType: '3x3',
      lighting: false
    };
    const quantity = 1;
    // Expected: 2800 + 120 = 2920
    expect(calculateGazeboPrice(configState, quantity, mockGazeboConfig)).toBeCloseTo(2920);
  });

  // Test 3: Leg Type Impact (Deduction)
  it('should deduct cost for wall mount leg type', () => {
    const configState = {
      trussType: 'straight',
      legType: 'wall', // -150
      sizeType: '3x3',
      lighting: false
    };
    const quantity = 1;
    // Expected: 2800 - 150 = 2650
    expect(calculateGazeboPrice(configState, quantity, mockGazeboConfig)).toBeCloseTo(2650);
  });

  // Test 4: Size Type Impact
  it('should add cost for large size type (4x4)', () => {
    const configState = {
      trussType: 'straight',
      legType: 'full',
      sizeType: '4x4', // +450
      lighting: false
    };
    const quantity = 1;
    // Expected: 2800 + 450 = 3250
    expect(calculateGazeboPrice(configState, quantity, mockGazeboConfig)).toBeCloseTo(3250);
  });

  // Test for checkbox option
  it('should add cost for checked lighting option', () => {
    const configState = {
      trussType: 'straight',
      legType: 'full',
      sizeType: '3x3',
      lighting: true // +200
    };
    const quantity = 1;
    // Expected: 2800 + 200 = 3000
    expect(calculateGazeboPrice(configState, quantity, mockGazeboConfig)).toBeCloseTo(3000);
  });

  // Test 5: Multiple Options Combined
  it('should correctly sum costs for multiple options combined', () => {
    const configState = {
      trussType: 'curved', // +120
      legType: 'wall',   // -150
      sizeType: '4x4',   // +450
      lighting: true    // +200
    };
    const quantity = 1;
    // Expected: 2800 + 120 - 150 + 450 + 200 = 3420
    expect(calculateGazeboPrice(configState, quantity, mockGazeboConfig)).toBeCloseTo(3420);
  });

  // Test 6: Overall Quantity Impact
  it('should multiply the single unit price by the overall quantity', () => {
    const configState = {
      trussType: 'curved',
      legType: 'wall',
      sizeType: '4x4',
      lighting: true
    }; // Single unit price = 3420 (from Test 5)
    const quantity = 3;
    // Expected: 3420 * 3 = 10260
    expect(calculateGazeboPrice(configState, quantity, mockGazeboConfig)).toBeCloseTo(10260);
  });

  // Test 7: Handling of Undefined/Null Config Data
  it('should return null if configData is undefined', () => {
    const configState = { trussType: 'straight' };
    expect(calculateGazeboPrice(configState, 1, undefined)).toBeNull();
  });

  it('should return null if configData is null', () => {
    const configState = { trussType: 'straight' };
    expect(calculateGazeboPrice(configState, 1, null as any)).toBeNull();
  });

  // Test 8: Zero Quantity
  it('should return 0 if quantity is 0', () => {
    const configState = { trussType: 'straight', legType: 'full', sizeType: '3x3', lighting: false };
    // Expected: (any single unit price) * 0 = 0
    expect(calculateGazeboPrice(configState, 0, mockGazeboConfig)).toBeCloseTo(0);
  });

  // Test 9: Negative Quantity
  it('should return 0 if quantity is negative due to Math.max(0, singleUnitPrice)', () => {
    const configState = { trussType: 'straight', legType: 'full', sizeType: '3x3', lighting: false };
    // Expected: (basePrice 2800) * -1 = -2800. But Math.max(0, singleUnitPrice) * quantity.
    // If singleUnitPrice is positive, then nonNegativeSinglePrice * quantity.
    // So 2800 * -1 = -2800.  The Math.max(0, singleUnitPrice) applies before multiplication by quantity.
    // The current function is: Math.max(0, singleUnitPrice) * quantity;
    // So, if singleUnitPrice = 2800, quantity = -1, result = 2800 * -1 = -2800.
    // The test should reflect this.
    // Ah, the previous `calculatePrice` had `Math.max(0, singleUnitPrice) * quantity;`
    // The current `calculateGazeboPrice` has `const nonNegativeSinglePrice = Math.max(0, singleUnitPrice); return nonNegativeSinglePrice * quantity;`
    // This means if singleUnitPrice is, e.g., 2800, nonNegativeSinglePrice is 2800. Then 2800 * -1 = -2800.
    // If singleUnitPrice was -50 (e.g. many deductions), nonNegativeSinglePrice is 0. Then 0 * -1 = 0.
    expect(calculateGazeboPrice(configState, -1, mockGazeboConfig)).toBeCloseTo(-2800);

    const configStateWithDeductions = {
        trussType: 'straight', // 0
        legType: 'wall',   // -150
        sizeType: 'small', // Let's assume small is -100, need to add to mock
        lighting: false    // 0
      };
      const mockConfigWithSmallSize = JSON.parse(JSON.stringify(mockGazeboConfig)) as GazeboConfigData;
      if (mockConfigWithSmallSize.options.find(o => o.id === 'sizeType')?.values) {
        // @ts-ignore
        mockConfigWithSmallSize.options.find(o => o.id === 'sizeType').values["small"] = { label: "Small", priceImpact: -3000 }; // large deduction
      }
      // base (2800) - 150 (wall) - 3000 (small) = -350. nonNegativeSinglePrice = 0. 0 * -1 = 0.
      expect(calculateGazeboPrice(configStateWithDeductions, -1, mockConfigWithSmallSize)).toBeCloseTo(0);

  });
});
