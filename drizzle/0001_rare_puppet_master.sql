DROP INDEX "encrypted_mail_user_id_uq";--> statement-breakpoint
DROP INDEX "encrypted_mail_user_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "encryptedMailUserIdUQ" ON "encryptedMail" USING btree ("userId","id");--> statement-breakpoint
CREATE INDEX "encryptedMailUserIdIndex" ON "encryptedMail" USING btree ("userId");