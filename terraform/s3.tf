terraform {
  backend "s3" {
    bucket = "terra-buck-blogger"
    key    = "terraform.tfstate"
    region = "eu-north-1"
  }
}
