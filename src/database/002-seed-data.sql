-- ============================================
-- DOT Transportation Data Demo - Seed Data
-- Sample data based on real DOT datasets
-- ============================================

-- ============================================
-- Insert Categories
-- ============================================
SET IDENTITY_INSERT dbo.Categories ON;

INSERT INTO dbo.Categories (Id, Name, Description, Icon, Color, SortOrder, IsActive)
VALUES
    (1, 'Railroads', 'Federal Railroad Administration (FRA) safety data including train accidents, equipment incidents, and hazmat releases across the U.S. rail network.', 'train', '#1E40AF', 1, 1),
    (2, 'Bridges', 'National Bridge Inventory (NBI) data from the Federal Highway Administration including structural conditions, traffic volumes, and inspection records for 600,000+ bridges.', 'bridge', '#047857', 2, 1),
    (3, 'Public Transit', 'National Transit Database (NTD) metrics from the Federal Transit Administration including ridership, service hours, and operating expenses for transit agencies.', 'bus', '#7C3AED', 3, 1),
    (4, 'Automobiles', 'Fatality Analysis Reporting System (FARS) data from NHTSA tracking motor vehicle traffic crashes and fatalities across the nation.', 'car', '#DC2626', 4, 1);

SET IDENTITY_INSERT dbo.Categories OFF;
GO

-- ============================================
-- Insert States Reference Data
-- ============================================
INSERT INTO dbo.States (Id, Code, Name, Region) VALUES
    (1, 'AL', 'Alabama', 'Southeast'),
    (2, 'AK', 'Alaska', 'Pacific'),
    (4, 'AZ', 'Arizona', 'Southwest'),
    (5, 'AR', 'Arkansas', 'Southeast'),
    (6, 'CA', 'California', 'Pacific'),
    (8, 'CO', 'Colorado', 'Mountain'),
    (9, 'CT', 'Connecticut', 'Northeast'),
    (10, 'DE', 'Delaware', 'Northeast'),
    (11, 'DC', 'District of Columbia', 'Northeast'),
    (12, 'FL', 'Florida', 'Southeast'),
    (13, 'GA', 'Georgia', 'Southeast'),
    (15, 'HI', 'Hawaii', 'Pacific'),
    (16, 'ID', 'Idaho', 'Mountain'),
    (17, 'IL', 'Illinois', 'Midwest'),
    (18, 'IN', 'Indiana', 'Midwest'),
    (19, 'IA', 'Iowa', 'Midwest'),
    (20, 'KS', 'Kansas', 'Midwest'),
    (21, 'KY', 'Kentucky', 'Southeast'),
    (22, 'LA', 'Louisiana', 'Southeast'),
    (23, 'ME', 'Maine', 'Northeast'),
    (24, 'MD', 'Maryland', 'Northeast'),
    (25, 'MA', 'Massachusetts', 'Northeast'),
    (26, 'MI', 'Michigan', 'Midwest'),
    (27, 'MN', 'Minnesota', 'Midwest'),
    (28, 'MS', 'Mississippi', 'Southeast'),
    (29, 'MO', 'Missouri', 'Midwest'),
    (30, 'MT', 'Montana', 'Mountain'),
    (31, 'NE', 'Nebraska', 'Midwest'),
    (32, 'NV', 'Nevada', 'Mountain'),
    (33, 'NH', 'New Hampshire', 'Northeast'),
    (34, 'NJ', 'New Jersey', 'Northeast'),
    (35, 'NM', 'New Mexico', 'Southwest'),
    (36, 'NY', 'New York', 'Northeast'),
    (37, 'NC', 'North Carolina', 'Southeast'),
    (38, 'ND', 'North Dakota', 'Midwest'),
    (39, 'OH', 'Ohio', 'Midwest'),
    (40, 'OK', 'Oklahoma', 'Southwest'),
    (41, 'OR', 'Oregon', 'Pacific'),
    (42, 'PA', 'Pennsylvania', 'Northeast'),
    (44, 'RI', 'Rhode Island', 'Northeast'),
    (45, 'SC', 'South Carolina', 'Southeast'),
    (46, 'SD', 'South Dakota', 'Midwest'),
    (47, 'TN', 'Tennessee', 'Southeast'),
    (48, 'TX', 'Texas', 'Southwest'),
    (49, 'UT', 'Utah', 'Mountain'),
    (50, 'VT', 'Vermont', 'Northeast'),
    (51, 'VA', 'Virginia', 'Southeast'),
    (53, 'WA', 'Washington', 'Pacific'),
    (54, 'WV', 'West Virginia', 'Southeast'),
    (55, 'WI', 'Wisconsin', 'Midwest'),
    (56, 'WY', 'Wyoming', 'Mountain');
