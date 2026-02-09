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

// State types - supports both camelCase and PascalCase (DAB returns PascalCase)
export interface State {
  // PascalCase (DAB response)
  Id: number;
  Code: string;
  Name: string;
  Region: string;
  // camelCase for compatibility
  id?: number;
  code?: string;
  name?: string;
  region?: string;
}

// Railroad types - supports both camelCase and PascalCase (DAB returns PascalCase)
export interface RailroadAccident {
  // PascalCase (DAB response)
  Id: number;
  CategoryId: number;
  ReportingRailroadCode: string;
  ReportingRailroadName: string;
  AccidentDate: string;
  AccidentTime: string | null;
  AccidentYear: number;
  AccidentMonth: number;
  StateId: number;
  CountyName: string | null;
  Subdivision: string | null;
  Milepost: string | null;
  Station: string | null;
  AccidentTypeCode: string;
  AccidentType: string;
  TrainSpeed: number | null;
  MaxSpeed: number | null;
  GrossTonnage: number | null;
  TrackType: string | null;
  TrackClass: string | null;
  TrainDirection: string | null;
  EquipmentType: string | null;
  TrainNumber: string | null;
  Temperature: number | null;
  WeatherCondition: string | null;
  Visibility: string | null;
  HazmatCars: number;
  HazmatCarsDamaged: number;
  HazmatReleasedCars: number;
  PersonsEvacuated: number;
  TotalKilled: number;
  TotalInjured: number;
  EquipmentDamage: number | null;
  TrackDamage: number | null;
  TotalDamage: number | null;
  CreatedAt: string;
  UpdatedAt: string;
  State?: State;
  // camelCase for compatibility
  id?: number;
  categoryId?: number;
  reportingRailroadCode?: string;
  reportingRailroadName?: string;
  accidentDate?: string;
  accidentTime?: string | null;
  accidentYear?: number;
  accidentMonth?: number;
  stateId?: number;
  countyName?: string | null;
  subdivision?: string | null;
  milepost?: string | null;
  station?: string | null;
  accidentTypeCode?: string;
  accidentType?: string;
  trainSpeed?: number | null;
  maxSpeed?: number | null;
  grossTonnage?: number | null;
  trackType?: string | null;
  trackClass?: string | null;
  trainDirection?: string | null;
  equipmentType?: string | null;
  trainNumber?: string | null;
  temperature?: number | null;
  weatherCondition?: string | null;
  visibility?: string | null;
  hazmatCars?: number;
  hazmatCarsDamaged?: number;
  hazmatReleasedCars?: number;
  personsEvacuated?: number;
  totalKilled?: number;
  totalInjured?: number;
  equipmentDamage?: number | null;
  trackDamage?: number | null;
  totalDamage?: number | null;
  createdAt?: string;
  updatedAt?: string;
  state?: State;
}

// Bridge types - supports both camelCase and PascalCase (DAB returns PascalCase)
export interface Bridge {
  // PascalCase (DAB response)
  Id: number;
  CategoryId: number;
  StructureNumber: string;
  StateId: number;
  CountyCode: number | null;
  CountyName: string | null;
  Latitude: number | null;
  Longitude: number | null;
  FeaturesIntersected: string | null;
  FacilityCarried: string | null;
  YearBuilt: number | null;
  YearReconstructed: number | null;
  StructureLength: number | null;
  DeckWidth: number | null;
  LanesOnStructure: number | null;
  LanesUnderStructure: number | null;
  AverageDailyTraffic: number | null;
  AverageDailyTruckTraffic: number | null;
  TrafficDirection: string | null;
  MainStructureType: string | null;
  MainStructureMaterial: string | null;
  DeckStructureType: string | null;
  DeckCondition: number | null;
  SuperstructureCondition: number | null;
  SubstructureCondition: number | null;
  ChannelCondition: number | null;
  CulvertCondition: number | null;
  OverallCondition: 'Good' | 'Fair' | 'Poor' | null;
  StructurallyDeficient: boolean;
  FunctionallyObsolete: boolean;
  LastInspectionDate: string | null;
  InspectionFrequency: number | null;
  OwnerAgency: string | null;
  MaintenanceResponsibility: string | null;
  CreatedAt: string;
  UpdatedAt: string;
  State?: State;
  // camelCase for compatibility
  id?: number;
  categoryId?: number;
  structureNumber?: string;
  stateId?: number;
  countyCode?: number | null;
  countyName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  featuresIntersected?: string | null;
  facilityCarried?: string | null;
  yearBuilt?: number | null;
  yearReconstructed?: number | null;
  structureLength?: number | null;
  deckWidth?: number | null;
  lanesOnStructure?: number | null;
  lanesUnderStructure?: number | null;
  averageDailyTraffic?: number | null;
  averageDailyTruckTraffic?: number | null;
  trafficDirection?: string | null;
  mainStructureType?: string | null;
  mainStructureMaterial?: string | null;
  deckStructureType?: string | null;
  deckCondition?: number | null;
  superstructureCondition?: number | null;
  substructureCondition?: number | null;
  channelCondition?: number | null;
  culvertCondition?: number | null;
  overallCondition?: 'Good' | 'Fair' | 'Poor' | null;
  structurallyDeficient?: boolean;
  functionallyObsolete?: boolean;
  lastInspectionDate?: string | null;
  inspectionFrequency?: number | null;
  ownerAgency?: string | null;
  maintenanceResponsibility?: string | null;
  createdAt?: string;
  updatedAt?: string;
  state?: State;
}

