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
  src_dir   = "${abspath(path.root)}/rust"
  build_dir = "${abspath(path.root)}/build"
  binaries = {
    "fixed_payments" = {
      source_dir = "src/bin/fixed_payments"
      build_dir  = "${local.build_dir}/x86_64-unknown-linux-musl/release"
      handler    = "fixed_payments"
    }
  }
}

# Local-exec to build and zip the Go binaries
resource "null_resource" "build" {
  triggers = {
    src_files_hash = sha256(join("", sort([
      for f in fileset(local.src_dir, "**/*") : filesha256("${local.src_dir}/${f}")
    ])))
  }

  provisioner "local-exec" {
    working_dir = local.src_dir
    command     = "CARGO_TARGET_DIR=${local.build_dir} cargo build --release --target=x86_64-unknown-linux-musl"
  }
}

resource "null_resource" "rename" {
  depends_on = [null_resource.build]
  for_each   = local.binaries

  provisioner "local-exec" {
    working_dir = each.value.build_dir
    command     = "mkdir -p ${each.key}_dir && cp ${each.key} ${each.key}_dir/bootstrap"
  }
}

data "archive_file" "archive" {
  depends_on  = [null_resource.rename]
  for_each    = local.binaries
  type        = "zip"
  source_file = "${each.value.build_dir}/${each.key}_dir/bootstrap"
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
  runtime          = "provided.al2023"
  role             = aws_iam_role.lambda_exec_role.arn

  filename = data.archive_file.archive[each.key].output_path

  environment {
    variables = {
      DATABASE_URL = var.database_url
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

resource "aws_cloudwatch_log_group" "log_group" {
  for_each = local.binaries

  name              = "/aws/lambda/pocket/${each.key}"
  retention_in_days = 3
}

data "aws_iam_policy_document" "lambda_logging" {
  statement {
    effect = "Allow"

    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]

    resources = ["arn:aws:logs:*:*:*"]
  }
}

resource "aws_iam_policy" "lambda_logging" {
  name        = "lambda_logging"
  path        = "/"
  description = "IAM policy for logging from a lambda"
  policy      = data.aws_iam_policy_document.lambda_logging.json
}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = aws_iam_policy.lambda_logging.arn
}
