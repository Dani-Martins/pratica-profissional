-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: sistema_empresa
-- ------------------------------------------------------
-- Server version	11.7.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categoria`
--

DROP TABLE IF EXISTS `categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoria` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `categoria` varchar(60) NOT NULL,
  `situacao` datetime DEFAULT NULL,
  `datacriacao` datetime DEFAULT NULL,
  `dataalteracao` datetime DEFAULT NULL,
  `usercriacao` text DEFAULT NULL,
  `useratualizacao` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria`
--

LOCK TABLES `categoria` WRITE;
/*!40000 ALTER TABLE `categoria` DISABLE KEYS */;
INSERT INTO `categoria` VALUES (1,'ALIMENTOS','2025-06-29 21:56:00','2025-06-29 21:56:00','2025-06-29 21:56:00','sistema','sistema'),(2,'TESTE','0001-01-01 00:00:00','2025-06-29 21:56:08','2025-06-29 21:56:23','sistema','SISTEMA_INATIVACAO');
/*!40000 ALTER TABLE `categoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cidade`
--

DROP TABLE IF EXISTS `cidade`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cidade` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `codigo_ibge` varchar(10) DEFAULT NULL,
  `estado_id` int(11) NOT NULL,
  `Situacao` tinyint(1) NOT NULL DEFAULT 1,
  `data_criacao` datetime NOT NULL DEFAULT current_timestamp(),
  `data_atualizacao` datetime DEFAULT NULL,
  `user_criacao` varchar(100) DEFAULT NULL,
  `user_atualizacao` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cidade_estado_fk` (`estado_id`),
  CONSTRAINT `cidade_estado_fk` FOREIGN KEY (`estado_id`) REFERENCES `estado` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cidade`
--

LOCK TABLES `cidade` WRITE;
/*!40000 ALTER TABLE `cidade` DISABLE KEYS */;
INSERT INTO `cidade` VALUES (1,'SÃO PAULO','3500219',1,1,'2025-06-20 19:08:12',NULL,'SISTEMA_MIGRACAO',NULL),(3,'RIO DE JANEIRO','3304557',2,1,'2025-06-20 19:08:12',NULL,'SISTEMA_MIGRACAO',NULL),(4,'BELO HORIZONTE','3106200',3,1,'2025-06-20 19:08:12',NULL,'SISTEMA_MIGRACAO',NULL),(5,'MATELÂNDIA','4115606',4,1,'2025-06-20 19:08:12',NULL,'SISTEMA_MIGRACAO',NULL),(6,'SALVADOR','292741',5,1,'2025-06-20 19:08:12',NULL,'SISTEMA_MIGRACAO',NULL),(7,'FOZ DO IGUAÇU','78654324',4,1,'2025-06-20 19:08:12',NULL,'SISTEMA_MIGRACAO',NULL),(29,'LOS ANGELES','06037',8,1,'2025-06-20 19:08:12',NULL,'SISTEMA_MIGRACAO',NULL),(30,'LIMA','3104809',10,1,'2025-06-20 19:08:12',NULL,'SISTEMA_MIGRACAO',NULL),(32,'TOLUCA','722',13,1,'2025-06-20 19:08:12',NULL,'SISTEMA_MIGRACAO',NULL),(36,'CIDADETESTE','13246578',24,1,'2025-06-20 19:08:12',NULL,'SISTEMA_MIGRACAO',NULL),(37,'CIDADE A','13246578',25,1,'2025-06-20 19:08:12',NULL,'SISTEMA_MIGRACAO',NULL),(38,'CIDADE TESTE INATIVACAO','99999',1,1,'2025-06-20 19:13:39',NULL,'SCRIPT_TESTE',NULL),(39,'TESTE','13246578',36,0,'2025-06-21 01:09:23','2025-06-21 01:09:48',NULL,'SISTEMA_CONTROLLER'),(40,'TESTE D','13246578',37,1,'2025-06-22 18:07:55',NULL,NULL,NULL);
/*!40000 ALTER TABLE `cidade` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cliente`
--

DROP TABLE IF EXISTS `cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cliente` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) DEFAULT NULL,
  `cpf` varchar(14) DEFAULT NULL,
  `cnpj` varchar(18) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `endereco` varchar(200) DEFAULT NULL,
  `numero` varchar(20) DEFAULT NULL,
  `complemento` varchar(100) DEFAULT NULL,
  `bairro` varchar(50) DEFAULT NULL,
  `cep` varchar(10) DEFAULT NULL,
  `cidade_id` bigint(20) DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT 1,
  `tipopessoa` varchar(1) DEFAULT NULL,
  `razaosocial` varchar(100) DEFAULT NULL,
  `nomefantasia` varchar(100) DEFAULT NULL,
  `inscricaoestadual` varchar(20) DEFAULT NULL,
  `apelido` varchar(60) DEFAULT NULL,
  `isbrasileiro` tinyint(4) DEFAULT NULL,
  `limitecredito` decimal(10,2) DEFAULT NULL,
  `nacionalidade` varchar(255) DEFAULT NULL,
  `rg` varchar(14) DEFAULT NULL,
  `datanascimento` date DEFAULT NULL,
  `estadocivil` varchar(255) DEFAULT NULL,
  `sexo` varchar(1) DEFAULT NULL,
  `condicaopagamentoid` bigint(20) DEFAULT NULL,
  `limitecredito2` decimal(10,2) DEFAULT NULL,
  `observacao` varchar(255) DEFAULT NULL,
  `datacriacao` datetime DEFAULT NULL,
  `dataalteracao` datetime DEFAULT NULL,
  `usercriacao` text DEFAULT NULL,
  `useratualizacao` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cidade_id` (`cidade_id`),
  KEY `idx_cliente_cnpj` (`cnpj`),
  KEY `idx_cliente_tipo` (`tipopessoa`),
  KEY `idx_cliente_ativo` (`ativo`),
  KEY `fk_cliente_condicaopagamento` (`condicaopagamentoid`),
  CONSTRAINT `cliente_ibfk_1` FOREIGN KEY (`cidade_id`) REFERENCES `cidade` (`id`),
  CONSTRAINT `fk_cliente_condicaopagamento` FOREIGN KEY (`condicaopagamentoid`) REFERENCES `condicao_pagamento` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cliente`
--

LOCK TABLES `cliente` WRITE;
/*!40000 ALTER TABLE `cliente` DISABLE KEYS */;
INSERT INTO `cliente` VALUES (1,'João Silva','123.456.789-00',NULL,'joao@email.com','(11) 98765-4321',NULL,NULL,NULL,NULL,NULL,1,1,'F',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2023-01-01 00:00:00',NULL,NULL,NULL),(2,'Maria Santos','987.654.321-00',NULL,'maria@email.com','(11) 91234-5678',NULL,NULL,NULL,NULL,NULL,2,0,'F',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2023-01-01 00:00:00','2025-06-23 18:28:54',NULL,'SISTEMA_INATIVACAO'),(4,'DANIEL SILVA','11623832918',NULL,'user@example.com','45991472399','RUA GENI COSTENARO CHIAPPIN','152','CASA','JARDIM GUAIRACA','85887000',5,1,'F',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2023-01-01 00:00:00',NULL,NULL,NULL),(5,'ANA PAULA TANNOURI DE OLIVEIRA','09826915998',NULL,'user@example.com','45991552217','Rua Indóia','151','Casa','Campos do Iguaçu','85857520',5,1,'F',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2023-01-01 00:00:00',NULL,NULL,NULL),(6,'ADRIANA SILVA','11623832918','','user@example.com','4599148621','RUA ALEATORIA A','111','CASA','BAIRRO ALEATORIO A','05407002',5,1,'F',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2023-01-01 00:00:00','2025-06-28 18:04:57',NULL,'sistema'),(7,'DANIEL SILVA MARTINS','11623832918','','SILVAMARTINSDANIEL235@GMAIL.COM','45991472399','Rua Geni Costenaro Chiappin','152','','Jardim Guairaca','85887-000',5,1,'F',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2023-01-01 00:00:00',NULL,NULL,NULL),(46,'',NULL,'09284714000143','SILVAMARTINSDANIEL235@GMAIL.COM','45991472399','RUA EXEMPLO','123','APARTAMENTO','BAIRRO EXEMPLO','85887000',36,1,'J','TESTE CLIENTE JURIDICO','CLIENTE JURIDICO SA','123.456.789.012','CLIENTE JURÍDICO',1,5000.00,'','',NULL,'','',4,1000.00,'Este cliente jurídico é apenas um teste ;)','2025-06-23 16:43:24',NULL,'sistema',NULL);
/*!40000 ALTER TABLE `cliente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `condicao_pagamento`
--

DROP TABLE IF EXISTS `condicao_pagamento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `condicao_pagamento` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `codigo` varchar(20) NOT NULL,
  `descricao` varchar(100) DEFAULT NULL,
  `a_vista` tinyint(1) DEFAULT 0,
  `ativo` tinyint(1) DEFAULT 1,
  `percentual_juros` decimal(10,2) DEFAULT 0.00,
  `percentual_multa` decimal(10,2) DEFAULT 0.00,
  `percentual_desconto` decimal(10,2) DEFAULT 0.00,
  `data_cadastro` timestamp NULL DEFAULT current_timestamp(),
  `ultima_modificacao` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `formapagamentoid` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_condicao_pagamento_codigo` (`codigo`),
  KEY `fk_condicao_formapagamento` (`formapagamentoid`),
  CONSTRAINT `fk_condicao_formapagamento` FOREIGN KEY (`formapagamentoid`) REFERENCES `forma_pagamento` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `condicao_pagamento`
--

LOCK TABLES `condicao_pagamento` WRITE;
/*!40000 ALTER TABLE `condicao_pagamento` DISABLE KEYS */;
INSERT INTO `condicao_pagamento` VALUES (1,'AVISTA02','Pagamento à vista com desconto',1,1,0.00,0.00,5.00,'2025-04-24 16:49:17','2025-06-23 16:57:56',NULL),(2,'3X','Pagamento em 3 parcelas mensais',0,1,2.00,1.50,0.00,'2025-04-24 16:49:17','2025-04-24 16:49:17',NULL),(3,'30-60-90','Pagamento em 3 parcelas a cada 30 dias',0,1,0.00,0.00,0.00,'2025-04-24 16:49:17','2025-04-24 16:49:17',NULL),(4,'AVISTA20','Pagamento à vista com 20% de desconto',1,1,0.00,0.00,10.00,'2025-04-24 17:24:28','2025-04-24 17:52:58',NULL),(7,'AVISTA','À Vista',1,0,0.00,0.00,0.00,'2025-06-23 16:58:56','2025-06-28 23:01:41',NULL);
/*!40000 ALTER TABLE `condicao_pagamento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estado`
--

DROP TABLE IF EXISTS `estado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estado` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `uf` varchar(10) NOT NULL,
  `pais_id` int(11) NOT NULL,
  `situacao` bit(1) NOT NULL DEFAULT b'1',
  `data_criacao` datetime NOT NULL DEFAULT current_timestamp(),
  `data_atualizacao` datetime DEFAULT NULL,
  `user_criacao` varchar(100) DEFAULT NULL,
  `user_atualizacao` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_estado_uf` (`uf`),
  KEY `idx_estado_pais` (`pais_id`),
  CONSTRAINT `estado_ibfk_1` FOREIGN KEY (`pais_id`) REFERENCES `pais` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estado`
--

LOCK TABLES `estado` WRITE;
/*!40000 ALTER TABLE `estado` DISABLE KEYS */;
INSERT INTO `estado` VALUES (1,'SÃO PAULO','SP',1,_binary '','2025-06-19 17:21:16',NULL,'sistema',NULL),(2,'RIO DE JANEIRO','RJ',1,_binary '','2025-06-19 17:21:16',NULL,'sistema',NULL),(3,'MINAS GERAIS','MG',1,_binary '','2025-06-19 17:21:16',NULL,'sistema',NULL),(4,'PARANÁ','PR',1,_binary '','2025-06-19 17:21:16',NULL,'sistema',NULL),(5,'BAHIA','BA',1,_binary '','2025-06-19 17:21:16',NULL,'sistema',NULL),(8,'CALIFÓRNIA','CA',18,_binary '','2025-06-19 17:21:16',NULL,'sistema',NULL),(9,'SANTA CATARINA','SC',1,_binary '','2025-06-19 17:21:16',NULL,'sistema',NULL),(10,'LIMA','LIM',19,_binary '','2025-06-19 17:21:16',NULL,'sistema',NULL),(13,'ESTADO DO MEXICO','EM',22,_binary '','2025-06-19 17:21:16',NULL,'sistema',NULL),(21,'ACRE','AC',1,_binary '','2025-06-19 17:21:16','2025-06-20 23:00:04','sistema','SISTEMA'),(24,'ESTADOTESTE','ET',46,_binary '','2025-06-19 17:21:16',NULL,'sistema',NULL),(25,'ESTADO A','EA',52,_binary '','2025-06-19 17:21:16',NULL,'sistema',NULL),(34,'ESTADO TESTE EXCLUSÃO 2','EX',1,_binary '\0','2025-06-20 17:34:01','2025-06-20 17:36:24','SCRIPT_TESTE_2','SISTEMA_CONTROLLER'),(35,'TESTE','TE',1,_binary '\0','2025-06-20 17:40:23','2025-06-20 17:40:27','SISTEMA','SISTEMA_CONTROLLER'),(36,'TESTE C','TC',54,_binary '','2025-06-21 01:09:05',NULL,NULL,NULL),(37,'TESTE D','TD',55,_binary '','2025-06-22 18:07:42',NULL,NULL,NULL);
/*!40000 ALTER TABLE `estado` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `forma_pagamento`
--

DROP TABLE IF EXISTS `forma_pagamento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `forma_pagamento` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `descricao` varchar(255) NOT NULL,
  `situacao` tinyint(1) NOT NULL DEFAULT 1,
  `DataCriacao` datetime NOT NULL DEFAULT current_timestamp() COMMENT 'Data de criação do registro',
  `DataAlteracao` datetime DEFAULT NULL COMMENT 'Data da última alteração do registro',
  `UserCriacao` varchar(100) NOT NULL COMMENT 'Usuário que criou o registro',
  `UserAtualizacao` varchar(100) DEFAULT NULL COMMENT 'Usuário que atualizou o registro',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forma_pagamento`
--

LOCK TABLES `forma_pagamento` WRITE;
/*!40000 ALTER TABLE `forma_pagamento` DISABLE KEYS */;
INSERT INTO `forma_pagamento` VALUES (1,'Dinheiro',1,'2025-06-21 14:36:11',NULL,'',NULL),(2,'Cartão de Crédito',1,'2025-06-21 14:36:11',NULL,'',NULL),(3,'Cartão de Débito',1,'2025-06-21 14:36:11',NULL,'',NULL),(4,'PIX',1,'2025-06-21 14:36:11',NULL,'',NULL),(5,'Boleto Bancário',1,'2025-06-21 14:36:11','2025-06-28 14:37:22','','Sistema'),(6,'Transferência Bancária',1,'2025-06-21 14:36:11',NULL,'',NULL),(8,'Forma de Pagamento Teste SQL Direto',1,'2025-06-21 22:23:40',NULL,'Script SQL',NULL),(9,'Cheque',1,'2025-06-21 22:38:55',NULL,'Sistema',NULL),(10,'TESTE',0,'2025-06-21 22:39:32','2025-06-21 22:39:43','Sistema','Sistema'),(11,'TESTE',0,'2025-06-28 14:43:48','2025-06-28 14:47:47','Sistema','Sistema');
/*!40000 ALTER TABLE `forma_pagamento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fornecedores`
--

DROP TABLE IF EXISTS `fornecedores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fornecedores` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `tipopessoa` char(1) DEFAULT 'J',
  `nome` varchar(100) DEFAULT NULL,
  `cpf` varchar(14) DEFAULT NULL,
  `razao_social` varchar(150) DEFAULT NULL,
  `nome_fantasia` varchar(100) DEFAULT NULL,
  `cnpj` varchar(18) DEFAULT NULL,
  `inscricao_estadual` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `endereco` varchar(200) DEFAULT NULL,
  `numero` varchar(20) DEFAULT NULL,
  `complemento` varchar(100) DEFAULT NULL,
  `bairro` varchar(50) DEFAULT NULL,
  `cep` varchar(10) DEFAULT NULL,
  `cidade_id` bigint(20) DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT 1,
  `apelido` varchar(60) DEFAULT NULL,
  `limitecredito` decimal(10,2) DEFAULT NULL,
  `rg` varchar(14) DEFAULT NULL,
  `condicaopagamentoid` int(11) DEFAULT NULL,
  `observacao` varchar(255) DEFAULT NULL,
  `datacriacao` datetime DEFAULT NULL,
  `dataalteracao` datetime DEFAULT NULL,
  `usercriacao` text DEFAULT NULL,
  `useratualizacao` text DEFAULT NULL,
  `contato` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cidade_id` (`cidade_id`),
  KEY `idx_fornecedores_tipopessoa` (`tipopessoa`),
  KEY `idx_fornecedores_cpf` (`cpf`),
  KEY `idx_fornecedores_cnpj` (`cnpj`),
  KEY `idx_fornecedores_ativo` (`ativo`),
  CONSTRAINT `fornecedores_ibfk_1` FOREIGN KEY (`cidade_id`) REFERENCES `cidade` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci COMMENT='Tabela de fornecedores com suporte a pessoa física e jurídica';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fornecedores`
--

LOCK TABLES `fornecedores` WRITE;
/*!40000 ALTER TABLE `fornecedores` DISABLE KEYS */;
INSERT INTO `fornecedores` VALUES (1,'J',NULL,NULL,'Fornecedor A LTDA','Fornecedor A','09284714000143',NULL,'contato@fornecedora.com','(11) 3456-7890',NULL,'152','Casa','Jardim Guairaca','85887-000',7,0,NULL,NULL,NULL,NULL,NULL,'2023-01-01 00:00:00','2023-01-01 00:00:00','sistema','sistema',NULL),(2,'J',NULL,NULL,'Fornecedor B S.A.','Fornecedor B','98.765.432/0001-10',NULL,'contato@fornecedorb.com','(11) 2345-6789',NULL,NULL,NULL,NULL,NULL,3,0,NULL,NULL,NULL,NULL,NULL,'2023-01-01 00:00:00','2023-01-01 00:00:00','sistema','sistema',NULL),(3,'J',NULL,NULL,'FORNECEDOR C LTDA','FORNECEDOR C','45283163000167',NULL,'FORNECEDOR@GMAIL.COM','11912345678','','152','Casa','Jardim Guairaca','85887000',5,0,NULL,NULL,NULL,NULL,NULL,'2023-01-01 00:00:00','2023-01-01 00:00:00','sistema','sistema',NULL),(4,'J',NULL,NULL,'FARMACIA E DROGARIA VILA PORTES EIRELI','DROGAFOZ','09284714000143',NULL,'user@example.com','45984311918','Rua Santo Rafagnin','40','Banco 24 Horas','Vila Portes','85865370',7,1,NULL,NULL,NULL,NULL,NULL,'2023-01-01 00:00:00','2023-01-01 00:00:00','sistema','sistema',NULL),(5,'J',NULL,NULL,'FORNECEDOR ALEATORIO AA','FORNECEDOR A.A','09284714000143',NULL,'user@example.com','45984311918','RUA ALETORIA B','222','INDUSTRIA','BAIRRO ALEATORIO B','01000-000',1,0,NULL,NULL,NULL,NULL,NULL,'2023-01-01 00:00:00','2023-01-01 00:00:00','sistema','sistema',NULL),(6,'J',NULL,NULL,'FORNECEDOR LTDA C','FORNECEDOR C','09284714000143',NULL,'SILVAMARTINSDANIEL235@GMAIL.COM','45991472399',NULL,'152','Casa','Jardim Guairaca','85887-000',5,0,NULL,NULL,NULL,NULL,NULL,'2023-01-01 00:00:00','2023-01-01 00:00:00','sistema','sistema',NULL),(7,'J',NULL,NULL,'FORNECEDOR LTDA C','FORNECEDOR C','09284714000143',NULL,'SILVAMARTINSDANIEL235@GMAIL.COM','45991472399',NULL,'152','Casa','Jardim Guairaca','85887-000',5,0,NULL,NULL,NULL,NULL,NULL,'2023-01-01 00:00:00','2023-01-01 00:00:00','sistema','sistema',NULL),(8,'J',NULL,NULL,'FORNECEDOR JURIDICO EXEMPLO','FORNECEDOR JURIDICO LTDA','09284714000143',NULL,'SILVAMARTINSDANIEL235@GMAIL.COM','45991472399','RUA EXEMPLO','123','APARTAMENTO','BAIRRO EXEMPLO','85887000',5,0,NULL,NULL,NULL,NULL,NULL,'2023-01-01 00:00:00','2023-01-01 00:00:00','sistema','sistema',NULL),(9,'J',NULL,NULL,'[PF] FORNECEDOR FISICO EXEMPLO','[PF] FORNECEDOR FISICO EXEMPLO','11.623.832/0001-80',NULL,'SILVAMARTINSDANIEL235@GMAIL.COM','45991472399','RUA EXEMPLO','123','APARTAMENTO','BAIRRO EXEMPLO','85887000',5,0,NULL,NULL,NULL,NULL,NULL,'2023-01-01 00:00:00','2023-01-01 00:00:00','sistema','sistema',NULL),(10,'J',NULL,NULL,'[PF] TESTE','[PF] TESTE','11623832000180',NULL,'SILVAMARTINSDANIEL235@GMAIL.COM','45991472399','RUA EXEMPLO','123','APARTAMENTO','BAIRRO EXEMPLO','85887000',36,0,NULL,0.00,NULL,NULL,NULL,'2025-06-24 00:00:00','2025-06-24 00:00:00','sistema','sistema','45991472399'),(11,'J',NULL,NULL,'TESTE','TESTE','09284714000143',NULL,'SILVAMARTINSDANIEL235@GMAIL.COM','45991472399','RUA EXEMPLO','123','APARTAMENTO','BAIRRO EXEMPLO','85887000',7,0,NULL,0.00,NULL,NULL,NULL,'2025-06-24 00:00:00','2025-06-24 00:00:00','sistema','sistema','45991472399'),(12,'F','TESTE','11623832918','[PF] TESTE','[PF] TESTE','ISENTO','ISENTO','SILVAMARTINSDANIEL235@GMAIL.COM','45991472399','RUA EXEMPLO','123','APARTAMENTO','BAIRRO EXEMPLO','85887000',7,0,NULL,0.00,NULL,NULL,NULL,'2025-06-24 00:00:00','2025-06-24 16:25:12','sistema','sistema','45991472399'),(13,'F','FORNECEDOR FISICO EXEMPLO','11623832918','[PF] FORNECEDOR FISICO EXEMPLO','[PF] FORNECEDOR FISICO EXEMPLO','ISENTO','ISENTO','SILVAMARTINSDANIEL235@GMAIL.COM','45991472399','RUA EXEMPLO','123','APARTAMENTO','BAIRRO EXEMPLO','85887000',36,1,'FORNECEDOR FISICO',5000.00,'14.205.536-8',7,'Este Fornecedor é apenas um teste 😀','2025-06-24 19:50:46','2025-06-25 15:04:36','sistema','sistema','45991472399'),(14,'J','FORNECEDOR JURIDICO EXEMPLO',NULL,'FORNECEDOR JURIDICO EXEMPLO','FORNECEDOR JURIDICO SA','09284714000143','123.456.789.012','SILVAMARTINSDANIEL235@GMAIL.COM','45991472399','RUA EXEMPLO','123','APARTAMENTO','BAIRRO EXEMPLO','85887000',7,1,'FORNECEDOR JURIDICO',5000.00,NULL,4,'Este fornecedor jurídico é apenas um teste 😃','2025-06-24 21:03:55','2025-06-24 23:17:30','sistema','sistema','45991472399');
/*!40000 ALTER TABLE `fornecedores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `funcaofuncionarios`
--

DROP TABLE IF EXISTS `funcaofuncionarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `funcaofuncionarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `funcaofuncionario` varchar(255) DEFAULT NULL,
  `requercnh` tinyint(1) DEFAULT NULL,
  `cargahoraria` decimal(10,2) DEFAULT NULL,
  `descricao` varchar(255) DEFAULT NULL,
  `observacao` varchar(255) DEFAULT NULL,
  `situacao` varchar(1) NOT NULL DEFAULT 'A',
  `datacriacao` datetime NOT NULL DEFAULT current_timestamp(),
  `dataalteracao` datetime DEFAULT NULL ON UPDATE current_timestamp(),
  `usercriacao` text DEFAULT NULL,
  `useratualizacao` text DEFAULT NULL,
  `tipoCNHRequerido` varchar(5) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `funcaofuncionarios`
--

LOCK TABLES `funcaofuncionarios` WRITE;
/*!40000 ALTER TABLE `funcaofuncionarios` DISABLE KEYS */;
INSERT INTO `funcaofuncionarios` VALUES (1,'MOTORISTA - D',1,43.00,'TRANSPORTE DE CARGA E ENTREGAS','NECESSÁRIO CNH CATEGORIA D','A','2025-06-25 00:00:00','2025-06-28 03:31:03','sistema','sistema','AB'),(2,'TESTE',1,47.00,'APAGUE','APAGUE','I','2025-06-25 00:00:00','2025-06-28 03:15:32','sistema','Sistema','B'),(3,'FUNCAO DE FUNCIONARIO EXEMPLO',1,15.00,'ESSE É SÓ UM EXEMPLO DE FUNCAO DE FUNCIONARIO','ESSE CONTINUA SENDO SÓ UM EXEMPLO DE FUNCAO DE FUNCIONARIO 😄','I','2025-06-25 15:04:28','2025-06-28 03:15:32','sistema','Sistema','B'),(4,'TESTE CNH',1,40.00,'TESTE VALIDAÇÃO CNH','TESTE DE CNH','I','2025-06-28 02:30:11','2025-06-30 15:16:28','sistema','Sistema','B'),(5,'MOTOBOY',1,40.00,'ENTREGADOR DE MERCADORIA','ENTREGADOR DE MERCADORIAS DE MOTO','A','2025-06-28 04:09:12','2025-06-28 04:09:12','sistema','sistema','A');
/*!40000 ALTER TABLE `funcaofuncionarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `funcionario`
--

DROP TABLE IF EXISTS `funcionario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `funcionario` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `cpf` varchar(14) DEFAULT NULL,
  `rg` varchar(20) DEFAULT NULL,
  `data_nascimento` date DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `endereco` varchar(200) DEFAULT NULL,
  `numero` varchar(20) DEFAULT NULL,
  `complemento` varchar(100) DEFAULT NULL,
  `bairro` varchar(50) DEFAULT NULL,
  `cep` varchar(10) DEFAULT NULL,
  `cidade_id` bigint(20) DEFAULT NULL,
  `data_admissao` date DEFAULT NULL,
  `data_demissao` date DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT 1,
  `salario` decimal(10,2) DEFAULT NULL,
  `tipopessoa` char(1) NOT NULL DEFAULT 'F' COMMENT 'Tipo de pessoa (apenas F é permitido)',
  `apelido` varchar(60) DEFAULT NULL COMMENT 'Apelido/Nome social do funcionário',
  `cnh` varchar(25) DEFAULT NULL COMMENT 'Número da CNH do funcionário',
  `datavalidadecnh` date DEFAULT NULL COMMENT 'Data de validade da CNH',
  `sexo` int(11) DEFAULT NULL COMMENT 'Sexo do funcionário (1 = Masculino, 2 = Feminino, 3 = Outro)',
  `observacoes` varchar(255) DEFAULT NULL COMMENT 'Observações sobre o funcionário',
  `estadocivil` int(11) DEFAULT NULL COMMENT 'Estado civil (1 = Solteiro, 2 = Casado, 3 = Divorciado, 4 = Viúvo, 5 = União estável)',
  `isbrasileiro` int(11) DEFAULT 1 COMMENT 'Se o funcionário é brasileiro (1 = Sim, 0 = Não)',
  `nacionalidade` int(11) DEFAULT NULL COMMENT 'Código do país de nacionalidade',
  `funcaofuncionarioid` int(11) DEFAULT NULL COMMENT 'ID da função do funcionário',
  `datacriacao` datetime DEFAULT current_timestamp() COMMENT 'Data de criação do registro',
  `dataalteracao` datetime DEFAULT NULL ON UPDATE current_timestamp() COMMENT 'Data da última alteração',
  `usercriacao` varchar(50) DEFAULT 'SISTEMA' COMMENT 'Usuário que criou o registro',
  `useratualizacao` varchar(50) DEFAULT NULL COMMENT 'Usuário que atualizou o registro por último',
  PRIMARY KEY (`id`),
  KEY `cidade_id` (`cidade_id`),
  KEY `idx_funcionario_funcao` (`funcaofuncionarioid`),
  CONSTRAINT `fk_funcionario_funcao` FOREIGN KEY (`funcaofuncionarioid`) REFERENCES `funcaofuncionarios` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `funcionario_ibfk_1` FOREIGN KEY (`cidade_id`) REFERENCES `cidade` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `funcionario`
--

LOCK TABLES `funcionario` WRITE;
/*!40000 ALTER TABLE `funcionario` DISABLE KEYS */;
INSERT INTO `funcionario` VALUES (1,'João Silva','123.456.789-10','12.345.678-9','1990-05-15','(11) 98765-4321','joao@email.com','Rua Principal','123',NULL,'Centro','01234-567',1,'2023-01-15',NULL,1,NULL,'F',NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,'2025-06-25 21:36:58','2025-06-27 00:51:43','SISTEMA',NULL),(2,'Maria Oliveira','987.654.321-00','98.765.432-1','1995-10-20','(11) 91234-5678','maria@email.com','Avenida Central','456',NULL,'Jardim','07654-321',2,'2023-02-01',NULL,1,NULL,'F',NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,'2025-06-25 21:36:58','2025-06-27 00:51:43','SISTEMA',NULL),(3,'Carlos Pereira','456.789.123-00','45.678.912-3','1988-03-25','(11) 95555-9999','carlos@email.com','Praça das Flores','789',NULL,'Vila Nova','04567-890',1,'2022-11-10',NULL,1,NULL,'F',NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,'2025-06-25 21:36:58','2025-06-27 00:51:43','SISTEMA',NULL),(4,'João Silva','123.456.789-10','12.345.678-9','1990-05-15','(11) 98765-4321','joao@email.com','Rua Principal','123',NULL,'Centro','01234-567',1,'2023-01-15',NULL,1,NULL,'F',NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,'2025-06-25 21:36:58','2025-06-27 00:51:43','SISTEMA',NULL),(5,'Maria Oliveira','987.654.321-00','98.765.432-1','1995-10-20','(11) 91234-5678','maria@email.com','Avenida Central','456',NULL,'Jardim','07654-321',2,'2023-02-01',NULL,1,NULL,'F',NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,'2025-06-25 21:36:58','2025-06-27 00:51:43','SISTEMA',NULL),(6,'Carlos Pereira','456.789.123-00','45.678.912-3','1988-03-25','(11) 95555-9999','carlos@email.com','Praça das Flores','789',NULL,'Vila Nova','04567-890',1,'2022-11-10',NULL,0,NULL,'F',NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,'2025-06-25 21:36:58','2025-06-27 00:51:43','SISTEMA',NULL),(7,'ARTHUR GOMES',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'2017-02-13',NULL,0,NULL,'F',NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,'2025-06-25 21:36:58','2025-06-27 14:54:18','SISTEMA','SISTEMA'),(8,'TOMAS VERCETTI','042.691.370-04','32.478.596-4','2004-04-17','459871216892','UDC@UDC.EDU.BR','Rua Ladeira da Conceição','6101','APARTAMENTO','Centro','45651-300',6,'2015-01-17',NULL,1,9.70,'F',NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,'2025-06-25 21:36:58','2025-06-27 00:51:43','SISTEMA',NULL),(9,'RICARDO SANTOS','123.456.789-10','28.654.987-2','1988-06-15','(11) 98765-4321','ricardo.santos@empresa.com.br','RUA DAS FLORES','1250','APARTAMENTO 42','Jardim América','14810-120',4,'2023-03-10',NULL,0,5800.00,'F',NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,'2025-06-25 21:36:58','2025-06-27 00:51:43','SISTEMA',NULL),(10,'FUNCIONARIO FISICO EXEMPLO','116.238.329-18','14.205.536-8','2004-06-22','(45) 99147-2399','SILVAMARTINSDANIEL235@GMAIL.COM','RUA EXEMPLO','123','APARTAMENTO','BAIRRO EXEMPLO','85887-000',37,'2023-01-17',NULL,1,3000.00,'F',NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,'2025-06-25 21:36:58','2025-06-27 00:51:43','SISTEMA',NULL),(11,'FUNCIONARIO FISICO EXEMPLO','116.238.329-18','14.205.536-8','2004-06-22','(45) 99147-2399','SILVAMARTINSDANIEL235@GMAIL.COM','RUA EXEMPLO','123','APARTAMENTO','BAIRRO EXEMPLO','85887-000',37,'2023-01-17',NULL,0,3000.00,'F',NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,'2025-06-25 21:36:58','2025-06-27 00:51:43','SISTEMA',NULL),(12,'FUNCIONARIO JURIDICO EXEMPLO','','',NULL,'(45) 99147-2399','SILVAMARTINSDANIEL235@GMAIL.COM','RUA EXEMPLO','123','APARTAMENTO','BAIRRO EXEMPLO','85887-000',36,'2023-07-13',NULL,0,3000.00,'F',NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,'2025-06-25 21:36:58','2025-06-27 00:51:43','SISTEMA',NULL),(13,'FUNCIONARIO JURIDICO EXEMPLO','','',NULL,'(45) 99147-2399','SILVAMARTINSDANIEL235@GMAIL.COM','RUA EXEMPLO','123','APARTAMENTO','BAIRRO EXEMPLO','85887-000',37,'2022-07-21',NULL,0,3000.00,'F',NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,NULL,'2025-06-25 21:36:58','2025-06-27 14:58:55','SISTEMA',NULL),(14,'TESTE','11623832918','142055368','2025-06-28','45991472399','SILVAMARTINSDANIEL235@GMAIL.COM','RUA EXEMPLO','135','CASA','BAIRRO EXEMPLO','85887-000',4,'2025-06-28','2025-06-28',0,3000.00,'F','TESTE','AB','2025-06-28',0,'TESTE TESTE TESTE',0,0,0,1,'2025-06-28 00:17:41','2025-06-28 00:19:24','SISTEMA',NULL),(15,'TEST','11623832918','14.205.536-8','2021-05-11','45991472399','SILVAMARTINSDANIEL235@GMAIL.COM','RUA EXEMPLO','123','APARTAMENTO','BAIRRO EXEMPLO','85887000',5,'2023-06-06',NULL,1,3000.00,'F','TESTE','A','2029-10-23',2,'TESTE TESTE TESTE ',2,1,1,1,'2025-06-28 00:43:34','2025-06-28 02:29:08','SISTEMA','SISTEMA');
/*!40000 ALTER TABLE `funcionario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item_nfe`
--

DROP TABLE IF EXISTS `item_nfe`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `item_nfe` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `nfe_id` bigint(20) NOT NULL,
  `produto_id` bigint(20) NOT NULL,
  `quantidade` decimal(10,3) NOT NULL,
  `valor_unitario` decimal(10,2) NOT NULL,
  `valor_total` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `nfe_id` (`nfe_id`),
  KEY `produto_id` (`produto_id`),
  CONSTRAINT `item_nfe_ibfk_1` FOREIGN KEY (`nfe_id`) REFERENCES `nfe` (`id`),
  CONSTRAINT `item_nfe_ibfk_2` FOREIGN KEY (`produto_id`) REFERENCES `produto` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_nfe`
--

LOCK TABLES `item_nfe` WRITE;
/*!40000 ALTER TABLE `item_nfe` DISABLE KEYS */;
INSERT INTO `item_nfe` VALUES (1,1,1,1.000,39.90,39.90),(2,1,2,1.000,36.90,36.90),(3,1,3,1.000,8.90,8.90);
/*!40000 ALTER TABLE `item_nfe` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `marcas`
--

DROP TABLE IF EXISTS `marcas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `marcas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `marca` varchar(60) NOT NULL,
  `situacao` datetime DEFAULT NULL,
  `datacriacao` datetime DEFAULT NULL,
  `dataalteracao` datetime DEFAULT NULL,
  `usercriacao` text DEFAULT NULL,
  `useratualizacao` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `marcas`
--

LOCK TABLES `marcas` WRITE;
/*!40000 ALTER TABLE `marcas` DISABLE KEYS */;
INSERT INTO `marcas` VALUES (1,'COCA-COLA','2025-06-29 21:53:00','2025-06-29 21:53:00','2025-06-29 21:53:00','sistema','sistema'),(2,'TESTE','0001-01-01 00:00:00','2025-06-29 21:53:13','2025-06-29 21:53:17','sistema','SISTEMA_INATIVACAO'),(3,'UMBRO','2025-06-30 16:03:20','2025-06-30 16:03:20','2025-06-30 16:03:20','sistema','sistema'),(4,'DORITOS','2025-06-30 16:03:42','2025-06-30 16:03:42','2025-06-30 16:03:42','sistema','sistema');
/*!40000 ALTER TABLE `marcas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `modalidade_nfe`
--

DROP TABLE IF EXISTS `modalidade_nfe`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `modalidade_nfe` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `codigo` varchar(10) NOT NULL,
  `descricao` varchar(100) NOT NULL,
  `ativo` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `modalidade_nfe`
--

LOCK TABLES `modalidade_nfe` WRITE;
/*!40000 ALTER TABLE `modalidade_nfe` DISABLE KEYS */;
INSERT INTO `modalidade_nfe` VALUES (1,'55','NFe - Nota Fiscal Eletrônica',1),(2,'65','NFCe - Nota Fiscal de Consumidor Eletrônica',1);
/*!40000 ALTER TABLE `modalidade_nfe` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimentacao_nfe`
--

DROP TABLE IF EXISTS `movimentacao_nfe`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimentacao_nfe` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `nfe_id` bigint(20) NOT NULL,
  `data_movimentacao` datetime NOT NULL,
  `status` varchar(50) NOT NULL,
  `descricao` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `nfe_id` (`nfe_id`),
  CONSTRAINT `movimentacao_nfe_ibfk_1` FOREIGN KEY (`nfe_id`) REFERENCES `nfe` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimentacao_nfe`
--

LOCK TABLES `movimentacao_nfe` WRITE;
/*!40000 ALTER TABLE `movimentacao_nfe` DISABLE KEYS */;
INSERT INTO `movimentacao_nfe` VALUES (1,1,'2025-04-09 00:06:14','EMITIDA','Nota fiscal emitida com sucesso');
/*!40000 ALTER TABLE `movimentacao_nfe` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nfe`
--

DROP TABLE IF EXISTS `nfe`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nfe` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `numero` varchar(50) NOT NULL,
  `serie` varchar(3) NOT NULL,
  `chave_acesso` varchar(44) DEFAULT NULL,
  `data_emissao` datetime NOT NULL,
  `cliente_id` bigint(20) DEFAULT NULL,
  `valor_total` decimal(10,2) NOT NULL,
  `forma_pagamento_id` bigint(20) DEFAULT NULL,
  `condicao_pagamento_id` bigint(20) DEFAULT NULL,
  `transportadora_id` bigint(20) DEFAULT NULL,
  `veiculo_id` bigint(20) DEFAULT NULL,
  `modalidade_id` bigint(20) DEFAULT NULL,
  `cancelada` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `cliente_id` (`cliente_id`),
  KEY `forma_pagamento_id` (`forma_pagamento_id`),
  KEY `condicao_pagamento_id` (`condicao_pagamento_id`),
  KEY `transportadora_id` (`transportadora_id`),
  KEY `veiculo_id` (`veiculo_id`),
  KEY `modalidade_id` (`modalidade_id`),
  CONSTRAINT `nfe_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `cliente` (`id`),
  CONSTRAINT `nfe_ibfk_2` FOREIGN KEY (`forma_pagamento_id`) REFERENCES `forma_pagamento` (`id`),
  CONSTRAINT `nfe_ibfk_4` FOREIGN KEY (`transportadora_id`) REFERENCES `transportadora` (`id`),
  CONSTRAINT `nfe_ibfk_5` FOREIGN KEY (`veiculo_id`) REFERENCES `veiculo` (`id`),
  CONSTRAINT `nfe_ibfk_6` FOREIGN KEY (`modalidade_id`) REFERENCES `modalidade_nfe` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nfe`
--

LOCK TABLES `nfe` WRITE;
/*!40000 ALTER TABLE `nfe` DISABLE KEYS */;
INSERT INTO `nfe` VALUES (1,'000001','1',NULL,'2025-04-09 00:06:14',1,85.70,4,1,NULL,NULL,1,0);
/*!40000 ALTER TABLE `nfe` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pais`
--

DROP TABLE IF EXISTS `pais`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pais` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `sigla` char(3) NOT NULL,
  `codigo` varchar(10) DEFAULT NULL,
  `situacao` tinyint(1) NOT NULL DEFAULT 1,
  `datacriacao` datetime NOT NULL DEFAULT current_timestamp(),
  `dataalteracao` datetime DEFAULT NULL,
  `usercriacao` varchar(100) NOT NULL DEFAULT 'SISTEMA',
  `useralteracao` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pais`
--

LOCK TABLES `pais` WRITE;
/*!40000 ALTER TABLE `pais` DISABLE KEYS */;
INSERT INTO `pais` VALUES (1,'BRASIL','BR','055',1,'2025-06-11 01:40:42',NULL,'SISTEMA',NULL),(2,'JAPÃO','JP','081',1,'2025-06-11 01:40:42',NULL,'SISTEMA',NULL),(3,'ALEMANHA','DE','049',1,'2025-06-11 01:40:42','2025-06-28 14:33:51','SISTEMA','SISTEMA'),(4,'PARAGUAI','PY','595',1,'2025-06-11 01:40:42',NULL,'SISTEMA',NULL),(18,'ESTADOS UNIDOS','US','01',1,'2025-06-11 01:40:42',NULL,'SISTEMA',NULL),(19,'PERU','PE','51',1,'2025-06-11 01:40:42',NULL,'SISTEMA',NULL),(20,'CHILE','CL','56',1,'2025-06-11 01:40:42',NULL,'SISTEMA',NULL),(22,'MÉXICO','MX','52',1,'2025-06-11 01:40:42',NULL,'SISTEMA',NULL),(24,'VENEZUELA','VE','58',1,'2025-06-11 01:40:42',NULL,'SISTEMA',NULL),(35,'LIBIA','LY','218',1,'2025-06-11 01:40:42',NULL,'SISTEMA',NULL),(46,'PAISTESTE','PT','123',1,'2025-06-11 01:40:42','2025-06-30 00:24:35','SISTEMA','SISTEMA'),(47,'ARGENTINA','AR','054',1,'2025-06-11 02:03:36','2025-06-11 02:03:54','SISTEMA','SISTEMA'),(48,'URUGUAI','UY','598',1,'2025-06-12 23:13:59',NULL,'SISTEMA',NULL),(50,'TESTE','TE','123',0,'2025-06-13 00:21:29','2025-06-14 16:09:16','SISTEMA','SISTEMA'),(51,'TESTE A','TA','123',1,'2025-06-13 20:08:59',NULL,'SISTEMA',NULL),(52,'PAIS A','PA','11',1,'2025-06-15 17:15:07',NULL,'SISTEMA',NULL),(53,'TESTE B','TB','132',1,'2025-06-20 13:45:11',NULL,'SISTEMA',NULL),(54,'TESTE C','TC','213',1,'2025-06-21 01:08:55',NULL,'SISTEMA',NULL),(55,'TESTE D','TD','451',1,'2025-06-22 18:07:33',NULL,'SISTEMA',NULL);
/*!40000 ALTER TABLE `pais` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parcela_condicao_pagamento`
--

DROP TABLE IF EXISTS `parcela_condicao_pagamento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `parcela_condicao_pagamento` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `condicao_pagamento_id` bigint(20) NOT NULL,
  `numero` int(11) NOT NULL,
  `dias` int(11) NOT NULL,
  `percentual` decimal(10,2) NOT NULL,
  `forma_pagamento_id` bigint(20) DEFAULT NULL,
  `data_cadastro` timestamp NULL DEFAULT current_timestamp(),
  `ultima_modificacao` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_parcela_numero_condicao` (`condicao_pagamento_id`,`numero`),
  KEY `fk_parcela_forma_pagamento` (`forma_pagamento_id`),
  KEY `idx_parcela_condicao` (`condicao_pagamento_id`),
  CONSTRAINT `fk_parcela_condicao_pagamento` FOREIGN KEY (`condicao_pagamento_id`) REFERENCES `condicao_pagamento` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_parcela_forma_pagamento` FOREIGN KEY (`forma_pagamento_id`) REFERENCES `forma_pagamento` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parcela_condicao_pagamento`
--

LOCK TABLES `parcela_condicao_pagamento` WRITE;
/*!40000 ALTER TABLE `parcela_condicao_pagamento` DISABLE KEYS */;
INSERT INTO `parcela_condicao_pagamento` VALUES (2,2,1,30,33.34,2,'2025-04-24 16:49:17','2025-04-24 16:49:17'),(3,2,2,60,33.33,2,'2025-04-24 16:49:17','2025-04-24 18:19:27'),(4,2,3,90,33.33,2,'2025-04-24 16:49:17','2025-04-24 16:49:17'),(5,3,1,30,33.34,2,'2025-04-24 16:49:17','2025-04-24 16:49:17'),(6,3,2,60,33.33,2,'2025-04-24 16:49:17','2025-04-24 16:49:17'),(7,3,3,90,33.33,2,'2025-04-24 16:49:17','2025-04-24 16:49:17'),(9,4,1,0,100.00,1,'2025-04-24 17:52:58','2025-04-24 17:52:58'),(13,1,1,0,100.00,1,'2025-06-23 16:57:56','2025-06-23 16:57:56'),(28,7,1,0,100.00,3,'2025-06-28 23:01:41','2025-06-28 23:01:41');
/*!40000 ALTER TABLE `parcela_condicao_pagamento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `produto`
--

DROP TABLE IF EXISTS `produto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `produto` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `descricao` text DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT 1,
  `unidademedidaid` int(11) DEFAULT NULL,
  `codbarras` varchar(255) DEFAULT NULL,
  `referencia` varchar(10) DEFAULT NULL,
  `marcaid` int(11) DEFAULT NULL,
  `categoriaid` int(11) DEFAULT NULL,
  `quantidademinima` int(11) DEFAULT NULL,
  `valorcompra` decimal(10,2) DEFAULT NULL,
  `valorvenda` decimal(10,2) DEFAULT NULL,
  `quantidade` int(11) DEFAULT NULL,
  `percentuallucro` decimal(10,2) DEFAULT NULL,
  `observacoes` varchar(255) DEFAULT NULL,
  `situacao` date DEFAULT NULL,
  `datacriacao` datetime DEFAULT NULL,
  `dataalteracao` datetime DEFAULT NULL,
  `usercriacao` text DEFAULT NULL,
  `useratualizacao` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_produto_unidademedida` (`unidademedidaid`),
  KEY `fk_produto_marca` (`marcaid`),
  KEY `fk_produto_categoria` (`categoriaid`),
  CONSTRAINT `fk_produto_categoria` FOREIGN KEY (`categoriaid`) REFERENCES `categoria` (`id`),
  CONSTRAINT `fk_produto_marca` FOREIGN KEY (`marcaid`) REFERENCES `marcas` (`id`),
  CONSTRAINT `fk_produto_unidademedida` FOREIGN KEY (`unidademedidaid`) REFERENCES `unidademedidas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `produto`
--

LOCK TABLES `produto` WRITE;
/*!40000 ALTER TABLE `produto` DISABLE KEYS */;
INSERT INTO `produto` VALUES (1,'LIMPEZA DE PELE','LIMPEZA DE PELE PROFUNDA',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2,'DESIGN DE SOBRANCELHA','DESIGN E DEPILAÇÃO DE SOBRANCELHA',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(3,'MASSAGEM','MASSAGEM RELAXANTE',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(4,'PRODUTO EXEMPLO','EXEMPLO DE UM PRODUTO PARA TESTAR',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `produto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transportadora`
--

DROP TABLE IF EXISTS `transportadora`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transportadora` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `razao_social` varchar(150) NOT NULL,
  `nome_fantasia` varchar(100) DEFAULT NULL,
  `cnpj` varchar(18) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `endereco` varchar(200) DEFAULT NULL,
  `cidade_id` bigint(20) DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT 1,
  `condicaopagamentoid` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cidade_id` (`cidade_id`),
  KEY `fk_transportadora_condicao` (`condicaopagamentoid`),
  CONSTRAINT `fk_transportadora_condicao` FOREIGN KEY (`condicaopagamentoid`) REFERENCES `condicao_pagamento` (`id`),
  CONSTRAINT `transportadora_ibfk_1` FOREIGN KEY (`cidade_id`) REFERENCES `cidade` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transportadora`
--

LOCK TABLES `transportadora` WRITE;
/*!40000 ALTER TABLE `transportadora` DISABLE KEYS */;
INSERT INTO `transportadora` VALUES (1,'Transportadora Rápida LTDA','Trans Rápida','45.678.901/0001-23','contato@transrapida.com','(11) 3333-4444',NULL,1,0,NULL),(2,'TRANSPORTADORA RÁPIDA B SA','TRANS RÁPIDA B','16.427.308/0001-04','TRANSPORTADORARAPB@GMAIL.COM','(21) 99876-4321',' RUA SÃO GUILHERME',4,0,NULL),(3,'TRANSPORTADORA RÁPIDA B SA','TRANS RÁPIDA B','16.427.308/0001-04','TRANSPORTADORARAPB@GMAIL.COM','(21) 99876-4321',' RUA SÃO GUILHERME',4,1,NULL),(4,'TRANSPORTADORA EXEMPLO','TRANSPORTADORA EXEMPLO LTDA','12.345.678/0001-90','SILVAMARTINSDANIEL235@GMAIL.COM','45991472399','RUA GENI COSTENARO CHIAPPIN',40,1,NULL);
/*!40000 ALTER TABLE `transportadora` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `unidademedidas`
--

DROP TABLE IF EXISTS `unidademedidas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `unidademedidas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `unidademedida` varchar(255) NOT NULL,
  `situacao` date NOT NULL,
  `datacriacao` datetime DEFAULT NULL,
  `dataalteracao` datetime DEFAULT NULL,
  `usercriacao` text NOT NULL,
  `useratualizacao` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unidademedidas`
--

LOCK TABLES `unidademedidas` WRITE;
/*!40000 ALTER TABLE `unidademedidas` DISABLE KEYS */;
INSERT INTO `unidademedidas` VALUES (1,'PICOMETRO','2025-06-29','2025-06-29 00:00:00','2025-06-29 16:23:02','Sistema','sistema'),(7,'TESTE','0001-01-01','2025-06-29 16:57:55','2025-06-29 17:14:32','sistema','SISTEMA_INATIVACAO'),(8,'MICRÔMETRO','2025-06-30','2025-06-30 15:14:18','2025-06-30 15:14:18','sistema','sistema');
/*!40000 ALTER TABLE `unidademedidas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `veiculo`
--

DROP TABLE IF EXISTS `veiculo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `veiculo` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `placa` varchar(10) NOT NULL,
  `modelo` varchar(50) DEFAULT NULL,
  `marca` varchar(50) DEFAULT NULL,
  `ano` int(11) DEFAULT NULL,
  `capacidade` decimal(10,2) DEFAULT NULL,
  `transportadora_id` bigint(20) DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `transportadora_id` (`transportadora_id`),
  CONSTRAINT `veiculo_ibfk_1` FOREIGN KEY (`transportadora_id`) REFERENCES `transportadora` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `veiculo`
--

LOCK TABLES `veiculo` WRITE;
/*!40000 ALTER TABLE `veiculo` DISABLE KEYS */;
INSERT INTO `veiculo` VALUES (1,'ABC-1234','Van','Mercedes',2020,1500.00,1,1);
/*!40000 ALTER TABLE `veiculo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'sistema_empresa'
--
/*!50003 DROP PROCEDURE IF EXISTS `sp_inativar_estado` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_uca1400_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_inativar_estado`(IN estado_id BIGINT)
BEGIN
    -- Update instead of delete
    UPDATE estado 
    SET situacao = 0, 
        data_atualizacao = NOW(), 
        user_atualizacao = 'SISTEMA_PROC' 
    WHERE id = estado_id;
    
    -- Return the number of affected rows
    SELECT ROW_COUNT() AS affected_rows;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-07-01 13:14:31
