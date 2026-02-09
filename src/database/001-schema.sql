-- ============================================
-- DOT Transportation Data Demo - Database Schema
-- Department of Transportation Sample Data
-- ============================================

-- Drop existing tables if they exist (for clean reinstall)
IF OBJECT_ID('dbo.RailroadAccidents', 'U') IS NOT NULL DROP TABLE dbo.RailroadAccidents;
IF OBJECT_ID('dbo.Bridges', 'U') IS NOT NULL DROP TABLE dbo.Bridges;
IF OBJECT_ID('dbo.TransitAgencies', 'U') IS NOT NULL DROP TABLE dbo.TransitAgencies;
IF OBJECT_ID('dbo.VehicleFatalities', 'U') IS NOT NULL DROP TABLE dbo.VehicleFatalities;
IF OBJECT_ID('dbo.States', 'U') IS NOT NULL DROP TABLE dbo.States;
IF OBJECT_ID('dbo.Categories', 'U') IS NOT NULL DROP TABLE dbo.Categories;
GO

-- ============================================
-- Reference Tables
-- ============================================

-- Categories table for grouping DOT data types
CREATE TABLE dbo.Categories (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL UNIQUE,
    Description NVARCHAR(500) NOT NULL,
    Icon NVARCHAR(50) NOT NULL,
    Color NVARCHAR(20) NOT NULL,
    SortOrder INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- States reference table
CREATE TABLE dbo.States (
    Id INT PRIMARY KEY,
    Code CHAR(2) NOT NULL UNIQUE,
    Name NVARCHAR(100) NOT NULL,
    Region NVARCHAR(50) NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);

-- ============================================
-- Railroad Data (FRA Form 54)
-- ============================================

CREATE TABLE dbo.RailroadAccidents (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CategoryId INT NOT NULL DEFAULT 1,

    -- Railroad identification
    ReportingRailroadCode NVARCHAR(10) NOT NULL,
    ReportingRailroadName NVARCHAR(200) NOT NULL,

    -- Date/Time
    AccidentDate DATE NOT NULL,
    AccidentTime NVARCHAR(10) NULL,
    AccidentYear INT NOT NULL,
    AccidentMonth INT NOT NULL,

    -- Location
    StateId INT NOT NULL,
    CountyName NVARCHAR(100) NULL,
    Subdivision NVARCHAR(100) NULL,
    Milepost NVARCHAR(20) NULL,
    Station NVARCHAR(100) NULL,

    -- Accident details
    AccidentTypeCode NVARCHAR(10) NOT NULL,
    AccidentType NVARCHAR(100) NOT NULL,
    TrainSpeed INT NULL,
    MaxSpeed INT NULL,
    GrossTonnage DECIMAL(12,2) NULL,

    -- Track information
    TrackType NVARCHAR(50) NULL,
    TrackClass NVARCHAR(10) NULL,
    TrainDirection NVARCHAR(50) NULL,

    -- Equipment
    EquipmentType NVARCHAR(100) NULL,
    TrainNumber NVARCHAR(50) NULL,

    -- Weather/Visibility
    Temperature INT NULL,
    WeatherCondition NVARCHAR(50) NULL,
    Visibility NVARCHAR(50) NULL,

    -- Hazmat
    HazmatCars INT NULL DEFAULT 0,
    HazmatCarsDamaged INT NULL DEFAULT 0,
    HazmatReleasedCars INT NULL DEFAULT 0,
    PersonsEvacuated INT NULL DEFAULT 0,

    -- Casualties and damage
    TotalKilled INT NOT NULL DEFAULT 0,
    TotalInjured INT NOT NULL DEFAULT 0,
    EquipmentDamage DECIMAL(15,2) NULL,
    TrackDamage DECIMAL(15,2) NULL,
    TotalDamage DECIMAL(15,2) NULL,

    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),

    CONSTRAINT FK_RailroadAccidents_Category FOREIGN KEY (CategoryId) REFERENCES dbo.Categories(Id),
    CONSTRAINT FK_RailroadAccidents_State FOREIGN KEY (StateId) REFERENCES dbo.States(Id)
);