GO

-- ============================================
-- Railroad Accidents Sample Data (Form 54)
-- Based on FRA Safety Data patterns
-- ============================================

-- Railroad codes and names (Class I railroads)
DECLARE @Railroads TABLE (Code NVARCHAR(10), Name NVARCHAR(200));
INSERT INTO @Railroads VALUES
    ('BNSF', 'BNSF Railway Company'),
    ('UP', 'Union Pacific Railroad'),
    ('NS', 'Norfolk Southern Railway'),
    ('CSXT', 'CSX Transportation'),
    ('KCS', 'Kansas City Southern Railway'),
    ('CN', 'Canadian National Railway'),
    ('CP', 'Canadian Pacific Railway'),
    ('AMTK', 'Amtrak (National Railroad Passenger Corporation)'),
    ('MET', 'Metro-North Commuter Railroad'),
    ('NJT', 'New Jersey Transit Rail');

-- Accident types
DECLARE @AccidentTypes TABLE (Code NVARCHAR(10), Name NVARCHAR(100));
INSERT INTO @AccidentTypes VALUES
    ('01', 'Derailment'),
    ('02', 'Head-on Collision'),
    ('03', 'Rear-end Collision'),
    ('04', 'Side Collision'),
    ('05', 'Raking Collision'),
    ('06', 'Broken Train Collision'),
    ('07', 'Hump Collision'),
    ('08', 'RR Grade Crossing'),
    ('09', 'Obstruction'),
    ('10', 'Explosion/Detonation'),
    ('11', 'Fire/Violent Rupture'),
    ('12', 'Other Impacts');

