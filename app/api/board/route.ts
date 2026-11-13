import { env } from 'cloudflare:workers';
import { cars } from '@/lib/cars';
export const dynamic = 'force-dynamic';
const reply=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
async function boardId(req:Request) {
 const key=req.headers.get('Authorization')?.replace(/^Bearer /,'')||'';
 if(!/^[a-f0-9]{64}$/.test(key)) return null;
 const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(key));
 return Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');
}
export async function GET(req:Request) {
 try { if(!env.DB)return reply({error:'Storage unavailable'},503); const id=await boardId(req); if(!id)return reply({error:'Open the shared board link to view notes.'},401);
 const board=await env.DB.prepare('SELECT id FROM boards WHERE id = ?').bind(id).first(); if(!board)return reply({error:'Board not found. Check your shared link.'},404);
 const [states,notes]=await Promise.all([env.DB.prepare('SELECT car, removed FROM car_states WHERE board = ?').bind(id).all(),env.DB.prepare('SELECT id, car, author, body, created_at FROM notes WHERE board = ? ORDER BY created_at, id').bind(id).all()]);
 return reply({states:states.results,notes:notes.results});
 }catch{return reply({error:'Unable to load shared changes. Please retry.'},503);}
}
export async function POST(req:Request) {
 try {
 if(!env.DB)return reply({error:'Storage unavailable'},503);
 const origin=req.headers.get('Origin'); if(origin && origin!==new URL(req.url).origin)return reply({error:'Invalid origin'},403);
 if(Number(req.headers.get('Content-Length')||0)>12000)return reply({error:'Request too large'},413);
 const raw=await req.text();if(raw.length>12000)return reply({error:'Request too large'},413);
 const data=JSON.parse(raw);const id=await boardId(req);if(!id)return reply({error:'A valid board link is required.'},401);
 if(data.action==='create') {await env.DB.prepare('INSERT OR IGNORE INTO boards (id,created_at) VALUES (?,?)').bind(id,new Date().toISOString()).run();return reply({ok:true});}
 if(!await env.DB.prepare('SELECT id FROM boards WHERE id = ?').bind(id).first())return reply({error:'Board not found'},404);
 if(!cars.some(c=>c.id===data.car))return reply({error:'Unknown car'},400);
 if(data.action==='remove'||data.action==='restore') {await env.DB.prepare('INSERT INTO car_states (board,car,removed) VALUES (?,?,?) ON CONFLICT(board,car) DO UPDATE SET removed=excluded.removed').bind(id,data.car,data.action==='remove'?1:0).run();return reply({ok:true});}
 if(data.action==='note') {
 if(typeof data.body!=='string'||!data.body.trim()||data.body.length>4000||typeof data.author!=='string'||!data.author.trim()||data.author.length>60||typeof data.id!=='string'||!/^[a-f0-9-]{36}$/.test(data.id))return reply({error:'Enter your name and a note (up to 4,000 characters).'},400);
 await env.DB.prepare('INSERT OR IGNORE INTO notes (id,board,car,author,body,created_at) VALUES (?,?,?,?,?,?)').bind(data.id,id,data.car,data.author.trim(),data.body.trim(),new Date().toISOString()).run();return reply({ok:true});
 }
 return reply({error:'Unknown action'},400);
 }catch{return reply({error:'Changes could not be saved. Please retry.'},503);}
}
