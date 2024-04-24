provider "aws" {
  region = "ap-northeast-2" # AWS Seoul region
}

variable "database_url" {
  type = string
}

# S3 bucket to store the compiled binaries
resource "aws_s3_bucket" "lambda_bucket" {
  bucket = "pocket-lambda-bucket"
}

# Define the binaries and their configurations in a map
locals {
  src_dir = "${path.module}/src"
  binaries = {
    "reset_budgets" = {
      source_dir = "src/bin/reset_budget"
      build_dir  = "${abspath(path.root)}/build/reset_budget"
      handler    = "reset_budget"
    },
    "fixed_payments" = {
      source_dir = "src/bin/fixed_payments"
      build_dir  = "${abspath(path.root)}/build/fixed_payments"
      handler    = "fixed_payments"
    }
  }
}

# Local-exec to build and zip the Go binaries
resource "null_resource" "build" {
  for_each = local.binaries

  triggers = {
    src_files_hash = sha256(join("", sort([
      for f in fileset(local.src_dir, "**/*") : filesha256("${local.src_dir}/${f}")
    ])))
  }

  provisioner "local-exec" {
    working_dir = "${path.module}/${each.value.source_dir}"
    command     = "GOOS=linux GOARCH=amd64 go build -ldflags='-s -w' -o ${each.value.build_dir}/${each.key}"
  }
}

data "archive_file" "archive" {
  for_each = local.binaries

  depends_on  = [null_resource.build]
  type        = "zip"
  source_file = "${each.value.build_dir}/${each.key}"
  output_path = "${each.value.build_dir}/${each.key}.zip"
}

# IAM role for Lambda execution
resource "aws_iam_role" "lambda_exec_role" {
  name = "lambda_execution_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      },
    ]
  })
}

# Lambda functions for each binary
resource "aws_lambda_function" "lambda" {
  depends_on = [data.archive_file.archive]

  for_each = local.binaries

  source_code_hash = data.archive_file.archive[each.key].output_base64sha256
  function_name    = each.key
  handler          = each.value.handler
  runtime          = "go1.x"
  role             = aws_iam_role.lambda_exec_role.arn

  filename = data.archive_file.archive[each.key].output_path

  environment {
    variables = {
      GO_DATABASE_URL = var.database_url
    }
  }
}

# EventBridge rule for monthly trigger
resource "aws_cloudwatch_event_rule" "monthly_trigger" {
  name                = "MonthlyTrigger"
  schedule_expression = "cron(0 0 1 * ? *)"
}

# Event targets for Lambda functions
resource "aws_cloudwatch_event_target" "lambda_target" {
  for_each = local.binaries

  rule = aws_cloudwatch_event_rule.monthly_trigger.name
  arn  = aws_lambda_function.lambda[each.key].arn
}

# Permissions for EventBridge to invoke Lambda functions
resource "aws_lambda_permission" "lambda_invoke" {
  for_each = local.binaries

  statement_id  = "AllowExecutionFromCloudWatch_${each.key}"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.lambda[each.key].function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.monthly_trigger.arn
}