-- Generate 300 railroad accident records
DECLARE @i INT = 1;
WHILE @i <= 300
BEGIN
    INSERT INTO dbo.RailroadAccidents (
        CategoryId, ReportingRailroadCode, ReportingRailroadName,
        AccidentDate, AccidentTime, AccidentYear, AccidentMonth,
        StateId, CountyName, Subdivision, Milepost, Station,
        AccidentTypeCode, AccidentType, TrainSpeed, MaxSpeed, GrossTonnage,
        TrackType, TrackClass, TrainDirection, EquipmentType, TrainNumber,
        Temperature, WeatherCondition, Visibility,
        HazmatCars, HazmatCarsDamaged, HazmatReleasedCars, PersonsEvacuated,
        TotalKilled, TotalInjured, EquipmentDamage, TrackDamage, TotalDamage
    )
    SELECT TOP 1
        1,
        r.Code, r.Name,
        DATEADD(DAY, -ABS(CHECKSUM(NEWID())) % 1825, GETDATE()),
        RIGHT('0' + CAST(ABS(CHECKSUM(NEWID())) % 24 AS VARCHAR), 2) + ':' +
        RIGHT('0' + CAST(ABS(CHECKSUM(NEWID())) % 60 AS VARCHAR), 2),
        YEAR(DATEADD(DAY, -ABS(CHECKSUM(NEWID())) % 1825, GETDATE())),
        MONTH(DATEADD(DAY, -ABS(CHECKSUM(NEWID())) % 1825, GETDATE())),
        (SELECT TOP 1 Id FROM dbo.States ORDER BY NEWID()),
        'County ' + CAST(ABS(CHECKSUM(NEWID())) % 100 AS VARCHAR),
        'Subdivision ' + CAST(ABS(CHECKSUM(NEWID())) % 50 AS VARCHAR),
        CAST(ABS(CHECKSUM(NEWID())) % 500 + 1 AS VARCHAR) + '.' + CAST(ABS(CHECKSUM(NEWID())) % 10 AS VARCHAR),
        'Station ' + CAST(ABS(CHECKSUM(NEWID())) % 200 AS VARCHAR),
        at.Code, at.Name,
        ABS(CHECKSUM(NEWID())) % 80,
        ABS(CHECKSUM(NEWID())) % 40 + 50,
        ABS(CHECKSUM(NEWID())) % 20000 + 1000,
        CASE ABS(CHECKSUM(NEWID())) % 4
            WHEN 0 THEN 'Main'
            WHEN 1 THEN 'Yard'
            WHEN 2 THEN 'Siding'
            ELSE 'Industry'
        END,
        CAST(ABS(CHECKSUM(NEWID())) % 6 + 1 AS VARCHAR),
        CASE ABS(CHECKSUM(NEWID())) % 2 WHEN 0 THEN 'Eastbound' ELSE 'Westbound' END,
        CASE ABS(CHECKSUM(NEWID())) % 4
            WHEN 0 THEN 'Freight Train'
            WHEN 1 THEN 'Passenger Train'
            WHEN 2 THEN 'Yard/Switching'
            ELSE 'Work Train'
        END,
        'Train-' + CAST(ABS(CHECKSUM(NEWID())) % 9999 AS VARCHAR),
        ABS(CHECKSUM(NEWID())) % 100 - 20,
        CASE ABS(CHECKSUM(NEWID())) % 5
            WHEN 0 THEN 'Clear'
            WHEN 1 THEN 'Cloudy'
            WHEN 2 THEN 'Rain'
            WHEN 3 THEN 'Snow'
            ELSE 'Fog'
        END,
        CASE ABS(CHECKSUM(NEWID())) % 4
            WHEN 0 THEN 'Daylight'
            WHEN 1 THEN 'Dawn'
            WHEN 2 THEN 'Dusk'
            ELSE 'Dark'
        END,
        CASE WHEN ABS(CHECKSUM(NEWID())) % 20 = 0 THEN ABS(CHECKSUM(NEWID())) % 5 ELSE 0 END,
        CASE WHEN ABS(CHECKSUM(NEWID())) % 30 = 0 THEN ABS(CHECKSUM(NEWID())) % 3 ELSE 0 END,
        CASE WHEN ABS(CHECKSUM(NEWID())) % 50 = 0 THEN ABS(CHECKSUM(NEWID())) % 2 ELSE 0 END,
        CASE WHEN ABS(CHECKSUM(NEWID())) % 50 = 0 THEN ABS(CHECKSUM(NEWID())) % 100 ELSE 0 END,
        CASE WHEN ABS(CHECKSUM(NEWID())) % 50 = 0 THEN ABS(CHECKSUM(NEWID())) % 3 ELSE 0 END,
        ABS(CHECKSUM(NEWID())) % 20,
        ABS(CHECKSUM(NEWID())) % 5000000 + 10000,
        ABS(CHECKSUM(NEWID())) % 2000000 + 5000,
        ABS(CHECKSUM(NEWID())) % 7000000 + 15000
    FROM @Railroads r
    CROSS JOIN @AccidentTypes at
    ORDER BY NEWID();

    SET @i = @i + 1;
END;
GO

-- ============================================
-- Bridge Data (National Bridge Inventory)
-- Based on NBI field patterns
-- ============================================

