terraform {
  required_providers {
    helm = {
      version = "2.9.0"
      source  = "hashicorp/helm"
    }
  }
}

resource "local_file" "kubeconfig" {
  content  = base64decode(var.kubeconfig)
  filename = "${path.module}/.kubeconfig"
}

provider "helm" {
  kubernetes {
    config_path = local_file.kubeconfig.filename
  }
}
