import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { accessDecision } from '../server/access.js';
import handler from '../api/session.js';
const root = path.resolve('public');
const types = {'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.jpg':'image/jpeg','.ico':'image/x-icon','.pdf':'application/pdf','.mp3':'audio/mpeg','.webp':'image/webp','.woff2':'font/woff2'};
http.createServer(async(req,res)=>{
  try {
    const url = new URL(req.url,'http://'+req.headers.host);
    res.setHeader('Cache-Control','private, no-store');
    const decision = accessDecision(url.pathname,req.headers.cookie);
    if(decision==='deny'){res.writeHead(404);return res.end('Not found');}
    if(decision==='login'){res.writeHead(307,{Location:'/access/?next='+encodeURIComponent(url.pathname+url.search)});return res.end();}
    if(url.pathname==='/api/session'){
      let body='';for await (const chunk of req){body+=chunk;if(body.length>2048){res.writeHead(413);return res.end();}}
      try{req.body=body?JSON.parse(body):null;}catch{res.writeHead(400);return res.end();}
      req.headers['x-forwarded-proto']='http';
      res.status=code=>{res.statusCode=code;return res;};res.json=obj=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(obj));};
      return await handler(req,res);
    }
    let file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
    if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(404);return res.end();}
    if((await stat(file)).isDirectory())file=path.join(file,'index.html');
    res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(await readFile(file));
  }catch{res.writeHead(404);res.end('Not found');}
}).listen(Number(process.env.PORT||5188),'127.0.0.1',()=>console.log('ASFC preview: http://127.0.0.1:'+(process.env.PORT||5188)));
