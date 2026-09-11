import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
const directories = ['Documents','Spurs','Videos','YouTube','agency','analytics','aspensnowmass','audio','clubamerica','data','facebook','games','gmail','images','js','lewishamilton','logos','lukadoncic','lukaslovenia','parisvsslovenia','pitch','access','admin','services','photos'];
rmSync('public',{ recursive:true,force:true }); mkdirSync('public');
const filter = source => !source.split('/').some(p => p.startsWith('.')) && !/\.(?:psd|zip|py|md|cjs|sh|map)$/i.test(source);
for (const dir of directories) if(existsSync(dir)) cpSync(dir,`public/${dir}`,{recursive:true,filter});
for(const file of readdirSync('.')) if(/\.(?:html|css|js|png|jpg|jpeg|svg|ico|webp|txt|webmanifest)$/i.test(file)) cpSync(file,`public/${file}`);
for(const file of ['index.html','access/index.html','admin/index.html','agency/index.html','analytics/cam-view-history.js']) if(!existsSync(`public/${file}`)) throw new Error(`Missing release file: ${file}`);
console.log('Static release built; server code and secrets excluded.');