// Transit types - supports both camelCase and PascalCase (DAB returns PascalCase)
export interface TransitAgency {
  // PascalCase (DAB response)
  Id: number;
  CategoryId: number;
  NtdId: string;
  AgencyName: string;
  City: string;
  StateId: number;
  UzaName: string | null;
  UzaPopulation: number | null;
  OrganizationType: string | null;
  ReporterType: string | null;
  ReportYear: number;
  VehiclesOperatedMaxService: number | null;
  UnlinkedPassengerTrips: number | null;
  VehicleRevenueMiles: number | null;
  VehicleRevenueHours: number | null;
  PassengerMilesTraveled: number | null;
  FareRevenuesEarned: number | null;
  TotalOperatingExpenses: number | null;
  PassengersPerHour: number | null;
  CostPerTrip: number | null;
  FareCoveryRatio: number | null;
  CreatedAt: string;
  UpdatedAt: string;
  State?: State;
  // camelCase for compatibility
  id?: number;
  categoryId?: number;
  ntdId?: string;
  agencyName?: string;
  city?: string;
  stateId?: number;
  uzaName?: string | null;
  uzaPopulation?: number | null;
  organizationType?: string | null;
  reporterType?: string | null;
  reportYear?: number;
  vehiclesOperatedMaxService?: number | null;
  unlinkedPassengerTrips?: number | null;
  vehicleRevenueMiles?: number | null;
  vehicleRevenueHours?: number | null;
  passengerMilesTraveled?: number | null;
  fareRevenuesEarned?: number | null;
  totalOperatingExpenses?: number | null;
  passengersPerHour?: number | null;
  costPerTrip?: number | null;
  fareCoveryRatio?: number | null;
  createdAt?: string;
  updatedAt?: string;
  state?: State;
}

// Vehicle fatality types - supports both camelCase and PascalCase (DAB returns PascalCase)
export interface VehicleFatality {
  // PascalCase (DAB response)
  Id: number;
  CategoryId: number;
  CaseNumber: string;
  StateId: number;
  CountyCode: number | null;
  CountyName: string | null;
  City: string | null;
  CrashDate: string;
  CrashTime: string | null;
  CrashYear: number;
  CrashMonth: number;
  DayOfWeek: string | null;
  Latitude: number | null;
  Longitude: number | null;
  RouteType: string | null;
  RoadwayFunctionClass: string | null;
  MannerOfCollision: string | null;
  FirstHarmfulEvent: string | null;
  LightCondition: string | null;
  WeatherCondition: string | null;
  RoadSurfaceCondition: string | null;
  NumberOfVehicles: number;
  NumberOfMotorVehicles: number | null;
  NumberOfParkedVehicles: number | null;
  NumberOfPersons: number;
  NumberOfFatalities: number;
  NumberOfDrunkDrivers: number;
  InvolvesLargeTruck: boolean;
  InvolvesMotorcycle: boolean;
  InvolvesPedestrian: boolean;
  InvolvesBicyclist: boolean;
  InvolvesSpeedRelated: boolean;
  SchoolBusRelated: boolean;
  WorkZoneRelated: boolean;
  LandUse: 'Rural' | 'Urban' | null;
  CreatedAt: string;
  UpdatedAt: string;
  State?: State;
  // camelCase for compatibility
  id?: number;
  categoryId?: number;
  caseNumber?: string;
  stateId?: number;
  countyCode?: number | null;
  countyName?: string | null;
  city?: string | null;
  crashDate?: string;
  crashTime?: string | null;
  crashYear?: number;
  crashMonth?: number;
  dayOfWeek?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  routeType?: string | null;
  roadwayFunctionClass?: string | null;
  mannerOfCollision?: string | null;
  firstHarmfulEvent?: string | null;
  lightCondition?: string | null;
  weatherCondition?: string | null;
  roadSurfaceCondition?: string | null;
  numberOfVehicles?: number;
  numberOfMotorVehicles?: number | null;
  numberOfParkedVehicles?: number | null;
  numberOfPersons?: number;
  numberOfFatalities?: number;
  numberOfDrunkDrivers?: number;
  involvesLargeTruck?: boolean;
  involvesMotorcycle?: boolean;
  involvesPedestrian?: boolean;
  involvesBicyclist?: boolean;
  involvesSpeedRelated?: boolean;
  schoolBusRelated?: boolean;
  workZoneRelated?: boolean;
  landUse?: 'Rural' | 'Urban' | null;
  createdAt?: string;
  updatedAt?: string;
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
