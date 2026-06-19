CREATE DATABASE  IF NOT EXISTS `pos_system` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `pos_system`;
-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: pos_system
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `name_2` (`name`),
  UNIQUE KEY `name_3` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'Beverages','Drinks, juices, water, and other beverages',1,'2026-06-11 08:25:38','2026-06-11 08:25:38'),(2,'Snacks','Chips, cookies, candy, and other snacks',1,'2026-06-11 08:25:38','2026-06-11 08:25:38'),(3,'Electronics','Cables, chargers, earphones, and accessories',1,'2026-06-11 08:25:38','2026-06-11 08:25:38'),(4,'Household','Cleaning supplies, toiletries, and household items',1,'2026-06-11 08:25:38','2026-06-11 08:25:38'),(5,'Stationery','Pens, notebooks, paper, and office supplies',1,'2026-06-11 08:25:38','2026-06-11 08:25:38'),(21,'RapidTest_1781797573058',NULL,1,'2026-06-18 15:46:13','2026-06-18 15:46:13'),(22,'កាតសារ \"test\" — \'intro\'',NULL,0,'2026-06-18 15:46:22','2026-06-18 15:46:26'),(23,'RapidTest_1781798885904',NULL,1,'2026-06-18 16:08:06','2026-06-18 16:08:06');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` text,
  `points` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone` (`phone`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,'Walk-in Customer',NULL,NULL,NULL,0,1,'2026-06-11 08:25:38','2026-06-11 08:25:38'),(2,'Sokha Chea','+855 12 111 222','sokha@email.com','Street 63, Phnom Penh',2,1,'2026-06-11 08:25:38','2026-06-19 08:28:51'),(3,'Dara Kim','+855 12 333 444','dara.kim@email.com','Street 271, Phnom Penh',100,1,'2026-06-11 08:25:38','2026-06-19 08:28:41'),(4,'Bopha Ly','+855 12 555 666','bopha.ly@email.com','Street 110, Phnom Penh',14,1,'2026-06-11 08:25:38','2026-06-19 08:28:02'),(17,'Hak','+855 09239239','sdfwaf@gmaif.com','PP',12,1,'2026-06-19 08:19:55','2026-06-19 08:28:44'),(18,'f','123123123','f@dfdf.co','f',0,0,'2026-06-19 08:20:14','2026-06-19 08:20:17');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `barcode` varchar(50) DEFAULT NULL,
  `name` varchar(200) NOT NULL,
  `description` text,
  `category_id` int DEFAULT NULL,
  `cost_price` decimal(12,2) NOT NULL DEFAULT '0.00',
  `sell_price` decimal(12,2) NOT NULL,
  `stock_qty` int NOT NULL DEFAULT '0',
  `min_stock` int DEFAULT '10',
  `unit` varchar(20) DEFAULT 'pcs',
  `image_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `barcode` (`barcode`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'8850999220017','Coca-Cola 330ml','Classic Coca-Cola can 330ml',1,0.35,0.75,148,20,'pcs','/uploads/products/coca_cola.png',1,'2026-06-11 08:25:38','2026-06-11 09:50:44'),(2,'8851234560012','Pepsi 330ml','Pepsi cola can 330ml',1,0.30,0.70,111,20,'pcs','/uploads/products/pepsi.png',1,'2026-06-11 08:25:38','2026-06-19 09:07:45'),(3,'8850001234567','Mineral Water 500ml','Pure mineral water bottle',1,0.15,0.50,198,30,'pcs','/uploads/products/mineral_water.png',1,'2026-06-11 08:25:38','2026-06-17 12:47:41'),(4,'8850009876543','Orange Juice 1L','Fresh orange juice carton',1,1.20,2.50,34,10,'pcs','/uploads/products/orange_juice.png',1,'2026-06-11 08:25:38','2026-06-19 08:55:55'),(5,'8851111222333','Iced Coffee 240ml','Premium iced coffee can',1,0.45,1.00,1000000067,15,'pcs','/uploads/products/iced_coffee.png',1,'2026-06-11 08:25:38','2026-06-19 09:06:50'),(6,'8852222333444','Lays Classic 75g','Lays potato chips original flavor',2,0.50,1.25,87,15,'pcs','/uploads/products/lays_classic.png',1,'2026-06-11 08:25:38','2026-06-17 12:25:18'),(7,'8852223334445','Oreo Cookies 133g','Oreo chocolate sandwich cookies',2,0.80,1.75,65,10,'pcs','/uploads/products/oreo_cookies.png',1,'2026-06-11 08:25:38','2026-06-19 09:07:45'),(8,'8852224335446','KitKat 4-Finger','Nestle KitKat chocolate wafer bar',2,0.60,1.50,94,15,'pcs','/uploads/products/kitkat.png',1,'2026-06-11 08:25:38','2026-06-18 14:59:52'),(9,'8853333444555','Snickers Bar','Snickers chocolate peanut bar',2,0.55,1.25,81,10,'pcs','/uploads/products/snickers.png',1,'2026-06-11 08:25:38','2026-06-17 12:38:28'),(10,'8854444555666','USB-C Cable 1m','High-quality USB-C charging cable',3,1.50,4.50,39,5,'pcs','/uploads/products/usbc_cable.png',1,'2026-06-11 08:25:38','2026-06-18 13:55:13'),(11,'8854445556667','Earphones Basic','Wired earphones with microphone',3,2.00,5.99,28,5,'pcs','/uploads/products/earphones.png',1,'2026-06-11 08:25:38','2026-06-17 12:34:26'),(12,'8854446557668','Phone Charger 10W','Universal USB phone charger',3,3.00,7.50,19,5,'pcs','/uploads/products/phone_charger.png',1,'2026-06-11 08:25:38','2026-06-19 09:06:50'),(13,'8855555666777','Dish Soap 500ml','Lemon scented dish washing liquid',4,0.80,1.99,58,10,'pcs','/uploads/products/dish_soap.png',1,'2026-06-11 08:25:38','2026-06-11 09:50:44'),(14,'8855556667778','Tissue Box 200pcs','Soft facial tissue box',4,0.60,1.50,99,15,'pcs','/uploads/products/tissue_box.png',1,'2026-06-11 08:25:38','2026-06-17 12:38:28'),(15,'8856666777888','Ballpoint Pen Blue','Smooth writing ballpoint pen',5,0.10,0.50,196,30,'pcs','/uploads/products/ballpoint_pen.png',1,'2026-06-11 08:25:38','2026-06-18 14:50:03'),(16,'8856667778889','Notebook A5 80pg','Ruled notebook A5 size 80 pages',5,0.40,1.25,143,20,'pcs','/uploads/products/notebook_a5.png',1,'2026-06-11 08:25:38','2026-06-17 12:37:56'),(35,'200700344065','Iphone 17 pro max','Iphone',3,100.00,200.00,99,5,'pcs',NULL,1,'2026-06-17 12:46:19','2026-06-19 09:06:50'),(36,NULL,'TestProduct_437361',NULL,NULL,1.00,2.50,0,5,'pcs',NULL,1,'2026-06-18 15:43:57','2026-06-18 15:43:57'),(37,NULL,'TestProduct_777096',NULL,NULL,1.00,2.50,0,5,'pcs',NULL,1,'2026-06-18 16:06:17','2026-06-18 16:06:17');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sale_items`
