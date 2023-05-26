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
    config_context = var.kubeconfig
  }
}

resource "helm_release" "global" {
  name = "backend"
  chart = "./charts/global"
}

resource "helm_release" "backend" {
  name = "backend"
  chart = "./charts/backend"
}

resource "helm_release" "certmanager" {
  name = "certmanager"
  chart = "./charts/certmanager"
}

resource "helm_release" "coturn" {
  name = "coturn"
  chart = "./charts/coturn"
}

resource "helm_release" "frontend" {
  name = "frontend"
  chart = "./charts/frontend"
}

resource "helm_release" "ingress" {
  name = "ingress"
  chart = "./charts/ingress"
}

resource "helm_release" "mariadb" {
  name = "mariadb"
  chart = "./charts/mariadb"
}

resource "helm_release" "postfix" {
  name = "postfix"
  chart = "./charts/postfix"
}

resource "helm_release" "redis" {
  name = "redis"
  chart = "./charts/redis"
}
