terraform {
  backend "s3" {
    bucket = "your-terraform-state-bucket"
    key    = "blog-app/terraform.tfstate"
    region = "eu-north-1"
  }
}