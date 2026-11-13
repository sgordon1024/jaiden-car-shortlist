import { integer, sqliteTable, text, primaryKey } from 'drizzle-orm/sqlite-core';
export const boards = sqliteTable('boards', { id: text('id').primaryKey(), createdAt: text('created_at').notNull() });
export const carStates = sqliteTable('car_states', { board: text('board').notNull().references(()=>boards.id), car: text('car').notNull(), removed: integer('removed').notNull().default(0) }, t=>[primaryKey({columns:[t.board,t.car]})]);
export const notes = sqliteTable('notes', { id: text('id').primaryKey(), board: text('board').notNull().references(()=>boards.id), car: text('car').notNull(), author: text('author').notNull(), body: text('body').notNull(), createdAt: text('created_at').notNull() });