-- Structure types
DECLARE @StructureTypes TABLE (Id INT, Name NVARCHAR(100));
INSERT INTO @StructureTypes VALUES
    (1, 'Concrete Slab'),
    (2, 'Concrete Stringer/Multi-beam'),
    (3, 'Concrete Girder and Floorbeam'),
    (4, 'Concrete Tee Beam'),
    (5, 'Concrete Box Beam - Multiple'),
    (6, 'Steel Stringer/Multi-beam'),
    (7, 'Steel Girder and Floorbeam'),
    (8, 'Steel Truss - Deck'),
    (9, 'Steel Truss - Thru'),
    (10, 'Prestressed Concrete Box Beam'),
    (11, 'Timber Stringer/Multi-beam'),
    (12, 'Masonry Arch'),
    (13, 'Steel Arch'),
    (14, 'Concrete Culvert'),
    (15, 'Cable-Stayed');

-- Owner agencies
DECLARE @Owners TABLE (Name NVARCHAR(100));
INSERT INTO @Owners VALUES
    ('State Highway Agency'),
    ('County Highway Agency'),
    ('Town or Township Highway Agency'),
    ('City or Municipal Highway Agency'),
    ('State Toll Authority'),
    ('Federal Agency'),
    ('Railroad'),
    ('Private (Other than Railroad)');