CREATE INDEX IX_RailroadAccidents_StateId ON dbo.RailroadAccidents(StateId);
CREATE INDEX IX_RailroadAccidents_AccidentDate ON dbo.RailroadAccidents(AccidentDate);
CREATE INDEX IX_RailroadAccidents_AccidentType ON dbo.RailroadAccidents(AccidentType);
CREATE INDEX IX_RailroadAccidents_CategoryId ON dbo.RailroadAccidents(CategoryId);

-- ============================================
-- Bridge Data (National Bridge Inventory)
-- ============================================

CREATE TABLE dbo.Bridges (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CategoryId INT NOT NULL DEFAULT 2,

    -- Identification
    StructureNumber NVARCHAR(20) NOT NULL,
    StateId INT NOT NULL,
    CountyCode INT NULL,
    CountyName NVARCHAR(100) NULL,

    -- Location
    Latitude DECIMAL(10,6) NULL,
    Longitude DECIMAL(10,6) NULL,
    FeaturesIntersected NVARCHAR(200) NULL,
    FacilityCarried NVARCHAR(200) NULL,

    -- Physical characteristics
    YearBuilt INT NULL,
    YearReconstructed INT NULL,
    StructureLength DECIMAL(10,2) NULL, -- in meters
    DeckWidth DECIMAL(10,2) NULL, -- in meters
    LanesOnStructure INT NULL,
    LanesUnderStructure INT NULL,

    -- Traffic
    AverageDailyTraffic INT NULL,
    AverageDailyTruckTraffic INT NULL,
    TrafficDirection NVARCHAR(20) NULL,

    -- Structure type
    MainStructureType NVARCHAR(100) NULL,
    MainStructureMaterial NVARCHAR(100) NULL,
    DeckStructureType NVARCHAR(100) NULL,

    -- Condition ratings (0-9 scale, 9 = excellent)
    DeckCondition INT NULL CHECK (DeckCondition BETWEEN 0 AND 9),
    SuperstructureCondition INT NULL CHECK (SuperstructureCondition BETWEEN 0 AND 9),
    SubstructureCondition INT NULL CHECK (SubstructureCondition BETWEEN 0 AND 9),
    ChannelCondition INT NULL CHECK (ChannelCondition BETWEEN 0 AND 9),
    CulvertCondition INT NULL CHECK (CulvertCondition BETWEEN 0 AND 9),

    -- Overall assessment
    OverallCondition NVARCHAR(20) NULL, -- Good, Fair, Poor
    StructurallyDeficient BIT NOT NULL DEFAULT 0,
    FunctionallyObsolete BIT NOT NULL DEFAULT 0,

    -- Inspection
    LastInspectionDate DATE NULL,
    InspectionFrequency INT NULL, -- months

    -- Owner/maintenance
    OwnerAgency NVARCHAR(100) NULL,
    MaintenanceResponsibility NVARCHAR(100) NULL,

    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),

    CONSTRAINT FK_Bridges_Category FOREIGN KEY (CategoryId) REFERENCES dbo.Categories(Id),
    CONSTRAINT FK_Bridges_State FOREIGN KEY (StateId) REFERENCES dbo.States(Id)
);

CREATE INDEX IX_Bridges_StateId ON dbo.Bridges(StateId);
CREATE INDEX IX_Bridges_OverallCondition ON dbo.Bridges(OverallCondition);
CREATE INDEX IX_Bridges_YearBuilt ON dbo.Bridges(YearBuilt);
CREATE INDEX IX_Bridges_CategoryId ON dbo.Bridges(CategoryId);
CREATE INDEX IX_Bridges_StructurallyDeficient ON dbo.Bridges(StructurallyDeficient);

-- ============================================
-- Transit Data (National Transit Database)
-- ============================================

