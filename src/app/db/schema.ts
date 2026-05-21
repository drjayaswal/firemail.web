import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
  uniqueIndex,
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export * from "./auth-schema";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  accessToken: text("accessToken").notNull().unique(),
  createdAt: timestamp("createdAt").notNull(),
});

export const encryptedMail = pgTable("encrypted_mail", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  gmailMessageId: text("gmail_message_id").notNull(),
  ciphertext: text("ciphertext").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  categories: text("categories").array(),
  priority: decimal("priority", { precision: 10, scale: 4 }).array().notNull().default([]),
  version: text("version").array().notNull().default([]),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
}, (table) => [
  uniqueIndex("encrypted_mail_user_message_uq").on(table.userId, table.gmailMessageId),
  index("encrypted_mail_user_idx").on(table.userId),
]);

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
});

export const encryptedMailRelations = relations(encryptedMail, ({ one }) => ({
  user: one(user, { fields: [encryptedMail.userId], references: [user.id] }),
}));
