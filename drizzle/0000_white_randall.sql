CREATE TABLE "encryptedMail" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"threadId" text,
	"envelopeFrom" text,
	"envelopeSubject" text,
	"envelopeDate" text,
	"flagsUnread" boolean DEFAULT true,
	"content" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"accessToken" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_accessToken_unique" UNIQUE("accessToken")
);
--> statement-breakpoint
ALTER TABLE "encryptedMail" ADD CONSTRAINT "encryptedMail_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "encrypted_mail_user_id_uq" ON "encryptedMail" USING btree ("userId","id");--> statement-breakpoint
CREATE INDEX "encrypted_mail_user_idx" ON "encryptedMail" USING btree ("userId");