CREATE TABLE dbo.TransitAgencies (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CategoryId INT NOT NULL DEFAULT 3,

    -- Agency identification
    NtdId NVARCHAR(10) NOT NULL,
    AgencyName NVARCHAR(200) NOT NULL,
    City NVARCHAR(100) NOT NULL,
    StateId INT NOT NULL,

    -- Urban area
    UzaName NVARCHAR(200) NULL,
    UzaPopulation INT NULL,

    -- Organization
    OrganizationType NVARCHAR(100) NULL,
    ReporterType NVARCHAR(100) NULL,
    ReportYear INT NOT NULL,

    -- Service metrics
    VehiclesOperatedMaxService INT NULL, -- VOMS
    UnlinkedPassengerTrips BIGINT NULL, -- UPT
    VehicleRevenueMiles BIGINT NULL, -- VRM
    VehicleRevenueHours BIGINT NULL, -- VRH
    PassengerMilesTraveled BIGINT NULL, -- PMT

    -- Financial
    FareRevenuesEarned DECIMAL(15,2) NULL,
    TotalOperatingExpenses DECIMAL(15,2) NULL,

    -- Calculated metrics
    PassengersPerHour DECIMAL(10,2) NULL,
    CostPerTrip DECIMAL(10,2) NULL,
    FareCoveryRatio DECIMAL(5,4) NULL,

    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),

    CONSTRAINT FK_TransitAgencies_Category FOREIGN KEY (CategoryId) REFERENCES dbo.Categories(Id),
    CONSTRAINT FK_TransitAgencies_State FOREIGN KEY (StateId) REFERENCES dbo.States(Id)
);

CREATE INDEX IX_TransitAgencies_StateId ON dbo.TransitAgencies(StateId);
CREATE INDEX IX_TransitAgencies_ReportYear ON dbo.TransitAgencies(ReportYear);
CREATE INDEX IX_TransitAgencies_CategoryId ON dbo.TransitAgencies(CategoryId);
CREATE INDEX IX_TransitAgencies_UzaPopulation ON dbo.TransitAgencies(UzaPopulation);

-- ============================================
-- Vehicle Fatality Data (NHTSA FARS)
-- ============================================

CREATE TABLE dbo.VehicleFatalities (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    CategoryId INT NOT NULL DEFAULT 4,

    -- Case identification
    CaseNumber NVARCHAR(20) NOT NULL,
    StateId INT NOT NULL,
    CountyCode INT NULL,
    CountyName NVARCHAR(100) NULL,
    City NVARCHAR(100) NULL,

    -- Date/Time
    CrashDate DATE NOT NULL,
    CrashTime NVARCHAR(10) NULL,
    CrashYear INT NOT NULL,
    CrashMonth INT NOT NULL,
    DayOfWeek NVARCHAR(20) NULL,

    -- Location
    Latitude DECIMAL(10,6) NULL,
    Longitude DECIMAL(10,6) NULL,
    RouteType NVARCHAR(50) NULL,
    RoadwayFunctionClass NVARCHAR(50) NULL,

    -- Crash details
    MannerOfCollision NVARCHAR(100) NULL,
    FirstHarmfulEvent NVARCHAR(100) NULL,
    LightCondition NVARCHAR(50) NULL,
    WeatherCondition NVARCHAR(50) NULL,
    RoadSurfaceCondition NVARCHAR(50) NULL,

    -- Vehicles involved
    NumberOfVehicles INT NOT NULL DEFAULT 1,
    NumberOfMotorVehicles INT NULL,
    NumberOfParkedVehicles INT NULL,

    -- Persons involved
    NumberOfPersons INT NOT NULL DEFAULT 1,
    NumberOfFatalities INT NOT NULL DEFAULT 1,
    NumberOfDrunkDrivers INT NULL DEFAULT 0,

    -- Vehicle types (flags)
    InvolvesLargeTruck BIT NOT NULL DEFAULT 0,
    InvolvesMotorcycle BIT NOT NULL DEFAULT 0,
    InvolvesPedestrian BIT NOT NULL DEFAULT 0,
    InvolvesBicyclist BIT NOT NULL DEFAULT 0,
    InvolvesSpeedRelated BIT NOT NULL DEFAULT 0,

    -- School bus
    SchoolBusRelated BIT NOT NULL DEFAULT 0,

    -- Work zone
    WorkZoneRelated BIT NOT NULL DEFAULT 0,

    -- Rural/Urban
    LandUse NVARCHAR(20) NULL, -- Rural, Urban

    CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),

    CONSTRAINT FK_VehicleFatalities_Category FOREIGN KEY (CategoryId) REFERENCES dbo.Categories(Id),
    CONSTRAINT FK_VehicleFatalities_State FOREIGN KEY (StateId) REFERENCES dbo.States(Id)
);

