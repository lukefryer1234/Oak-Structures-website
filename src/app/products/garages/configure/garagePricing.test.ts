import { calculatePrice, GarageConfigData } from './garagePricing'; // Removed GarageConfigOption, GarageConfigValue as they are not directly used in tests, only via GarageConfigData

describe('calculatePrice for Garages', () => {
  const mockGarageConfig: GarageConfigData = {
    title: "Test Garage Config",
    basePrice: 7500, // Base price, assumed for 1 bay with all default options having 0 priceImpact
    options: [
      {
        id: "bays", // This option's value is used as a multiplier for perBay options
        label: "Number of Bays",
        type: "slider",
        min: 1,
        max: 4,
        step: 1,
        defaultValue: [1], // Default to 1 bay for base price calculation
      },
      {
        id: "beamSize",
        label: "Structural Beam Sizes",
        type: "select",
        defaultValue: "6x6",
        values: {
          "6x6": { label: "6 inch x 6 inch", priceImpact: 0, perBay: true },
          "7x7": { label: "7 inch x 7 inch", priceImpact: 250, perBay: true }, // +250 per bay
          "8x8": { label: "8 inch x 8 inch", priceImpact: 500, perBay: true }  // +500 per bay
        }
      },
      {
        id: "trussType",
        label: "Truss Type",
        type: "radio",
        defaultValue: "straight",
        values: {
          "straight": { label: "Straight", priceImpact: 0, perBay: false },      // Base
          "curved": { label: "Curved", priceImpact: 150, perBay: false }        // +150 one-off
        }
      },
      {
        id: "baySize",
        label: "Size Per Bay",
        type: "select",
        defaultValue: "standard",
        values: {
            "standard": { label: "Standard (e.g., 3m wide)", priceImpact: 0, perBay: true },
            "large": { label: "Large (e.g., 3.5m wide)", priceImpact: 350, perBay: true } // +350 per bay
        }
      },
      {
        id: "catSlide",
        label: "Include Cat Slide Roof?",
        type: "checkbox",
        defaultValue: false,
        priceImpact: 300, // +300 if true
        perBay: true      // per bay
      }
    ]
  };

  it('should be defined', () => {
    expect(calculatePrice).toBeDefined();
  });

  // Test 1: Base Price Calculation
  it('should return the base price for default options and quantity 1', () => {
    const defaultConfigState = {
      bays: [1],
      beamSize: '6x6',
      trussType: 'straight',
      baySize: 'standard',
      catSlide: false
    };
    const quantity = 1;
    // Expected: basePrice (7500)
    // beamSize "6x6": priceImpact 0 * 1 bay = 0
    // trussType "straight": priceImpact 0 = 0
    // baySize "standard": priceImpact 0 * 1 bay = 0
    // catSlide false: priceImpact 0 = 0
    // Total = 7500
    expect(calculatePrice(defaultConfigState, quantity, mockGarageConfig)).toBeCloseTo(7500);
  });

  // Test 2: Single Option Price Impact (Non-perBay)
  it('should add cost for a non-perBay option', () => {
    const configState = {
      bays: [1],
      beamSize: '6x6',
      trussType: 'curved', // Changed: +150 (non-perBay)
      baySize: 'standard',
      catSlide: false
    };
    const quantity = 1;
    // Expected: basePrice (7500) + trussType_curved (150) = 7650
    expect(calculatePrice(configState, quantity, mockGarageConfig)).toBeCloseTo(7650);
  });

  // Test 3: Single Option Price Impact (perBay)
  it('should add cost for a perBay option, scaled by number of bays', () => {
    const configState = {
      bays: [2], // 2 bays
      beamSize: '7x7', // Changed: +250 perBay
      trussType: 'straight',
      baySize: 'standard',
      catSlide: false
    };
    const quantity = 1;
    // Expected: basePrice (7500) + (beamSize_7x7_priceImpact (250) * 2 bays) = 7500 + 500 = 8000
    expect(calculatePrice(configState, quantity, mockGarageConfig)).toBeCloseTo(8000);
  });

  // Test 4: Checkbox Option (perBay, checked)
  it('should add cost for a checked perBay checkbox, scaled by number of bays', () => {
    const configState = {
      bays: [3], // 3 bays
      beamSize: '6x6',
      trussType: 'straight',
      baySize: 'standard',
      catSlide: true // Changed: +300 perBay
    };
    const quantity = 1;
    // Expected: basePrice (7500) + (catSlide_priceImpact (300) * 3 bays) = 7500 + 900 = 8400
    expect(calculatePrice(configState, quantity, mockGarageConfig)).toBeCloseTo(8400);
  });

  // Test 5: Checkbox Option (unchecked)
  it('should not add cost for an unchecked checkbox option', () => {
    const configState = {
      bays: [1],
      beamSize: '6x6',
      trussType: 'straight',
      baySize: 'standard',
      catSlide: false // Unchanged: 0 cost
    };
    const quantity = 1;
    // Expected: basePrice (7500)
    expect(calculatePrice(configState, quantity, mockGarageConfig)).toBeCloseTo(7500);
  });

  // Test 6: Multiple Options Combined
  it('should correctly sum costs for multiple options combined', () => {
    const configState = {
      bays: [2],         // 2 bays
      beamSize: '8x8',   // +500 perBay
      trussType: 'curved', // +150 non-perBay
      baySize: 'large',  // +350 perBay
      catSlide: true     // +300 perBay
    };
    const quantity = 1;
    // Expected:
    // basePrice: 7500
    // beamSize '8x8': 500 * 2 bays = 1000
    // trussType 'curved': 150 (non-perBay) = 150
    // baySize 'large': 350 * 2 bays = 700
    // catSlide true: 300 * 2 bays = 600
    // Total = 7500 + 1000 + 150 + 700 + 600 = 9950
    expect(calculatePrice(configState, quantity, mockGarageConfig)).toBeCloseTo(9950);
  });

  // Test 7: Overall Quantity Impact
  it('should multiply the single unit price by the overall quantity', () => {
    const configState = {
      bays: [2],
      beamSize: '8x8',   // +500 perBay => 1000 for 2 bays
      trussType: 'curved', // +150 non-perBay => 150
      baySize: 'large',  // +350 perBay => 700 for 2 bays
      catSlide: true     // +300 perBay => 600 for 2 bays
    };
    const quantity = 3;
    // Single unit price from Test 6 is 9950
    // Total for 3 units = 9950 * 3 = 29850
    expect(calculatePrice(configState, quantity, mockGarageConfig)).toBeCloseTo(29850);
  });

  // Test 8: Handling of Undefined/Null Config Data
  it('should return null if configData is undefined', () => {
    const configState = { bays: [1] };
    const quantity = 1;
    expect(calculatePrice(configState, quantity, undefined)).toBeNull();
  });

  it('should return null if configData is null', () => {
    const configState = { bays: [1] };
    const quantity = 1;
    expect(calculatePrice(configState, quantity, null as any)).toBeNull(); // Cast as any to satisfy TS for test
  });

  // Test 9: Slider 'bays' Price Logic (Interaction with basePrice and perBay options)
  // This test assumes basePrice is for ONE bay and other options are additional.
  // The 'bays' slider itself does not add its own priceImpact in the current calculatePrice logic;
  // it only acts as a multiplier for other perBay options.
  describe('Slider "bays" interaction with pricing', () => {
    it('should calculate correct price for 1 bay with default options', () => {
      const configState = {
        bays: [1],
        beamSize: '6x6', // 0 impact
        trussType: 'straight', // 0 impact
        baySize: 'standard', // 0 impact
        catSlide: false, // 0 impact
      };
      // Expected: 7500 (basePrice for 1 bay)
      expect(calculatePrice(configState, 1, mockGarageConfig)).toBeCloseTo(7500);
    });

    it('should correctly apply perBay costs when increasing to 2 bays', () => {
      const configState = {
        bays: [2], // 2 bays
        beamSize: '7x7', // +250 perBay
        trussType: 'straight', // 0 impact
        baySize: 'standard', // 0 impact
        catSlide: false, // 0 impact
      };
      // Expected: basePrice (7500) + (beamSize '7x7' 250 * 2 bays) = 7500 + 500 = 8000
      expect(calculatePrice(configState, 1, mockGarageConfig)).toBeCloseTo(8000);
    });

    it('should correctly apply perBay costs for multiple items with 3 bays', () => {
        const configState = {
          bays: [3], // 3 bays
          beamSize: '6x6',     // 0 * 3 = 0
          trussType: 'straight', // 0
          baySize: 'large',    // 350 * 3 = 1050
          catSlide: true,      // 300 * 3 = 900
        };
        // Expected: basePrice (7500) + baySize_large (1050) + catSlide_true (900) = 7500 + 1050 + 900 = 9450
        expect(calculatePrice(configState, 1, mockGarageConfig)).toBeCloseTo(9450);
      });
  });

  // Test for edge case: 0 quantity (should result in 0 price)
  it('should return 0 if quantity is 0', () => {
    const configState = {
        bays: [1], beamSize: '6x6', trussType: 'straight', catSlide: false, baySize: 'standard'
    };
    expect(calculatePrice(configState, 0, mockGarageConfig)).toBeCloseTo(0);
  });

  // Test for negative quantity (should behave like 0 or positive, current logic will multiply by negative)
  // The calculatePrice function itself doesn't prevent negative quantity, that's UI/state logic.
  // So, it will return basePrice * -1 if quantity is -1.
  // This test just confirms the current behavior of calculatePrice.
  it('should return a negative price if quantity is negative (confirming raw function behavior)', () => {
    const configState = {
        bays: [1], beamSize: '6x6', trussType: 'straight', catSlide: false, baySize: 'standard'
    };
    // Expected: 7500 * -1 = -7500
    expect(calculatePrice(configState, -1, mockGarageConfig)).toBeCloseTo(-7500);
  });

});
