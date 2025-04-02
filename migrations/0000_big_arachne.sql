CREATE TABLE "articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"content" text NOT NULL,
	"content_html" text,
	"excerpt" text,
	"image_url" text,
	"publish_date" timestamp NOT NULL,
	"category" text NOT NULL,
	"youtube_video_id" text,
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "banks" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo_url" text,
	"description" text,
	CONSTRAINT "banks_name_unique" UNIQUE("name"),
	CONSTRAINT "banks_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "calculators" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"icon_name" text NOT NULL,
	CONSTRAINT "calculators_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "cards" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"bank_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"annual_fee" text NOT NULL,
	"intro_apr" text,
	"regular_apr" text,
	"rewards_description" text,
	"rating" text,
	"featured" boolean DEFAULT false,
	"card_color_from" text DEFAULT '#0F4C81',
	"card_color_to" text DEFAULT '#0F4C81',
	"content_html" text,
	"youtube_video_id" text,
	CONSTRAINT "cards_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name"),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
