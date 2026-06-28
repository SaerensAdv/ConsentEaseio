CREATE TABLE "agencies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"logo_url" text,
	"website_url" text,
	"contact_email" text,
	"owner_id" varchar NOT NULL,
	"is_featured" boolean DEFAULT false,
	"featured_order" integer DEFAULT 0,
	"hero_text" text,
	"client_count" integer DEFAULT 0,
	"total_websites" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "agencies_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "agency_clients" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agency_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"client_name" text,
	"notes" text,
	"relationship_type" text DEFAULT 'managed' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agency_invites" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agency_id" varchar NOT NULL,
	"email" text NOT NULL,
	"token" text NOT NULL,
	"invite_type" text NOT NULL,
	"role" text,
	"invited_by" varchar NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "agency_invites_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "agency_members" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agency_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"invited_by" varchar,
	"invited_at" timestamp DEFAULT now() NOT NULL,
	"accepted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "analytics_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"website_id" varchar NOT NULL,
	"event_type" text NOT NULL,
	"country" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "banner_configs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"website_id" varchar NOT NULL,
	"heading" text DEFAULT 'We value your privacy' NOT NULL,
	"description" text DEFAULT 'We use cookies to enhance your browsing experience and analyze site traffic. By clicking "Accept All", you consent to our use of cookies.' NOT NULL,
	"accept_text" text DEFAULT 'Accept All' NOT NULL,
	"reject_text" text DEFAULT 'Reject All' NOT NULL,
	"settings_text" text DEFAULT 'Preferences' NOT NULL,
	"position" text DEFAULT 'bottom-left' NOT NULL,
	"theme" text DEFAULT 'light' NOT NULL,
	"primary_color" text DEFAULT '#726CEA' NOT NULL,
	"background_color" text DEFAULT '#ffffff' NOT NULL,
	"text_color" text DEFAULT '#1e1e1e' NOT NULL,
	"border_radius" integer DEFAULT 12 NOT NULL,
	"show_icon" boolean DEFAULT true NOT NULL,
	"font_family" text DEFAULT 'Inter' NOT NULL,
	"font_size" text DEFAULT 'medium' NOT NULL,
	"shadow" text DEFAULT 'medium' NOT NULL,
	"backdrop_blur" boolean DEFAULT true NOT NULL,
	"animation" text DEFAULT 'slide-up' NOT NULL,
	"button_style" text DEFAULT 'filled' NOT NULL,
	"button_shape" text DEFAULT 'rounded' NOT NULL,
	"border_color" text DEFAULT '#e5e7eb',
	"border_width" integer DEFAULT 1,
	"secondary_button_color" text DEFAULT '#6b7280',
	"max_width" integer DEFAULT 400,
	"show_overlay" boolean DEFAULT false,
	"overlay_opacity" integer DEFAULT 50,
	"logo_url" text,
	"display_delay" integer DEFAULT 0,
	"auto_hide_delay" integer,
	"show_close_button" boolean DEFAULT false,
	"reconsent_days" integer DEFAULT 365,
	"respect_dnt" boolean DEFAULT false,
	"privacy_policy_url" text,
	"privacy_policy_text" text DEFAULT 'Privacy Policy',
	"cookie_policy_url" text,
	"cookie_policy_text" text DEFAULT 'Cookie Policy',
	"custom_footer" text,
	"language" text DEFAULT 'en',
	"translations" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "consent_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"website_id" varchar NOT NULL,
	"visitor_id" text NOT NULL,
	"action" text NOT NULL,
	"ip_hash" text,
	"user_agent" text,
	"country" text,
	"region" text,
	"consent_choices" text NOT NULL,
	"banner_version" text,
	"policy_version" text,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "cookie_categories" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"website_id" varchar NOT NULL,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"description" text NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cookies" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"website_id" varchar NOT NULL,
	"category_id" varchar NOT NULL,
	"name" text NOT NULL,
	"provider" text,
	"purpose" text NOT NULL,
	"expiry" text,
	"type" text DEFAULT 'first-party' NOT NULL,
	"is_auto_detected" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diagnostic_scans" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"website_id" varchar NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"consent_mode_detected" boolean,
	"consent_mode_version" text,
	"default_consent_set" boolean,
	"update_consent_called" boolean,
	"gtm_detected" boolean,
	"gtag_detected" boolean,
	"banner_script_detected" boolean,
	"banner_script_version" text,
	"issues" text,
	"recommendations" text,
	"raw_data" text,
	"scanned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_verification_tokens" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_verification_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"avatar_url" text,
	"plan" text DEFAULT 'solo' NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"subscription_status" text DEFAULT 'none',
	"subscription_end_date" timestamp,
	"email_verified" boolean DEFAULT false NOT NULL,
	"pending_email" text,
	"pending_email_token" text,
	"pending_email_expires" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "web_vitals_metrics" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"website_id" varchar NOT NULL,
	"lcp" integer,
	"cls" numeric(6, 4),
	"inp" integer,
	"fcp" integer,
	"ttfb" integer,
	"banner_delay" integer,
	"country" text,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "websites" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"public_id" text NOT NULL,
	"domain" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"last_scan" timestamp,
	"cookies_found" integer DEFAULT 0,
	"scripts_found" integer DEFAULT 0,
	"clarity_project_id" text,
	"subscription_type" text DEFAULT 'free',
	"subscription_end_date" timestamp,
	"excluded_paths" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "websites_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
ALTER TABLE "agencies" ADD CONSTRAINT "agencies_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_clients" ADD CONSTRAINT "agency_clients_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_clients" ADD CONSTRAINT "agency_clients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_invites" ADD CONSTRAINT "agency_invites_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_invites" ADD CONSTRAINT "agency_invites_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_members" ADD CONSTRAINT "agency_members_agency_id_agencies_id_fk" FOREIGN KEY ("agency_id") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_members" ADD CONSTRAINT "agency_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agency_members" ADD CONSTRAINT "agency_members_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_website_id_websites_id_fk" FOREIGN KEY ("website_id") REFERENCES "public"."websites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "banner_configs" ADD CONSTRAINT "banner_configs_website_id_websites_id_fk" FOREIGN KEY ("website_id") REFERENCES "public"."websites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_logs" ADD CONSTRAINT "consent_logs_website_id_websites_id_fk" FOREIGN KEY ("website_id") REFERENCES "public"."websites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cookie_categories" ADD CONSTRAINT "cookie_categories_website_id_websites_id_fk" FOREIGN KEY ("website_id") REFERENCES "public"."websites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cookies" ADD CONSTRAINT "cookies_website_id_websites_id_fk" FOREIGN KEY ("website_id") REFERENCES "public"."websites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cookies" ADD CONSTRAINT "cookies_category_id_cookie_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."cookie_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diagnostic_scans" ADD CONSTRAINT "diagnostic_scans_website_id_websites_id_fk" FOREIGN KEY ("website_id") REFERENCES "public"."websites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "web_vitals_metrics" ADD CONSTRAINT "web_vitals_metrics_website_id_websites_id_fk" FOREIGN KEY ("website_id") REFERENCES "public"."websites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "websites" ADD CONSTRAINT "websites_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;