-- Generate 400 bridge records
DECLARE @j INT = 1;
WHILE @j <= 400
BEGIN
    DECLARE @stateId INT = (SELECT TOP 1 Id FROM dbo.States ORDER BY NEWID());
    DECLARE @stateCode CHAR(2) = (SELECT Code FROM dbo.States WHERE Id = @stateId);
    DECLARE @yearBuilt INT = 1920 + ABS(CHECKSUM(NEWID())) % 105;
    DECLARE @deckCond INT = ABS(CHECKSUM(NEWID())) % 10;
    DECLARE @superCond INT = ABS(CHECKSUM(NEWID())) % 10;
    DECLARE @subCond INT = ABS(CHECKSUM(NEWID())) % 10;
    DECLARE @minCond INT = CASE WHEN @deckCond < @superCond THEN
                                    CASE WHEN @deckCond < @subCond THEN @deckCond ELSE @subCond END
                               ELSE
                                    CASE WHEN @superCond < @subCond THEN @superCond ELSE @subCond END
                           END;

    INSERT INTO dbo.Bridges (
        CategoryId, StructureNumber, StateId, CountyCode, CountyName,
        Latitude, Longitude, FeaturesIntersected, FacilityCarried,
        YearBuilt, YearReconstructed, StructureLength, DeckWidth,
        LanesOnStructure, LanesUnderStructure,
        AverageDailyTraffic, AverageDailyTruckTraffic, TrafficDirection,
        MainStructureType, MainStructureMaterial, DeckStructureType,
        DeckCondition, SuperstructureCondition, SubstructureCondition,
        ChannelCondition, CulvertCondition, OverallCondition,
        StructurallyDeficient, FunctionallyObsolete,
        LastInspectionDate, InspectionFrequency, OwnerAgency, MaintenanceResponsibility
    )
    SELECT TOP 1
        2,
        @stateCode + RIGHT('00000' + CAST(@j AS VARCHAR), 5) + 'B' +
            CAST(ABS(CHECKSUM(NEWID())) % 1000 AS VARCHAR),
        @stateId,
        ABS(CHECKSUM(NEWID())) % 200 + 1,
        'County ' + CAST(ABS(CHECKSUM(NEWID())) % 100 AS VARCHAR),
        CAST(30 + (ABS(CHECKSUM(NEWID())) % 20) AS DECIMAL(10,6)) +
            (ABS(CHECKSUM(NEWID())) % 1000000) / 1000000.0,
        CAST(-70 - (ABS(CHECKSUM(NEWID())) % 50) AS DECIMAL(10,6)) -
            (ABS(CHECKSUM(NEWID())) % 1000000) / 1000000.0,
        CASE ABS(CHECKSUM(NEWID())) % 4
            WHEN 0 THEN 'Interstate Highway'
            WHEN 1 THEN 'US Highway'
            WHEN 2 THEN 'State Route'
            ELSE 'County Road'
        END + ' ' + CAST(ABS(CHECKSUM(NEWID())) % 999 AS VARCHAR),
        CASE ABS(CHECKSUM(NEWID())) % 5
            WHEN 0 THEN 'River Crossing'
            WHEN 1 THEN 'Stream'
            WHEN 2 THEN 'Railroad'
            WHEN 3 THEN 'Highway Overpass'
            ELSE 'Valley'
        END,
        @yearBuilt,
        CASE WHEN ABS(CHECKSUM(NEWID())) % 5 = 0 THEN @yearBuilt + ABS(CHECKSUM(NEWID())) % 40 ELSE NULL END,
        ABS(CHECKSUM(NEWID())) % 500 + 10,
        ABS(CHECKSUM(NEWID())) % 30 + 6,
        CASE ABS(CHECKSUM(NEWID())) % 4
            WHEN 0 THEN 2
            WHEN 1 THEN 4
            WHEN 2 THEN 6
            ELSE 8
        END,
        CASE WHEN ABS(CHECKSUM(NEWID())) % 3 = 0 THEN ABS(CHECKSUM(NEWID())) % 4 ELSE 0 END,
        ABS(CHECKSUM(NEWID())) % 150000 + 1000,
        ABS(CHECKSUM(NEWID())) % 20000 + 100,
        CASE ABS(CHECKSUM(NEWID())) % 3
            WHEN 0 THEN 'One-Way'
            WHEN 1 THEN 'Two-Way'
            ELSE 'Reversible'
        END,
        st.Name,
        CASE ABS(CHECKSUM(NEWID())) % 5
            WHEN 0 THEN 'Concrete'
            WHEN 1 THEN 'Steel'
            WHEN 2 THEN 'Prestressed Concrete'
            WHEN 3 THEN 'Timber'
            ELSE 'Masonry'
        END,
        CASE ABS(CHECKSUM(NEWID())) % 4
            WHEN 0 THEN 'Concrete Cast-in-Place'
            WHEN 1 THEN 'Concrete Precast Panels'
            WHEN 2 THEN 'Open Grating'
            ELSE 'Steel Orthotropic'
        END,
        @deckCond,
        @superCond,
        @subCond,
        CASE WHEN ABS(CHECKSUM(NEWID())) % 5 = 0 THEN ABS(CHECKSUM(NEWID())) % 10 ELSE NULL END,
        CASE WHEN ABS(CHECKSUM(NEWID())) % 10 = 0 THEN ABS(CHECKSUM(NEWID())) % 10 ELSE NULL END,
        CASE WHEN @minCond >= 7 THEN 'Good'
             WHEN @minCond >= 5 THEN 'Fair'
             ELSE 'Poor'
        END,
        CASE WHEN @minCond < 5 THEN 1 ELSE 0 END,
        CASE WHEN ABS(CHECKSUM(NEWID())) % 10 = 0 THEN 1 ELSE 0 END,
        DATEADD(DAY, -ABS(CHECKSUM(NEWID())) % 730, GETDATE()),
        CASE ABS(CHECKSUM(NEWID())) % 3
            WHEN 0 THEN 12
            WHEN 1 THEN 24
            ELSE 48
        END,
        o.Name,
        o.Name
    FROM @StructureTypes st
    CROSS JOIN @Owners o
    ORDER BY NEWID();

    SET @j = @j + 1;
END;
GO

-- ============================================
-- Transit Agency Data (NTD)
-- Based on National Transit Database patterns
-- ============================================

-- Organization types
DECLARE @OrgTypes TABLE (Name NVARCHAR(100));
INSERT INTO @OrgTypes VALUES
    ('Independent Authority'),
    ('City Government'),
    ('County Government'),
    ('State Government'),
    ('Private Non-Profit'),
    ('Private Provider');

