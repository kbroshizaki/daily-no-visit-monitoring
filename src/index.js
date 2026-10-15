'use strict';
const fs=require('node:fs/promises');
const path=require('node:path');
const {monitor,formatEmail,shift}=require('./monitor');
async function main(){
 const args=process.argv.slice(2);
 if(args.length && (args[0]!=='--date'||args.length!==2)) throw new Error('Usage: npm start -- --date YYYY-MM-DD');
 const reportDate=args[1]||'2026-10-10';
 const base=path.join(__dirname,'..');
 const stores=JSON.parse(await fs.readFile(path.join(base,'data/stores.json'),'utf8'));
 const visits=JSON.parse(await fs.readFile(path.join(base,'data/visits.json'),'utf8'));
 const rows=monitor(stores,visits,reportDate);
 const email=formatEmail(rows,reportDate);
 const out=path.join(base,'output');await fs.mkdir(out,{recursive:true});
 await fs.writeFile(path.join(out,'report.json'),JSON.stringify({fictional:true,reportDate,rows},null,2));
 await fs.writeFile(path.join(out,'email-preview.txt'),`FICTIONAL PORTFOLIO DEMO — NO EMAIL SENT\nSubject: ${email.subject}\n\n${email.text}\n`);
 console.log(email.subject+'\n'+email.text+'\n\nPreview written to output/email-preview.txt');
}
main().catch(err=>{console.error(err.message);process.exitCode=1;});
