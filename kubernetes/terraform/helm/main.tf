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
  set {
    name = "domain"
    value = var.domain
  }
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
  set  {
    name = "domain"
    value = var.domain

  }
  set {
    name = "external_ip"
    value = var.ip_address
  }
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