CREATE INDEX IX_VehicleFatalities_StateId ON dbo.VehicleFatalities(StateId);
CREATE INDEX IX_VehicleFatalities_CrashDate ON dbo.VehicleFatalities(CrashDate);
CREATE INDEX IX_VehicleFatalities_CrashYear ON dbo.VehicleFatalities(CrashYear);
CREATE INDEX IX_VehicleFatalities_CategoryId ON dbo.VehicleFatalities(CategoryId);
CREATE INDEX IX_VehicleFatalities_LandUse ON dbo.VehicleFatalities(LandUse);

GO

-- ============================================
-- UpdatedAt Triggers
-- ============================================

-- Categories table trigger
CREATE OR ALTER TRIGGER trg_Categories_UpdatedAt
ON dbo.Categories
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Categories
    SET UpdatedAt = GETUTCDATE()
    FROM dbo.Categories t
    INNER JOIN inserted i ON t.Id = i.Id;
END;
GO

-- RailroadAccidents table trigger
CREATE OR ALTER TRIGGER trg_RailroadAccidents_UpdatedAt
ON dbo.RailroadAccidents
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.RailroadAccidents
    SET UpdatedAt = GETUTCDATE()
    FROM dbo.RailroadAccidents t
    INNER JOIN inserted i ON t.Id = i.Id;
END;
GO

-- Bridges table trigger
CREATE OR ALTER TRIGGER trg_Bridges_UpdatedAt
ON dbo.Bridges
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Bridges
    SET UpdatedAt = GETUTCDATE()
    FROM dbo.Bridges t
    INNER JOIN inserted i ON t.Id = i.Id;
END;
GO

-- TransitAgencies table trigger
CREATE OR ALTER TRIGGER trg_TransitAgencies_UpdatedAt
ON dbo.TransitAgencies
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.TransitAgencies
    SET UpdatedAt = GETUTCDATE()
    FROM dbo.TransitAgencies t
    INNER JOIN inserted i ON t.Id = i.Id;
END;
GO

-- VehicleFatalities table trigger
CREATE OR ALTER TRIGGER trg_VehicleFatalities_UpdatedAt
ON dbo.VehicleFatalities
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.VehicleFatalities
    SET UpdatedAt = GETUTCDATE()
    FROM dbo.VehicleFatalities t
    INNER JOIN inserted i ON t.Id = i.Id;
END;
GO

-- ============================================
-- Composite Indexes for Common Query Patterns
-- ============================================

-- Filter by State and Date for railroad accidents
CREATE INDEX IX_RailroadAccidents_StateId_AccidentDate
ON dbo.RailroadAccidents(StateId, AccidentDate);

-- Filter by State and Condition for bridges
CREATE INDEX IX_Bridges_StateId_OverallCondition
ON dbo.Bridges(StateId, OverallCondition);

-- Filter by State and Year for vehicle fatalities
CREATE INDEX IX_VehicleFatalities_StateId_CrashYear
ON dbo.VehicleFatalities(StateId, CrashYear);

-- Filter by State and ReportYear for transit agencies
CREATE INDEX IX_TransitAgencies_StateId_ReportYear
ON dbo.TransitAgencies(StateId, ReportYear);
GO

-- ============================================
-- Views for API consumption
-- ============================================

-- Summary view by category
CREATE OR ALTER VIEW dbo.vw_CategorySummary AS
SELECT
    c.Id AS CategoryId,
    c.Name AS CategoryName,
    c.Description,
    c.Icon,
    c.Color,
    CASE c.Name
        WHEN 'Railroads' THEN (SELECT COUNT(*) FROM dbo.RailroadAccidents WHERE CategoryId = c.Id)
        WHEN 'Bridges' THEN (SELECT COUNT(*) FROM dbo.Bridges WHERE CategoryId = c.Id)
        WHEN 'Public Transit' THEN (SELECT COUNT(*) FROM dbo.TransitAgencies WHERE CategoryId = c.Id)
        WHEN 'Automobiles' THEN (SELECT COUNT(*) FROM dbo.VehicleFatalities WHERE CategoryId = c.Id)
        ELSE 0
    END AS RecordCount