-- Generate transit agency data
INSERT INTO dbo.TransitAgencies (
    CategoryId, NtdId, AgencyName, City, StateId,
    UzaName, UzaPopulation, OrganizationType, ReporterType, ReportYear,
    VehiclesOperatedMaxService, UnlinkedPassengerTrips, VehicleRevenueMiles,
    VehicleRevenueHours, PassengerMilesTraveled,
    FareRevenuesEarned, TotalOperatingExpenses, PassengersPerHour, CostPerTrip, FareCoveryRatio
)
SELECT
    3,
    CAST(20000 + ROW_NUMBER() OVER (ORDER BY s.Id, agency.Num) AS VARCHAR),
    CASE agency.Num % 10
        WHEN 0 THEN city.Name + ' Metro Transit Authority'
        WHEN 1 THEN city.Name + ' Area Rapid Transit'
        WHEN 2 THEN 'Greater ' + city.Name + ' Transit'
        WHEN 3 THEN city.Name + ' Regional Transportation'
        WHEN 4 THEN city.Name + ' City Bus'
        WHEN 5 THEN city.Name + ' Public Transit'
        WHEN 6 THEN city.Name + ' Transportation Authority'
        WHEN 7 THEN city.Name + ' Metro'
        WHEN 8 THEN city.Name + ' Transit System'
        ELSE city.Name + ' Municipal Transit'
    END,
    city.Name,
    s.Id,
    city.Name + ', ' + s.Code + ' Urbanized Area',
    100000 + ABS(CHECKSUM(NEWID())) % 5000000,
    ot.Name,
    CASE WHEN ABS(CHECKSUM(NEWID())) % 10 = 0 THEN 'Reduced Reporter' ELSE 'Full Reporter' END,
    2020 + (ABS(CHECKSUM(NEWID())) % 5),
    50 + ABS(CHECKSUM(NEWID())) % 2000,
    1000000 + CAST(ABS(CHECKSUM(NEWID())) AS BIGINT) % 500000000,
    100000 + CAST(ABS(CHECKSUM(NEWID())) AS BIGINT) % 50000000,
    50000 + CAST(ABS(CHECKSUM(NEWID())) AS BIGINT) % 5000000,
    2000000 + CAST(ABS(CHECKSUM(NEWID())) AS BIGINT) % 2000000000,
    100000 + ABS(CHECKSUM(NEWID())) % 500000000,
    5000000 + ABS(CHECKSUM(NEWID())) % 2000000000,
    5 + ABS(CHECKSUM(NEWID())) % 50,
    CAST(1 + ABS(CHECKSUM(NEWID())) % 20 AS DECIMAL(10,2)),
    CAST(ABS(CHECKSUM(NEWID())) % 60 / 100.0 AS DECIMAL(5,4))
FROM dbo.States s
CROSS JOIN (SELECT 1 AS Num UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) agency
CROSS JOIN @OrgTypes ot
CROSS JOIN (
    SELECT 'Springfield' AS Name UNION SELECT 'Riverside' UNION SELECT 'Fairview'
    UNION SELECT 'Georgetown' UNION SELECT 'Madison' UNION SELECT 'Clinton'
    UNION SELECT 'Franklin' UNION SELECT 'Greenville' UNION SELECT 'Salem'
    UNION SELECT 'Bristol'
) city
WHERE ABS(CHECKSUM(NEWID()) + s.Id + agency.Num) % 15 = 0;
GO

-- ============================================
-- Vehicle Fatality Data (FARS)
-- Based on NHTSA FARS patterns
-- ============================================

-- Days of week
DECLARE @Days TABLE (Name NVARCHAR(20));
INSERT INTO @Days VALUES ('Sunday'), ('Monday'), ('Tuesday'), ('Wednesday'),
    ('Thursday'), ('Friday'), ('Saturday');

