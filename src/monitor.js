'use strict';
function date(value) {
 if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Use an ISO date: YYYY-MM-DD');
 const d = new Date(value+'T00:00:00Z');
 if (!Number.isFinite(d.getTime()) || d.toISOString().slice(0,10)!==value) throw new Error('Invalid date');
 return d;
}
function shift(value, days) { const d=date(value); d.setUTCDate(d.getUTCDate()+days); return d.toISOString().slice(0,10); }
function monitor(stores, visits, reportDate, lookbackDays=365) {
 date(reportDate);
 if (!Number.isInteger(lookbackDays) || lookbackDays<0) throw new Error('Invalid lookback');
 const activity=new Set();
 for (const v of visits) {
  date(v.date);
  if (![v.daycareCount,v.boardingCount].every(x=>Number.isFinite(x)&&x>=0)) throw new Error('Invalid visit counts');
  if(v.daycareCount>0 || v.boardingCount>0) activity.add(String(v.companyId)+'|'+v.date);
 }
 const unique=new Map(stores.map(s=>[String(s.companyId),s]));
 const rows=[];
 for(const [id,s] of unique) {
  date(s.openDate);
  if(s.closeDate || s.terminationDate || s.openDate>reportDate || activity.has(id+'|'+reportDate)) continue;
  const windowStart=shift(reportDate,-lookbackDays);
  // Demo refinement: avoid counting dates before the location opened.
  const start=s.openDate>windowStart?s.openDate:windowStart;
  let current=reportDate,count=0,first=reportDate;
  while(current>=start && !activity.has(id+'|'+current)) { count++;first=current;current=shift(current,-1); }
  rows.push({companyId:id,name:s.name,reportDate,consecutiveNoVisitDays:count,firstNoVisitDate:first,historyLimited:first===start});
 }
 return rows.sort((a,b)=>b.consecutiveNoVisitDays-a.consecutiveNoVisitDays||a.name.localeCompare(b.name));
}
function formatEmail(rows,reportDate) {
 const subject='Locations With No Recorded Visits Yesterday';
 const lines=rows.length ? rows.map(r=>`${r.name} | ${r.reportDate} | ${r.consecutiveNoVisitDays} consecutive no-visit days`) : ['No eligible locations were flagged for '+reportDate+'.'];
 return {subject,text:lines.join('\n')};
}
module.exports={monitor,formatEmail,shift};
