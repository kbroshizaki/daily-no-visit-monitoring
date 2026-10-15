const {test}=require('node:test');const assert=require('node:assert/strict');const {monitor,formatEmail}=require('../src/monitor');
const store={companyId:'D001',name:'Redwood Demo Location',openDate:'2026-01-01'};
test('counts missing and zero records after last activity; boarding breaks streak',()=>{
 const rows=monitor([store],[{companyId:'D001',date:'2026-10-08',daycareCount:0,boardingCount:2},{companyId:'D001',date:'2026-10-09',daycareCount:0,boardingCount:0}],'2026-10-10');assert.equal(rows[0].consecutiveNoVisitDays,2);assert.equal(rows[0].firstNoVisitDate,'2026-10-09');
});
test('activity on report date excludes location',()=>assert.deepEqual(monitor([store],[{companyId:'D001',date:'2026-10-10',daycareCount:1,boardingCount:0}],'2026-10-10'),[]));
test('closed, terminated and unopened stores excluded; duplicate IDs collapse',()=>{
 const rows=monitor([store,store,{...store,companyId:'D2',closeDate:'2026-01-02'},{...store,companyId:'D3',terminationDate:'2026-01-02'},{...store,companyId:'D4',openDate:'2026-10-11'}],[],'2026-10-10');assert.equal(rows.length,1);
});
test('bounded history and opening date limit the streak',()=>{let r=monitor([store],[],'2026-10-10',2)[0];assert.equal(r.consecutiveNoVisitDays,3);assert.equal(r.historyLimited,true);r=monitor([{...store,openDate:'2026-10-10'}],[],'2026-10-10')[0];assert.equal(r.consecutiveNoVisitDays,1);});
test('rejects invalid dates and counts; empty message avoids asserting actual visits',()=>{assert.throws(()=>monitor([store],[],'2026-02-30'));assert.throws(()=>monitor([store],[{companyId:'D001',date:'2026-10-10',daycareCount:-1,boardingCount:0}],'2026-10-10'));assert.match(formatEmail([],'2026-10-10').text,/No eligible locations/);});
