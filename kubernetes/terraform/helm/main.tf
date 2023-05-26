terraform {
  required_providers {
    helm = {
      version = "2.9.0"
      source  = "hashicorp/helm"
    }
  }
}

variable "kubeconfig" {}

provider "helm" {
  kubernetes {
    config_context = kubeconfig
  }
}