FROM dbo.Categories c
WHERE c.IsActive = 1;
GO

-- Railroad accidents summary by state
CREATE OR ALTER VIEW dbo.vw_RailroadAccidentsByState AS
SELECT
    s.Code AS StateCode,
    s.Name AS StateName,
    s.Region,
    COUNT(*) AS TotalAccidents,
    SUM(r.TotalKilled) AS TotalFatalities,
    SUM(r.TotalInjured) AS TotalInjuries,
    SUM(r.TotalDamage) AS TotalDamage,
    MIN(r.AccidentDate) AS EarliestAccident,
    MAX(r.AccidentDate) AS LatestAccident
FROM dbo.RailroadAccidents r
INNER JOIN dbo.States s ON r.StateId = s.Id
GROUP BY s.Code, s.Name, s.Region;
GO

-- Bridge condition summary by state
CREATE OR ALTER VIEW dbo.vw_BridgeConditionByState AS
SELECT
    s.Code AS StateCode,
    s.Name AS StateName,
    s.Region,
    COUNT(*) AS TotalBridges,
    SUM(CASE WHEN b.OverallCondition = 'Good' THEN 1 ELSE 0 END) AS GoodCondition,
    SUM(CASE WHEN b.OverallCondition = 'Fair' THEN 1 ELSE 0 END) AS FairCondition,
    SUM(CASE WHEN b.OverallCondition = 'Poor' THEN 1 ELSE 0 END) AS PoorCondition,
    SUM(CASE WHEN b.StructurallyDeficient = 1 THEN 1 ELSE 0 END) AS StructurallyDeficient,
    AVG(b.YearBuilt) AS AvgYearBuilt,
    SUM(b.AverageDailyTraffic) AS TotalDailyTraffic
FROM dbo.Bridges b
INNER JOIN dbo.States s ON b.StateId = s.Id
GROUP BY s.Code, s.Name, s.Region;
GO

-- Transit summary by state
CREATE OR ALTER VIEW dbo.vw_TransitSummaryByState AS
SELECT
    s.Code AS StateCode,
    s.Name AS StateName,
    s.Region,
    COUNT(DISTINCT t.NtdId) AS TotalAgencies,
    SUM(t.UnlinkedPassengerTrips) AS TotalRidership,
    SUM(t.VehicleRevenueMiles) AS TotalVehicleMiles,
    SUM(t.TotalOperatingExpenses) AS TotalExpenses,
    SUM(t.FareRevenuesEarned) AS TotalFareRevenue,
    MAX(t.ReportYear) AS LatestReportYear
FROM dbo.TransitAgencies t
INNER JOIN dbo.States s ON t.StateId = s.Id
GROUP BY s.Code, s.Name, s.Region;
GO

-- Vehicle fatality summary by state and year
CREATE OR ALTER VIEW dbo.vw_VehicleFatalitiesByState AS
SELECT
    s.Code AS StateCode,
    s.Name AS StateName,
    s.Region,
    v.CrashYear,
    COUNT(*) AS TotalCrashes,
    SUM(v.NumberOfFatalities) AS TotalFatalities,
    SUM(CASE WHEN v.NumberOfDrunkDrivers > 0 THEN 1 ELSE 0 END) AS AlcoholRelated,
    SUM(CASE WHEN v.InvolvesSpeedRelated = 1 THEN 1 ELSE 0 END) AS SpeedRelated,
    SUM(CASE WHEN v.InvolvesPedestrian = 1 THEN 1 ELSE 0 END) AS PedestrianInvolved,
    SUM(CASE WHEN v.InvolvesMotorcycle = 1 THEN 1 ELSE 0 END) AS MotorcycleInvolved
FROM dbo.VehicleFatalities v
INNER JOIN dbo.States s ON v.StateId = s.Id
GROUP BY s.Code, s.Name, s.Region, v.CrashYear;
GO

PRINT 'DOT Transportation Database Schema created successfully.';
GO
