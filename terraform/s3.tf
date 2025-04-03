terraform {
  backend "s3" {
    bucket = "your-terraform-state-bucket"
    key    = "blog-app/terraform.tfstate"
    region = "your-aws-region"
  }
}