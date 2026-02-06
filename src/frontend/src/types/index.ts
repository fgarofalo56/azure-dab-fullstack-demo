/**
 * TypeScript Type Definitions
 * Shared types for the DOT Transportation Data Portal
 */

// API Response types
export interface ApiResponse<T> {
  value: T[];
  '@odata.count'?: number;
  '@odata.nextLink'?: string;
}

// Category types
export interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategorySummary {
  // Note: DAB returns PascalCase field names from the database
  CategoryId: number;
  CategoryName: string;
  Description: string;
  Icon: string;
  Color: string;
  RecordCount: number;
  // Also support camelCase for compatibility
  categoryId?: number;
  categoryName?: string;
  description?: string;
  icon?: string;
  color?: string;
  recordCount?: number;
}

// State types
export interface State {
  id: number;
  code: string;
  name: string;
  region: string;
}

// Railroad types
export interface RailroadAccident {
  id: number;
  categoryId: number;
  reportingRailroadCode: string;
  reportingRailroadName: string;
  accidentDate: string;
  accidentTime: string | null;
  accidentYear: number;
  accidentMonth: number;
  stateId: number;
  countyName: string | null;
  subdivision: string | null;
  milepost: string | null;
  station: string | null;
  accidentTypeCode: string;
  accidentType: string;
  trainSpeed: number | null;
  maxSpeed: number | null;
  grossTonnage: number | null;
  trackType: string | null;
  trackClass: string | null;
  trainDirection: string | null;
  equipmentType: string | null;
  trainNumber: string | null;
  temperature: number | null;
  weatherCondition: string | null;
  visibility: string | null;
  hazmatCars: number;
  hazmatCarsDamaged: number;
  hazmatReleasedCars: number;
  personsEvacuated: number;
  totalKilled: number;
  totalInjured: number;
  equipmentDamage: number | null;
  trackDamage: number | null;
  totalDamage: number | null;
  createdAt: string;
  updatedAt: string;
  state?: State;
}

// Bridge types
export interface Bridge {
  id: number;
  categoryId: number;
  structureNumber: string;
  stateId: number;
  countyCode: number | null;
  countyName: string | null;
  latitude: number | null;
  longitude: number | null;
  featuresIntersected: string | null;
  facilityCarried: string | null;
  yearBuilt: number | null;
  yearReconstructed: number | null;
  structureLength: number | null;
  deckWidth: number | null;
  lanesOnStructure: number | null;
  lanesUnderStructure: number | null;
  averageDailyTraffic: number | null;
  averageDailyTruckTraffic: number | null;
  trafficDirection: string | null;
  mainStructureType: string | null;
  mainStructureMaterial: string | null;
  deckStructureType: string | null;
  deckCondition: number | null;
  superstructureCondition: number | null;
  substructureCondition: number | null;
  channelCondition: number | null;
  culvertCondition: number | null;
  overallCondition: 'Good' | 'Fair' | 'Poor' | null;
  structurallyDeficient: boolean;
  functionallyObsolete: boolean;
  lastInspectionDate: string | null;
  inspectionFrequency: number | null;
  ownerAgency: string | null;
  maintenanceResponsibility: string | null;
  createdAt: string;
  updatedAt: string;
  state?: State;
}

// Transit types
export interface TransitAgency {
  id: number;
  categoryId: number;
  ntdId: string;
  agencyName: string;
  city: string;
  stateId: number;
  uzaName: string | null;
  uzaPopulation: number | null;
  organizationType: string | null;
  reporterType: string | null;
  reportYear: number;
  vehiclesOperatedMaxService: number | null;
  unlinkedPassengerTrips: number | null;
  vehicleRevenueMiles: number | null;
  vehicleRevenueHours: number | null;
  passengerMilesTraveled: number | null;
  fareRevenuesEarned: number | null;
  totalOperatingExpenses: number | null;
  passengersPerHour: number | null;
  costPerTrip: number | null;
  fareCoveryRatio: number | null;
  createdAt: string;
  updatedAt: string;
  state?: State;
}

// Vehicle fatality types
export interface VehicleFatality {
  id: number;
  categoryId: number;
  caseNumber: string;
  stateId: number;
  countyCode: number | null;
  countyName: string | null;
  city: string | null;
  crashDate: string;
  crashTime: string | null;
  crashYear: number;
  crashMonth: number;
  dayOfWeek: string | null;
  latitude: number | null;
  longitude: number | null;
  routeType: string | null;
  roadwayFunctionClass: string | null;
  mannerOfCollision: string | null;
  firstHarmfulEvent: string | null;
  lightCondition: string | null;
  weatherCondition: string | null;
  roadSurfaceCondition: string | null;
  numberOfVehicles: number;
  numberOfMotorVehicles: number | null;
  numberOfParkedVehicles: number | null;
  numberOfPersons: number;
  numberOfFatalities: number;
  numberOfDrunkDrivers: number;
  involvesLargeTruck: boolean;
  involvesMotorcycle: boolean;
  involvesPedestrian: boolean;
  involvesBicyclist: boolean;
  involvesSpeedRelated: boolean;
  schoolBusRelated: boolean;
  workZoneRelated: boolean;
  landUse: 'Rural' | 'Urban' | null;
  createdAt: string;
  updatedAt: string;
  state?: State;
}

// Summary view types
export interface RailroadAccidentsByState {
  stateCode: string;
  stateName: string;
  region: string;
  totalAccidents: number;
  totalFatalities: number;
  totalInjuries: number;
  totalDamage: number;
  earliestAccident: string;
  latestAccident: string;
}

export interface BridgeConditionByState {
  stateCode: string;
  stateName: string;
  region: string;
  totalBridges: number;
  goodCondition: number;
  fairCondition: number;
  poorCondition: number;
  structurallyDeficient: number;
  avgYearBuilt: number;
  totalDailyTraffic: number;
}

export interface TransitSummaryByState {
  stateCode: string;
  stateName: string;
  region: string;
  totalAgencies: number;
  totalRidership: number;
  totalVehicleMiles: number;
  totalExpenses: number;
  totalFareRevenue: number;
  latestReportYear: number;
}

export interface VehicleFatalitiesByState {
  stateCode: string;
  stateName: string;
  region: string;
  crashYear: number;
  totalCrashes: number;
  totalFatalities: number;
  alcoholRelated: number;
  speedRelated: number;
  pedestrianInvolved: number;
  motorcycleInvolved: number;
}

// Component prop types
export interface DataTableColumn<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface FilterOption {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains';
  value: string | number | boolean;
}
