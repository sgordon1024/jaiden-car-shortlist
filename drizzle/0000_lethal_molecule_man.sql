CREATE TABLE `boards` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `car_states` (
	`board` text NOT NULL,
	`car` text NOT NULL,
	`removed` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`board`, `car`),
	FOREIGN KEY (`board`) REFERENCES `boards`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `notes` (
	`id` text PRIMARY KEY NOT NULL,
	`board` text NOT NULL,
	`car` text NOT NULL,
	`author` text NOT NULL,
	`body` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`board`) REFERENCES `boards`(`id`) ON UPDATE no action ON DELETE no action
);