-- Collision types
DECLARE @Collisions TABLE (Name NVARCHAR(100));
INSERT INTO @Collisions VALUES
    ('Single-Vehicle Crash'),
    ('Angle Collision'),
    ('Head-On Collision'),
    ('Rear-End Collision'),
    ('Sideswipe - Same Direction'),
    ('Sideswipe - Opposite Direction'),
    ('Unknown');

-- Light conditions
DECLARE @LightCond TABLE (Name NVARCHAR(50));
INSERT INTO @LightCond VALUES
    ('Daylight'), ('Dawn'), ('Dusk'),
    ('Dark - Lighted'), ('Dark - Not Lighted'), ('Dark - Unknown Lighting');

-- Weather conditions
DECLARE @Weather TABLE (Name NVARCHAR(50));
INSERT INTO @Weather VALUES
    ('Clear'), ('Cloudy'), ('Rain'), ('Sleet/Hail'),
    ('Snow'), ('Fog/Smoke'), ('Severe Crosswinds'), ('Blowing Sand/Dirt');

-- Road conditions
DECLARE @RoadCond TABLE (Name NVARCHAR(50));
INSERT INTO @RoadCond VALUES
    ('Dry'), ('Wet'), ('Snow'), ('Ice'),
    ('Sand/Mud/Dirt'), ('Oil'), ('Unknown');

