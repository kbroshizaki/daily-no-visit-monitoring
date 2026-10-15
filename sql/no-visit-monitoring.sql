-- SQL Server reference implementation using fictional schema names.
-- Create/populate demo.Stores and demo.DailyVisits before running.
-- Stores: CompanyID, LocationName, OpenDate, CloseDate, TerminationDate
-- DailyVisits: CompanyID, VisitDate, DaycareCount, BoardingCount
-- This example is documentation only; the Node demo uses local JSON.
DECLARE @ReportDate date = '2026-10-10';
DECLARE @StartDate date = DATEADD(day, -365, @ReportDate);
WITH Dates AS (
 SELECT @StartDate AS VisitDate
 UNION ALL
 SELECT DATEADD(day, 1, VisitDate) FROM Dates WHERE VisitDate < @ReportDate
), Activity AS (
 SELECT CompanyID, CAST(VisitDate AS date) AS VisitDate
 FROM demo.DailyVisits
 WHERE VisitDate >= @StartDate AND VisitDate < DATEADD(day, 1, @ReportDate)
 AND (COALESCE(DaycareCount,0)>0 OR COALESCE(BoardingCount,0)>0)
 GROUP BY CompanyID, CAST(VisitDate AS date)
), Eligible AS (
 SELECT CompanyID, LocationName, OpenDate FROM demo.Stores
 WHERE OpenDate <= @ReportDate AND CloseDate IS NULL AND TerminationDate IS NULL
), LastActivity AS (
 SELECT e.CompanyID, MAX(a.VisitDate) AS LastVisitDate
 FROM Eligible e LEFT JOIN Activity a ON a.CompanyID=e.CompanyID
 GROUP BY e.CompanyID
)
SELECT e.CompanyID, e.LocationName, @ReportDate AS ReportDate,
 MIN(d.VisitDate) AS FirstNoVisitDate, COUNT(*) AS ConsecutiveNoVisitDays
FROM Eligible e
JOIN LastActivity l ON e.CompanyID=l.CompanyID
JOIN Dates d ON d.VisitDate >= CAST(e.OpenDate AS date)
 AND d.VisitDate > COALESCE(l.LastVisitDate, CONVERT(date,'19000101'))
WHERE NOT EXISTS (SELECT 1 FROM Activity a WHERE a.CompanyID=e.CompanyID AND a.VisitDate=@ReportDate)
GROUP BY e.CompanyID,e.LocationName
ORDER BY ConsecutiveNoVisitDays DESC,e.LocationName
OPTION(MAXRECURSION 0);
