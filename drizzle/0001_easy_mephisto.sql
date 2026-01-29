CREATE TABLE `messageTemplates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`customerSegment` enum('long-term','new','chronic_defaulter') NOT NULL,
	`channel` enum('email','sms','whatsapp') NOT NULL,
	`tone` varchar(255) NOT NULL,
	`subject` text,
	`content` text NOT NULL,
	`tags` varchar(500),
	`isPublic` enum('true','false') NOT NULL DEFAULT 'false',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `messageTemplates_id` PRIMARY KEY(`id`)
);
