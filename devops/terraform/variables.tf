# Variables for the PostgreSQL RDS deployment (see rds.tf).

variable "db_name" {
  description = "Name of the initial PostgreSQL database."
  type        = string
  default     = "agrifi"
}

variable "db_username" {
  description = "Master username for the PostgreSQL instance."
  type        = string
  default     = "agrifi_admin"
}

variable "db_password" {
  description = "Master password. Supply via TF_VAR_db_password or a secrets backend; never commit a real value."
  type        = string
  sensitive   = true
}

variable "db_engine_version" {
  description = "PostgreSQL engine version."
  type        = string
  default     = "16.4"
}

variable "db_instance_class" {
  description = "RDS instance class."
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "Initial allocated storage in GiB."
  type        = number
  default     = 20
}

variable "db_max_allocated_storage" {
  description = "Upper bound for storage autoscaling in GiB. Set equal to db_allocated_storage to disable autoscaling."
  type        = number
  default     = 100
}

variable "db_backup_retention_period" {
  description = "Number of days to retain automated backups."
  type        = number
  default     = 7
}

variable "db_multi_az" {
  description = "Deploy the instance across multiple availability zones."
  type        = bool
  default     = false
}

variable "vpc_id" {
  description = "VPC the RDS instance and its security group live in."
  type        = string
}

variable "db_subnet_ids" {
  description = "Private subnet IDs used for the RDS subnet group."
  type        = list(string)
}

variable "backend_subnet_cidrs" {
  description = "CIDR blocks of the backend application subnet(s) allowed to reach PostgreSQL on 5432."
  type        = list(string)
}


variable "ecs_subnet_ids" {
  description = "Subnet IDs for ECS tasks"
  type        = list(string)
}

variable "alb_subnet_ids" {
  description = "Subnet IDs for the Application Load Balancer"
  type        = list(string)
}

variable "jwt_secret" {
  description = "JWT secret for authentication"
  type        = string
  sensitive   = true
}

variable "stellar_platform_secret" {
  description = "Stellar platform secret key"
  type        = string
  sensitive   = true
}
