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

# IAM Role for ECS Tasks
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

# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "ecs_treasure_hunt" {
  name              = "/ecs/treasure-hunt"
  retention_in_days = 7
  tags = {
    Name = "treasure-hunt-log-group"
  }
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

# Security Group for ECS
resource "aws_security_group" "ecs_security_group" {
  vpc_id = aws_vpc.treasure_hunt_vpc.id
  name   = "treasure-hunt-ecs-sg"

  ingress {
    description      = "Allow HTTP traffic from VPC"
    from_port        = 3000
    to_port          = 3000
    protocol         = "tcp"
    cidr_blocks      = [aws_vpc.treasure_hunt_vpc.cidr_block]
    security_groups = [aws_security_group.alb_sg.id]
  }

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

# ECS Service
resource "aws_ecs_service" "treasure_hunt_service" {
  name            = "treasure-hunt-service"
  cluster         = aws_ecs_cluster.treasure_hunt_cluster.id
  desired_count   = 1
  launch_type     = "FARGATE"
  task_definition = aws_ecs_task_definition.treasure_hunt_task.arn

  network_configuration {
    subnets         = [aws_subnet.private_subnet_1.id, aws_subnet.private_subnet_2.id]
    security_groups = [aws_security_group.ecs_security_group.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.ecs_target_group.arn
    container_name   = "treasure-hunt-container"
    container_port   = 3000
  }
}

# VPC
resource "aws_vpc" "treasure_hunt_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
}

# Subnets
resource "aws_subnet" "public_subnet_1" {
  vpc_id                  = aws_vpc.treasure_hunt_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "ap-southeast-2a"
  map_public_ip_on_launch = true
}

resource "aws_subnet" "public_subnet_2" {
  vpc_id                  = aws_vpc.treasure_hunt_vpc.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "ap-southeast-2b"
  map_public_ip_on_launch = true
}

resource "aws_subnet" "private_subnet_1" {
  vpc_id            = aws_vpc.treasure_hunt_vpc.id
  cidr_block        = "10.0.3.0/24"
  availability_zone = "ap-southeast-2a"
}

resource "aws_subnet" "private_subnet_2" {
  vpc_id            = aws_vpc.treasure_hunt_vpc.id
  cidr_block        = "10.0.4.0/24"
  availability_zone = "ap-southeast-2b"
}

# Internet Gateway
resource "aws_internet_gateway" "treasure_hunt_igw" {
  vpc_id = aws_vpc.treasure_hunt_vpc.id
}

# Associate Subnets with Route Table
resource "aws_route_table_association" "public_subnet_1_association" {
  subnet_id      = aws_subnet.public_subnet_1.id
  route_table_id = aws_route_table.public_route_table.id
}

resource "aws_route_table_association" "public_subnet_2_association" {
  subnet_id      = aws_subnet.public_subnet_2.id
  route_table_id = aws_route_table.public_route_table.id
}


# Route Table
resource "aws_route_table" "public_route_table" {
  vpc_id = aws_vpc.treasure_hunt_vpc.id
}

resource "aws_route" "public_route" {
  route_table_id         = aws_route_table.public_route_table.id
  destination_cidr_block = "0.0.0.0/0"
  gateway_id             = aws_internet_gateway.treasure_hunt_igw.id
}

# Private Route Table
resource "aws_route_table" "private_route_table" {
  vpc_id = aws_vpc.treasure_hunt_vpc.id
}

resource "aws_route" "private_nat_route" {
  route_table_id         = aws_route_table.private_route_table.id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.treasure_hunt_nat_gateway.id
}

resource "aws_route_table_association" "private_subnet_1_association" {
  subnet_id      = aws_subnet.private_subnet_1.id
  route_table_id = aws_route_table.private_route_table.id
}

resource "aws_route_table_association" "private_subnet_2_association" {
  subnet_id      = aws_subnet.private_subnet_2.id
  route_table_id = aws_route_table.private_route_table.id
}
# Elastic IP for NAT Gateway
resource "aws_eip" "nat_gateway_eip" {
  domain = "vpc"
}
# NAT Gateway
resource "aws_nat_gateway" "treasure_hunt_nat_gateway" {
  subnet_id = aws_subnet.public_subnet_1.id
  allocation_id = aws_eip.nat_gateway_eip.id
}

resource "aws_security_group" "alb_sg" {
  vpc_id = aws_vpc.treasure_hunt_vpc.id
  name   = "treasure-hunt-alb-sg"

  # Allow HTTP traffic from the internet
  ingress {
    description = "Allow HTTP traffic"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow HTTPS traffic from the internet (optional if using HTTPS)
  ingress {
    description = "Allow HTTPS traffic"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow all outbound traffic
  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "treasure-hunt-alb-security-group"
  }
}

# ALB
resource "aws_lb" "ecs_alb" {
  name               = "treasure-hunt-alb"
  internal           = false
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = [aws_subnet.public_subnet_1.id, aws_subnet.public_subnet_2.id]
}

resource "aws_lb_target_group" "ecs_target_group" {
  name        = "ecs-target-group"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.treasure_hunt_vpc.id
  target_type = "ip"
  health_check {
    path                = "/"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 3
    unhealthy_threshold = 2
  }

  # lifecycle {
  #   prevent_destroy = true
  # }
}

resource "aws_lb_listener" "ecs_listener" {
  load_balancer_arn = aws_lb.ecs_alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "forward"
    target_group_arn = aws_lb_target_group.ecs_target_group.arn
  }
  depends_on = [aws_lb_target_group.ecs_target_group]
}

# CloudFront
resource "aws_cloudfront_distribution" "ecs_cloudfront" {
  origin {
    domain_name = aws_lb.ecs_alb.dns_name
    origin_id   = "ecs-alb-origin"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  enabled             = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "ecs-alb-origin"

    forwarded_values {
      query_string = true
      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  tags = {
    Name = "treasure-hunt-cloudfront"
  }
}