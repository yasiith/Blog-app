resource "aws_instance" "web" {

  ami           = "ami-03f71e078efdce2c9"  # Amazon Linux 2 in us-east-1
  instance_type = "t3.micro"
  key_name      = "SahanDevKeyPair"

  # Use a constant tag to identify this as the same logical instance
  tags = {
    Name = "BlogApp"
    Environment = "production"
    ManagedBy = "terraform"
  }

  # Add lifecycle policy to prevent replacement
  lifecycle {
    prevent_destroy = false
    ignore_changes = [ami]
  }

  provisioner "local-exec" {
    command = <<-EOT
      # Create ansible directory if it doesn't exist
      if (!(Test-Path -Path "${path.module}/../ansible")) {
        New-Item -ItemType Directory -Path "${path.module}/../ansible"
      }
      
      # Create/overwrite inventory file
      "[web]" | Out-File -FilePath "${replace("${path.module}/../ansible/inventory.ini", "/", "\\")}" -Encoding ASCII
      "${self.public_ip} ansible_user=ec2-user ansible_ssh_private_key_file=${replace(var.ssh_key_path, "/", "\\")} ansible_python_interpreter=/usr/bin/python3" | Add-Content -Path "${replace("${path.module}/../ansible/inventory.ini", "/", "\\")}" -Encoding ASCII
    EOT
    interpreter = ["PowerShell", "-Command"]
  }
}

variable "ssh_key_path" {
  description = "Path to the SSH private key"
  default     = "C:/Users/MSI/Desktop/CV/SahanDevKeyPair.pem"
}

output "server_ip" {
  value = aws_instance.web.public_ip
}