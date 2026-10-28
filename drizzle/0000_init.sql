CREATE TYPE "public"."purchase_kind" AS ENUM('program', 'session');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('client', 'trainer');--> statement-breakpoint
CREATE TYPE "public"."slot_status" AS ENUM('open', 'held', 'booked');--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_id" uuid NOT NULL,
	"title" text NOT NULL,
	"position" integer NOT NULL,
	"video_path" text,
	CONSTRAINT "lessons_program_id_position_unique" UNIQUE("program_id","position")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"role" "role" NOT NULL,
	"name" text NOT NULL,
	"avatar_url" text,
	"headline" text,
	"bio" text,
	"specialties" text[],
	"session_price_cents" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "programs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trainer_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"cover_url" text,
	"price_cents" integer NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"trainer_id" uuid NOT NULL,
	"kind" "purchase_kind" NOT NULL,
	"program_id" uuid,
	"slot_id" uuid,
	"amount_cents" integer NOT NULL,
	"stripe_session_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "purchases_stripe_session_id_unique" UNIQUE("stripe_session_id")
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trainer_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reviews_trainer_id_client_id_unique" UNIQUE("trainer_id","client_id"),
	CONSTRAINT "rating_1_to_5" CHECK ("reviews"."rating" BETWEEN 1 AND 5)
);
--> statement-breakpoint
CREATE TABLE "slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trainer_id" uuid NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"status" "slot_status" DEFAULT 'open' NOT NULL,
	"client_id" uuid,
	"held_until" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programs" ADD CONSTRAINT "programs_trainer_id_profiles_user_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_client_id_profiles_user_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_trainer_id_profiles_user_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_slot_id_slots_id_fk" FOREIGN KEY ("slot_id") REFERENCES "public"."slots"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_trainer_id_profiles_user_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_client_id_profiles_user_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slots" ADD CONSTRAINT "slots_trainer_id_profiles_user_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slots" ADD CONSTRAINT "slots_client_id_profiles_user_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."profiles"("user_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "one_purchase_per_program" ON "purchases" USING btree ("client_id","program_id") WHERE "purchases"."kind" = 'program';