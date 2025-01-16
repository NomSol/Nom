provider "aws" {
  region = "ap-southeast-2"
}

# ECS Cluster
resource "aws_ecs_cluster" "treasure_hunt_cluster" {
  name = "treasure-hunt-cluster"
}

# ECR Repository
resource "aws_ecr_repository" "treasure_hunt_repo" {
  name = "treasure-hunt-repo"
}

resource "aws_iam_role" "ecs_task_execution_role" {
  name = "treasure-hunt-ecs-task-execution-role"

  # Trust relationship with ECS
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        },
        Action = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# ECS Task Definition
resource "aws_ecs_task_definition" "treasure_hunt_task" {
  family                   = "treasure-hunt-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"  # 0.25 vCPU
  memory                   = "512"  # 512 MB
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  container_definitions    = jsonencode([
    {
      name      = "treasure-hunt-container",
      image     = aws_ecr_repository.treasure_hunt_repo.repository_url,
      cpu       = 256,
      memory    = 512,
      essential = true,
      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
          protocol      = "tcp"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = "/ecs/treasure-hunt"
          awslogs-region        = "ap-southeast-2"
          awslogs-stream-prefix = "ecs"
        }
      }
      environment = [
        {
          name  = "NEXTAUTH_SECRET"
          value = "ChIzB/4UPzCS5kuAbzSlrks83FednR7A2x41XKcQrJA="
        },
        {
          name  = "NEXT_PUBLIC_SUPABASE_URL"
          value = "https://zqjzqzqzqzqzqzqzqzqz.supabase.co"
        },
        {
          name  = "NEXT_PUBLIC_SUPABASE_KEY"
          value = "eyJvYjoiYjIwMzQwZjItZjQwZi00ZjQwLWIwZjQtZjQwZjQwZjQwZjQwIiwicCI6IjEwMzQwZjItZjQwZi00ZjQwLWIwZjQtZjQwZjQwZjQwZjQwIiwiaCI6IjQwZjQwLWIwZjQtZjQwZi00ZjQwLWIwZjQtZjQwZjQwZjQwZjQwIiwidCI6IjEwMzQwZjItZjQwZi00ZjQwLWIwZjQtZjQwZjQwZjQwZjQwIn0="
        }
      ]
    }
  ])
  runtime_platform {
    cpu_architecture       = "ARM64"
    operating_system_family = "LINUX"
  }
}

# ECS Service
resource "aws_ecs_service" "treasure_hunt_service" {
  name            = "treasure-hunt-service"
  cluster         = aws_ecs_cluster.treasure_hunt_cluster.id
  desired_count   = 1
  launch_type     = "FARGATE"
  task_definition = aws_ecs_task_definition.treasure_hunt_task.arn

  network_configuration {
    subnets         = [aws_subnet.public_subnet_1.id, aws_subnet.public_subnet_2.id]
    security_groups = [aws_security_group.ecs_security_group.id]
    assign_public_ip = true
  }
}

# Create a VPC
resource "aws_vpc" "treasure_hunt_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = {
    Name = "treasure-hunt-vpc"
  }
}

# Create Public Subnet 1
resource "aws_subnet" "public_subnet_1" {
  vpc_id                  = aws_vpc.treasure_hunt_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "ap-southeast-2a"
  map_public_ip_on_launch = true
  tags = {
    Name = "treasure-hunt-public-subnet-1"
  }
}

# Create Public Subnet 2
resource "aws_subnet" "public_subnet_2" {
  vpc_id                  = aws_vpc.treasure_hunt_vpc.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "ap-southeast-2b"
  map_public_ip_on_launch = true
  tags = {
    Name = "treasure-hunt-public-subnet-2"
  }
}

# Create an Internet Gateway
resource "aws_internet_gateway" "treasure_hunt_igw" {
  vpc_id = aws_vpc.treasure_hunt_vpc.id
  tags = {
    Name = "treasure-hunt-igw"
  }
}

# Create a Route Table
resource "aws_route_table" "public_route_table" {
  vpc_id = aws_vpc.treasure_hunt_vpc.id
  tags = {
    Name = "treasure-hunt-public-route-table"
  }
}

# Add a Route for Internet Access
resource "aws_route" "public_route" {
  route_table_id         = aws_route_table.public_route_table.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.treasure_hunt_igw.id
}

# Associate the Subnets with the Route Table
resource "aws_route_table_association" "public_subnet_1_association" {
  subnet_id      = aws_subnet.public_subnet_1.id
  route_table_id = aws_route_table.public_route_table.id
}

resource "aws_route_table_association" "public_subnet_2_association" {
  subnet_id      = aws_subnet.public_subnet_2.id
  route_table_id = aws_route_table.public_route_table.id
}

# Security Group for ECS Tasks
resource "aws_security_group" "ecs_security_group" {
  vpc_id = aws_vpc.treasure_hunt_vpc.id
  name   = "treasure-hunt-ecs-sg"

  # Inbound Rules
  ingress {
    description      = "Allow HTTP traffic"
    from_port        = 3000
    to_port          = 3000
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
  }

  ingress {
    description      = "Allow HTTPS traffic"
    from_port        = 443
    to_port          = 443
    protocol         = "tcp"
    cidr_blocks      = ["0.0.0.0/0"]
  }

  # Outbound Rules
  egress {
    description      = "Allow all outbound traffic"
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
  }

  tags = {
    Name = "treasure-hunt-ecs-security-group"
  }
}

resource "aws_cloudwatch_log_group" "ecs_treasure_hunt" {
  name              = "/ecs/treasure-hunt"
  retention_in_days = 7 # Adjust as needed
  tags = {
    Name = "treasure-hunt-log-group"
  }
}