-- Generate 400 fatality records
DECLARE @k INT = 1;
WHILE @k <= 400
BEGIN
    DECLARE @crashDate DATE = DATEADD(DAY, -ABS(CHECKSUM(NEWID())) % 1825, GETDATE());
    DECLARE @numVehicles INT = 1 + ABS(CHECKSUM(NEWID())) % 4;
    DECLARE @numFatalities INT = 1 + ABS(CHECKSUM(NEWID())) % 4;

    INSERT INTO dbo.VehicleFatalities (
        CategoryId, CaseNumber, StateId, CountyCode, CountyName, City,
        CrashDate, CrashTime, CrashYear, CrashMonth, DayOfWeek,
        Latitude, Longitude, RouteType, RoadwayFunctionClass,
        MannerOfCollision, FirstHarmfulEvent, LightCondition,
        WeatherCondition, RoadSurfaceCondition,
        NumberOfVehicles, NumberOfMotorVehicles, NumberOfParkedVehicles,
        NumberOfPersons, NumberOfFatalities, NumberOfDrunkDrivers,
        InvolvesLargeTruck, InvolvesMotorcycle, InvolvesPedestrian,
        InvolvesBicyclist, InvolvesSpeedRelated, SchoolBusRelated,
        WorkZoneRelated, LandUse
    )
    SELECT TOP 1
        4,
        CAST(YEAR(@crashDate) AS VARCHAR) + '-' +
            RIGHT('000000' + CAST(@k AS VARCHAR), 6),
        (SELECT TOP 1 Id FROM dbo.States ORDER BY NEWID()),
        ABS(CHECKSUM(NEWID())) % 200 + 1,
        'County ' + CAST(ABS(CHECKSUM(NEWID())) % 100 AS VARCHAR),
        CASE ABS(CHECKSUM(NEWID())) % 8
            WHEN 0 THEN 'Springfield'
            WHEN 1 THEN 'Riverside'
            WHEN 2 THEN 'Franklin'
            WHEN 3 THEN 'Greenville'
            WHEN 4 THEN 'Madison'
            WHEN 5 THEN 'Clinton'
            WHEN 6 THEN 'Salem'
            ELSE 'Georgetown'
        END,
        @crashDate,
        RIGHT('0' + CAST(ABS(CHECKSUM(NEWID())) % 24 AS VARCHAR), 2) + ':' +
        RIGHT('0' + CAST(ABS(CHECKSUM(NEWID())) % 60 AS VARCHAR), 2),
        YEAR(@crashDate),
        MONTH(@crashDate),
        d.Name,
        CAST(30 + (ABS(CHECKSUM(NEWID())) % 20) AS DECIMAL(10,6)),
        CAST(-70 - (ABS(CHECKSUM(NEWID())) % 50) AS DECIMAL(10,6)),
        CASE ABS(CHECKSUM(NEWID())) % 6
            WHEN 0 THEN 'Interstate'
            WHEN 1 THEN 'US Highway'
            WHEN 2 THEN 'State Highway'
            WHEN 3 THEN 'County Road'
            WHEN 4 THEN 'Local Street'
            ELSE 'Unknown'
        END,
        CASE ABS(CHECKSUM(NEWID())) % 7
            WHEN 0 THEN 'Rural Interstate'
            WHEN 1 THEN 'Rural Arterial'
            WHEN 2 THEN 'Rural Collector'
            WHEN 3 THEN 'Urban Interstate'
            WHEN 4 THEN 'Urban Arterial'
            WHEN 5 THEN 'Urban Collector'
            ELSE 'Local'
        END,
        c.Name,
        CASE ABS(CHECKSUM(NEWID())) % 6
            WHEN 0 THEN 'Rollover'
            WHEN 1 THEN 'Collision with Fixed Object'
            WHEN 2 THEN 'Collision with Motor Vehicle'
            WHEN 3 THEN 'Collision with Pedestrian'
            WHEN 4 THEN 'Fell from Vehicle'
            ELSE 'Other'
        END,
        l.Name,
        w.Name,
        r.Name,
        @numVehicles,
        @numVehicles,
        CASE WHEN ABS(CHECKSUM(NEWID())) % 20 = 0 THEN 1 ELSE 0 END,
        @numFatalities + ABS(CHECKSUM(NEWID())) % 5,
        @numFatalities,
        CASE WHEN ABS(CHECKSUM(NEWID())) % 4 = 0 THEN 1 ELSE 0 END,
        CASE WHEN ABS(CHECKSUM(NEWID())) % 10 = 0 THEN 1 ELSE 0 END,
        CASE WHEN ABS(CHECKSUM(NEWID())) % 12 = 0 THEN 1 ELSE 0 END,
        CASE WHEN ABS(CHECKSUM(NEWID())) % 15 = 0 THEN 1 ELSE 0 END,
        CASE WHEN ABS(CHECKSUM(NEWID())) % 15 = 0 THEN 1 ELSE 0 END,
        CASE WHEN ABS(CHECKSUM(NEWID())) % 5 = 0 THEN 1 ELSE 0 END,
        CASE WHEN ABS(CHECKSUM(NEWID())) % 50 = 0 THEN 1 ELSE 0 END,
        CASE WHEN ABS(CHECKSUM(NEWID())) % 20 = 0 THEN 1 ELSE 0 END,
        CASE ABS(CHECKSUM(NEWID())) % 2 WHEN 0 THEN 'Rural' ELSE 'Urban' END
    FROM @Days d
    CROSS JOIN @Collisions c
    CROSS JOIN @LightCond l
    CROSS JOIN @Weather w
    CROSS JOIN @RoadCond r
    ORDER BY NEWID();

    SET @k = @k + 1;
END;
GO

-- ============================================
-- Final Statistics
-- ============================================
PRINT '';
PRINT '============================================';
PRINT 'DOT Transportation Database Seeded Successfully';
PRINT '============================================';
PRINT '';

SELECT 'Categories' AS TableName, COUNT(*) AS RecordCount FROM dbo.Categories
UNION ALL
SELECT 'States', COUNT(*) FROM dbo.States
UNION ALL
SELECT 'RailroadAccidents', COUNT(*) FROM dbo.RailroadAccidents
UNION ALL
SELECT 'Bridges', COUNT(*) FROM dbo.Bridges
UNION ALL
SELECT 'TransitAgencies', COUNT(*) FROM dbo.TransitAgencies
UNION ALL
SELECT 'VehicleFatalities', COUNT(*) FROM dbo.VehicleFatalities
ORDER BY TableName;
GO
