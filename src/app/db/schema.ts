import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

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
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
}, (table) => [
  uniqueIndex("encrypted_mail_user_message_uq").on(table.userId, table.gmailMessageId),
  index("encrypted_mail_user_idx").on(table.userId),
]);

export const encryptedMailRelations = relations(encryptedMail, ({ one }) => ({
  user: one(user, { fields: [encryptedMail.userId], references: [user.id] }),
}));