--

DROP TABLE IF EXISTS `sale_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sale_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sale_id` int NOT NULL,
  `product_id` int NOT NULL,
  `product_name` varchar(200) NOT NULL,
  `barcode` varchar(50) DEFAULT NULL,
  `qty` int NOT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `discount` decimal(12,2) DEFAULT '0.00',
  `total` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sale_id` (`sale_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `sale_items_ibfk_1` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE,
  CONSTRAINT `sale_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=80 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sale_items`
--

LOCK TABLES `sale_items` WRITE;
/*!40000 ALTER TABLE `sale_items` DISABLE KEYS */;
INSERT INTO `sale_items` VALUES (1,1,5,'Iced Coffee 240ml','8851111222333',1,1.00,0.00,1.00),(2,1,11,'Earphones Basic','8854445556667',1,5.99,0.00,5.99),(3,1,16,'Notebook A5 80pg','8856667778889',1,1.25,0.00,1.25),(4,1,4,'Orange Juice 1L','8850009876543',1,2.50,0.00,2.50),(5,2,5,'Iced Coffee 240ml','8851111222333',1,1.00,0.00,1.00),(6,2,16,'Notebook A5 80pg','8856667778889',1,1.25,0.00,1.25),(7,2,4,'Orange Juice 1L','8850009876543',19,2.50,0.00,47.50),(8,3,5,'Iced Coffee 240ml','8851111222333',1,1.00,0.00,1.00),(9,3,11,'Earphones Basic','8854445556667',1,5.99,0.00,5.99),(10,3,16,'Notebook A5 80pg','8856667778889',1,1.25,0.00,1.25),(11,3,4,'Orange Juice 1L','8850009876543',1,2.50,0.00,2.50),(12,4,11,'Earphones Basic','8854445556667',1,5.99,0.00,5.99),(13,4,5,'Iced Coffee 240ml','8851111222333',1,1.00,0.00,1.00),(14,4,16,'Notebook A5 80pg','8856667778889',1,1.25,0.00,1.25),(15,4,4,'Orange Juice 1L','8850009876543',1,2.50,0.00,2.50),(16,5,1,'Coca-Cola 330ml','8850999220017',2,0.75,0.00,1.50),(17,5,13,'Dish Soap 500ml','8855555666777',2,1.99,0.00,3.98),(18,5,11,'Earphones Basic','8854445556667',2,5.99,0.00,11.98),(19,5,5,'Iced Coffee 240ml','8851111222333',2,1.00,0.00,2.00),(20,5,16,'Notebook A5 80pg','8856667778889',1,1.25,0.00,1.25),(21,5,3,'Mineral Water 500ml','8850001234567',1,0.50,0.00,0.50),(22,6,2,'Pepsi 330ml','8851234560012',1,0.70,0.00,0.70),(23,6,9,'Snickers Bar','8853333444555',1,1.25,0.00,1.25),(24,6,12,'Phone Charger 10W','8854446557668',1,7.50,0.00,7.50),(25,6,8,'KitKat 4-Finger','8852224335446',2,1.50,0.00,3.00),(26,6,6,'Lays Classic 75g','8852222333444',1,1.25,0.00,1.25),(27,7,11,'Earphones Basic','8854445556667',1,5.99,0.00,5.99),(28,7,5,'Iced Coffee 240ml','8851111222333',1,1.00,0.00,1.00),(29,7,8,'KitKat 4-Finger','8852224335446',1,1.50,0.00,1.50),(30,7,6,'Lays Classic 75g','8852222333444',1,1.25,0.00,1.25),(31,7,9,'Snickers Bar','8853333444555',1,1.25,0.00,1.25),(32,7,2,'Pepsi 330ml','8851234560012',2,0.70,0.00,1.40),(33,7,4,'Orange Juice 1L','8850009876543',1,2.50,0.00,2.50),(34,7,7,'Oreo Cookies 133g','8852223334445',1,1.75,0.00,1.75),(35,8,9,'Snickers Bar','8853333444555',1,1.25,0.00,1.25),(36,8,12,'Phone Charger 10W','8854446557668',1,7.50,0.00,7.50),(37,8,6,'Lays Classic 75g','8852222333444',1,1.25,0.00,1.25),(38,9,11,'Earphones Basic','8854445556667',1,5.99,0.00,5.99),(39,9,5,'Iced Coffee 240ml','8851111222333',1,1.00,0.00,1.00),(40,9,16,'Notebook A5 80pg','8856667778889',1,1.25,0.00,1.25),(41,9,4,'Orange Juice 1L','8850009876543',1,2.50,0.00,2.50),(42,10,16,'Notebook A5 80pg','8856667778889',1,1.25,0.00,1.25),(43,10,4,'Orange Juice 1L','8850009876543',1,2.50,0.00,2.50),(44,11,14,'Tissue Box 200pcs','8855556667778',1,1.50,0.00,1.50),(45,11,9,'Snickers Bar','8853333444555',1,1.25,0.00,1.25),(46,12,3,'Mineral Water 500ml','8850001234567',1,0.50,0.00,0.50),(47,12,35,'Iphone 17 pro max','200700344065',5,200.00,0.00,1000.00),(48,13,8,'KitKat 4-Finger','8852224335446',1,1.50,0.00,1.50),(49,13,35,'Iphone 17 pro max','200700344065',1,200.00,0.00,200.00),(50,13,5,'Iced Coffee 240ml','8851111222333',1,1.00,0.00,1.00),(51,13,7,'Oreo Cookies 133g','8852223334445',1,1.75,0.00,1.75),(52,13,2,'Pepsi 330ml','8851234560012',1,0.70,0.00,0.70),(53,13,12,'Phone Charger 10W','8854446557668',1,7.50,0.00,7.50),(54,14,15,'Ballpoint Pen Blue','8856666777888',2,0.50,0.00,1.00),(55,15,8,'KitKat 4-Finger','8852224335446',1,1.50,0.00,1.50),(56,15,35,'Iphone 17 pro max','200700344065',1,200.00,0.00,200.00),(57,15,10,'USB-C Cable 1m','8854444555666',1,4.50,0.00,4.50),(58,16,15,'Ballpoint Pen Blue','8856666777888',1,0.50,0.00,0.50),(59,17,15,'Ballpoint Pen Blue','8856666777888',1,0.50,0.00,0.50),(60,18,7,'Oreo Cookies 133g','8852223334445',1,1.75,0.00,1.75),(61,18,2,'Pepsi 330ml','8851234560012',1,0.70,0.00,0.70),(62,18,5,'Iced Coffee 240ml','8851111222333',1,1.00,0.00,1.00),(63,18,35,'Iphone 17 pro max','200700344065',1,200.00,0.00,200.00),(64,18,8,'KitKat 4-Finger','8852224335446',1,1.50,0.00,1.50),(65,19,35,'Iphone 17 pro max','200700344065',1,200.00,0.00,200.00),(66,19,5,'Iced Coffee 240ml','8851111222333',1,1.00,0.00,1.00),(67,20,12,'Phone Charger 10W','8854446557668',1,7.50,0.00,7.50),(68,20,2,'Pepsi 330ml','8851234560012',1,0.70,0.00,0.70),(69,21,2,'Pepsi 330ml','8851234560012',1,0.70,0.00,0.70),(70,21,12,'Phone Charger 10W','8854446557668',1,7.50,0.00,7.50),(71,22,5,'Iced Coffee 240ml','8851111222333',1,1.00,0.00,1.00),(72,22,4,'Orange Juice 1L','8850009876543',1,2.50,0.00,2.50),(73,22,7,'Oreo Cookies 133g','8852223334445',1,1.75,0.00,1.75),(74,23,2,'Pepsi 330ml','8851234560012',1,0.70,0.00,0.70),(75,23,12,'Phone Charger 10W','8854446557668',1,7.50,0.00,7.50),(76,23,5,'Iced Coffee 240ml','8851111222333',1,1.00,0.00,1.00),(77,23,35,'Iphone 17 pro max','200700344065',1,200.00,0.00,200.00),(78,24,2,'Pepsi 330ml','8851234560012',1,0.70,0.00,0.70),(79,24,7,'Oreo Cookies 133g','8852223334445',1,1.75,0.00,1.75);
/*!40000 ALTER TABLE `sale_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales`
--

DROP TABLE IF EXISTS `sales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sales` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invoice_number` varchar(50) NOT NULL,
  `user_id` int NOT NULL,
  `customer_id` int DEFAULT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `discount_type` enum('percentage','fixed') DEFAULT 'fixed',
  `discount_value` decimal(12,2) DEFAULT '0.00',
  `discount_amount` decimal(12,2) DEFAULT '0.00',
  `tax_rate` decimal(5,2) DEFAULT '0.00',
  `tax_amount` decimal(12,2) DEFAULT '0.00',
  `total_amount` decimal(12,2) NOT NULL,
  `amount_paid` decimal(12,2) NOT NULL,
  `change_amount` decimal(12,2) DEFAULT '0.00',
  `payment_method` enum('cash','card','qr','other') DEFAULT 'cash',
  `note` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoice_number` (`invoice_number`),
  KEY `user_id` (`user_id`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `sales_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `sales_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales`
--

LOCK TABLES `sales` WRITE;
/*!40000 ALTER TABLE `sales` DISABLE KEYS */;
INSERT INTO `sales` VALUES (1,'INV-20260611-0001',2,NULL,10.74,'fixed',0.00,0.00,10.00,1.07,11.81,255.71,243.90,'cash',NULL,'2026-06-11 09:30:49'),(2,'INV-20260611-0002',2,NULL,49.75,'fixed',0.00,0.00,10.00,4.98,54.73,100.00,45.28,'cash',NULL,'2026-06-11 09:31:24'),(3,'INV-20260611-0003',1,NULL,10.74,'fixed',0.00,0.00,10.00,1.07,11.81,20.00,8.19,'cash',NULL,'2026-06-11 09:32:37'),(4,'INV-20260611-0004',1,NULL,10.74,'percentage',0.00,0.00,10.00,1.07,11.81,50.00,38.19,'cash',NULL,'2026-06-11 09:47:26'),(5,'INV-20260611-0005',1,NULL,21.21,'percentage',0.00,0.00,10.00,2.12,23.33,100.00,76.67,'cash',NULL,'2026-06-11 09:50:44'),(6,'INV-20260613-0001',1,NULL,13.70,'percentage',0.00,0.00,10.00,1.37,15.07,15.07,0.00,'cash',NULL,'2026-06-13 10:34:48'),(7,'INV-20260617-0001',1,NULL,16.64,'percentage',0.00,0.00,10.00,1.66,18.30,50.00,31.70,'cash',NULL,'2026-06-17 12:17:22'),(8,'INV-20260617-0002',1,NULL,10.00,'percentage',0.00,0.00,10.00,1.00,11.00,100.00,89.00,'cash',NULL,'2026-06-17 12:25:18'),(9,'INV-20260617-0003',1,NULL,10.74,'percentage',20.00,2.15,10.00,0.86,9.45,12.20,2.74,'cash',NULL,'2026-06-17 12:34:26'),(10,'INV-20260617-0004',1,NULL,3.75,'fixed',0.00,0.00,10.00,0.38,4.13,100.00,95.88,'cash',NULL,'2026-06-17 12:37:56'),(11,'INV-20260617-0005',1,NULL,2.75,'percentage',0.00,0.00,10.00,0.28,3.03,100.00,96.98,'cash',NULL,'2026-06-17 12:38:28'),(12,'INV-20260617-0006',2,NULL,1000.50,'percentage',0.00,0.00,10.00,100.05,1100.55,1101.00,0.45,'cash',NULL,'2026-06-17 12:47:41'),(13,'INV-20260617-0007',1,NULL,212.45,'percentage',29.00,61.61,10.00,15.08,165.92,250.00,84.08,'cash',NULL,'2026-06-17 12:54:09'),(14,'INV-20260617-0008',2,NULL,1.00,'percentage',0.00,0.00,10.00,0.10,1.10,150.00,148.90,'cash',NULL,'2026-06-17 14:12:15'),(15,'INV-20260618-0001',1,NULL,206.00,'percentage',0.00,0.00,10.00,20.60,226.60,300.00,73.40,'cash',NULL,'2026-06-18 13:55:13'),(16,'INV-20260618-0002',2,NULL,0.50,'percentage',100.00,0.50,10.00,0.00,0.00,0.00,0.00,'cash',NULL,'2026-06-18 14:30:32'),(17,'INV-20260618-0003',2,NULL,0.50,'percentage',100.00,0.50,10.00,0.00,0.00,0.00,0.00,'cash',NULL,'2026-06-18 14:50:03'),(18,'INV-20260618-0004',1,NULL,204.95,'fixed',4.00,4.00,10.00,20.10,221.05,300.00,78.96,'cash',NULL,'2026-06-18 14:59:52'),(19,'INV-20260619-0001',1,NULL,201.00,'percentage',0.00,0.00,10.00,20.10,221.10,300.00,78.90,'cash',NULL,'2026-06-19 08:16:07'),(20,'INV-20260619-0002',1,NULL,8.20,'percentage',0.00,0.00,10.00,0.82,9.02,100.00,90.98,'cash',NULL,'2026-06-19 08:43:41'),(21,'INV-20260619-0003',1,NULL,8.20,'percentage',0.00,0.00,10.00,0.82,9.02,100.00,90.98,'cash',NULL,'2026-06-19 08:44:23'),(22,'INV-20260619-0004',1,NULL,5.25,'percentage',0.00,0.00,10.00,0.53,5.78,100.00,94.23,'cash',NULL,'2026-06-19 08:55:55'),(23,'INV-20260619-0005',2,NULL,209.20,'percentage',0.00,0.00,10.00,20.92,230.12,304.88,74.76,'cash',NULL,'2026-06-19 09:06:50'),(24,'INV-20260619-0006',1,NULL,2.45,'percentage',0.00,0.00,10.00,0.25,2.70,36.59,33.89,'cash',NULL,'2026-06-19 09:07:45');
/*!40000 ALTER TABLE `sales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(50) NOT NULL,
  `setting_value` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `settings`
--

LOCK TABLES `settings` WRITE;
/*!40000 ALTER TABLE `settings` DISABLE KEYS */;
INSERT INTO `settings` VALUES (1,'tax_rate','10','Default tax rate percentage','2026-06-11 08:25:38'),(2,'exchange_rate','4100','USD to KHR exchange rate','2026-06-11 08:25:38'),(3,'shop_name','MekongPOS','Shop display name','2026-06-19 08:43:50'),(4,'shop_address','Phnom Penh, Cambodia','Shop address','2026-06-11 08:25:38'),(5,'shop_phone','+855 12 345 678','Shop phone number','2026-06-11 08:25:38'),(6,'receipt_footer','Thank you for shopping with us!','Receipt footer message','2026-06-11 08:25:38'),(7,'currency_primary','USD','Primary currency','2026-06-19 09:08:01'),(8,'currency_secondary','KHR','Secondary currency','2026-06-19 09:08:01');
/*!40000 ALTER TABLE `settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_movements`
--

DROP TABLE IF EXISTS `stock_movements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_movements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `type` enum('in','out','adjustment','sale') NOT NULL,
  `qty` int NOT NULL,
  `reference` varchar(100) DEFAULT NULL,
  `note` text,
  `user_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `stock_movements_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `stock_movements_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=83 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_movements`
--

LOCK TABLES `stock_movements` WRITE;
/*!40000 ALTER TABLE `stock_movements` DISABLE KEYS */;
INSERT INTO `stock_movements` VALUES (1,5,'sale',1,'INV-20260611-0001','Sale: Iced Coffee 240ml x1',2,'2026-06-11 09:30:49'),(2,11,'sale',1,'INV-20260611-0001','Sale: Earphones Basic x1',2,'2026-06-11 09:30:49'),(3,16,'sale',1,'INV-20260611-0001','Sale: Notebook A5 80pg x1',2,'2026-06-11 09:30:49'),(4,4,'sale',1,'INV-20260611-0001','Sale: Orange Juice 1L x1',2,'2026-06-11 09:30:49'),(5,5,'sale',1,'INV-20260611-0002','Sale: Iced Coffee 240ml x1',2,'2026-06-11 09:31:24'),(6,16,'sale',1,'INV-20260611-0002','Sale: Notebook A5 80pg x1',2,'2026-06-11 09:31:24'),(7,4,'sale',19,'INV-20260611-0002','Sale: Orange Juice 1L x19',2,'2026-06-11 09:31:24'),(8,5,'sale',1,'INV-20260611-0003','Sale: Iced Coffee 240ml x1',1,'2026-06-11 09:32:37'),(9,11,'sale',1,'INV-20260611-0003','Sale: Earphones Basic x1',1,'2026-06-11 09:32:37'),(10,16,'sale',1,'INV-20260611-0003','Sale: Notebook A5 80pg x1',1,'2026-06-11 09:32:37'),(11,4,'sale',1,'INV-20260611-0003','Sale: Orange Juice 1L x1',1,'2026-06-11 09:32:37'),(12,11,'sale',1,'INV-20260611-0004','Sale: Earphones Basic x1',1,'2026-06-11 09:47:26'),(13,5,'sale',1,'INV-20260611-0004','Sale: Iced Coffee 240ml x1',1,'2026-06-11 09:47:26'),(14,16,'sale',1,'INV-20260611-0004','Sale: Notebook A5 80pg x1',1,'2026-06-11 09:47:26'),(15,4,'sale',1,'INV-20260611-0004','Sale: Orange Juice 1L x1',1,'2026-06-11 09:47:26'),(16,1,'sale',2,'INV-20260611-0005','Sale: Coca-Cola 330ml x2',1,'2026-06-11 09:50:44'),(17,13,'sale',2,'INV-20260611-0005','Sale: Dish Soap 500ml x2',1,'2026-06-11 09:50:44'),(18,11,'sale',2,'INV-20260611-0005','Sale: Earphones Basic x2',1,'2026-06-11 09:50:44'),(19,5,'sale',2,'INV-20260611-0005','Sale: Iced Coffee 240ml x2',1,'2026-06-11 09:50:44'),(20,16,'sale',1,'INV-20260611-0005','Sale: Notebook A5 80pg x1',1,'2026-06-11 09:50:44'),(21,3,'sale',1,'INV-20260611-0005','Sale: Mineral Water 500ml x1',1,'2026-06-11 09:50:44'),(22,2,'sale',1,'INV-20260613-0001','Sale: Pepsi 330ml x1',1,'2026-06-13 10:34:48'),(23,9,'sale',1,'INV-20260613-0001','Sale: Snickers Bar x1',1,'2026-06-13 10:34:48'),(24,12,'sale',1,'INV-20260613-0001','Sale: Phone Charger 10W x1',1,'2026-06-13 10:34:48'),(25,8,'sale',2,'INV-20260613-0001','Sale: KitKat 4-Finger x2',1,'2026-06-13 10:34:48'),(26,6,'sale',1,'INV-20260613-0001','Sale: Lays Classic 75g x1',1,'2026-06-13 10:34:48'),(27,11,'sale',1,'INV-20260617-0001','Sale: Earphones Basic x1',1,'2026-06-17 12:17:22'),(28,5,'sale',1,'INV-20260617-0001','Sale: Iced Coffee 240ml x1',1,'2026-06-17 12:17:22'),(29,8,'sale',1,'INV-20260617-0001','Sale: KitKat 4-Finger x1',1,'2026-06-17 12:17:22'),(30,6,'sale',1,'INV-20260617-0001','Sale: Lays Classic 75g x1',1,'2026-06-17 12:17:22'),(31,9,'sale',1,'INV-20260617-0001','Sale: Snickers Bar x1',1,'2026-06-17 12:17:22'),(32,2,'sale',2,'INV-20260617-0001','Sale: Pepsi 330ml x2',1,'2026-06-17 12:17:22'),(33,4,'sale',1,'INV-20260617-0001','Sale: Orange Juice 1L x1',1,'2026-06-17 12:17:22'),(34,7,'sale',1,'INV-20260617-0001','Sale: Oreo Cookies 133g x1',1,'2026-06-17 12:17:22'),(35,9,'sale',1,'INV-20260617-0002','Sale: Snickers Bar x1',1,'2026-06-17 12:25:18'),(36,12,'sale',1,'INV-20260617-0002','Sale: Phone Charger 10W x1',1,'2026-06-17 12:25:18'),(37,6,'sale',1,'INV-20260617-0002','Sale: Lays Classic 75g x1',1,'2026-06-17 12:25:18'),(38,11,'sale',1,'INV-20260617-0003','Sale: Earphones Basic x1',1,'2026-06-17 12:34:26'),(39,5,'sale',1,'INV-20260617-0003','Sale: Iced Coffee 240ml x1',1,'2026-06-17 12:34:26'),(40,16,'sale',1,'INV-20260617-0003','Sale: Notebook A5 80pg x1',1,'2026-06-17 12:34:26'),(41,4,'sale',1,'INV-20260617-0003','Sale: Orange Juice 1L x1',1,'2026-06-17 12:34:26'),(42,16,'sale',1,'INV-20260617-0004','Sale: Notebook A5 80pg x1',1,'2026-06-17 12:37:56'),(43,4,'sale',1,'INV-20260617-0004','Sale: Orange Juice 1L x1',1,'2026-06-17 12:37:56'),(44,14,'sale',1,'INV-20260617-0005','Sale: Tissue Box 200pcs x1',1,'2026-06-17 12:38:28'),(45,9,'sale',1,'INV-20260617-0005','Sale: Snickers Bar x1',1,'2026-06-17 12:38:28'),(46,5,'in',1000000000,NULL,NULL,1,'2026-06-17 12:44:01'),(47,3,'sale',1,'INV-20260617-0006','Sale: Mineral Water 500ml x1',2,'2026-06-17 12:47:41'),(48,35,'sale',5,'INV-20260617-0006','Sale: Iphone 17 pro max x5',2,'2026-06-17 12:47:41'),(49,8,'sale',1,'INV-20260617-0007','Sale: KitKat 4-Finger x1',1,'2026-06-17 12:54:09'),(50,35,'sale',1,'INV-20260617-0007','Sale: Iphone 17 pro max x1',1,'2026-06-17 12:54:09'),(51,5,'sale',1,'INV-20260617-0007','Sale: Iced Coffee 240ml x1',1,'2026-06-17 12:54:09'),(52,7,'sale',1,'INV-20260617-0007','Sale: Oreo Cookies 133g x1',1,'2026-06-17 12:54:09'),(53,2,'sale',1,'INV-20260617-0007','Sale: Pepsi 330ml x1',1,'2026-06-17 12:54:09'),(54,12,'sale',1,'INV-20260617-0007','Sale: Phone Charger 10W x1',1,'2026-06-17 12:54:09'),(55,15,'sale',2,'INV-20260617-0008','Sale: Ballpoint Pen Blue x2',2,'2026-06-17 14:12:15'),(56,8,'sale',1,'INV-20260618-0001','Sale: KitKat 4-Finger x1',1,'2026-06-18 13:55:13'),(57,35,'sale',1,'INV-20260618-0001','Sale: Iphone 17 pro max x1',1,'2026-06-18 13:55:13'),(58,10,'sale',1,'INV-20260618-0001','Sale: USB-C Cable 1m x1',1,'2026-06-18 13:55:13'),(59,15,'sale',1,'INV-20260618-0002','Sale: Ballpoint Pen Blue x1',2,'2026-06-18 14:30:32'),(60,15,'sale',1,'INV-20260618-0003','Sale: Ballpoint Pen Blue x1',2,'2026-06-18 14:50:03'),(61,7,'sale',1,'INV-20260618-0004','Sale: Oreo Cookies 133g x1',1,'2026-06-18 14:59:52'),(62,2,'sale',1,'INV-20260618-0004','Sale: Pepsi 330ml x1',1,'2026-06-18 14:59:52'),(63,5,'sale',1,'INV-20260618-0004','Sale: Iced Coffee 240ml x1',1,'2026-06-18 14:59:52'),(64,35,'sale',1,'INV-20260618-0004','Sale: Iphone 17 pro max x1',1,'2026-06-18 14:59:52'),(65,8,'sale',1,'INV-20260618-0004','Sale: KitKat 4-Finger x1',1,'2026-06-18 14:59:52'),(66,35,'sale',1,'INV-20260619-0001','Sale: Iphone 17 pro max x1',1,'2026-06-19 08:16:07'),(67,5,'sale',1,'INV-20260619-0001','Sale: Iced Coffee 240ml x1',1,'2026-06-19 08:16:07'),(68,12,'sale',1,'INV-20260619-0002','Sale: Phone Charger 10W x1',1,'2026-06-19 08:43:41'),(69,2,'sale',1,'INV-20260619-0002','Sale: Pepsi 330ml x1',1,'2026-06-19 08:43:41'),(70,2,'sale',1,'INV-20260619-0003','Sale: Pepsi 330ml x1',1,'2026-06-19 08:44:23'),(71,12,'sale',1,'INV-20260619-0003','Sale: Phone Charger 10W x1',1,'2026-06-19 08:44:23'),(72,5,'sale',1,'INV-20260619-0004','Sale: Iced Coffee 240ml x1',1,'2026-06-19 08:55:55'),(73,4,'sale',1,'INV-20260619-0004','Sale: Orange Juice 1L x1',1,'2026-06-19 08:55:55'),(74,7,'sale',1,'INV-20260619-0004','Sale: Oreo Cookies 133g x1',1,'2026-06-19 08:55:55'),(75,35,'in',100,NULL,NULL,1,'2026-06-19 08:56:50'),(76,35,'out',1,NULL,NULL,1,'2026-06-19 08:57:13'),(77,2,'sale',1,'INV-20260619-0005','Sale: Pepsi 330ml x1',2,'2026-06-19 09:06:50'),(78,12,'sale',1,'INV-20260619-0005','Sale: Phone Charger 10W x1',2,'2026-06-19 09:06:50'),(79,5,'sale',1,'INV-20260619-0005','Sale: Iced Coffee 240ml x1',2,'2026-06-19 09:06:50'),(80,35,'sale',1,'INV-20260619-0005','Sale: Iphone 17 pro max x1',2,'2026-06-19 09:06:50'),(81,2,'sale',1,'INV-20260619-0006','Sale: Pepsi 330ml x1',1,'2026-06-19 09:07:45'),(82,7,'sale',1,'INV-20260619-0006','Sale: Oreo Cookies 133g x1',1,'2026-06-19 09:07:45');
/*!40000 ALTER TABLE `stock_movements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `role` enum('admin','cashier') DEFAULT 'cashier',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2a$10$SCcZyj36bPa9krF7yIaSyeE8gdu6eI6W0kuyCh4hNdgwJAUSlGxzu','System Admin','admin',1,'2026-06-11 08:25:38','2026-06-11 08:25:38'),(2,'cashier','$2a$10$t518J23/k3Zgy.0TojjJGOkKj264mlLRdDN.DDamam6zfQ1R1Cnui','Default Cashier','cashier',1,'2026-06-11 08:25:38','2026-06-19 08:58:48'),(8,'warehouse','$2a$10$HFHko8TWZioD2SHuqjvt/eWoykt3sYWVUJOXA6muZp6OsC.sy3oSy','warehouse','admin',0,'2026-06-13 10:50:29','2026-06-19 08:58:53');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-19 16:18:48
